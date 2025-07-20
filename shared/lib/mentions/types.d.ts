import type { UserId } from '../../types/ids.js';
export interface CreateMentionsIndexParams {
    sourceType: 'thread' | 'post' | 'shout';
    sourceId: string;
    userIds: UserId[];
    triggeredBy?: UserId | null;
}
/**
 * Frontend-safe interface for mentions index operations.
 * Server implementations should be in server/src/domains/social/services/mentions-index.service.ts
 */
export interface MentionsIndexInterface {
    createMentionsIndex(params: CreateMentionsIndexParams): Promise<number>;
    getMentionsForSource(sourceType: string, sourceId: string): Promise<Array<{
        id: string;
        sourceType: string;
        sourceId: string;
        mentioningUserId: UserId | null;
        mentionedUserId: UserId;
        createdAt: Date;
    }>>;
    removeMentionsForSource(sourceType: string, sourceId: string): Promise<boolean>;
    getMentionsForUser(userId: UserId, limit?: number, offset?: number): Promise<Array<{
        id: string;
        sourceType: string;
        sourceId: string;
        mentioningUserId: UserId | null;
        mentionedUserId: UserId;
        createdAt: Date;
    }>>;
}
