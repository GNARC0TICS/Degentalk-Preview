/**
 * CCPayment Token Service
 * 
 * Handles token information, pricing, and metadata from CCPayment API
 * Provides coin details, logos, pricing, and network information
 */

import { logger } from '@server/src/core/logger';
import { WalletError, ErrorCodes } from '@server/src/core/errors';
import { ccpaymentApiService } from './ccpayment-api.service';
import type { CoinId } from '@shared/types';
import { EntityId } from "@shared/types";

export interface CCPaymentTokenInfo {
  coinId: EntityId;
  symbol: string;
  coinFullName: string;
  logoUrl: string;
  status: 'Normal' | 'Maintain' | 'Pre-delisting' | 'Delisted';
  networks: Record<string, CCPaymentNetworkInfo>;
}

export interface CCPaymentNetworkInfo {
  chain: string;
  chainFullName: string;
  contract: string;
  precision: number;
  canDeposit: boolean;
  canWithdraw: boolean;
  minimumDepositAmount: string;
  minimumWithdrawAmount: string;
  maximumWithdrawAmount: string;
  isSupportMemo: boolean;
}

export interface CCPaymentTokenPrice {
  coinId: EntityId;
  usdtPrice: string;
  timestamp: number;
}

export interface CCPaymentWithdrawFee {
  coinId: EntityId;
  coinSymbol: string;
  amount: string;
  chain: string;
}

export interface CCPaymentAppBalance {
  coinId: EntityId;
  coinSymbol: string;
  available: string;
}

export class CCPaymentTokenService {
  private tokenCache = new Map<number, CCPaymentTokenInfo>();
  private priceCache = new Map<number, CCPaymentTokenPrice>();
  private feeCache = new Map<string, CCPaymentWithdrawFee>();
  
  // Cache TTL in milliseconds
  private readonly CACHE_TTL = {
    TOKEN_INFO: 60 * 60 * 1000,    // 1 hour
    PRICE: 5 * 60 * 1000,          // 5 minutes
    FEE: 30 * 60 * 1000            // 30 minutes
  };

  /**
   * Get detailed token information including logo and networks
   */
  async getTokenInfo(coinId: CoinId): Promise<CCPaymentTokenInfo> {
    try {
      // Check cache first
      const cached = this.tokenCache.get(coinId);
      if (cached) {
        logger.debug('CCPaymentTokenService', 'Token info cache hit', { coinId });
        return cached;
      }

      logger.info('CCPaymentTokenService', 'Fetching token info from CCPayment', { coinId });

      const response = await ccpaymentApiService.makeRequest<{
        coin: CCPaymentTokenInfo;
      }>('/ccpayment/v2/getCoin', { coinId });

      if (!response.coin) {
        throw new WalletError(
          `Token information not found for coinId: ${coinId}`,
          ErrorCodes.NOT_FOUND,
          404,
          { coinId }
        );
      }

      // Cache the result
      this.tokenCache.set(coinId, response.coin);

      // Auto-cleanup cache after TTL
      setTimeout(() => {
        this.tokenCache.delete(coinId);
      }, this.CACHE_TTL.TOKEN_INFO);

      logger.info('CCPaymentTokenService', 'Token info retrieved successfully', {
        coinId,
        symbol: response.coin.symbol,
        status: response.coin.status
      });

      return response.coin;
    } catch (error) {
      logger.error('CCPaymentTokenService', 'Error fetching token info', {
        coinId,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to fetch token information',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { coinId, originalError: error }
      );
    }
  }

  /**
   * Get current USDT price for tokens
   */
  async getTokenPrices(coinIds: CoinId[]): Promise<Record<number, string>> {
    try {
      // Filter out cached prices that are still valid
      const uncachedCoinIds: CoinId[] = [];
      const result: Record<number, string> = {};

      for (const coinId of coinIds) {
        const cached = this.priceCache.get(coinId);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL.PRICE)) {
          result[coinId] = cached.usdtPrice;
        } else {
          uncachedCoinIds.push(coinId);
        }
      }

      // Fetch uncached prices
      if (uncachedCoinIds.length > 0) {
        logger.info('CCPaymentTokenService', 'Fetching token prices from CCPayment', {
          coinIds: uncachedCoinIds
        });

        const response = await ccpaymentApiService.makeRequest<{
          prices: Record<string, string>;
        }>('/ccpayment/v2/getCoinUSDTPrice', { coinIds: uncachedCoinIds });

        // Process and cache the prices
        for (const [coinIdStr, price] of Object.entries(response.prices)) {
          const coinId = parseInt(coinIdStr);
          result[coinId] = price;

          // Cache the price
          this.priceCache.set(coinId, {
            coinId,
            usdtPrice: price,
            timestamp: Date.now()
          });

          // Auto-cleanup cache after TTL
          setTimeout(() => {
            this.priceCache.delete(coinId);
          }, this.CACHE_TTL.PRICE);
        }

        logger.info('CCPaymentTokenService', 'Token prices retrieved successfully', {
          fetchedCount: uncachedCoinIds.length,
          totalCount: coinIds.length
        });
      }

      return result;
    } catch (error) {
      logger.error('CCPaymentTokenService', 'Error fetching token prices', {
        coinIds,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to fetch token prices',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { coinIds, originalError: error }
      );
    }
  }

