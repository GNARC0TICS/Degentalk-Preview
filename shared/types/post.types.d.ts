import type { PostId, ThreadId, UserId } from './ids.js';
/**
 * Post Type
 * Unified post representation across the platform
 *
 * This matches the Post interface from core/forum.types.ts but with
 * user population for display purposes.
 */
export interface PostAuthor {
    id: UserId;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    activeAvatarUrl?: string;
    role: 'user' | 'moderator' | 'admin' | 'owner';
    isOnline?: boolean;
    isVerified?: boolean;
    isBanned?: boolean;
    forumStats?: {
        level: number;
        xp: number;
        reputation: number;
        totalPosts: number;
        totalThreads: number;
    };
    lastSeenAt?: string;
    joinedAt?: string;
}
/**
 * Main Post Type
 *
 * This is the display-ready version with populated user data.
 * For the base database type, see core/forum.types.ts
 */
export interface Post {
    id: PostId;
    content: string;
    threadId: ThreadId;
    userId: UserId;
    user: PostAuthor;
    replyToPostId?: PostId;
    replyToPost?: Pick<Post, 'id' | 'content' | 'user'>;
    isHidden: boolean;
    isEdited: boolean;
    isDeleted?: boolean;
    editCount: number;
    likeCount: number;
    tipAmount?: number;
    hasLiked?: boolean;
    createdAt: string;
    updatedAt: string;
    lastEditedAt?: string;
    thread?: {
        id: ThreadId;
        title: string;
        slug: string;
    };
    permissions?: {
        canEdit: boolean;
        canDelete: boolean;
        canReport: boolean;
        canTip: boolean;
        canMarkSolution: boolean;
    };
}
/**
 * Post creation input
 */
export interface CreatePostInput {
    threadId: ThreadId;
    content: string;
    replyToPostId?: PostId;
}
/**
 * Post update input
 */
export interface UpdatePostInput {
    content: string;
    editReason?: string;
}
/**
 * Type guards
 */
export declare function isPost(value: unknown): value is Post;
