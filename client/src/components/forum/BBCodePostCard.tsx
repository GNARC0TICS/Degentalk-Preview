import React from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent } from '@/components/ui/card';
import { UnifiedProfileCard } from '@/components/profile/UnifiedProfileCard';
import { ReactionBar } from './ReactionBar';
import { SignatureRenderer } from './SignatureRenderer';
import { SolveBadge } from './SolveBadge';
import type { PostWithUser } from '@db_types/forum.types';

interface BBCodePostCardProps {
	post: PostWithUser;
	isFirst?: boolean;
	isThreadSolved?: boolean;
	isSolution?: boolean;
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
	return (
		<div
			id={`post-${post.id}`}
			className={`grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-0 mb-6 ${className}`}
		>
			{/* Desktop: Left Author Profile Card */}
			<div className="hidden lg:block">
				<UnifiedProfileCard
					username={post.user.username}
					variant="sidebar"
					className="sticky top-4"
					showStats={true}
					showJoinDate={true}
					showLevel={true}
					animated={true}
				/>
			</div>

			{/* Mobile: Compact Author Profile (horizontal) */}
			<div className="lg:hidden mb-4">
				<UnifiedProfileCard
					username={post.user.username}
					variant="compact"
					showStats={true}
					showLevel={true}
					animated={false}
				/>
			</div>

			{/* Main Post Content */}
			<Card
				className={`bg-zinc-900/60 border-zinc-800 ${isSolution ? 'ring-1 ring-emerald-500/30 border-emerald-700/50' : ''} lg:col-start-2`}
			>
				{/* Post Header with Solution Badge */}
				{isSolution && (
					<div className="flex items-center justify-between p-3 border-b border-zinc-800/50 bg-emerald-900/20">
						<SolveBadge size="sm" />
						<span className="text-xs text-emerald-400">Marked as solution</span>
					</div>
				)}

				{/* Post Body */}
				<CardContent className="p-0">
					<div className="p-6">
						{/* Post number and permalink */}
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center space-x-2">
								{isFirst && (
									<span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30">
										Original Post
									</span>
								)}
								<span className="text-xs text-zinc-500">#{post.id}</span>
							</div>
							<a
								href={`#post-${post.id}`}
								className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
								title="Permalink to this post"
							>
								🔗
							</a>
						</div>

						{/* Post Content */}
						<div className="prose prose-invert prose-zinc max-w-none mb-4">
							{post.content && (
								<div
									className="post-content"
									dangerouslySetInnerHTML={{
										__html: DOMPurify.sanitize(post.content, {
											ALLOWED_TAGS: [
												'p',
												'br',
												'strong',
												'b',
												'em',
												'i',
												'u',
												's',
												'strike',
												'del',
												'a',
												'img',
												'h1',
												'h2',
												'h3',
												'h4',
												'h5',
												'h6',
												'ul',
												'ol',
												'li',
												'blockquote',
												'code',
												'pre',
												'table',
												'thead',
												'tbody',
												'tr',
												'th',
												'td',
												'span',
												'div',
												'hr'
											],
											ALLOWED_ATTR: [
												'href',
												'src',
												'alt',
												'title',
												'class',
												'style',
												'target',
												'rel',
												'width',
												'height'
											],
											ADD_ATTR: ['target'],
											HOOK_ATTRIBUTES: {
												a: function (node) {
													const href = node.getAttribute('href');
													if (href && (href.startsWith('http') || href.startsWith('//'))) {
														node.setAttribute('target', '_blank');
														node.setAttribute('rel', 'noopener noreferrer');
													}
												}
											}
										})
									}}
								/>
							)}
						</div>

						{/* Signature */}
						<SignatureRenderer
							signature={post.user.signature}
							username={post.user.username}
							showSignatures={showSignatures}
							maxHeight={80}
						/>
					</div>

					{/* Reaction Bar */}
					<ReactionBar
						postId={post.id}
						likeCount={post.likeCount}
						hasLiked={post.hasLiked}
						canEdit={canEdit}
						canDelete={canDelete}
						canMarkSolution={canMarkSolution}
						isSolution={isSolution}
						isThreadSolved={isThreadSolved}
						tippingEnabled={tippingEnabled}
						createdAt={post.createdAt}
						editedAt={post.updatedAt}
						isEdited={post.isEdited}
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
				</CardContent>
			</Card>

			<style jsx>{`
				.post-content {
					line-height: 1.6;
				}
				.post-content img {
					max-width: 100%;
					height: auto;
					border-radius: 8px;
					margin: 1rem 0;
				}
				.post-content a {
					color: rgb(34 197 94); /* emerald-500 */
					text-decoration: none;
				}
				.post-content a:hover {
					color: rgb(16 185 129); /* emerald-600 */
					text-decoration: underline;
				}
				.post-content blockquote {
					border-left: 4px solid rgb(34 197 94);
					padding-left: 1rem;
					margin: 1rem 0;
					background: rgba(39, 39, 42, 0.3);
					border-radius: 0 8px 8px 0;
					padding: 1rem;
				}
				.post-content code {
					background: rgba(39, 39, 42, 0.8);
					padding: 2px 6px;
					border-radius: 4px;
					font-size: 0.9em;
				}
				.post-content pre {
					background: rgba(39, 39, 42, 0.8);
					padding: 1rem;
					border-radius: 8px;
					overflow-x: auto;
					border: 1px solid rgba(82, 82, 91, 0.3);
				}
				.post-content pre code {
					background: none;
					padding: 0;
				}
				.post-content table {
					border-collapse: collapse;
					width: 100%;
					margin: 1rem 0;
				}
				.post-content th,
				.post-content td {
					border: 1px solid rgba(82, 82, 91, 0.3);
					padding: 0.5rem;
					text-align: left;
				}
				.post-content th {
					background: rgba(39, 39, 42, 0.5);
					font-weight: 600;
				}
				.post-content hr {
					border: none;
					border-top: 1px solid rgba(82, 82, 91, 0.3);
					margin: 2rem 0;
				}
			`}</style>
		</div>
	);
}
