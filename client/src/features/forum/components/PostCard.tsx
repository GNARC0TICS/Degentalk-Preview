import React from 'react';
import DOMPurify from 'dompurify';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { UnifiedProfileCard } from '@/components/profile/UnifiedProfileCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
	Heart,
	ThumbsUp,
	Reply,
	Trash,
	Edit,
	Flag,
	Coins,
	LogIn,
	MoreHorizontal
} from 'lucide-react';
import type { PostWithUser } from '@/types/compat/forum';
import type { PostId } from '@shared/types/ids';
import { SolveBadge } from '@/components/forum/SolveBadge';
import { SignatureRenderer } from '@/components/forum/SignatureRenderer';
import { useAuth } from '@/hooks/use-auth';
import { ButtonTooltip } from '@/components/ui/tooltip-utils';
import { ModeratorActions } from '@/components/forum/ModeratorActions';
import TipButton from '@/components/economy/wallet/tip-button';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import { getAdaptiveConfig } from '@/utils/adaptiveSpacing';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
	post: PostWithUser;
	isEditable?: boolean;
	isThreadSolved?: boolean;
	isSolution?: boolean;
	onLike?: (id: PostId, hasLiked: boolean) => void;
	onReply?: (id: PostId) => void;
	onEdit?: (id: PostId) => void;
	onDelete?: (id: PostId) => void;
	onMarkAsSolution?: (id: PostId) => void;
	onReport?: (id: PostId) => void; // New prop
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
	const breakpoint = useBreakpoint();

	// Get adaptive spacing configuration
	const adaptiveConfig = getAdaptiveConfig({
		spacing: 'sm',
		padding: breakpoint.isMobile ? 'sm' : 'md',
		typography: 'body',
		touchTarget: 'md',
		density: breakpoint.isMobile ? 'compact' : 'comfortable'
	});

	const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
	const editedTimeAgo =
		post.isEdited && post.updatedAt
			? formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })
			: null;

	return (
		<Card
			id={`post-${post.id}`}
			className={cn(
				'bg-zinc-900/60 border overflow-hidden',
				isSolution ? 'border-emerald-800/70 ring-1 ring-emerald-500/30' : 'border-zinc-800',
				adaptiveConfig.spacing
			)}
		>
			<div
				className={cn(
					// Mobile: Stack vertically, Desktop: Side by side
					breakpoint.isMobile ? 'flex flex-col' : 'flex flex-col sm:flex-row'
				)}
			>
				{/* Enhanced Author Profile Sidebar */}
				<UnifiedProfileCard
					username={post.user.username}
					variant={breakpoint.isMobile ? 'compact' : 'sidebar'}
					showStats={!breakpoint.isMobile} // Hide detailed stats on mobile
					showJoinDate={!breakpoint.isMobile}
					showOnlineStatus={true}
					showLevel={true}
					showRole={true}
					animated={false}
				/>

				{/* Post Content Area */}
				<div className="flex-1">
					<CardHeader
						className={cn(
							'flex flex-row items-start justify-between',
							adaptiveConfig.padding,
							// Mobile: Reduce bottom padding
							breakpoint.isMobile ? 'pb-2' : 'pb-2'
						)}
					>
						<div
							className={cn(
								'flex gap-2 min-w-0 flex-1',
								breakpoint.isMobile ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'
							)}
						>
							<p className={cn('text-zinc-400 truncate', adaptiveConfig.typography)}>
								{timeAgo}
								{post.isEdited && (
									<span className="text-zinc-500 italic ml-1.5">(edited {editedTimeAgo})</span>
								)}
							</p>
							{isFirst && (
								<Badge
									variant="outline"
									className="text-[10px] px-2 py-0.5 border-emerald-600 text-emerald-400 self-start"
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

					<CardContent className={cn(adaptiveConfig.padding)}>
						<div
							className={cn(
								'prose prose-invert prose-zinc max-w-none',
								// Mobile: Adjust prose sizing for better readability
								breakpoint.isMobile && 'prose-sm'
							)}
						>
							{post.content && (
								<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
							)}
						</div>

						{/* User Signature - Hide on mobile to save space */}
						{post.user.signature && !breakpoint.isMobile && (
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

					<CardFooter
						className={cn(
							'border-t border-zinc-800/70 flex items-center justify-between',
							adaptiveConfig.padding,
							// Mobile: Adjust layout for better touch interaction
							breakpoint.isMobile ? 'flex-col gap-3' : 'flex-row gap-2'
						)}
					>
						{/* Primary Actions - Always visible */}
						<div
							className={cn(
								'flex items-center',
								breakpoint.isMobile ? 'w-full justify-between' : 'space-x-2'
							)}
						>
							{/* Like Button */}
							{currentUser ? (
								<ButtonTooltip content={post.hasLiked ? 'Unlike this post' : 'Like this post'}>
									<Button
										size={breakpoint.isMobile ? 'default' : 'sm'}
										variant="ghost"
										className={cn(
											'flex items-center gap-1.5',
											post.hasLiked ? 'text-pink-400' : 'text-zinc-400',
											adaptiveConfig.touchTarget,
											adaptiveConfig.typography
										)}
										onClick={() => onLike && onLike(post.id, !!post.hasLiked)}
									>
										<Heart
											className={cn(
												post.hasLiked && 'fill-pink-400',
												breakpoint.isMobile ? 'h-5 w-5' : 'h-4 w-4'
											)}
										/>
										<span>{post.likeCount || 0}</span>
									</Button>
								</ButtonTooltip>
							) : (
								<Button
									size={breakpoint.isMobile ? 'default' : 'sm'}
									variant="ghost"
									className={cn(
										'flex items-center gap-1.5 text-zinc-500 cursor-not-allowed',
										adaptiveConfig.touchTarget,
										adaptiveConfig.typography
									)}
									title="Sign in to like posts"
									disabled
								>
									<Heart className={cn(breakpoint.isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
									<span>{post.likeCount || 0}</span>
								</Button>
							)}

							{/* Reply Button */}
							{currentUser ? (
								<ButtonTooltip content="Reply to this post">
									<Button
										size={breakpoint.isMobile ? 'default' : 'sm'}
										variant="ghost"
										className={cn(
											'text-zinc-400 flex items-center gap-1.5',
											adaptiveConfig.touchTarget,
											adaptiveConfig.typography
										)}
										onClick={() => onReply && onReply(post.id)}
									>
										<Reply className={cn(breakpoint.isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
										{!breakpoint.isMobile && <span>Reply</span>}
									</Button>
								</ButtonTooltip>
							) : (
								<Link href="/auth">
									<Button
										size={breakpoint.isMobile ? 'default' : 'sm'}
										variant="ghost"
										className={cn(
											'text-amber-400 flex items-center gap-1.5 hover:text-amber-300',
											adaptiveConfig.touchTarget,
											adaptiveConfig.typography
										)}
									>
										<LogIn className={cn(breakpoint.isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
										{!breakpoint.isMobile && <span>Sign in to Reply</span>}
									</Button>
								</Link>
							)}

							{/* Tip Button - Always show if enabled and not mobile, or if mobile but more space-efficient */}
							{tippingEnabled &&
								currentUser &&
								post.user.id !== currentUser.id &&
								!breakpoint.isMobile && (
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

						{/* Secondary Actions */}
						{breakpoint.isMobile ? (
							/* Mobile: Dropdown Menu for secondary actions */
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										size="default"
										variant="ghost"
										className={cn('text-zinc-400', adaptiveConfig.touchTarget)}
									>
										<MoreHorizontal className="h-5 w-5" />
										<span className="sr-only">More actions</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									{/* Tip Button in mobile dropdown */}
									{tippingEnabled && currentUser && post.user.id !== currentUser.id && (
										<DropdownMenuItem asChild>
											<TipButton
												recipientId={post.user.id}
												recipientName={post.user.username}
												buttonText="Tip User"
												buttonVariant="ghost"
												className="w-full justify-start text-zinc-400"
												source="forum_post"
											/>
										</DropdownMenuItem>
									)}

									{isEditable && (
										<>
											<DropdownMenuItem onClick={() => onEdit && onEdit(post.id)}>
												<Edit className="h-4 w-4 mr-2" />
												Edit Post
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onDelete && onDelete(post.id)}
												className="text-red-400 focus:text-red-300"
											>
												<Trash className="h-4 w-4 mr-2" />
												Delete Post
											</DropdownMenuItem>
										</>
									)}

									{!isThreadSolved && !isSolution && onMarkAsSolution && (
										<DropdownMenuItem
											onClick={() => onMarkAsSolution(post.id)}
											className="text-emerald-400 focus:text-emerald-300"
										>
											<ThumbsUp className="h-4 w-4 mr-2" />
											Mark as Solution
										</DropdownMenuItem>
									)}

									<DropdownMenuItem onClick={() => onReport && onReport(post.id)}>
										<Flag className="h-4 w-4 mr-2" />
										Report Post
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							/* Desktop: Individual buttons */
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
						)}
					</CardFooter>
				</div>
			</div>
		</Card>
	);
}

export default PostCard;
