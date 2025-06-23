import React from 'react';
import DOMPurify from 'dompurify';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { UserProfileRenderer } from '@/components/profile/UserProfileRenderer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Heart, ThumbsUp, Reply, Trash, Edit, Flag, Coins, LogIn } from 'lucide-react';
import type { PostWithUser } from '@db_types/forum.types';
import { SolveBadge } from '@/components/forum/SolveBadge';
import { SignatureRenderer } from '@/components/forum/SignatureRenderer';
import { useAuth } from '@/hooks/use-auth';
import { ButtonTooltip } from '@/components/ui/tooltip-utils';
import { ModeratorActions } from '@/components/forum/ModeratorActions';
import TipButton from '@/components/economy/wallet/tip-button';

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
	onReport,
	isFirst = false,
	parentForumTheme = null,
	tippingEnabled = false
}: PostCardProps) {
	const { user: currentUser } = useAuth();

	const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
	const editedTimeAgo =
		post.isEdited && post.updatedAt
			? formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })
			: null;

	return (
		<Card
			className={`mb-4 bg-zinc-900/60 border ${isSolution ? 'border-emerald-800/70' : 'border-zinc-800'} ${isSolution ? 'ring-1 ring-emerald-500/30' : ''} overflow-hidden`}
		>
			<div className="flex flex-col sm:flex-row">
				{/* Enhanced Author Profile Sidebar */}
				<UserProfileRenderer
					user={post.user}
					variant="post-sidebar"
					showStats={true}
					showBio={true}
					showJoinDate={true}
					showOnlineStatus={true}
					showVerifiedBadge={true}
					showLevel={true}
					showRole={true}
					linkToProfile={true}
				/>

				{/* Post Content Area */}
				<div className="flex-1">
					<CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
						<div className="flex flex-col sm:flex-row sm:items-center gap-2">
							<p className="text-xs text-zinc-400">
								{timeAgo}
								{post.isEdited && (
									<span className="text-xs text-zinc-500 italic ml-1.5">
										(edited {editedTimeAgo})
									</span>
								)}
							</p>
							{isFirst && (
								<Badge
									variant="outline"
									className="text-[10px] px-2 py-0.5 border-emerald-600 text-emerald-400"
								>
									OP
								</Badge>
							)}
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

						{/* User Signature */}
						{post.user.signature && (
							<div className="mt-4 pt-3 border-t border-zinc-800/50">
								<SignatureRenderer
									signature={post.user.signature}
									username={post.user.username}
									maxHeight={80}
									className="text-xs"
								/>
							</div>
						)}
					</CardContent>

					<CardFooter className="px-4 py-2 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-2">
						<div className="flex items-center space-x-2">
							{/* Like Button */}
							{currentUser ? (
								<ButtonTooltip content={post.hasLiked ? 'Unlike this post' : 'Like this post'}>
									<Button
										size="sm"
										variant="ghost"
										className={`text-xs h-8 px-3 flex items-center gap-1.5 ${post.hasLiked ? 'text-pink-400' : 'text-zinc-400'}`}
										onClick={() => onLike && onLike(post.id, !!post.hasLiked)}
									>
										<Heart className={`h-4 w-4 ${post.hasLiked ? 'fill-pink-400' : ''}`} />
										<span>{post.likeCount || 0}</span>
									</Button>
								</ButtonTooltip>
							) : (
								<Button
									size="sm"
									variant="ghost"
									className="text-xs h-8 px-3 flex items-center gap-1.5 text-zinc-500 cursor-not-allowed"
									title="Sign in to like posts"
									disabled
								>
									<Heart className="h-4 w-4" />
									<span>{post.likeCount || 0}</span>
								</Button>
							)}

							{/* Reply Button */}
							{currentUser ? (
								<ButtonTooltip content="Reply to this post">
									<Button
										size="sm"
										variant="ghost"
										className="text-xs h-8 px-3 text-zinc-400 flex items-center gap-1.5"
										onClick={() => onReply && onReply(post.id)}
									>
										<Reply className="h-4 w-4" />
										<span>Reply</span>
									</Button>
								</ButtonTooltip>
							) : (
								<Link href="/auth">
									<Button
										size="sm"
										variant="ghost"
										className="text-xs h-8 px-3 text-amber-400 flex items-center gap-1.5 hover:text-amber-300"
									>
										<LogIn className="h-4 w-4" />
										<span>Sign in to Reply</span>
									</Button>
								</Link>
							)}

							{/* Tip Button */}
							{tippingEnabled && currentUser && post.user.id !== currentUser.id && (
								<TipButton
									recipientId={post.user.id}
									recipientName={post.user.username}
									buttonText="Tip"
									buttonVariant="ghost"
									buttonSize="sm"
									className="text-xs h-8 px-3 text-zinc-400 flex items-center gap-1.5"
									source="forum_post"
								/>
							)}
						</div>

						<div className="flex items-center space-x-1">
							{isEditable && (
								<>
									<ButtonTooltip content="Edit this post">
										<Button
											size="sm"
											variant="ghost"
											className="text-xs h-8 px-2 text-zinc-400"
											onClick={() => onEdit && onEdit(post.id)}
										>
											<Edit className="h-3.5 w-3.5" />
											<span className="sr-only">Edit</span>
										</Button>
									</ButtonTooltip>

									<ButtonTooltip content="Delete this post">
										<Button
											size="sm"
											variant="ghost"
											className="text-xs h-8 px-2 text-zinc-400 hover:text-red-400"
											onClick={() => onDelete && onDelete(post.id)}
										>
											<Trash className="h-3.5 w-3.5" />
											<span className="sr-only">Delete</span>
										</Button>
									</ButtonTooltip>
								</>
							)}

							{!isThreadSolved && !isSolution && onMarkAsSolution && (
								<ButtonTooltip content="Mark this post as the solution to the thread">
									<Button
										size="sm"
										variant="outline"
										className="text-xs h-8 px-3 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/30"
										onClick={() => onMarkAsSolution(post.id)}
									>
										<ThumbsUp className="h-3.5 w-3.5 mr-1" />
										Mark as Solution
									</Button>
								</ButtonTooltip>
							)}

							<ButtonTooltip content="Report this post to moderators">
								<Button
									size="sm"
									variant="ghost"
									className="text-xs h-8 px-2 text-zinc-400"
									onClick={() => onReport && onReport(post.id)}
								>
									<Flag className="h-3.5 w-3.5" />
									<span className="sr-only">Report</span>
								</Button>
							</ButtonTooltip>

							{/* Moderator Actions */}
							<ModeratorActions
								type="post"
								itemId={post.id}
								itemData={{
									isHidden: post.isHidden,
									userId: post.user.id.toString(),
									username: post.user.username
								}}
							/>
						</div>
					</CardFooter>
				</div>
			</div>
		</Card>
	);
}

export default PostCard;
