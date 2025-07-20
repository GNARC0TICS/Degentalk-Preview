/**
 * Wallet Feature Export Barrel
 *
 * Centralized exports for the complete wallet domain
 */

// Components
export * from './components';

// Services
export * from './services/wallet-api.service';

// Re-export types for convenience
export type {
	WalletBalance,
	CryptoBalance,
	DepositAddress,
	PurchaseOrder,
	DgtTransfer
} from '@shared/types/wallet/wallet.types';
