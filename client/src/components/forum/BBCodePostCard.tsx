import React from 'react';
import { motion } from 'framer-motion';
import { Pin, CheckCircle, Link2 } from 'lucide-react';
import { PostHeader, PostSidebar, PostBody, PostActions, PostFooter } from './bbcode';
import { UnifiedProfileCard } from '@/components/profile/UnifiedProfileCard';
import { brandConfig } from '@/config/brand.config';
import { cn } from '@/lib/utils';
import type { PostWithUser } from '@/types/compat/forum';

interface BBCodePostCardProps {
	post: PostWithUser;
	isFirst?: boolean;
	isThreadSolved?: boolean;
	isSolution?: boolean;
	threadTitle?: string;
	canEdit?: boolean;
	canDelete?: boolean;
	canMarkSolution?: boolean;
	tippingEnabled?: boolean;
	showSignatures?: boolean;
	onLike?: (id: number, hasLiked: boolean) => void;
	onReply?: (id: number) => void;
	onQuote?: (id: number) => void;
	onEdit?: (id: number) => void;
	onDelete?: (id: number) => void;
	onMarkSolution?: (id: number) => void;
	onTip?: (id: number) => void;
	onReport?: (id: number) => void;
	onBookmark?: (id: number) => void;
	onShare?: (id: number) => void;
	onCopyLink?: (id: number) => void;
	className?: string;
}

export function BBCodePostCard({
	post,
	isFirst = false,
	isThreadSolved = false,
	isSolution = false,
	threadTitle,
	canEdit = false,
	canDelete = false,
	canMarkSolution = false,
	tippingEnabled = false,
	showSignatures = true,
	onLike,
	onReply,
	onQuote,
	onEdit,
	onDelete,
	onMarkSolution,
	onTip,
	onReport,
	onBookmark,
	onShare,
	onCopyLink,
	className = ''
}: BBCodePostCardProps) {
	// Calculate post number (this would typically come from props in a real implementation)
	const postNumber = post.id;

	// Handle post action callbacks
	const handleCopyPermalink = () => {
		// Optional toast notification could be added here
	};
	return (
		<>
			{/* Desktop: Classic BBCode Forum Layout */}
			<div
				id={`post-${post.id}`}
				className={cn(
					'hidden lg:block backdrop-blur-sm shadow-lg mb-0 relative',
					isFirst
						? 'border border-zinc-600/60 bg-zinc-900/50 border-l-2 border-l-zinc-500/60'
						: 'border border-zinc-700/50 bg-zinc-900/40',
					isSolution && 'ring-1 ring-emerald-500/30 border-emerald-700/50',
					className
				)}
			>
				{/* Post Header */}
				<PostHeader
					postId={post.id}
					postNumber={postNumber}
					createdAt={new Date(post.createdAt)}
					editedAt={post.updatedAt ? new Date(post.updatedAt) : null}
					isFirst={isFirst}
					isSolution={isSolution}
					threadTitle={threadTitle}
					onCopyPermalink={handleCopyPermalink}
				/>

				{/* Main post content area - Classic two-column */}
				<div className="flex border-separate">
					{/* Left Sidebar - User Info */}
					<PostSidebar
						username={post.authorUsername}
						authorAvatar={post.authorAvatar}
						isFirst={isFirst}
					/>

					{/* Right Content Area */}
					<div className="flex-1 flex flex-col">
						{/* Post body with content and signature */}
						<PostBody
							content={post.content}
							signature={null} // TODO: Get signature from user profile
							username={post.authorUsername}
							showSignatures={showSignatures}
							isFirst={isFirst}
							className="flex-1"
						/>

						{/* Post actions */}
						<PostActions
							postId={post.id}
							likeCount={post.likeCount}
							hasLiked={post.hasLiked}
							canEdit={canEdit}
							canDelete={canDelete}
							canMarkSolution={canMarkSolution}
							isSolution={isSolution}
							isThreadSolved={isThreadSolved}
							isFirst={isFirst}
							tippingEnabled={tippingEnabled}
							onLike={onLike}
							onReply={onReply}
							onQuote={onQuote}
							onEdit={onEdit}
							onDelete={onDelete}
							onMarkSolution={onMarkSolution}
							onTip={onTip}
							onReport={onReport}
							onBookmark={onBookmark}
							onShare={onShare}
							onCopyLink={onCopyLink}
						/>

						{/* Post footer with timestamps */}
						<PostFooter
							createdAt={new Date(post.createdAt)}
							editedAt={post.updatedAt ? new Date(post.updatedAt) : null}
							isEdited={post.isEdited}
							reactionCount={post.likeCount}
							hasReacted={post.hasLiked}
						/>
					</div>
				</div>
			</div>

			{/* Mobile: Timeline Conversation View */}
			<motion.div
				id={`post-${post.id}-mobile`}
				className={cn(
					'lg:hidden mb-4 backdrop-blur-sm rounded-lg',
					isFirst
						? 'bg-zinc-900/65 border border-zinc-600/60 shadow-lg'
						: 'bg-zinc-900/60 border border-zinc-700/50',
					isSolution && 'ring-1 ring-emerald-500/30 border-emerald-700/50',
					className
				)}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				{/* Mobile header with user info */}
				<div className="p-4 border-b border-zinc-700/30">
					<div className="flex items-center justify-between mb-2">
						<UnifiedProfileCard
							username={post.authorUsername}
							variant="mini"
							showLevel={true}
							showOnlineStatus={true}
							animated={false}
						/>
						<div className="flex items-center space-x-2 text-xs text-zinc-500">
							{isFirst && (
								<span className="px-2 py-1 bg-zinc-800/60 text-zinc-200 border border-zinc-600/50 rounded text-sm font-medium flex items-center">
									<Pin className="h-3 w-3 mr-1" />
									OP
								</span>
							)}
							{isSolution && (
								<span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center">
									<CheckCircle className="h-3 w-3 mr-1" />
									Solution
								</span>
							)}
							<span>#{postNumber}</span>
							<button
								onClick={handleCopyPermalink}
								className="text-zinc-500 hover:text-emerald-400 transition-colors"
								title="Copy permalink"
							>
								<Link2 className="h-3 w-3" />
							</button>
						</div>
					</div>
				</div>

				{/* Mobile content */}
				<PostBody
					content={post.content}
					signature={null}
					username={post.authorUsername}
					showSignatures={showSignatures}
					className="border-b border-zinc-700/30"
				/>

				{/* Mobile actions */}
				<PostActions
					postId={post.id}
					likeCount={post.likeCount}
					hasLiked={post.hasLiked}
					canEdit={canEdit}
					canDelete={canDelete}
					canMarkSolution={canMarkSolution}
					isSolution={isSolution}
					isThreadSolved={isThreadSolved}
					isFirst={isFirst}
					tippingEnabled={tippingEnabled}
					onLike={onLike}
					onReply={onReply}
					onQuote={onQuote}
					onEdit={onEdit}
					onDelete={onDelete}
					onMarkSolution={onMarkSolution}
					onTip={onTip}
					onReport={onReport}
					onBookmark={onBookmark}
					onShare={onShare}
					onCopyLink={onCopyLink}
					className="border-none"
				/>
			</motion.div>
		</>
	);
}
