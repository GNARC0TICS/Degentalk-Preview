import React from 'react';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { type ThreadWithUserAndCategory } from '@db_types/forum.types';
import type { Tag } from '@/types/forum';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TagBadge } from '@/components/ui/tag-badge';
import {
	MessageSquare,
	Eye,
	Clock,
	Flame,
	Lock,
	Pin,
	Tag as TagIcon
} from 'lucide-react';

interface ThreadCardProps {
	thread: ThreadWithUserAndCategory;
	className?: string;
}

export function ThreadCard({ thread, className = '' }: ThreadCardProps) {
	if (!thread) {
		return null;
	}

	const {
		title,
		slug,
		isSticky,
		isLocked,
		viewCount,
		postCount,
		lastPostAt,
		createdAt,
		user,
		hotScore
	} = thread;

	const prefix = (thread as any).prefix ?? null;
	const tags: Tag[] = (thread as any).tags ?? [];
	const category = (thread as any).category ?? null;

	const threadUrl = `/threads/${slug}`;
	const isHot = hotScore !== undefined && hotScore > 10;

	return (
		<Card
			className={`bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 ${className}`}
		>
			<div className="p-4">
				<div className="flex gap-3">
					<Avatar className="h-10 w-10 border border-zinc-700">
						<AvatarImage
							src={user?.activeAvatarUrl || user?.avatarUrl || ''}
							alt={user?.username || 'User'}
						/>
						<AvatarFallback className="bg-zinc-800 text-zinc-300">
							{user?.username?.slice(0, 2).toUpperCase() || 'UN'}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 min-w-0">
						<div className="flex items-center flex-wrap gap-2 mb-1">
							<div className="flex gap-1">
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

						<Link href={threadUrl} className="block">
							<h3 className="text-lg font-medium leading-tight hover:text-emerald-400 transition-colors">
								{title}
							</h3>
						</Link>

						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-400">
							<Link href={`/profile/${user?.id}`} className="hover:text-zinc-200 transition-colors">
								{user?.username || 'Unknown'}
							</Link>

							<span className="flex items-center">
								<Clock className="h-3 w-3 mr-1" />
								{createdAt && !isNaN(new Date(createdAt).getTime())
									? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
									: 'unknown time'}
							</span>

							{category && (
								<Link
									href={`/forums/${category.slug}`}
									className="hover:text-zinc-200 transition-colors flex items-center"
								>
									<FolderIcon className="h-3 w-3 mr-1" />
									{category.name}
								</Link>
							)}

							{tags.length > 0 && (
								<div className="flex items-center flex-wrap gap-1">
									<TagIcon className="h-3 w-3 text-zinc-500" />
									{tags.map((tag: Tag) => (
										<TagBadge key={tag.id} tag={tag} />
									))}
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col items-end justify-between text-xs text-zinc-500 ml-2">
						<div className="flex flex-col items-end gap-1">
							<div className="flex items-center">
								<Eye className="h-3 w-3 mr-1" />
								<span>{viewCount ?? 0}</span>
							</div>
							<div className="flex items-center">
								<MessageSquare className="h-3 w-3 mr-1" />
								<span>{(postCount ?? 1) - 1}</span>
							</div>
						</div>

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

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
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

export default ThreadCard;
