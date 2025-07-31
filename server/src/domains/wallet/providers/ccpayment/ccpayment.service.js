/**
 * CCPayment Service - Orchestration Layer
 *
 * This service orchestrates calls to the CCPayment API v2.
 * It handles user wallet creation, deposits, withdrawals, and swaps,
 * mapping Degentalk concepts to CCPayment API calls.
 */
import { logger } from '@core/logger';
import { ccpaymentApiService } from './ccpayment-api.service';
import { db } from '@degentalk/db';
import { ccpaymentUsers } from '@schema';
import { eq } from 'drizzle-orm';
export class CCPaymentService {
    /**
     * Get or create a CCPayment mapping for a Degentalk user.
     * In v2, there is no explicit user creation endpoint. A user is implicitly
     * created when we first request a deposit address for their userId.
     * We will store our own mapping to track this.
     * @param userId The Degentalk user's ID.
     * @returns The Degentalk user's ID, which now serves as the CCPayment user ID.
     */
    async getOrCreateCCPaymentUser(userId) {
        // Check if a wallet record already exists for this user.
        const existingMapping = await db
            .select()
            .from(ccpaymentUsers)
            .where(eq(ccpaymentUsers.userId, userId))
            .limit(1);
        if (existingMapping.length > 0 && existingMapping[0].ccpaymentUserId) {
            return existingMapping[0].ccpaymentUserId;
        }
        // In v2, the Degentalk userId IS the CCPayment userId.
        // We just need to store this relationship.
        const ccpaymentUserId = userId;
        await db.insert(ccpaymentUsers).values({
            userId: userId,
            ccpaymentUserId: ccpaymentUserId,
        });
        logger.info('CCPaymentService', 'Created CCPayment user mapping', { userId, ccpaymentUserId });
        return ccpaymentUserId;
    }
    /**
     * Create or get a deposit address for a user.
     * @param userId The user's unique ID.
     * @param chain The blockchain symbol (e.g., 'POLYGON').
     */
    async createDepositAddress(userId, chain) {
        const body = { userId, chain };
        return ccpaymentApiService.makeRequest('/ccpayment/v2/getOrCreateUserDepositAddress', body);
    }
    /**
     * Get a user's crypto balances.
     * @param userId The user's unique ID.
     */
    async getUserCryptoBalances(userId) {
        const body = { userId };
        const response = await ccpaymentApiService.makeRequest('/ccpayment/v2/getUserCoinAssetList', body);
        return response.assets;
    }
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
    async requestWithdrawal(params) {
        return ccpaymentApiService.makeRequest('/ccpayment/v2/applyUserWithdrawToNetwork', params);
    }
    /**
     * Perform a swap for a user.
     * @param userId The user's unique ID.
     * @param fromCoinId The ID of the coin to swap from.
     * @param toCoinId The ID of the coin to swap to.
     * @param fromAmount The amount of the input coin.
     * @param orderId Your unique order ID for this swap.
     */
    async swap(params) {
        return ccpaymentApiService.makeRequest('/ccpayment/v2/userSwap', params);
    }
    /**
     * Get information about a specific token.
     * @param coinId The ID of the coin.
     */
    async getTokenInfo(coinId) {
        return ccpaymentApiService.makeRequest('/ccpayment/v2/getCoin', { coinId });
    }
    /**
     * Get a list of all supported tokens.
     */
    async getTokenList() {
        return ccpaymentApiService.makeRequest('/ccpayment/v2/getCoinList');
    }
    /**
     * Health check for CCPayment services.
     */
    async healthCheck() {
        return ccpaymentApiService.healthCheck();
    }
}
// Export a singleton instance
export const ccpaymentService = new CCPaymentService();
