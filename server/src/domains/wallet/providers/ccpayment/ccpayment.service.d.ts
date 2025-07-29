/**
 * CCPayment Service - Orchestration Layer
 *
 * This service orchestrates calls to the CCPayment API v2.
 * It handles user wallet creation, deposits, withdrawals, and swaps,
 * mapping Degentalk concepts to CCPayment API calls.
 */
import type { UserId } from '@shared/types/ids';
export interface DepositAddress {
    address: string;
    memo?: string;
}
export interface CryptoBalance {
    coinId: number;
    coinSymbol: string;
    available: string;
}
export interface CCPaymentWithdrawalResponse {
    recordId: string;
}
export interface CCPaymentSwapResponse {
    recordId: string;
    orderId: string;
    amountOut: string;
    netAmountOut: string;
}
export declare class CCPaymentService {
    /**
     * Get or create a CCPayment mapping for a Degentalk user.
     * In v2, there is no explicit user creation endpoint. A user is implicitly
     * created when we first request a deposit address for their userId.
     * We will store our own mapping to track this.
     * @param userId The Degentalk user's ID.
     * @returns The Degentalk user's ID, which now serves as the CCPayment user ID.
     */
    getOrCreateCCPaymentUser(userId: UserId): Promise<string>;
    /**
     * Create or get a deposit address for a user.
     * @param userId The user's unique ID.
     * @param chain The blockchain symbol (e.g., 'POLYGON').
     */
    createDepositAddress(userId: string, chain: string): Promise<DepositAddress>;
    /**
     * Get a user's crypto balances.
     * @param userId The user's unique ID.
     */
    getUserCryptoBalances(userId: string): Promise<CryptoBalance[]>;
    /**
     * Request a withdrawal for a user.
     * @param userId The user's unique ID.
     * @param coinId The ID of the coin to withdraw.
     * @param chain The blockchain symbol.
     * @param address The destination address.
     * @param amount The amount to withdraw.
     * @param orderId Your unique order ID for this transaction.
     * @param memo Optional memo for chains that require it.
     */
    requestWithdrawal(params: {
        userId: string;
        coinId: number;
        chain: string;
        address: string;
        amount: string;
        orderId: string;
        memo?: string;
    }): Promise<CCPaymentWithdrawalResponse>;
    /**
     * Perform a swap for a user.
     * @param userId The user's unique ID.
     * @param fromCoinId The ID of the coin to swap from.
     * @param toCoinId The ID of the coin to swap to.
     * @param fromAmount The amount of the input coin.
     * @param orderId Your unique order ID for this swap.
     */
    swap(params: {
        userId: string;
        coinIdIn: number;
        coinIdOut: number;
        amountIn: string;
        orderId: string;
    }): Promise<CCPaymentSwapResponse>;
    /**
     * Get information about a specific token.
     * @param coinId The ID of the coin.
     */
    getTokenInfo(coinId: number): Promise<unknown>;
    /**
     * Get a list of all supported tokens.
     */
    getTokenList(): Promise<unknown>;
    /**
     * Health check for CCPayment services.
     */
    healthCheck(): Promise<boolean>;
}
export declare const ccpaymentService: CCPaymentService;
