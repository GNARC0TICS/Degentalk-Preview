import type { ModeratorId, EntityId } from '../../types/ids.js';
export type VisibilityStatus = 'draft' | 'published' | 'hidden' | 'shadowbanned' | 'archived' | 'deleted';
export interface ApplyModerationActionParams {
    moderatorId: ModeratorId;
    targetType: 'thread' | 'post';
    targetId: EntityId;
    newVisibility: VisibilityStatus;
    reason: string;
}
export interface BulkModerationActionParams {
    moderatorId: ModeratorId;
    targets: Array<{
        type: 'thread' | 'post';
        id: EntityId;
    }>;
    newVisibility: VisibilityStatus;
    reason: string;
}
export interface BulkModerationResult {
    success: number;
    failed: number;
}
/**
 * Frontend-safe interface for moderation action operations.
 * Server implementations should be in server/src/domains/admin/services/moderation-action.service.ts
 */
export interface ModerationActionInterface {
    applyModerationAction(params: ApplyModerationActionParams): Promise<void>;
    getModerationHistory(targetType: 'thread' | 'post', targetId: EntityId): Promise<Array<{
        id: string;
        moderatorId: ModeratorId;
        contentType: string;
        contentId: EntityId;
        actionType: string;
        reason: string;
        additionalData: any;
        createdAt: Date;
    }>>;
    getModeratorActions(moderatorId: ModeratorId, limit?: number): Promise<Array<{
        id: string;
        moderatorId: ModeratorId;
        contentType: string;
        contentId: EntityId;
        actionType: string;
        reason: string;
        additionalData: any;
        createdAt: Date;
    }>>;
    bulkModerationAction(params: BulkModerationActionParams): Promise<BulkModerationResult>;
}
//# sourceMappingURL=types.d.ts.map