import { z } from 'zod';
import { UserIdSchema, TransactionIdSchema } from '../shared/branded-ids';

/**
 * Crypto Balance Schema
 */
export const CryptoBalanceSchema = z.object({
  symbol: z.string(),
  balance: z.number(),
  usdValue: z.number().optional(),
  address: z.string().optional()
});

export type CryptoBalance = z.infer<typeof CryptoBalanceSchema>;

/**
 * Wallet Balance Schema
 * Handles various response formats from the API
 */
export const WalletBalanceSchema = z.object({
  // Core balances
  dgt: z.number(),
  usdt: z.number().optional(),
  btc: z.number().optional(),
  eth: z.number().optional(),
  pendingDgt: z.number().optional(),
  
  // Legacy/compatibility fields
  dgtBalance: z.number().optional(), // Alias for dgt
  crypto: z.array(CryptoBalanceSchema).optional(),
  cryptoBalances: z.array(CryptoBalanceSchema).optional(),
  totalUsdValue: z.number().optional()
}).transform(data => {
  // Ensure consistent structure
  return {
    ...data,
    dgtBalance: data.dgtBalance ?? data.dgt,
    crypto: data.crypto ?? data.cryptoBalances ?? [],
    cryptoBalances: data.cryptoBalances ?? data.crypto ?? []
  };
});

export type WalletBalance = z.infer<typeof WalletBalanceSchema>;

/**
 * Transaction Schema
 */
export const TransactionSchema = z.object({
  id: TransactionIdSchema,
  userId: UserIdSchema,
  type: z.enum(['deposit', 'withdrawal', 'swap', 'transfer', 'tip', 'purchase', 'reward', 'rain']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
  amount: z.number(),
  currency: z.string(),
  fee: z.number().optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Legacy field
  timestamp: z.string().optional()
});

export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * DGT Package Schema
 */
export const DgtPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  dgtAmount: z.number(),
  priceUsd: z.number(),
  discount: z.number().optional(),
  isPopular: z.boolean().optional(),
  icon: z.string().optional()
});

export type DgtPackage = z.infer<typeof DgtPackageSchema>;

/**
 * Purchase Order Response
 */
export const PurchaseOrderResponseSchema = z.object({
  success: z.boolean(),
  orderId: z.string(),
  depositAddress: z.string(),
  depositUrl: z.string().optional(), // Some endpoints return this
  dgtAmount: z.number(),
  cryptoAmount: z.number().optional(),
  cryptoCurrency: z.string().optional(),
  expiresAt: z.string().optional(),
  message: z.string().optional()
});

export type PurchaseOrderResponse = z.infer<typeof PurchaseOrderResponseSchema>;

/**
 * Rain Response Schema
 */
export const RainResponseSchema = z.object({
  success: z.boolean(),
  transactionId: TransactionIdSchema,
  recipients: z.array(
    z.object({
      id: UserIdSchema,
      username: z.string(),
      amount: z.number()
    })
  ),
  totalAmount: z.number().optional(),
  message: z.string()
});

export type RainResponse = z.infer<typeof RainResponseSchema>;