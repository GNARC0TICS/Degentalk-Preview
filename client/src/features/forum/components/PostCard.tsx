import React from 'react';
import DOMPurify from 'dompurify';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AvatarFrame } from '@/components/identity/AvatarFrame';
import { UserName } from '@/components/users/Username';
import { LevelBadge } from '@/components/identity/LevelBadge';
import { useIdentityDisplay } from '@/hooks/useIdentityDisplay';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Heart, ThumbsUp, Reply, Trash, Edit, Flag, Coins } from 'lucide-react';
import type { PostWithUser } from '@db_types/forum.types';
import { SolveBadge } from '@/components/forum/SolveBadge';

interface PostCardProps {
	post: PostWithUser;
	isEditable?: boolean;
	isThreadSolved?: boolean;
	isSolution?: boolean;
	onLike?: (id: number, hasLiked: boolean) => void;
	onReply?: (id: number) => void;
	onEdit?: (id: number) => void;
	onDelete?: (id: number) => void;
	onMarkAsSolution?: (id: number) => void;
	onTip?: (id: number) => void; // New prop
	onReport?: (id: number) => void; // New prop
	isFirst?: boolean;
	parentForumTheme?: string | null;
	tippingEnabled?: boolean;
}

export function PostCard({
	post,
	isEditable = false,
	isThreadSolved = false,
	isSolution = false,
	onLike,
	onReply,
	onEdit,
	onDelete,
	onMarkAsSolution,
	onTip,
	onReport,
	isFirst = false,
	parentForumTheme = null,
	tippingEnabled = false,
}: PostCardProps) {
	const identity = useIdentityDisplay(post.user);

	const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
	const editedTimeAgo =
		post.isEdited && post.updatedAt
			? formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })
			: null;

	return (
		<Card
			className={`mb-4 bg-zinc-900/60 border ${isSolution ? 'border-emerald-800/70' : 'border-zinc-800'} ${isSolution ? 'ring-1 ring-emerald-500/30' : ''}`}
		>
			<CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
				<div className="flex items-center space-x-4">
					<AvatarFrame avatarUrl={post.user.avatarUrl || ''} frame={identity?.avatarFrame} size={40} />
					<div>
						<Link href={`/profile/${post.user.id}`}>
							<UserName user={post.user} className="hover:text-emerald-400 transition-colors" />
						</Link>
						<p className="text-xs text-zinc-400">
							{timeAgo}
							{post.isEdited && (
								<span className="text-xs text-zinc-500 italic ml-1.5">
									(edited {editedTimeAgo})
								</span>
							)}
						</p>
					</div>
				</div>

				{isSolution && (
					<div className="flex-shrink-0">
						<SolveBadge size="sm" className="mr-0" />
					</div>
				)}
			</CardHeader>

			<CardContent className="px-4 py-3">
				<div className="prose prose-invert prose-zinc max-w-none">
					{post.content && (
						<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
					)}
				</div>
			</CardContent>

			<CardFooter className="px-4 py-2 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center space-x-2">
					<Button
						size="sm"
						variant="ghost"
						className={`text-xs h-8 px-3 flex items-center gap-1.5 ${post.hasLiked ? 'text-pink-400' : 'text-zinc-400'}`}
						onClick={() => onLike && onLike(post.id, !!post.hasLiked)}
					>
						<Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-pink-400' : ''}`} />
						<span>{post.likeCount || 0}</span>
					</Button>

					<Button
						size="sm"
						variant="ghost"
						className="text-xs h-8 px-3 text-zinc-400 flex items-center gap-1.5"
						onClick={() => onReply && onReply(post.id)}
					>
						<Reply className="h-4 w-4" />
						<span>Reply</span>
					</Button>

					{tippingEnabled && (
						<Button
							size="sm"
							variant="ghost"
							className="text-xs h-8 px-3 text-zinc-400 flex items-center gap-1.5"
							onClick={() => onTip && onTip(post.id)}
						>
							<Coins className="h-4 w-4" />
							<span>Tip</span>
						</Button>
					)}
				</div>

				<div className="flex items-center space-x-1">
					{isEditable && (
						<>
							<Button
								size="sm"
								variant="ghost"
								className="text-xs h-8 px-2 text-zinc-400"
								onClick={() => onEdit && onEdit(post.id)}
							>
								<Edit className="h-3.5 w-3.5" />
								<span className="sr-only">Edit</span>
							</Button>

							<Button
								size="sm"
								variant="ghost"
								className="text-xs h-8 px-2 text-zinc-400"
								onClick={() => onDelete && onDelete(post.id)}
							>
								<Trash className="h-3.5 w-3.5" />
								<span className="sr-only">Delete</span>
							</Button>
						</>
					)}

					{!isThreadSolved && !isSolution && onMarkAsSolution && (
						<Button
							size="sm"
							variant="outline"
							className="text-xs h-8 px-3 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/30"
							onClick={() => onMarkAsSolution(post.id)}
						>
							<ThumbsUp className="h-3.5 w-3.5 mr-1" />
							Mark as Solution
						</Button>
					)}

					<Button
						size="sm"
						variant="ghost"
						className="text-xs h-8 px-2 text-zinc-400"
						onClick={() => onReport && onReport(post.id)}
					>
						<Flag className="h-3.5 w-3.5" />
						<span className="sr-only">Report</span>
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}

export default PostCard; 