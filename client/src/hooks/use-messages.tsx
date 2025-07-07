import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MessageId } from '@/types/ids';
import { type MessageId } from "@shared/types";

export interface Message {
	id: MessageId;
	senderId: string;
	recipientId: string;
	content: string;
	timestamp: string;
	isRead: boolean;
}

export interface Conversation {
	userId: string;
	username: string;
	avatarUrl: string | null;
	lastMessage: string;
	lastMessageTime: string;
	unreadCount: number;
}

export interface SendMessagePayload {
	recipientId: string;
	content: string;
}

export function useMessages() {
	const queryClient = useQueryClient();

	// Get all conversations for the current user
	const useConversations = () => {
		return useQuery({
			queryKey: ['/api/messages/conversations'],
			staleTime: 1000 * 60 // 1 minute
		});
	};

	// Get messages for a specific conversation
	const useConversation = (userId: string) => {
		return useQuery({
			queryKey: ['/api/messages/conversation', userId],
			queryFn: async () => {
				if (!userId) return [];
				return fetch(`/api/messages/conversation/${userId}`).then((res) => res.json());
			},
			enabled: !!userId,
			staleTime: 1000 * 30 // 30 seconds
		});
	};

	// Send a new message
	const useSendMessage = () => {
		return useMutation({
			mutationFn: async (payload: SendMessagePayload) => {
				const response = await fetch('/api/messages/send', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(payload)
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || 'Failed to send message');
				}

				return response.json();
			},
			onSuccess: (_, variables) => {
				// Invalidate conversations and the specific conversation
				queryClient.invalidateQueries({
					queryKey: ['/api/messages/conversations']
				});
				queryClient.invalidateQueries({
					queryKey: ['/api/messages/conversation', variables.recipientId]
				});
			}
		});
	};

	// Mark messages as read
	const useMarkAsRead = () => {
		return useMutation({
			mutationFn: async (senderId: string) => {
				const response = await fetch(`/api/messages/mark-read/${senderId}`, {
					method: 'POST'
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || 'Failed to mark messages as read');
				}

				return response.json();
			},
			onSuccess: (_, senderId) => {
				// Invalidate conversations and the specific conversation
				queryClient.invalidateQueries({
					queryKey: ['/api/messages/conversations']
				});
				queryClient.invalidateQueries({
					queryKey: ['/api/messages/conversation', senderId]
				});
				queryClient.invalidateQueries({
					queryKey: ['/api/messages/unread-count']
				});
			}
		});
	};

	// Delete a conversation
	const useDeleteConversation = () => {
		return useMutation({
			mutationFn: async (userId: string) => {
				const response = await fetch(`/api/messages/conversation/${userId}`, {
					method: 'DELETE'
				});

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.message || 'Failed to delete conversation');
				}

				return response.json();
			},
			onSuccess: (_, userId) => {
				// Invalidate conversations and the specific conversation
				queryClient.invalidateQueries({
					queryKey: ['/api/messages/conversations']
				});
				queryClient.invalidateQueries({
					queryKey: ['/api/messages/conversation', userId]
				});
				queryClient.invalidateQueries({
					queryKey: ['/api/messages/unread-count']
				});
			}
		});
	};

	// Get unread message count
	const useUnreadCount = () => {
		return useQuery({
			queryKey: ['/api/messages/unread-count'],
			staleTime: 1000 * 30 // 30 seconds
		});
	};

	return {
		useConversations,
		useConversation,
		useSendMessage,
		useMarkAsRead,
		useDeleteConversation,
		useUnreadCount
	};
}
