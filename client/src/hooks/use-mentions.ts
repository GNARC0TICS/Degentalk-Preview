import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-request';

interface MentionUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	role?: string | null;
	level?: number | null;
}

interface UseMentionsOptions {
	onMentionSelect?: (user: MentionUser) => void;
	mentionTrigger?: string;
}

interface MentionState {
	isOpen: boolean;
	query: string;
	position: { top: number; left: number };
	startIndex: number;
}

export function useMentions(options: UseMentionsOptions = {}) {
	const { onMentionSelect, mentionTrigger = '@' } = options;
	const queryClient = useQueryClient();

	const [mentionState, setMentionState] = useState<MentionState>({
		isOpen: false,
		query: '',
		position: { top: 0, left: 0 },
		startIndex: -1
	});

	const editorRef = useRef<HTMLTextAreaElement | null>(null);

	// Get user's unread mention count
	const { data: unreadCount = 0 } = useQuery({
		queryKey: ['/api/social/mentions/unread-count'],
		queryFn: async () => {
			const response = await apiRequest<{ unreadCount: number }>({
				url: '/api/social/mentions/unread-count',
				method: 'GET'
			});
			return response?.unreadCount || 0;
		},
		refetchInterval: 30000 // Refetch every 30 seconds
	});

	// Get user's mentions
	const { data: mentionsData, refetch: refetchMentions } = useQuery({
		queryKey: ['/api/social/mentions'],
		queryFn: async () => {
			return await apiRequest<{
				mentions: any[];
				unreadCount: number;
				pagination: { page: number; limit: number; hasMore: boolean };
			}>({
				url: '/api/social/mentions?page=1&limit=20',
				method: 'GET'
			});
		},
		enabled: false // Only fetch when explicitly requested
	});

	// Mark mentions as read
	const markAsReadMutation = useMutation({
		mutationFn: async (mentionIds?: string[]) => {
			return await apiRequest({
				url: '/api/social/mentions/mark-read',
				method: 'POST',
				data: { mentionIds }
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/social/mentions/unread-count'] });
			queryClient.invalidateQueries({ queryKey: ['/api/social/mentions'] });
		}
	});

	// Process content for mentions (to be called when submitting posts/threads)
	const processMentions = useCallback(
		async (content: string, type: 'thread' | 'post' | 'shoutbox', metadata?: any) => {
			// Extract mentions from content
			const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
			const matches = content.match(mentionRegex);

			if (!matches || matches.length === 0) return;

			// This would typically be handled by the backend when creating posts/threads
			// The frontend just needs to ensure the content includes the mentions
			// Processing mentions
		},
		[]
	);

	// Handle text input to detect mention triggers
	const handleTextChange = useCallback(
		(
			event: React.ChangeEvent<HTMLTextAreaElement> | React.FormEvent<HTMLDivElement>,
			value?: string
		) => {
			const target = event.target as HTMLTextAreaElement | HTMLDivElement;
			const currentValue =
				value || target.textContent || (target as HTMLTextAreaElement).value || '';

			// Store editor reference
			if (target.tagName === 'TEXTAREA') {
				editorRef.current = target as HTMLTextAreaElement;
			}

			// Get cursor position
			let cursorPos = 0;
			if (target.tagName === 'TEXTAREA') {
				cursorPos = (target as HTMLTextAreaElement).selectionStart || 0;
			} else {
				// For contenteditable divs, get cursor position
				const selection = window.getSelection();
				if (selection && selection.rangeCount > 0) {
					const range = selection.getRangeAt(0);
					cursorPos = range.startOffset;
				}
			}

			// Find mention trigger before cursor
			const textBeforeCursor = currentValue.slice(0, cursorPos);
			const mentionMatch = textBeforeCursor.match(
				new RegExp(`(^|\\s)${mentionTrigger}([a-zA-Z0-9_-]*)$`)
			);

			if (mentionMatch) {
				const mentionStart = textBeforeCursor.lastIndexOf(mentionTrigger);
				const query = mentionMatch[2]; // Everything after the @

				// Calculate position for autocomplete dropdown
				const rect = target.getBoundingClientRect();
				const lineHeight = 20; // Approximate line height

				setMentionState({
					isOpen: true,
					query,
					position: {
						top: rect.bottom + 4,
						left: rect.left + 8
					},
					startIndex: mentionStart
				});
			} else {
				setMentionState((prev) => ({ ...prev, isOpen: false, query: '', startIndex: -1 }));
			}
		},
		[mentionTrigger]
	);

	// Handle mention selection
	const handleMentionSelect = useCallback(
		(user: MentionUser) => {
			if (!editorRef.current || mentionState.startIndex === -1) return;

			const textarea = editorRef.current;
			const currentValue = textarea.value;
			const endIndex = mentionState.startIndex + mentionTrigger.length + mentionState.query.length;

			// Replace the mention with the selected username
			const newValue =
				currentValue.slice(0, mentionState.startIndex) +
				`@${user.username} ` +
				currentValue.slice(endIndex);

			// Update textarea value
			textarea.value = newValue;

			// Set cursor position after the mention
			const newCursorPos = mentionState.startIndex + `@${user.username} `.length;
			textarea.setSelectionRange(newCursorPos, newCursorPos);

			// Trigger change event
			const event = new Event('input', { bubbles: true });
			textarea.dispatchEvent(event);

			// Close autocomplete
			setMentionState((prev) => ({ ...prev, isOpen: false, query: '', startIndex: -1 }));

			// Call optional callback
			onMentionSelect?.(user);
		},
		[mentionState, mentionTrigger, onMentionSelect]
	);

	// Close mention autocomplete
	const closeMentions = useCallback(() => {
		setMentionState((prev) => ({ ...prev, isOpen: false }));
	}, []);

	// Mark all mentions as read
	const markAllAsRead = useCallback(() => {
		markAsReadMutation.mutate();
	}, [markAsReadMutation]);

	// Mark specific mentions as read
	const markMentionsAsRead = useCallback(
		(mentionIds: string[]) => {
			markAsReadMutation.mutate(mentionIds);
		},
		[markAsReadMutation]
	);

	return {
		// Mention autocomplete state
		mentionState,
		handleTextChange,
		handleMentionSelect,
		closeMentions,

		// Mentions data
		unreadCount,
		mentions: mentionsData?.mentions || [],
		refetchMentions,

		// Actions
		markAllAsRead,
		markMentionsAsRead,
		processMentions,

		// Loading states
		isMarkingAsRead: markAsReadMutation.isPending
	};
}
