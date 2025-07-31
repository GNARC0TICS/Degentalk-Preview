import { db } from '@degentalk/db';
import { mentions, userMentionPreferences, users, friendships, userFollows } from '@schema';
import { eq, and, desc, sql, inArray, or } from 'drizzle-orm';
import { logger } from '@core/logger';
export class MentionsService {
    /**
     * Extract @username mentions from text content
     */
    static extractMentions(content) {
        const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
        const matches = content.match(mentionRegex);
        if (!matches)
            return [];
        // Remove @ symbol and return unique usernames
        return [...new Set(matches.map((match) => match.slice(1)))];
    }
    /**
     * Process mentions in content and create mention records
     */
    static async processMentions({ content, mentioningUserId, type, threadId, postId, messageId, context }) {
        const mentionedUsernames = this.extractMentions(content);
        if (mentionedUsernames.length === 0)
            return [];
        try {
            // Find valid users from mentioned usernames
            const mentionedUsers = await db
                .select({ id: users.id, username: users.username })
                .from(users)
                .where(inArray(sql `LOWER(${users.username})`, mentionedUsernames.map((u) => u.toLowerCase())));
            if (mentionedUsers.length === 0)
                return [];
            // Check user preferences for each mentioned user
            const mentionRecords = [];
            for (const user of mentionedUsers) {
                const preferences = await this.getUserMentionPreferences(user.id);
                // Check if this type of mention is allowed
                if (!this.isMentionAllowed(type, preferences))
                    continue;
                // Check privacy settings (implement friend/follower checks here)
                if (preferences.onlyFriendsMention || preferences.onlyFollowersMention) {
                    const hasPermission = await this.checkMentionPermissions(mentioningUserId, user.id, preferences);
                    if (!hasPermission)
                        continue;
                }
                // Create mention record
                const mentionRecord = await db
                    .insert(mentions)
                    .values({
                    mentionedUserId: user.id,
                    mentioningUserId,
                    type,
                    threadId,
                    postId,
                    messageId,
                    mentionText: `@${user.username}`,
                    context: context || content.slice(0, 200),
                    isRead: false,
                    isNotified: false
                })
                    .returning();
                mentionRecords.push(mentionRecord[0]);
            }
            return mentionRecords;
        }
        catch (error) {
            logger.error('Error processing mentions:', error);
            return [];
        }
    }
    /**
     * Get user's mention preferences
     */
    static async getUserMentionPreferences(userId) {
        const preferences = await db
            .select()
            .from(userMentionPreferences)
            .where(eq(userMentionPreferences.userId, userId))
            .limit(1);
        // Return default preferences if none exist
        if (preferences.length === 0) {
            return {
                emailNotifications: true,
                pushNotifications: true,
                allowThreadMentions: true,
                allowPostMentions: true,
                allowShoutboxMentions: true,
                allowWhisperMentions: true,
                onlyFriendsMention: false,
                onlyFollowersMention: false
            };
        }
        return preferences[0];
    }
    /**
     * Check if mention type is allowed for user
     */
    static isMentionAllowed(type, preferences) {
        switch (type) {
            case 'thread':
                return preferences.allowThreadMentions;
            case 'post':
                return preferences.allowPostMentions;
            case 'shoutbox':
                return preferences.allowShoutboxMentions;
            case 'whisper':
                return preferences.allowWhisperMentions;
            default:
                return false;
        }
    }
    /**
     * Check mention permissions based on privacy settings
     */
    static async checkMentionPermissions(mentioningUserId, mentionedUserId, preferences) {
        // Don't allow self-mentions
        if (mentioningUserId === mentionedUserId)
            return false;
        // If only friends can mention, check friendship
        if (preferences.onlyFriendsMention) {
            const areFriends = await this.areFriends(mentioningUserId, mentionedUserId);
            return areFriends;
        }
        // If only followers can mention, check follow relationship
        if (preferences.onlyFollowersMention) {
            const isFollower = await this.isFollowing(mentioningUserId, mentionedUserId);
            return isFollower;
        }
        return true;
    }
    /**
     * Check if two users are friends
     */
    static async areFriends(userId1, userId2) {
        try {
            const friendship = await db
                .select()
                .from(friendships)
                .where(and(or(and(eq(friendships.requesterId, userId1), eq(friendships.addresseeId, userId2)), and(eq(friendships.requesterId, userId2), eq(friendships.addresseeId, userId1))), eq(friendships.status, 'accepted')))
                .limit(1);
            return friendship.length > 0;
        }
        catch (error) {
            logger.error('Error checking friendship:', error);
            return false;
        }
    }
    /**
     * Check if user is following another user
     */
    static async isFollowing(followerId, followeeId) {
        try {
            const follow = await db
                .select()
                .from(userFollows)
                .where(and(eq(userFollows.followerId, followerId), eq(userFollows.followeeId, followeeId)))
                .limit(1);
            return follow.length > 0;
        }
        catch (error) {
            logger.error('Error checking follow relationship:', error);
            return false;
        }
    }
    /**
     * Get mentions for a user
     */
    static async getUserMentions(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const userMentions = await db
            .select({
            id: mentions.id,
            type: mentions.type,
            threadId: mentions.threadId,
            postId: mentions.postId,
            messageId: mentions.messageId,
            mentionText: mentions.mentionText,
            context: mentions.context,
            isRead: mentions.isRead,
            createdAt: mentions.createdAt,
            mentioningUser: {
                id: users.id,
                username: users.username,
                avatarUrl: users.avatarUrl,
                activeAvatarUrl: users.activeAvatarUrl
            }
        })
            .from(mentions)
            .leftJoin(users, eq(mentions.mentioningUserId, users.id))
            .where(eq(mentions.mentionedUserId, userId))
            .orderBy(desc(mentions.createdAt))
            .limit(limit)
            .offset(offset);
        return userMentions;
    }
    /**
     * Mark mentions as read
     */
    static async markMentionsAsRead(userId, mentionIds) {
        if (mentionIds && mentionIds.length > 0) {
            // Mark specific mentions as read
            await db
                .update(mentions)
                .set({ isRead: true, readAt: sql `NOW()` })
                .where(and(eq(mentions.mentionedUserId, userId), inArray(mentions.id, mentionIds)));
        }
        else {
            // Mark all mentions as read
            await db
                .update(mentions)
                .set({ isRead: true, readAt: sql `NOW()` })
                .where(eq(mentions.mentionedUserId, userId));
        }
    }
    /**
     * Get unread mention count
     */
    static async getUnreadMentionCount(userId) {
        const result = await db
            .select({ count: sql `COUNT(*)` })
            .from(mentions)
            .where(and(eq(mentions.mentionedUserId, userId), eq(mentions.isRead, false)));
        return result[0]?.count || 0;
    }
    /**
     * Search users for mention autocomplete
     */
    static async searchUsersForMention(query, limit = 10) {
        if (query.length < 1)
            return [];
        const searchResults = await db
            .select({
            id: users.id,
            username: users.username,
            avatarUrl: users.avatarUrl,
            activeAvatarUrl: users.activeAvatarUrl,
            role: users.role,
            level: users.level
        })
            .from(users)
            .where(sql `LOWER(${users.username}) LIKE LOWER(${`%${query}%`})`)
            .orderBy(users.username)
            .limit(limit);
        return searchResults;
    }
    /**
     * Update user mention preferences
     */
    static async updateUserMentionPreferences(userId, preferences) {
        const existingPrefs = await db
            .select()
            .from(userMentionPreferences)
            .where(eq(userMentionPreferences.userId, userId))
            .limit(1);
        if (existingPrefs.length === 0) {
            // Create new preferences
            return await db
                .insert(userMentionPreferences)
                .values({
                userId,
                ...preferences
            })
                .returning();
        }
        else {
            // Update existing preferences
            return await db
                .update(userMentionPreferences)
                .set({
                ...preferences,
                updatedAt: sql `NOW()`
            })
                .where(eq(userMentionPreferences.userId, userId))
                .returning();
        }
    }
}
