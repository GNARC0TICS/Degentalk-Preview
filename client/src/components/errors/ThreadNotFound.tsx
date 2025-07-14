import React from 'react';
import { Link } from 'wouter';
import { AlertTriangle, Home, MessageSquare, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/queryClient';
import type { ThreadId } from '@shared/types/ids';

interface ThreadNotFoundProps {
	threadId?: string | number;
	forumSlug?: string;
	onBack?: () => void;
}

interface RelatedThread {
	id: ThreadId;
	title: string;
	slug: string;
	postCount: number;
	viewCount: number;
	createdAt: string;
	user: {
		username: string;
	};
	category: {
		name: string;
		slug: string;
	};
}

export function ThreadNotFound({ threadId, forumSlug, onBack }: ThreadNotFoundProps) {
	// Fetch related threads from the same forum
	const { data: relatedThreads = [] } = useQuery({
		queryKey: ['/api/forum/threads', 'related', forumSlug],
		queryFn: async () => {
			if (!forumSlug) return [];

			const response = await apiRequest<{ threads: RelatedThread[] }>({
				url: `/api/forum/threads?categorySlug=${forumSlug}&limit=5&sortBy=hot`,
				method: 'GET'
			});

			return response?.threads || [];
		},
		enabled: !!forumSlug
	});

	return (
		<div className="min-h-[60vh] flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl bg-zinc-900/80 border-zinc-800">
				<CardHeader className="text-center">
					<div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
						<AlertTriangle className="h-8 w-8 text-amber-500" />
					</div>
					<CardTitle className="text-2xl text-white">Thread Not Found</CardTitle>
					<p className="text-zinc-400 mt-2">
						The thread you're looking for doesn't exist, may have been deleted, or you don't have
						permission to view it.
					</p>
					{threadId && <p className="text-xs text-zinc-500 mt-1">Thread ID: {threadId}</p>}
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Quick Actions */}
					<div className="flex flex-wrap gap-3 justify-center">
						{onBack && (
							<Button variant="outline" onClick={onBack} className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Go Back
							</Button>
						)}

						{forumSlug && (
							<Link href={`/forums/${forumSlug}`}>
								<Button variant="outline" className="gap-2">
									<MessageSquare className="h-4 w-4" />
									Browse Forum
								</Button>
							</Link>
						)}

						<Link href="/search">
							<Button variant="outline" className="gap-2">
								<Search className="h-4 w-4" />
								Search Threads
							</Button>
						</Link>

						<Link href="/">
							<Button className="gap-2">
								<Home className="h-4 w-4" />
								Go Home
							</Button>
						</Link>
					</div>

					{/* Related Threads */}
					{relatedThreads.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold text-white mb-4 text-center">
								Other threads you might like
							</h3>
							<div className="space-y-3">
								{relatedThreads.map((thread) => (
									<Link key={thread.id} href={`/threads/${thread.slug}`} className="block">
										<div className="p-4 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-all cursor-pointer">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
														{thread.title}
													</h4>
													<div className="flex items-center gap-3 text-xs text-zinc-400">
														<span>by {thread.user.username}</span>
														<span>•</span>
														<span>{thread.category.name}</span>
														<span>•</span>
														<span>{thread.postCount} replies</span>
													</div>
												</div>
												<div className="text-xs text-zinc-500 text-right">
													{new Date(thread.createdAt).toLocaleDateString()}
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Help Text */}
					<div className="text-center text-sm text-zinc-500 pt-4 border-t border-zinc-800">
						<p>
							Need help? Try searching for similar topics or check out our most popular discussions.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
