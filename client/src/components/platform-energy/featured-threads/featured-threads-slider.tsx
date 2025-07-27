import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MessageSquare, Eye, BookmarkIcon } from 'lucide-react';
import { getInitials } from '@/utils/utils';

export type FeaturedThread = {
	thread_id: string;
	title: string;
	slug: string;
	post_count: number;
	view_count: number;
	featured_at: string;
	created_at: string;
	last_post_at: string;
	user_id: string;
	username: string;
	avatar_url?: string;
	category_name: string;
	category_slug: string;
	featured_by_username: string;
};

interface FeaturedThreadsSliderProps {
	limit?: number;
	showHeader?: boolean;
	className?: string;
}

export function FeaturedThreadsSlider({
	limit = 3,
	showHeader = true,
	className = ''
}: FeaturedThreadsSliderProps) {
	const {
		data: featuredThreads,
		isLoading,
		error
	} = useQuery<FeaturedThread[]>({
		queryKey: ['/api/featured-threads', limit],
		queryFn: async () => {
			const response = await fetch(`/api/featured-threads?limit=${limit}`);
			if (!response.ok) {
				throw new Error('Failed to fetch featured threads');
			}
			return response.json();
		}
	});

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'MMM d, yyyy');
		} catch (e) {
			return dateString;
		}
	};

	if (isLoading) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Featured Discussions</CardTitle>
						<CardDescription>Staff-selected threads you shouldn't miss</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: limit }).map((_, index) => (
							<Card key={index} className="border shadow-sm">
								<CardContent className="p-4">
									<div className="space-y-3">
										<Skeleton className="h-5 w-full" />
										<Skeleton className="h-4 w-2/3" />
										<div className="flex items-center gap-2">
											<Skeleton className="h-8 w-8 rounded-full" />
											<Skeleton className="h-4 w-24" />
										</div>
										<div className="flex items-center justify-between">
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-4 w-16" />
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className={className}>
				{showHeader && (
					<CardHeader>
						<CardTitle>Featured Discussions</CardTitle>
						<CardDescription>Staff-selected threads you shouldn't miss</CardDescription>
					</CardHeader>
				)}
				<CardContent>
					<div className="p-4 text-center text-muted-foreground">
						Failed to load featured threads. Please try again later.
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!featuredThreads || featuredThreads.length === 0) {
		return null; // Don't show the component at all if there are no featured threads
	}

	return (
		<Card className={className}>
			{showHeader && (
				<CardHeader>
					<div className="flex items-center">
						<BookmarkIcon className="h-5 w-5 text-primary mr-2" />
						<div>
							<CardTitle>Featured Discussions</CardTitle>
							<CardDescription>Staff-selected threads you shouldn't miss</CardDescription>
						</div>
					</div>
				</CardHeader>
			)}
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{featuredThreads.map((thread) => (
						<Link key={thread.thread_id} to={`/threads/${thread.slug}`}>
							<Card className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
								<CardHeader className="p-4 pb-2 space-y-1">
									<Badge variant="secondary" className="w-fit mb-2">
										Featured
									</Badge>
									<CardTitle className="text-base line-clamp-2">{thread.title}</CardTitle>
									<CardDescription className="line-clamp-1">
										<Link to={`/forums/${thread.category_slug}`} className="hover:underline">
											{thread.category_name}
										</Link>
									</CardDescription>
								</CardHeader>
								<CardContent className="p-4 pt-0 flex-grow">
									<div className="flex items-center gap-2 mt-3">
										<Avatar className="h-7 w-7">
											<AvatarImage src={thread.avatar_url || ''} alt={thread.username} />
											<AvatarFallback>{getInitials(thread.username)}</AvatarFallback>
										</Avatar>
										<div className="text-sm">
											<Link
												to={`/user/${thread.user_id}`}
												className="hover:underline font-medium"
											>
												{thread.username}
											</Link>
										</div>
									</div>
								</CardContent>
								<CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground mt-auto">
									<div className="flex items-center gap-1">
										<MessageSquare className="h-3.5 w-3.5" />
										<span>{thread.post_count}</span>
									</div>
									<div className="flex items-center gap-1">
										<Eye className="h-3.5 w-3.5" />
										<span>{thread.view_count}</span>
									</div>
									<div>
										<span>Featured by {thread.featured_by_username}</span>
									</div>
								</CardFooter>
							</Card>
						</Link>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
