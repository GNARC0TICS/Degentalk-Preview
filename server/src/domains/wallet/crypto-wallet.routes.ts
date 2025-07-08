import type { UserId } from '@shared/types/ids';
/**
 * Crypto Wallet Routes
 * 
 * Enhanced crypto wallet management with CCPayment integration
 * Provides token information, pricing, and secure wallet operations
 */

import { Router } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { isAuthenticated } from '../auth/middleware/auth.middleware';
import { logger } from '../../core/logger';
import { EconomyTransformer } from '../economy/transformers/economy.transformer';
import { toPublicList } from '@server/src/core/utils/transformer.helpers';
import { ccpaymentService } from './ccpayment.service';
import { walletService } from './wallet.service';
import { z } from 'zod';
import type { UserId, CoinId } from '@shared/types/ids';

const router = Router();

// Validation schemas
const addressValidationSchema = z.object({
  chain: z.string().min(1),
  address: z.string().min(1)
});

const rescanTransactionSchema = z.object({
  chain: z.string().min(1),
  toAddress: z.string().min(1),
  txId: z.string().min(1),
  memo: z.string().optional()
});

const withdrawFeeSchema = z.object({
  coinId: z.number().int().positive(),
  chain: z.string().min(1)
});

/**
 * GET /api/crypto-wallet/addresses
 * Get user's crypto deposit addresses with enhanced token information
 */
