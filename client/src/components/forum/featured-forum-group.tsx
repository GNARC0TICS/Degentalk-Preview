import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FolderOpen, ChevronDown, ChevronRight, MessageSquare, Megaphone } from 'lucide-react';
import type { ForumId, ForumId, ThreadId, EntityId } from '@shared/types/ids';

// Define theme colors for different forums
const FORUM_COLORS = {
	default: {
		border: 'border-zinc-800',
		accent: 'text-emerald-500',
		bg: 'bg-zinc-900/70',
		hover: 'hover:border-emerald-600'
	},
	announcements: {
		border: 'border-emerald-800/40',
		accent: 'text-emerald-500',
		bg: 'bg-zinc-900/70',
		hover: 'hover:border-emerald-600'
	},
	trading: {
		border: 'border-blue-800/40',
		accent: 'text-blue-500',
		bg: 'bg-zinc-900/70',
		hover: 'hover:border-blue-600'
	},
	discussion: {
		border: 'border-purple-800/40',
		accent: 'text-purple-500',
		bg: 'bg-zinc-900/70',
		hover: 'hover:border-purple-600'
	},
	community: {
		border: 'border-amber-800/40',
		accent: 'text-amber-500',
		bg: 'bg-zinc-900/70',
		hover: 'hover:border-amber-600'
	}
};

// Get forum theme based on forum name or slug
const getForumTheme = (forum: Forum) => {
	const name = forum.name.toLowerCase();
	if (name.includes('announcement')) return FORUM_COLORS.announcements;
	if (name.includes('trading') || name.includes('market')) return FORUM_COLORS.trading;
	if (name.includes('discussion') || name.includes('talk')) return FORUM_COLORS.discussion;
	if (name.includes('community') || name.includes('social')) return FORUM_COLORS.community;
	return FORUM_COLORS.default;
};

export interface Forum {
	id: ForumId;
	name: string;
	description: string | null;
	threadCount: number;
	postCount: number;
	slug: string;
	lastActivity?: string;
	lastThread?: {
		id: ThreadId;
		title: string;
		user: {
			username: string;
			avatarUrl?: string | null;
		};
		createdAt: string;
	};
	isLocked?: boolean;
	isVip?: boolean;
	minXp?: number | null;
}

export interface Forum {
	id: ForumId;
	name: string;
	position: number;
	slug?: string;
	forums: Forum[];
}

interface ForumGroupProps {
	forum: Forum;
	className?: string;
}

export function ForumGroup({ forum, className = '' }: ForumGroupProps) {
	const theme = getForumTheme(forum);

	return (
		<div className={`rounded-2xl ${theme.bg} border ${theme.border} p-4 space-y-4 ${className}`}>
			<div className="flex items-center mb-2">
				{/* Forum icon (optional) */}
				<FolderOpen className={`h-6 w-6 ${theme.accent} mr-2`} />
				<span className="text-lg font-bold text-white">{forum.name}</span>
				<span className="ml-2 text-xs text-zinc-400 font-normal">Forum</span>
			</div>
			<div className="space-y-3">
				{forum.forums && forum.forums.length > 0 ? (
					forum.forums.map((forum) => (
						<Link key={forum.id} to={`/forums/${forum.slug}`} className="block">
							<div
								className={`rounded-xl bg-zinc-900 border border-zinc-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between ${theme.hover} transition-all`}
							>
								<div className="flex items-center mb-2 sm:mb-0">
									{/* Forum icon - show megaphone for announcements */}
									<span className="mr-3">
										{forum.slug === 'forum-announcements' ? (
											<Megaphone className={`h-5 w-5 ${theme.accent}`} />
										) : (
											<MessageSquare className={`h-5 w-5 ${theme.accent}`} />
										)}
									</span>
									<div>
										<div className="font-semibold text-white text-base">
											{forum.name}
											{forum.slug === 'forum-announcements' && (
												<span className="ml-2 text-xs font-bold bg-emerald-700/80 text-white px-1.5 py-0.5 rounded">
													ANNOUNCEMENTS
												</span>
											)}
										</div>
										{forum.description && (
											<div className="text-xs text-zinc-400 mt-1">{forum.description}</div>
										)}
									</div>
								</div>
								<div className="flex items-center gap-4 mt-2 sm:mt-0">
									<span className="text-xs text-zinc-400">
										{forum.threadCount} threads • {forum.postCount} posts
									</span>
								</div>
							</div>
						</Link>
					))
				) : (
					<div className="py-4 text-center text-zinc-500">No forums available in this forum</div>
				)}
			</div>
		</div>
	);
}
