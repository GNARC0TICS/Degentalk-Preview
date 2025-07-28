import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import type { MentionThread } from '@shared/types/thread.types';
import type { UserId, ForumId, StructureId } from '@shared/types/ids';
import type { ContentResponse } from './use-content';

interface Mention {
	id: number;
	type: 'thread' | 'post' | 'shoutbox' | 'whisper';
	threadId?: string;
	postId?: string;
	messageId?: string;
	mentionText: string;
	context: string;
	isRead: boolean;
	createdAt: string;
	mentioningUser: {
		id: string;
		username: string;
		avatarUrl?: string | null;
		activeAvatarUrl?: string | null;
	};
}

interface MentionsResponse {
	mentions: Mention[];
	unreadCount: number;
	pagination: {
		page: number;
		limit: number;
		hasMore: boolean;
	};
}

/**
 * Hook to fetch mentions and transform them into content format
 */
export function useContentMentions(page = 1, limit = 20) {
	return useQuery<ContentResponse>({
		queryKey: ['content', 'mentions', page, limit],
		queryFn: async (): Promise<ContentResponse> => {
			const response = await apiRequest<MentionsResponse>({
				url: `/api/social/mentions?page=${page}&limit=${limit}`,
				method: 'GET'
			});

			if (!response) {
				return { items: [], meta: { hasMore: false, total: 0, page: 1 } };
			}

			// Transform mentions into thread-like format for display
			const items: MentionThread[] = response.mentions.map((mention) => ({
				// Basic thread properties (required by Thread type)
				id: mention.threadId || mention.postId || `mention-${mention.id}`,
				title: `${mention.mentioningUser.username} mentioned you`,
				slug: '',
				content: mention.context,
				excerpt: mention.context.substring(0, 150) + '...',
				
				// Timestamps
				createdAt: mention.createdAt,
				updatedAt: mention.createdAt,
				
				// User info - use mentioning user
				userId: mention.mentioningUser.id as UserId,
				user: {
					id: mention.mentioningUser.id as UserId,
					username: mention.mentioningUser.username,
					avatarUrl: mention.mentioningUser.avatarUrl,
					activeAvatarUrl: mention.mentioningUser.activeAvatarUrl,
					role: 'user' as const, // Default role
					level: 1,
					createdAt: new Date().toISOString()
				},
				
				// Required Thread fields
				isSticky: false,
				isLocked: false,
				isHidden: false,
				isSolved: false,
				viewCount: 0,
				postCount: 0,
				firstPostLikeCount: 0,
				structureId: 'mention-context' as StructureId, // Placeholder for mentions
				
				// Structure information (required)
				structure: {
					id: 'mention-context' as StructureId,
					name: 'Mentions',
					slug: 'mentions',
					type: 'forum' as const
				},
				
				// Featured forum (required)
				featuredForum: {
					id: 'mentions' as ForumId,
					name: 'Mentions',
					slug: 'mentions',
					colorTheme: 'blue'
				},
				
				// Tags and categorization
				tags: [],
				
				// MentionThread specific fields
				isRead: mention.isRead,
				metadata: {
					mentionId: mention.id,
					mentionType: mention.type,
					originalThreadId: mention.threadId,
					originalPostId: mention.postId
				}
			}));

			return {
				items,
				meta: {
					hasMore: response.pagination.hasMore,
					total: response.mentions.length,
					page: response.pagination.page
				}
			};
		},
		staleTime: 30 * 1000, // 30 seconds
		refetchInterval: 60 * 1000 // 1 minute
	});
}

/**
 * Hook to get unread mention count
 */
export function useUnreadMentionCount() {
	return useQuery<number>({
		queryKey: ['mentions', 'unread-count'],
		queryFn: async () => {
			const response = await apiRequest<{ unreadCount: number }>({
				url: '/api/social/mentions/unread-count',
				method: 'GET'
			});
			return response?.unreadCount || 0;
		},
		refetchInterval: 30 * 1000 // 30 seconds
	});
}