router.get('/addresses', isAuthenticated, async (req, res) => {
  try {
    const authUser = userService.getUserFromRequest(req);
    if (!authUser?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = authUser.id as UserId;

    // Get user's deposit addresses
    const addresses = await walletService.getUserDepositAddresses(userId);

    // Transform each address with enhanced token info
    const enhancedAddresses = await Promise.all(
      addresses.map(async (address) => {
        try {
          // Get token information and current price
          const [tokenInfo, prices] = await Promise.allSettled([
            ccpaymentService.getTokenInfo(address.coinId),
            ccpaymentService.getTokenPrices([address.coinId])
          ]);

          return {
            ...address,
            tokenInfo: tokenInfo.status === 'fulfilled' ? {
              logoUrl: tokenInfo.value.logoUrl,
              coinFullName: tokenInfo.value.coinFullName,
              status: tokenInfo.value.status,
              networks: tokenInfo.value.networks
            } : undefined,
            currentPrice: prices.status === 'fulfilled' 
              ? prices.value[address.coinId] 
              : undefined
          };
        } catch (error) {
          logger.warn('CryptoWalletRoutes', 'Failed to enhance address info', {
            coinId: address.coinId,
            error: error.message
          });
          return address;
        }
      })
    );

    res.json({
      addresses: toPublicList(enhancedAddresses, EconomyTransformer.toPublicCryptoWallet),
      totalAddresses: enhancedAddresses.length
    });

  } catch (error) {
    logger.error('CryptoWalletRoutes', 'Error getting crypto addresses', {
      error: error.message,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to retrieve crypto addresses' });
  }
});

/**
 * GET /api/crypto-wallet/balances
 * Get user's crypto balances with USD values and token information
 */
router.get('/balances', isAuthenticated, async (req, res) => {
  try {
    const authUser = userService.getUserFromRequest(req);
    if (!authUser?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = authUser.id.toString();

    // Get user balances
    const balances = await walletService.getUserBalances(userId);

    // Enhanced crypto balances with pricing
    if (balances.crypto.length > 0) {
      const coinIds = balances.crypto.map(c => c.coinId);
      
      try {
        const prices = await ccpaymentService.getTokenPrices(coinIds);
        
        balances.crypto = balances.crypto.map(wallet => ({
          ...wallet,
          currentPrice: prices[wallet.coinId] || '0',
          balanceUsdValue: EconomyTransformer['calculateCryptoUsdValue'](
            wallet.balance, 
            prices[wallet.coinId]
          )
        }));
      } catch (error) {
        logger.warn('CryptoWalletRoutes', 'Failed to fetch token prices', { error });
      }
    }

    // Transform balances using EconomyTransformer
    const transformedBalances = {
      ...balances,
      crypto: toPublicList(balances.crypto, EconomyTransformer.toAuthenticatedCryptoWallet)
    };
    
    res.json(transformedBalances);

  } catch (error) {
    logger.error('CryptoWalletRoutes', 'Error getting crypto balances', {
      error: error.message,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to retrieve crypto balances' });
  }
});

/**
 * POST /api/crypto-wallet/validate-address
 * Validate withdrawal address before allowing withdrawal
 */
router.post('/validate-address', isAuthenticated, async (req, res) => {
  try {
    const authUser = userService.getUserFromRequest(req);
    if (!authUser?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { chain, address } = addressValidationSchema.parse(req.body);

    // Check address validity with CCPayment
    const isValid = await ccpaymentService.checkWithdrawalAddressValidity(chain, address);

    const result = {
      isValid,
      chain,
      message: isValid 
        ? 'Address is valid for withdrawal'
        : 'Invalid address for the specified chain'
    };
    
    res.json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: error.errors 
      });
    }

    logger.error('CryptoWalletRoutes', 'Error validating address', {
      error: error.message,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to validate address' });
  }
});

/**
 * POST /api/crypto-wallet/get-withdraw-fee
 * Get withdrawal fee for specific token and chain
 */
router.post('/get-withdraw-fee', isAuthenticated, async (req, res) => {
  try {
    const authUser = userService.getUserFromRequest(req);
    if (!authUser?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { coinId, chain } = withdrawFeeSchema.parse(req.body);

    // Get withdrawal fee from CCPayment
    const feeInfo = await ccpaymentService.getWithdrawFee(coinId, chain);

    const result = {
      fee: feeInfo,
      message: `Withdrawal fee for ${feeInfo.coinSymbol} on ${chain}: ${feeInfo.amount}`
    };
    
    res.json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: error.errors 
      });
    }

    logger.error('CryptoWalletRoutes', 'Error getting withdraw fee', {
      error: error.message,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to get withdrawal fee' });
  }
});

/**
 * POST /api/crypto-wallet/rescan-transaction
 * Rescan lost deposit transaction
 */
router.post('/rescan-transaction', isAuthenticated, async (req, res) => {
  try {
    const authUser = userService.getUserFromRequest(req);
    if (!authUser?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const transactionData = rescanTransactionSchema.parse(req.body);

    // Rescan transaction with CCPayment
    const description = await ccpaymentService.rescanLostTransaction(transactionData);

    logger.info('CryptoWalletRoutes', 'Transaction rescan initiated', {
      userId: authUser.id,
      txId: transactionData.txId,
      chain: transactionData.chain
    });

    const result = {
      success: true,
      description,
      message: 'Transaction rescan initiated successfully'
    };
    
    res.json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: error.errors 
      });
    }

    logger.error('CryptoWalletRoutes', 'Error rescanning transaction', {
      error: error.message,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to rescan transaction' });
  }
});

/**
 * GET /api/crypto-wallet/supported-tokens
 * Get list of supported cryptocurrencies with enhanced information
 */
router.get('/supported-tokens', async (req, res) => {
  try {
    // Get supported cryptocurrencies
    const supportedTokens = await walletService.getSupportedCryptocurrencies();

    // Enhance with current prices
    const coinIds = supportedTokens.map(token => token.coinId);
    
    let prices: Record<number, string> = {};
    try {
      prices = await ccpaymentService.getTokenPrices(coinIds);
    } catch (error) {
      logger.warn('CryptoWalletRoutes', 'Failed to fetch token prices for supported tokens', { error });
    }

    const enhancedTokens = supportedTokens.map(token => ({
      ...token,
      currentPrice: prices[token.coinId] || '0',
      priceAvailable: !!prices[token.coinId]
    }));

    const result = {
      tokens: enhancedTokens,
      totalTokens: enhancedTokens.length,
      pricesLastUpdated: new Date().toISOString()
    };
    
    res.json(result);

  } catch (error) {
    logger.error('CryptoWalletRoutes', 'Error getting supported tokens', {
      error: error.message
    });
    res.status(500).json({ error: 'Failed to retrieve supported tokens' });
  }
});

/**
 * GET /api/crypto-wallet/token-info/:coinId
 * Get detailed information about a specific token
 */
router.get('/token-info/:coinId', async (req, res) => {
  try {
    const coinId = req.params.coinId as UserId;
    if (isNaN(coinId)) {
      return res.status(400).json({ error: 'Invalid coin ID' });
    }

    // Get detailed token information
    const tokenInfo = await ccpaymentService.getTokenInfo(coinId);
    
    // Get current price
    let currentPrice = '0';
    try {
      const prices = await ccpaymentService.getTokenPrices([coinId]);
      currentPrice = prices[coinId] || '0';
    } catch (error) {
      logger.warn('CryptoWalletRoutes', 'Failed to fetch token price', { coinId, error });
    }

    const result = {
      ...tokenInfo,
      currentPrice,
      priceLastUpdated: new Date().toISOString()
    };
    
    res.json(result);

  } catch (error) {
    logger.error('CryptoWalletRoutes', 'Error getting token info', {
      coinId: req.params.coinId,
      error: error.message
    });
    res.status(500).json({ error: 'Failed to retrieve token information' });
  }
});

export default router;