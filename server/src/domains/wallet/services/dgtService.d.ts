/**
 * DGT Service
 *
 * Centralized service for all DGT (DegenTalk Token) operations
 * Used by tip, shop, engagement, and other domains
 */
import type { UserId } from '@shared/types/ids';
import type { DgtTransaction, DgtTransactionMetadata } from '@shared/types';
/**
 * Centralized DGT operations service
 */
export declare class DgtService {
    /**
     * Credit DGT to a user (used by tips, rewards, airdrops, etc.)
     */
    creditDgt(userId: UserId, amount: number, metadata: DgtTransactionMetadata): Promise<DgtTransaction>;
    /**
     * Debit DGT from a user (used by shop purchases, transfers, etc.)
     */
    debitDgt(userId: UserId, amount: number, metadata: DgtTransactionMetadata): Promise<DgtTransaction>;
    /**
     * Get user's DGT balance
     */
    getDgtBalance(userId: UserId): Promise<number>;
    /**
     * Check if user has sufficient DGT balance
     */
    hasSufficientBalance(userId: UserId, amount: number): Promise<boolean>;
    /**
     * Process shop purchase (debit DGT and handle purchase logic)
     */
    processShopPurchase(userId: UserId, amount: number, itemId: string, itemName: string): Promise<DgtTransaction>;
    /**
     * Process tip sending (debit from sender)
     */
    processTipSend(senderId: UserId, amount: number, recipientId: UserId, message?: string): Promise<DgtTransaction>;
    /**
     * Process tip receiving (credit to recipient)
     */
    processTipReceive(recipientId: UserId, amount: number, senderId: UserId, message?: string): Promise<DgtTransaction>;
    /**
     * Process XP boost purchase
     */
    processXpBoostPurchase(userId: UserId, amount: number, boostType: string, duration: number): Promise<DgtTransaction>;
    /**
     * Process reward distribution (from engagement, achievements, etc.)
     */
    processReward(userId: UserId, amount: number, rewardType: string, reason: string): Promise<DgtTransaction>;
    /**
     * Process admin credit
     */
    processAdminCredit(userId: UserId, amount: number, reason: string, adminId: UserId): Promise<DgtTransaction>;
    /**
     * Process admin debit
     */
    processAdminDebit(userId: UserId, amount: number, reason: string, adminId: UserId): Promise<DgtTransaction>;
    /**
     * Process airdrop distribution
     */
    processAirdrop(userId: UserId, amount: number, airdropId: string, airdropName: string): Promise<DgtTransaction>;
}
export declare const dgtService: DgtService;
