/**
 * CCPayment Token Service
 *
 * Handles token information, pricing, and metadata from CCPayment API
 * Provides coin details, logos, pricing, and network information
 */
import type { CoinId } from '@shared/types/ids';
import type { EntityId } from '@shared/types/ids';
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
export declare class CCPaymentTokenService {
    private tokenCache;
    private priceCache;
    private feeCache;
    private supportedTokensCache;
    private readonly CACHE_TTL;
    /**
     * Get detailed token information including logo and networks
     */
    getTokenInfo(coinId: CoinId): Promise<CCPaymentTokenInfo>;
    /**
     * Get list of all supported tokens
     */
    getSupportedTokens(): Promise<CCPaymentTokenInfo[]>;
    /**
     * Get current USDT price for tokens
     */
    getTokenPrices(coinIds: CoinId[]): Promise<Record<number, string>>;
    /**
     * Get withdrawal fee for specific token and chain
     */
    getWithdrawFee(coinId: CoinId, chain: string): Promise<CCPaymentWithdrawFee>;
    /**
     * Get app coin balance list (merchant balance)
     */
    getAppBalanceList(): Promise<CCPaymentAppBalance[]>;
    /**
     * Get specific app coin balance
     */
    getAppCoinBalance(coinId: CoinId): Promise<CCPaymentAppBalance>;
    /**
     * Check withdrawal address validity
     */
    checkWithdrawalAddressValidity(chain: string, address: string): Promise<boolean>;
    /**
     * Rescan lost transaction
     */
    rescanLostTransaction(params: {
        chain: string;
        toAddress: string;
        txId: string;
        memo?: string;
    }): Promise<string>;
    /**
     * Clear all caches (useful for testing or manual refresh)
     */
    clearCaches(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        tokenInfo: number;
        prices: number;
        fees: number;
        supportedTokens: number;
    };
}
export declare const ccpaymentTokenService: CCPaymentTokenService;
