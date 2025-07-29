/**
 * Tip Service
 *
 * This service handles tipping between users, supporting both DGT and crypto.
 *
 * // [REFAC-TIP]
 */
import type { UserId, TransactionId } from '@shared/types/ids';
/**
 * Tip request structure
 */
export interface TipRequest {
    fromUserId: UserId;
    toUserId: UserId;
    amount: number;
    currency: string;
    source: string;
    contextId?: string;
    message?: string;
}
/**
 * Tip response structure
 */
export interface TipResponse {
    id: string;
    fromUserId: UserId;
    toUserId: UserId;
    amount: number;
    currency: string;
    source: string;
    status: string;
    createdAt: Date;
    transactionIds?: TransactionId[];
}
/**
 * Service for handling tips between users
 */
export declare class TipService {
    private walletService;
    constructor();
    /**
     * Send a tip from one user to another
     * @param request Tip request details
     * @returns Tip response
     */
    sendTip(request: TipRequest): Promise<TipResponse>;
    /**
     * Validate tip settings, including limits and cooldowns
     */
    private validateTipSettings;
    /**
     * Get tip history for a user (sent or received)
     */
    getTipHistory(userId: UserId, type?: 'sent' | 'received' | 'both', limit?: number, offset?: number): Promise<{
        tips: any[];
        total: number;
    }>;
}
export declare const tipService: TipService;
