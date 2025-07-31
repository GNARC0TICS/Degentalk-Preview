/**
 * DGT Service
 *
 * Centralized service for all DGT (DegenTalk Token) operations
 * Used by tip, shop, engagement, and other domains
 */
import { walletService } from './wallet.service';
import { logger } from '@core/logger';
/**
 * Centralized DGT operations service
 */
export class DgtService {
    /**
     * Credit DGT to a user (used by tips, rewards, airdrops, etc.)
     */
    async creditDgt(userId, amount, metadata) {
        logger.info('DgtService:creditDgt', 'Processing DGT credit', {
            userId,
            amount,
            source: metadata.source
        });
        return await walletService.creditDgt(userId, amount, metadata);
    }
    /**
     * Debit DGT from a user (used by shop purchases, transfers, etc.)
     */
    async debitDgt(userId, amount, metadata) {
        logger.info('DgtService:debitDgt', 'Processing DGT debit', {
            userId,
            amount,
            source: metadata.source
        });
        return await walletService.debitDgt(userId, amount, metadata);
    }
    /**
     * Get user's DGT balance
     */
    async getDgtBalance(userId) {
        const balance = await walletService.getUserBalance(userId);
        return balance.dgtBalance;
    }
    /**
     * Check if user has sufficient DGT balance
     */
    async hasSufficientBalance(userId, amount) {
        const balance = await this.getDgtBalance(userId);
        return balance >= amount;
    }
    /**
     * Process shop purchase (debit DGT and handle purchase logic)
     */
    async processShopPurchase(userId, amount, itemId, itemName) {
        return await this.debitDgt(userId, amount, {
            source: 'shop_purchase',
            reason: `Shop purchase: ${itemName}`,
            shopItemId: itemId,
            shopItemName: itemName
        });
    }
    /**
     * Process tip sending (debit from sender)
     */
    async processTipSend(senderId, amount, recipientId, message) {
        return await this.debitDgt(senderId, amount, {
            source: 'tip_send',
            reason: message || 'Tip sent',
            recipientId,
            tipMessage: message
        });
    }
    /**
     * Process tip receiving (credit to recipient)
     */
    async processTipReceive(recipientId, amount, senderId, message) {
        return await this.creditDgt(recipientId, amount, {
            source: 'tip_receive',
            reason: message || 'Tip received',
            senderId,
            tipMessage: message
        });
    }
    /**
     * Process XP boost purchase
     */
    async processXpBoostPurchase(userId, amount, boostType, duration) {
        return await this.debitDgt(userId, amount, {
            source: 'xp_boost',
            reason: `XP boost purchase: ${boostType}`,
            boostType,
            boostDuration: duration
        });
    }
    /**
     * Process reward distribution (from engagement, achievements, etc.)
     */
    async processReward(userId, amount, rewardType, reason) {
        return await this.creditDgt(userId, amount, {
            source: 'engagement_reward',
            reason,
            rewardType
        });
    }
    /**
     * Process admin credit
     */
    async processAdminCredit(userId, amount, reason, adminId) {
        return await this.creditDgt(userId, amount, {
            source: 'admin_credit',
            reason,
            adminId
        });
    }
    /**
     * Process admin debit
     */
    async processAdminDebit(userId, amount, reason, adminId) {
        return await this.debitDgt(userId, amount, {
            source: 'admin_debit',
            reason,
            adminId
        });
    }
    /**
     * Process airdrop distribution
     */
    async processAirdrop(userId, amount, airdropId, airdropName) {
        return await this.creditDgt(userId, amount, {
            source: 'airdrop',
            reason: `Airdrop: ${airdropName}`,
            airdropId,
            airdropName
        });
    }
}
// Export singleton instance
export const dgtService = new DgtService();
