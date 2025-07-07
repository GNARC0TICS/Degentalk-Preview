import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { MessageSquare, Eye, ArrowRight } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import type { PostId, ThreadId, UserId } from '@shared/types/ids';

export type RecentPost = {
	post_id: PostId;
	content: string;
	created_at: string;
	thread_id: ThreadId;
	title: string;
	slug: string;
	user_id: UserId;
	username: string;
	avatar_url?: string;
	category_name: string;
	category_slug: string;
};

interface RecentPostsFeedProps {
	limit?: number;
	showViewMore?: boolean;
	showHeader?: boolean;
	className?: string;
}

export function RecentPostsFeed({
	limit = 5,
	showViewMore = true,
	showHeader = true,
	className = ''
}: RecentPostsFeedProps) {
	const [expanded, setExpanded] = useState<Record<number, boolean>>({});

	const {
		data: recentPosts,
		isLoading,
		error
	} = useQuery<RecentPost[]>({
		queryKey: ['/api/recent-posts', limit],
		queryFn: async () => {
			const response = await fetch(`/api/recent-posts?limit=${limit}`);
			if (!response.ok) {
				throw new Error('Failed to fetch recent posts');
			}
			return response.json();
		}
	});

	const toggleExpand = (postId: PostId) => {
		setExpanded((prev) => ({
			...prev,
			[postId]: !prev[postId]
		}));
	};

	const truncateContent = (content: string, maxLength = 150) => {
		if (content.length <= maxLength) return content;
		return `${content.substring(0, maxLength)}...`;
	};

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
		} catch (e) {
			return dateString;
		}
	};

	// Function to strip HTML from content
	const stripHtml = (html: string) => {
		const doc = new DOMParser().parseFromString(html, 'text/html');
		return doc.body.textContent || '';
	};

	if (isLoading) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>Latest posts from the community</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					{Array.from({ length: limit }).map((_, index) => (
						<div key={index} className="mb-6 last:mb-0">
							<div className="flex items-start gap-4 mb-2">
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="flex-1">
									<Skeleton className="h-5 w-3/4 mb-2" />
									<Skeleton className="h-4 w-1/4" />
								</div>
							</div>
							<Skeleton className="h-16 w-full mt-2" />
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>Latest posts from the community</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="p-4 text-center text-muted-foreground">
						Failed to load recent posts. Please try again later.
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!recentPosts || recentPosts.length === 0) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>Latest posts from the community</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="p-4 text-center text-muted-foreground">
						No recent posts found. Be the first to start a conversation!
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			{showHeader && (
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>Latest posts from the community</CardDescription>
				</CardHeader>
			)}
			<CardContent className="space-y-6">
				{recentPosts.map((post) => (
					<div key={post.post_id} className="border-b border-border pb-4 last:border-0 last:pb-0">
						<div className="flex items-start gap-3">
							<Avatar className="h-8 w-8">
								<AvatarImage src={post.avatar_url || ''} alt={post.username} />
								<AvatarFallback>{getInitials(post.username)}</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<div className="flex flex-col gap-1">
									<Link
										href={`/threads/${post.slug}`}
										className="text-base font-medium hover:underline line-clamp-1"
									>
										{post.title}
									</Link>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Link href={`/user/${post.user_id}`} className="font-medium hover:underline">
											{post.username}
										</Link>
										<span>•</span>
										<time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
										<span>•</span>
										<Link href={`/forums/${post.category_slug}`}>
											<Badge variant="outline" className="px-2 py-0">
												{post.category_name}
											</Badge>
										</Link>
									</div>
								</div>
								<div className="mt-2">
									<div
										className={`prose prose-sm max-w-none dark:prose-invert ${!expanded[post.post_id] ? 'line-clamp-3' : ''}`}
									>
										{expanded[post.post_id]
											? stripHtml(post.content)
											: truncateContent(stripHtml(post.content))}
									</div>
									{stripHtml(post.content).length > 150 && (
										<Button
											variant="ghost"
											size="sm"
											className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-primary"
											onClick={() => toggleExpand(post.post_id)}
										>
											{expanded[post.post_id] ? 'Show less' : 'Read more'}
										</Button>
									)}
								</div>
							</div>
						</div>
					</div>
				))}
			</CardContent>
			{showViewMore && (
				<CardFooter>
					<Link href="/recent-activity">
						<Button variant="outline" className="w-full">
							View More Activity
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</CardFooter>
			)}
		</Card>
	);
}
