/**
 * Core Wallet Service
 *
 * Orchestrates wallet operations across different providers
 * Provides unified interface for wallet functionality
 */
import type { UserId } from '@shared/types/ids';
import type { WalletBalance, DepositAddress, DgtTransaction, DgtTransactionMetadata, // Added
WithdrawalRequest, WithdrawalResponse, WebhookResult, PaginationOptions, WalletConfigPublic, DgtTransfer, SupportedCoin, CCPaymentWithdrawFee } from '@shared/types';
export interface WalletServiceConfig {
    primaryProvider: 'ccpayment';
    enableCaching: boolean;
    cacheProvider?: 'memory' | 'redis';
    defaultCurrency: string;
    supportedCurrencies: string[];
}
export declare class WalletService {
    private readonly config;
    private readonly primaryAdapter;
    constructor(config?: Partial<WalletServiceConfig>);
    /**
     * Get comprehensive user wallet balance
     */
    getUserBalance(userId: UserId): Promise<WalletBalance>;
    /**
     * Create deposit address for cryptocurrency
     */
    createDepositAddress(userId: UserId, coinSymbol: string, chain?: string): Promise<DepositAddress>;
    /**
     * Get all deposit addresses for a user
     */
    getDepositAddresses(userId: UserId): Promise<DepositAddress[]>;
    /**
     * Initialize a new user's wallet with default crypto addresses and welcome bonus.
     * Implements circuit breaker pattern to never fail registration flow.
     */
    initializeWallet(userId: UserId): Promise<{
        success: boolean;
        walletsCreated: number;
        dgtWalletCreated: boolean;
        welcomeBonusAdded: boolean;
    }>;
    /**
     * Ensure CCPayment wallet exists for user (used during login).
     * Non-critical operation that won't fail authentication.
     */
    ensureCcPaymentWallet(userId: UserId): Promise<string | null>;
    /**
     * Swap cryptocurrencies for a user.
     */
    swapCrypto(userId: UserId, params: {
        fromCoinId: number;
        toCoinId: number;
        fromAmount: string;
    }): Promise<{
        recordId: string;
    }>;
    /**
     * Request cryptocurrency withdrawal
     */
    requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse>;
    /**
     * Get paginated transaction history
     */
    getTransactionHistory(userId: UserId, options?: Partial<PaginationOptions>): Promise<DgtTransaction[]>;
    /**
     * Get list of supported coins for deposits and withdrawals
     */
    getSupportedCoins(): Promise<SupportedCoin[]>;
    /**
     * Get detailed information for a single supported coin.
     */
    getTokenInfo(coinId: string): Promise<SupportedCoin>;
    /**
     * Validate a crypto address for a given chain.
     */
    validateAddress(address: string, chain: string): Promise<{
        isValid: boolean;
    }>;
    /**
     * Get withdrawal fee for a specific coin and chain.
     */
    getWithdrawFee(coinId: number, chain: string): Promise<CCPaymentWithdrawFee>;
    /**
     * Credit DGT to a user's wallet.
     */
    creditDgt(userId: UserId, amount: number, metadata: DgtTransactionMetadata): Promise<DgtTransaction>;
    /**
     * Debit DGT from a user's wallet.
     */
    debitDgt(userId: UserId, amount: number, metadata: DgtTransactionMetadata): Promise<DgtTransaction>;
    /**
     * Process internal DGT transfer between users
     */
    transferDgt(transfer: DgtTransfer): Promise<DgtTransaction>;
    /**
     * Process webhook from payment provider
     */
    processWebhook(provider: string, payload: string, signature: string): Promise<WebhookResult>;
    /**
     * Get public wallet configuration
     */
    getWalletConfig(): Promise<WalletConfigPublic>;
    /**
     * Create primary adapter based on configuration
     */
    private createPrimaryAdapter;
    /**
     * Validate currency is supported
     */
    private validateCurrency;
    /**
     * Validate withdrawal request
     */
    private validateWithdrawalRequest;
    /**
     * Validate DGT transfer request
     */
    private validateDgtTransfer;
    /**
     * Get default chain for a currency
     */
    private getDefaultChain;
    /**
     * Generate unique transaction ID
     */
    private generateTransactionId;
    /**
     * Get or create a DGT wallet for a user within a transaction.
     */
    private getOrCreateDgtWallet;
    /**
     * Get transaction description from metadata
     */
    private getTransactionDescription;
    private transformDbTransaction;
    /**
     * Handle and standardize errors
     */
    private handleError;
}
export declare const walletService: WalletService;
