import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTip } from '@/hooks/use-tip';
import { useCreatePost } from '@/features/forum/hooks/useForumQueries';
import { useBookmarkThread, useRemoveBookmark } from '@/features/forum/hooks/useForumQueries';
import type { ThreadDisplay } from '@/types/thread.types';
import { useQueryClient } from '@tanstack/react-query';

interface ThreadActionsContextValue {
	isBookmarked: boolean;
	tip: (...args: [string, number] | [number]) => void;
	toggleBookmark: () => void;
	share: () => void;
	quickReply: (content: string) => void;
}

const ThreadActionsContext = createContext<ThreadActionsContextValue | undefined>(undefined);

export const ThreadActionsProvider: React.FC<{
	thread: ThreadDisplay;
	children: React.ReactNode;
}> = ({ thread, children }) => {
	const [isBookmarked, setIsBookmarked] = useState<boolean>(thread.hasBookmarked ?? false);
	const { toast } = useToast();

	// Hooks
	const queryClient = useQueryClient();
	const { sendTip } = useTip();
	const bookmarkThread = useBookmarkThread();
	const removeBookmark = useRemoveBookmark();
	const createPost = useCreatePost();

	/* ----------------- Actions ----------------- */
	const tip = useCallback(
		(...args: [string, number] | [number]) => {
			const amount = args.length === 1 ? args[0] : args[1];
			if (typeof amount !== 'number') return;
			const authorId = Number(thread.user.id);
			if (Number.isNaN(authorId)) return;
			sendTip({ toUserId: authorId, amount, reason: 'thread_tip', source: 'forum_thread' });
		},
		[sendTip, thread.user.id]
	);

	const toggleBookmark = useCallback(() => {
		const threadId = Number(thread.id);
		if (Number.isNaN(threadId)) return;

		setIsBookmarked((prev) => {
			const next = !prev;
			const mutation = next ? bookmarkThread : removeBookmark;
			mutation.mutate(threadId, {
				onError: () => {
					// Revert
					setIsBookmarked(prev);
					toast({
						variant: 'error',
						title: 'Bookmark failed',
						description: 'Unable to update bookmark'
					});
				}
			});
			return next;
		});
	}, [bookmarkThread, removeBookmark, thread.id, toast]);

	const share = useCallback(() => {
		if (typeof navigator === 'undefined') return;
		const url = `${window.location.origin}/threads/${thread.slug}`;
		navigator.clipboard?.writeText(url).then(() => {
			toast({ variant: 'success', title: 'Link copied!', description: 'Thread URL copied.' });

			// Simple analytics beacon
			try {
				const payload = JSON.stringify({
					event: 'copy_thread_link',
					threadId: thread.id,
					timestamp: Date.now()
				});
				navigator.sendBeacon?.('/api/analytics/track', payload);
			} catch (err) {
				console.debug('analytics beacon failed', err);
			}
		});
	}, [thread.slug, thread.id, toast]);

	const quickReply = useCallback(
		(content: string) => {
			const threadIdNum = Number(thread.id);
			if (!content.trim() || Number.isNaN(threadIdNum)) return;

			createPost.mutate(
				{ threadId: threadIdNum, content },
				{
					onSuccess: (newPost) => {
						// Invalidate the thread + posts queries so UI refreshes
						queryClient.invalidateQueries({
							queryKey: [`/api/forum/threads/${threadIdNum}/posts`]
						});
						queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${threadIdNum}`] });

						// Scroll to the new post element if present
						setTimeout(() => {
							if (typeof window !== 'undefined') {
								document
									.getElementById(`post-${newPost.id}`)
									?.scrollIntoView({ behavior: 'smooth', block: 'start' });
							}
						}, 100);
					}
				}
			);
		},
		[createPost, queryClient, thread.id]
	);

	const value: ThreadActionsContextValue = {
		isBookmarked,
		tip,
		toggleBookmark,
		share,
		quickReply
	};

	return <ThreadActionsContext.Provider value={value}>{children}</ThreadActionsContext.Provider>;
};

export const useThreadActions = () => {
	const ctx = useContext(ThreadActionsContext);
	if (!ctx) {
		throw new Error('useThreadActions must be used within a ThreadActionsProvider');
	}
	return ctx;
};

// Non-throwing version – returns undefined when provider missing
export const useThreadActionsOptional = () => useContext(ThreadActionsContext);
