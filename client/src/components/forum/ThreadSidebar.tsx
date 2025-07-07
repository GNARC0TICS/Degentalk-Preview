import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Eye,
	MessageSquare,
	Clock,
	Share2,
	Link2,
	Pin,
	Lock,
	Move,
	Trash,
	Edit,
	Users,
	TrendingUp,
	BookOpen,
	AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ThreadWithPostsAndUser } from '@/types/compat/forum';

interface ThreadSidebarProps {
	thread: ThreadWithPostsAndUser['thread'];
	postCount?: number;
	canModerate?: boolean;
	canEdit?: boolean;
	canDelete?: boolean;
	onPin?: () => void;
	onLock?: () => void;
	onMove?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	onShare?: () => void;
	className?: string;
}

export function ThreadSidebar({
	thread,
	postCount = 0,
	canModerate = false,
	canEdit = false,
	canDelete = false,
	onPin,
	onLock,
	onMove,
	onEdit,
	onDelete,
	onShare,
	className = ''
}: ThreadSidebarProps) {
	const lastActivityTime = thread.lastActivityAt
		? formatDistanceToNow(new Date(thread.lastActivityAt), { addSuffix: true })
		: 'Never';

	const createdTime = formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true });

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			// Could add toast notification here
		} catch (err) {
			// Failed to copy link
		}
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Thread Statistics */}
			<Card className="bg-zinc-900/60 border-zinc-800">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg text-emerald-400 flex items-center">
						<TrendingUp className="h-5 w-5 mr-2" />
						Thread Stats
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center text-zinc-400">
							<Eye className="h-4 w-4 mr-2" />
							<span className="text-sm">Views</span>
						</div>
						<span className="text-zinc-300 font-medium">
							{(thread.viewCount || 0).toLocaleString()}
						</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center text-zinc-400">
							<MessageSquare className="h-4 w-4 mr-2" />
							<span className="text-sm">Replies</span>
						</div>
						<span className="text-zinc-300 font-medium">{Math.max(0, postCount - 1)}</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center text-zinc-400">
							<Users className="h-4 w-4 mr-2" />
							<span className="text-sm">Participants</span>
						</div>
						<span className="text-zinc-300 font-medium">{thread.participantCount || 1}</span>
					</div>

					<div className="border-t border-zinc-800/50 pt-3 space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-zinc-400">Created</span>
							<span className="text-zinc-300">{createdTime}</span>
						</div>

						<div className="flex items-center justify-between text-sm">
							<span className="text-zinc-400">Last activity</span>
							<span className="text-zinc-300">{lastActivityTime}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Thread Actions */}
			<Card className="bg-zinc-900/60 border-zinc-800">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg text-cyan-400 flex items-center">
						<Share2 className="h-5 w-5 mr-2" />
						Quick Actions
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<Button
						variant="outline"
						size="sm"
						className="w-full justify-start bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
						onClick={handleCopyLink}
					>
						<Link2 className="h-4 w-4 mr-2" />
						Copy Thread Link
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="w-full justify-start bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
						onClick={onShare}
					>
						<Share2 className="h-4 w-4 mr-2" />
						Share Thread
					</Button>

					{/* Thread status badges */}
					<div className="pt-2 space-y-2">
						{thread.isPinned && (
							<Badge
								variant="outline"
								className="bg-amber-500/20 text-amber-400 border-amber-500/30"
							>
								<Pin className="h-3 w-3 mr-1" />
								Pinned
							</Badge>
						)}

						{thread.isLocked && (
							<Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
								<Lock className="h-3 w-3 mr-1" />
								Locked
							</Badge>
						)}

						{thread.isSolved && (
							<Badge
								variant="outline"
								className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
							>
								<BookOpen className="h-3 w-3 mr-1" />
								Solved
							</Badge>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Moderator Tools (if applicable) */}
			{(canModerate || canEdit || canDelete) && (
				<Card className="bg-zinc-900/60 border-zinc-800">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg text-orange-400 flex items-center">
							<AlertTriangle className="h-5 w-5 mr-2" />
							Moderation
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{canEdit && (
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
								onClick={onEdit}
							>
								<Edit className="h-4 w-4 mr-2" />
								Edit Thread
							</Button>
						)}

						{canModerate && (
							<>
								<Button
									variant="outline"
									size="sm"
									className="w-full justify-start bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
									onClick={onPin}
								>
									<Pin className="h-4 w-4 mr-2" />
									{thread.isPinned ? 'Unpin' : 'Pin'} Thread
								</Button>

								<Button
									variant="outline"
									size="sm"
									className="w-full justify-start bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
									onClick={onLock}
								>
									<Lock className="h-4 w-4 mr-2" />
									{thread.isLocked ? 'Unlock' : 'Lock'} Thread
								</Button>

								<Button
									variant="outline"
									size="sm"
									className="w-full justify-start bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
									onClick={onMove}
								>
									<Move className="h-4 w-4 mr-2" />
									Move Thread
								</Button>
							</>
						)}

						{canDelete && (
							<Button
								variant="outline"
								size="sm"
								className="w-full justify-start border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
								onClick={onDelete}
							>
								<Trash className="h-4 w-4 mr-2" />
								Delete Thread
							</Button>
						)}
					</CardContent>
				</Card>
			)}

			{/* Thread Rules or Guidelines */}
			<Card className="bg-zinc-900/60 border-zinc-800">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg text-purple-400 flex items-center">
						<BookOpen className="h-5 w-5 mr-2" />
						Forum Rules
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-zinc-400 space-y-2">
						<p>• Be respectful to other members</p>
						<p>• Stay on topic</p>
						<p>• No spam or self-promotion</p>
						<p>• Use search before posting</p>
						<p>• Mark solutions when found</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
