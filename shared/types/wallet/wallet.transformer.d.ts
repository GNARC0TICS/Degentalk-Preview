import type { UserId, TransactionId } from '../ids.js';
import type { WalletBalance, CryptoBalance, DepositAddress, DgtTransaction, WithdrawalResponse, PurchaseOrder, WalletConfigPublic, SupportedCoin, CCPaymentWithdrawFee } from './wallet.types.js';
/**
 * Public wallet balance DTO (no sensitive data)
 */
export interface WalletBalancePublic {
    dgtBalance: number;
    cryptoBalances: CryptoBalancePublic[];
    lastUpdated: string;
}
/**
 * Public crypto balance DTO
 */
export interface CryptoBalancePublic {
    coinSymbol: string;
    chain: string;
    balance: string;
    usdValue: string;
    available: string;
}
/**
 * Public transaction DTO
 */
export interface DgtTransactionPublic {
    id: TransactionId;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'purchase' | 'reward';
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}
/**
 * Authenticated transaction DTO (includes metadata)
 */
export interface DgtTransactionAuthenticated extends DgtTransactionPublic {
    metadata: Record<string, unknown>;
}
/**
 * Transform wallet balance to public DTO
 */
export declare function toPublicWalletBalance(balance: WalletBalance): WalletBalancePublic;
/**
 * Transform crypto balance to public DTO
 */
export declare function toPublicCryptoBalance(balance: CryptoBalance): CryptoBalancePublic;
/**
 * Transform transaction to public DTO
 */
export declare function toPublicTransaction(transaction: DgtTransaction): DgtTransactionPublic;
/**
 * Transform transaction to authenticated DTO
 */
export declare function toAuthenticatedTransaction(transaction: DgtTransaction): DgtTransactionAuthenticated;
/**
 * Transform purchase order to public DTO
 */
export declare function toPublicPurchaseOrder(order: PurchaseOrder): Omit<PurchaseOrder, 'userId'>;
/**
 * Transform deposit address (no transformation needed - already safe)
 */
export declare function toPublicDepositAddress(address: DepositAddress): DepositAddress;
/**
 * Transform withdrawal response (no transformation needed - already safe)
 */
export declare function toPublicWithdrawalResponse(response: WithdrawalResponse): WithdrawalResponse;
/**
 * Transform wallet config (no transformation needed - already public)
 */
export declare function toPublicWalletConfig(config: WalletConfigPublic): WalletConfigPublic;
/**
 * CCPayment-specific transformers
 */
/**
 * Transform CCPayment balance response to CryptoBalance
 */
export declare function fromCCPaymentBalance(ccBalance: {
    coinId: number;
    coinSymbol: string;
    chain: string;
    balance: string;
    usdValue: string;
    available: string;
    frozen: string;
}): CryptoBalance;
/**
 * Transform CCPayment deposit address to DepositAddress
 */
export declare function fromCCPaymentDepositAddress(ccAddress: {
    coinSymbol: string;
    chain: string;
    address: string;
    memo?: string;
    qrCode?: string;
}): DepositAddress;
export declare function fromDbCryptoWallet(wallet: any): DepositAddress;
/**
 * Transform CCPayment token info to SupportedCoin
 */
export declare function fromCCPaymentTokenInfo(token: any, price?: string): SupportedCoin;
export declare function toPublicSupportedCoin(coin: SupportedCoin): any;
export declare function toPublicWithdrawFeeInfo(feeInfo: CCPaymentWithdrawFee): Omit<CCPaymentWithdrawFee, 'coinId'>;
/**
 * Utility function to safely extract user-specific data
 */
export declare function extractUserData<T>(data: T & {
    userId: UserId;
}, requestingUserId: UserId): T;
/**
 * Pagination transformer
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare function toPaginatedResponse<T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T>;
