import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import type { Thread } from '@shared/types/thread.types';
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
			const items: Thread[] = response.mentions.map((mention) => ({
				// Basic thread properties
				id: mention.threadId || mention.postId || `mention-${mention.id}`,
				title: `${mention.mentioningUser.username} mentioned you`,
				slug: '',
				content: mention.context,
				excerpt: mention.context.substring(0, 150) + '...',
				
				// Timestamps
				createdAt: mention.createdAt,
				updatedAt: mention.createdAt,
				
				// User info - use mentioning user
				userId: mention.mentioningUser.id,
				user: {
					id: mention.mentioningUser.id,
					username: mention.mentioningUser.username,
					avatarUrl: mention.mentioningUser.avatarUrl,
					activeAvatarUrl: mention.mentioningUser.activeAvatarUrl,
					role: null,
					level: null,
					createdAt: new Date().toISOString()
				},
				
				// Forum info - null for mentions
				forumId: null,
				forum: null,
				
				// Stats - minimal for mentions
				viewCount: 0,
				replyCount: 0,
				lastReplyAt: null,
				lastReplyUserId: null,
				lastReplyUser: null,
				
				// Flags
				isPinned: false,
				isLocked: false,
				isHidden: false,
				isFeatured: false,
				isSolved: false,
				isRead: mention.isRead,
				
				// Additional metadata
				tags: [],
				metadata: {
					mentionId: mention.id,
					mentionType: mention.type,
					originalThreadId: mention.threadId,
					originalPostId: mention.postId,
					originalMessageId: mention.messageId
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