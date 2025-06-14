import React from 'react';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { type ThreadWithUserAndCategory, type Tag } from '@/types/forum'; // Updated import path and type
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TagBadge } from '@/components/ui/tag-badge'; // Import TagBadge
import {
	MessageSquare,
	Eye,
	Clock,
	ExternalLink,
	Flame,
	ThumbsUp,
	Lock,
	Pin,
	Shield,
	Tag as TagIcon
} from 'lucide-react';

interface ThreadCardProps {
	thread: ThreadWithUserAndCategory; // Change type to ThreadWithUserAndCategory
	className?: string;
}

export function ThreadCard({ thread, className = '' }: ThreadCardProps) {
	// Safety check to ensure thread exists
	if (!thread) {
		return null;
	}

	const {
		id,
		title,
		slug,
		isSticky,
		isLocked,
		isHidden,
		viewCount,
		postCount,
		lastPostAt,
		createdAt,
		user,
		prefixId,
		hotScore
	} = thread;

	// Handle optional fields that might not be present
	const prefix = thread.prefix || null;
	console.log('ThreadCard rendering for thread:', { id, title, slug, threadUrl: `/threads/${slug}` });
	const tags = thread.tags || [];
	const category = thread.category || null;

	// Link to the new thread details page using the thread SLUG
	const threadUrl = `/threads/${slug}`;
	const isHot = hotScore && hotScore > 10;

	return (
		<Card
			className={`bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 ${className}`}
		>
			<div className="p-4">
				{/* Thread Header */}
				<div className="flex gap-3">
					{/* User Avatar */}
					<Avatar className="h-10 w-10 border border-zinc-700">
						<AvatarImage
							src={user?.activeAvatarUrl || user?.avatarUrl || ''}
							alt={user?.username || 'User'}
						/>
						<AvatarFallback className="bg-zinc-800 text-zinc-300">
							{user?.username?.slice(0, 2).toUpperCase() || 'UN'}
						</AvatarFallback>
					</Avatar>

					{/* Main Content */}
					<div className="flex-1 min-w-0">
						{/* Title & Badges Row */}
						<div className="flex items-center flex-wrap gap-2 mb-1">
							{/* Thread Status Badges */}
							<div className="flex gap-1">
								{/* Prefix Badge - styling based on prefix color */}
								{prefix && (
									<Badge
										className={`px-2 py-0.5 text-xs ${
											prefix.color
												? `bg-${prefix.color}-900/60 text-${prefix.color}-300 border-${prefix.color}-700/30`
												: 'bg-zinc-800 text-zinc-300 border-zinc-700/30'
										}`}
									>
										{prefix.name}
									</Badge>
								)}

								{isSticky && (
									<Badge className="bg-cyan-900/60 text-cyan-300 border-cyan-700/30 px-1.5 py-0.5 text-xs">
										<Pin className="h-3 w-3 mr-1" />
										Pinned
									</Badge>
								)}

								{isLocked && (
									<Badge className="bg-red-900/60 text-red-300 border-red-700/30 px-1.5 py-0.5 text-xs">
										<Lock className="h-3 w-3 mr-1" />
										Locked
									</Badge>
								)}

								{isHot && (
									<Badge className="bg-gradient-to-r from-orange-600 to-red-600 border-orange-700/30 text-white px-1.5 py-0.5 text-xs">
										<Flame className="h-3 w-3 mr-1" />
										Hot
									</Badge>
								)}
							</div>
						</div>

						{/* Title */}
						<Link href={threadUrl} className="block">
							<h3 className="text-lg font-medium leading-tight hover:text-emerald-400 transition-colors">
								{title}
							</h3>
						</Link>

						{/* Thread Meta Info */}
						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-400">
							{/* Author */}
							<Link href={`/profile/${user?.id}`} className="hover:text-zinc-200 transition-colors">
								{user?.username || 'Unknown'}
							</Link>

							{/* Creation Time */}
							<span className="flex items-center">
								<Clock className="h-3 w-3 mr-1" />
								{createdAt && !isNaN(new Date(createdAt).getTime())
									? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
									: 'unknown time'}
							</span>

							{/* Category */}
							{category && (
								<Link
									href={`/forums/${category.slug}`}
									className="hover:text-zinc-200 transition-colors flex items-center"
								>
									<FolderIcon className="h-3 w-3 mr-1" />
									{category.name}
								</Link>
							)}

							{/* Tags */}
							{tags && tags.length > 0 && (
								<div className="flex items-center flex-wrap gap-1">
									<TagIcon className="h-3 w-3 text-zinc-500" />
									{tags.map((tag: Tag) => (
										<TagBadge key={tag.id} tag={tag} />
									))}
								</div>
							)}
						</div>
					</div>

					{/* Thread Stats */}
					<div className="flex flex-col items-end justify-between text-xs text-zinc-500 ml-2">
						<div className="flex flex-col items-end gap-1">
							<div className="flex items-center">
								<Eye className="h-3 w-3 mr-1" />
								<span>{viewCount || 0}</span>
							</div>
							<div className="flex items-center">
								<MessageSquare className="h-3 w-3 mr-1" />
								<span>{(postCount || 1) - 1}</span>
							</div>
						</div>

						{/* Last activity time */}
						{lastPostAt && lastPostAt !== createdAt && (
							<div className="text-xs text-zinc-500 mt-2">
								{lastPostAt && !isNaN(new Date(lastPostAt).getTime())
									? formatDistanceToNow(new Date(lastPostAt), { addSuffix: true })
									: 'unknown time'}
							</div>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}

// Custom folder icon that matches Lucide style
const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
		</svg>
	);
};

export default ThreadCard;
