import type { MentionType } from './mentions.types';
export declare class MentionsService {
    /**
     * Extract @username mentions from text content
     */
    static extractMentions(content: string): string[];
    /**
     * Process mentions in content and create mention records
     */
    static processMentions({ content, mentioningUserId, type, threadId, postId, messageId, context }: {
        content: string;
        mentioningUserId: string;
        type: MentionType;
        threadId?: string;
        postId?: string;
        messageId?: string;
        context?: string;
    }): Promise<any[]>;
    /**
     * Get user's mention preferences
     */
    static getUserMentionPreferences(userId: string): Promise<any>;
    /**
     * Check if mention type is allowed for user
     */
    static isMentionAllowed(type: MentionType, preferences: any): boolean;
    /**
     * Check mention permissions based on privacy settings
     */
    static checkMentionPermissions(mentioningUserId: string, mentionedUserId: string, preferences: any): Promise<boolean>;
    /**
     * Check if two users are friends
     */
    static areFriends(userId1: string, userId2: string): Promise<boolean>;
    /**
     * Check if user is following another user
     */
    static isFollowing(followerId: string, followeeId: string): Promise<boolean>;
    /**
     * Get mentions for a user
     */
    static getUserMentions(userId: string, page?: number, limit?: number): Promise<any>;
    /**
     * Mark mentions as read
     */
    static markMentionsAsRead(userId: string, mentionIds?: number[]): Promise<void>;
    /**
     * Get unread mention count
     */
    static getUnreadMentionCount(userId: string): Promise<number>;
    /**
     * Search users for mention autocomplete
     */
    static searchUsersForMention(query: string, limit?: number): Promise<any>;
    /**
     * Update user mention preferences
     */
    static updateUserMentionPreferences(userId: string, preferences: Partial<any>): Promise<any>;
}
