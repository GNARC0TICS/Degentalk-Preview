/**
 * New Wallet Domain - Index
 * 
 * Centralized exports for the new wallet implementation
 * Provides clean interface for consuming the wallet functionality
 */

// Services
export { walletService } from './services/wallet.service';

// Controllers
export { walletController } from './controllers/wallet.controller';

// Routes
export { walletRoutes } from './routes/wallet.routes';

// Adapters
export { ccpaymentAdapter } from './adapters/ccpayment.adapter';
export { CacheAdapter } from './adapters/cache.adapter';
export type { WalletAdapter } from './adapters/ccpayment.adapter';

// Validation
export { walletValidation } from './validation/wallet.validation';

// Re-export shared types for convenience
export type {
  WalletBalance,
  CryptoBalance,
  DepositAddress,
  DgtTransaction,
  WithdrawalRequest,
  WithdrawalResponse,
  PurchaseRequest,
  PurchaseOrder,
  WebhookResult,
  WalletConfigPublic,
  DgtTransfer,
  PaginationOptions
} from '@shared/types/wallet/wallet.types';

// Re-export transformers
export {
  toPublicWalletBalance,
  toPublicCryptoBalance,
  toPublicTransaction,
  toAuthenticatedTransaction,
  toPublicPurchaseOrder,
  toPublicDepositAddress,
  toPublicWithdrawalResponse,
  toPublicWalletConfig,
  fromCCPaymentBalance,
  fromCCPaymentDepositAddress,
  extractUserData,
  toPaginatedResponse
} from '@shared/types/wallet/wallet.transformer';

export type {
  WalletBalancePublic,
  CryptoBalancePublic,
  DgtTransactionPublic,
  DgtTransactionAuthenticated,
  PaginatedResponse
} from '@shared/types/wallet/wallet.transformer';