  /**
   * Get withdrawal fee for specific token and chain
   */
  async getWithdrawFee(coinId: CoinId, chain: string): Promise<CCPaymentWithdrawFee> {
    try {
      const cacheKey = `${coinId}-${chain}`;
      const cached = this.feeCache.get(cacheKey);
      
      if (cached) {
        logger.debug('CCPaymentTokenService', 'Withdraw fee cache hit', { coinId, chain });
        return cached;
      }

      logger.info('CCPaymentTokenService', 'Fetching withdraw fee from CCPayment', {
        coinId,
        chain
      });

      const response = await ccpaymentApiService.makeRequest<{
        fee: {
          coinId: EntityId;
          coinSymbol: string;
          amount: string;
        };
      }>('/ccpayment/v2/getWithdrawFee', { coinId, chain });

      if (!response.fee) {
        throw new WalletError(
          `Withdrawal fee not found for coinId: ${coinId}, chain: ${chain}`,
          ErrorCodes.NOT_FOUND,
          404,
          { coinId, chain }
        );
      }

      const fee: CCPaymentWithdrawFee = {
        coinId: response.fee.coinId,
        coinSymbol: response.fee.coinSymbol,
        amount: response.fee.amount,
        chain
      };

      // Cache the result
      this.feeCache.set(cacheKey, fee);

      // Auto-cleanup cache after TTL
      setTimeout(() => {
        this.feeCache.delete(cacheKey);
      }, this.CACHE_TTL.FEE);

      logger.info('CCPaymentTokenService', 'Withdraw fee retrieved successfully', {
        coinId,
        chain,
        amount: fee.amount,
        symbol: fee.coinSymbol
      });

      return fee;
    } catch (error) {
      logger.error('CCPaymentTokenService', 'Error fetching withdraw fee', {
        coinId,
        chain,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to fetch withdrawal fee',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { coinId, chain, originalError: error }
      );
    }
  }

  /**
   * Get app coin balance list (merchant balance)
   */
  async getAppBalanceList(): Promise<CCPaymentAppBalance[]> {
    try {
      logger.info('CCPaymentTokenService', 'Fetching app balance list from CCPayment');

      const response = await ccpaymentApiService.makeRequest<{
        assets: CCPaymentAppBalance[];
      }>('/ccpayment/v2/getAppCoinAssetList');

      logger.info('CCPaymentTokenService', 'App balance list retrieved successfully', {
        assetCount: response.assets?.length || 0
      });

      return response.assets || [];
    } catch (error) {
      logger.error('CCPaymentTokenService', 'Error fetching app balance list', { error });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to fetch app balance list',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { originalError: error }
      );
    }
  }

  /**
   * Get specific app coin balance
   */
  async getAppCoinBalance(coinId: CoinId): Promise<CCPaymentAppBalance> {
    try {
      logger.info('CCPaymentTokenService', 'Fetching app coin balance from CCPayment', { coinId });

      const response = await ccpaymentApiService.makeRequest<{
        asset: CCPaymentAppBalance;
      }>('/ccpayment/v2/getAppCoinAsset', { coinId });

      if (!response.asset) {
        throw new WalletError(
          `App balance not found for coinId: ${coinId}`,
          ErrorCodes.NOT_FOUND,
          404,
          { coinId }
        );
      }

      logger.info('CCPaymentTokenService', 'App coin balance retrieved successfully', {
        coinId,
        symbol: response.asset.coinSymbol,
        available: response.asset.available
      });

      return response.asset;
    } catch (error) {
      logger.error('CCPaymentTokenService', 'Error fetching app coin balance', {
        coinId,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to fetch app coin balance',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { coinId, originalError: error }
      );
    }
  }

  /**
   * Check withdrawal address validity
   */
  async checkWithdrawalAddressValidity(chain: string, address: string): Promise<boolean> {
    try {
      logger.info('CCPaymentTokenService', 'Checking withdrawal address validity', {
        chain,
        address: address.substring(0, 10) + '...' // Log partial address for security
      });

      const response = await ccpaymentApiService.makeRequest<{
        addrIsValid: boolean;
      }>('/ccpayment/v2/checkWithdrawalAddressValidity', { chain, address });

      logger.info('CCPaymentTokenService', 'Address validity check completed', {
        chain,
        isValid: response.addrIsValid
      });

      return response.addrIsValid;
    } catch (error) {
      logger.error('CCPaymentTokenService', 'Error checking address validity', {
        chain,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to check withdrawal address validity',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { chain, originalError: error }
      );
    }
  }

  /**
   * Rescan lost transaction
   */
  async rescanLostTransaction(params: {
    chain: string;
    toAddress: string;
    txId: string;
    memo?: string;
  }): Promise<string> {
    try {
      logger.info('CCPaymentTokenService', 'Rescanning lost transaction', {
        chain: params.chain,
        txId: params.txId
      });

      const response = await ccpaymentApiService.makeRequest<{
        description: string;
      }>('/ccpayment/v2/rescanLostTransaction', params);

      logger.info('CCPaymentTokenService', 'Transaction rescan initiated', {
        chain: params.chain,
        txId: params.txId,
        description: response.description
      });

      return response.description;
    } catch (error) {
      logger.error('CCPaymentTokenService', 'Error rescanning transaction', {
        params,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to rescan transaction',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { params, originalError: error }
      );
    }
  }

  /**
   * Clear all caches (useful for testing or manual refresh)
   */
  clearCaches(): void {
    this.tokenCache.clear();
    this.priceCache.clear();
    this.feeCache.clear();
    logger.info('CCPaymentTokenService', 'All caches cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    tokenInfo: number;
    prices: number;
    fees: number;
  } {
    return {
      tokenInfo: this.tokenCache.size,
      prices: this.priceCache.size,
      fees: this.feeCache.size
    };
  }
}

// Export singleton instance
export const ccpaymentTokenService = new CCPaymentTokenService();