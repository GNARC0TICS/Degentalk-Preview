import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { ArrowRight, Clock, FolderIcon, MessageSquare, MessagesSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ForumId, ThreadId } from '@shared/types/ids';

interface ForumCardProps {
	id: ForumId;
	name: string;
	description: string | null;
	threadCount: number;
	postCount: number;
	categoryCount: number;
	lastActivity?: string;
	slug: string;
	lastThread?: {
		id: ThreadId;
		title: string;
		user: { username: string; avatarUrl?: string | null };
		createdAt: string;
	};
}

export function ForumCard({
	id,
	name,
	description,
	threadCount,
	postCount,
	categoryCount,
	lastActivity,
	slug,
	lastThread
}: ForumCardProps) {
	const navigate = useNavigate();

	const handleViewForum = () => {
		navigate(`/forums/${slug}`);
	};

	const formattedLastActivity = lastActivity
		? formatDistanceToNow(new Date(lastActivity), { addSuffix: true })
		: 'No recent activity';

	return (
		<Card className="bg-zinc-900/60 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all shadow-md rounded-lg">
			<div className="flex flex-col lg:flex-row">
				<div className="flex-1">
					<CardHeader className="p-4 pb-2">
						<div className="flex justify-between items-start">
							<div>
								<CardTitle className="text-xl text-zinc-100">{name}</CardTitle>
								{description && (
									<CardDescription className="text-zinc-400 mt-1">{description}</CardDescription>
								)}
							</div>
							<div className="hidden md:flex">
								<Badge
									variant="secondary"
									className="bg-amber-950/40 text-amber-300 hover:bg-amber-950/60 border border-amber-800/60"
								>
									{categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
								</Badge>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-4 pt-0">
						<div className="flex flex-wrap gap-4 text-sm text-zinc-400">
							<div className="flex items-center gap-1">
								<MessagesSquare className="h-4 w-4 text-zinc-500" />
								<span>{threadCount} threads</span>
							</div>
							<div className="flex items-center gap-1">
								<MessageSquare className="h-4 w-4 text-zinc-500" />
								<span>{postCount} posts</span>
							</div>
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4 text-zinc-500" />
								<span>{formattedLastActivity}</span>
							</div>
							<div className="flex md:hidden items-center gap-1">
								<FolderIcon className="h-4 w-4 text-zinc-500" />
								<span>
									{categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
								</span>
							</div>
						</div>
						{lastThread && (
							<div className="mt-4 flex items-center gap-3 p-2 rounded bg-zinc-950/60 border border-zinc-800 hover:bg-zinc-800/60 transition-all duration-200">
								<div className="flex-shrink-0 h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
									{lastThread.user.avatarUrl ? (
										<img
											src={lastThread.user.avatarUrl}
											alt={lastThread.user.username}
											className="h-7 w-7 object-cover rounded-full"
										/>
									) : (
										<span className="text-xs text-zinc-400 font-bold">
											{lastThread.user.username.slice(0, 2).toUpperCase()}
										</span>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<a
										href={`/threads/${lastThread.id}`}
										className="text-sm text-emerald-300 hover:underline hover:text-emerald-400 transition-colors truncate block"
									>
										{lastThread.title}
									</a>
									<div className="text-xs text-zinc-500 truncate">
										by {lastThread.user.username}
									</div>
								</div>
								<div className="text-xs text-zinc-500 whitespace-nowrap">
									{formatDistanceToNow(new Date(lastThread.createdAt), { addSuffix: true })}
								</div>
							</div>
						)}
					</CardContent>
				</div>
				<div className="flex items-stretch border-t lg:border-t-0 lg:border-l border-zinc-800">
					<Button
						variant="ghost"
						className="rounded-none flex-1 h-auto px-6 py-4 justify-center hover:bg-zinc-800/60 text-amber-400 hover:text-amber-300"
						onClick={handleViewForum}
					>
						<div className="flex flex-col items-center gap-2">
							<ArrowRight className="h-5 w-5" />
							<span className="text-xs">View</span>
						</div>
					</Button>
				</div>
			</div>
		</Card>
	);
}
