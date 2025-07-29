/**
 * CCPayment Wallet Adapter
 *
 * Implements the wallet adapter interface for CCPayment provider
 * Leverages existing CCPayment services for actual implementation
 */
import type { UserId } from '@shared/types/ids';
import type { WalletBalance, DepositAddress, DgtTransaction, WithdrawalRequest, WithdrawalResponse, WebhookResult, PaginationOptions, SupportedCoin, CCPaymentWithdrawFee } from '@shared/types';
export interface WalletAdapter {
    getUserBalance(userId: UserId): Promise<WalletBalance>;
    createDepositAddress(userId: UserId, coinSymbol: string, chain: string): Promise<DepositAddress>;
    requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse>;
    getTransactionHistory(userId: UserId, options: PaginationOptions): Promise<DgtTransaction[]>;
    processWebhook(payload: string, signature: string): Promise<WebhookResult>;
    getSupportedCoins(): Promise<SupportedCoin[]>;
    getTokenInfo(coinId: string): Promise<SupportedCoin>;
    validateAddress(address: string, chain: string): Promise<{
        isValid: boolean;
    }>;
    getWithdrawFee(coinId: number, chain: string): Promise<CCPaymentWithdrawFee>;
}
export declare class CCPaymentAdapter implements WalletAdapter {
    /**
     * Get comprehensive user balance including DGT and crypto
     */
    getUserBalance(userId: UserId): Promise<WalletBalance>;
    /**
     * Create deposit address for specified coin and chain
     */
    createDepositAddress(userId: UserId, coinSymbol: string, chain: string): Promise<DepositAddress>;
    /**
     * Request cryptocurrency withdrawal
     */
    requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse>;
    /**
     * Get list of supported coins
     */
    getSupportedCoins(): Promise<SupportedCoin[]>;
    /**
     * Get info for a single token
     */
    getTokenInfo(coinId: string): Promise<SupportedCoin>;
    /**
     * Validate a crypto address for a given chain
     */
    validateAddress(address: string, chain: string): Promise<{
        isValid: boolean;
    }>;
    /**
     * Get withdrawal fee for a specific coin and chain
     */
    getWithdrawFee(coinId: number, chain: string): Promise<CCPaymentWithdrawFee>;
    /**
     * Get paginated transaction history
     */
    getTransactionHistory(userId: UserId, options: PaginationOptions): Promise<DgtTransaction[]>;
    /**
     * Process webhook from CCPayment
     */
    processWebhook(payload: string, signature: string): Promise<WebhookResult>;
    /**
     * Handle deposit webhook event
     */
    private handleDepositWebhook;
    /**
     * Handle withdrawal webhook event
     */
    private handleWithdrawalWebhook;
    /**
     * Get CCPayment user ID from database mapping
     */
    private getCCPaymentUserId;
    /**
     * Get DGT balance from local database
     */
    private getDgtBalance;
    /**
     * Map CCPayment transaction type to our enum
     */
    private mapTransactionType;
    /**
     * Map CCPayment status to our enum
     */
    private mapTransactionStatus;
}
export declare const ccpaymentAdapter: CCPaymentAdapter;
