import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Users, MessageSquare } from 'lucide-react';
// import { ForumEntity } from '@/features/forum/hooks/useForumStructure'; // Old import
import type { MergedForum, MergedZone } from '@/contexts/ForumStructureContext'; // New import
import { getThemeClass } from '@/utils/forum-routing-helper';

interface ForumHeaderProps {
	forum: MergedForum | MergedZone; // Allow either type, or a common base if defined
	isPrimaryZone?: boolean;
	className?: string;
}

/**
 * ForumHeader - Displays a themed header for forums
 * Handles both Primary Zones and regular forums with different styling
 */
export function ForumHeader({ forum, isPrimaryZone = false, className = '' }: ForumHeaderProps) {
	const themeClass = forum.colorTheme ? `forum-header-theme-${forum.colorTheme}` : '';

	// Select icon based on theme or use default
	const renderIcon = () => {
		// If forum has an emoji icon, render it directly
		if (forum.icon && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(forum.icon)) {
			return <span className="text-4xl mr-4">{forum.icon}</span>;
		}

		// Default icon
		return <Flame className="h-8 w-8 mr-4 text-amber-500" />;
	};

	// For Primary Zones, render a more distinct, themed header
	if (isPrimaryZone) {
		const dynamicThemeClass = `theme-header-${forum.colorTheme || 'zinc'}`;
		return (
			<div className={`forum-header primary-zone-header ${dynamicThemeClass} mb-6 ${className}`}>
				<div
					// Apply static Tailwind classes that use CSS variables
					className="rounded-2xl p-6 bg-gradient-to-r from-forum-header-gradient-from to-forum-header-gradient-to border-2 border-forum-header-border"
				>
					<div className="flex items-center mb-4">
						{renderIcon()}
						<div>
							<h1 className="text-2xl font-bold text-white">{forum.name}</h1>
							<div className="flex items-center mt-1">
								<Badge
									// Apply static Tailwind classes that use CSS variables
									className="mr-2 bg-forum-header-badge-bg hover:bg-forum-header-badge-bg-hover"
								>
									Primary Zone
								</Badge>
								{(forum as MergedZone).hasXpBoost && ( // Type assertion for MergedZone specific prop
									<Badge className="bg-emerald-600 hover:bg-emerald-500">
										{(forum as MergedZone).boostMultiplier || 2}x XP
									</Badge>
								)}
							</div>
						</div>
					</div>

					{forum.description && <p className="text-zinc-300 mb-4">{forum.description}</p>}

					<div className="flex items-center text-sm text-zinc-400 gap-4">
						<div className="flex items-center">
							<MessageSquare className="h-4 w-4 mr-1 opacity-70" />
							<span>{forum.threadCount || 0} threads</span>
						</div>
						<div className="flex items-center">
							<Users className="h-4 w-4 mr-1 opacity-70" />
							<span>{forum.postCount || 0} posts</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// For regular forums, render a simpler header
	return (
		<Card className={`forum-header regular-forum-header mb-6 ${className}`}>
			<CardContent className="p-6">
				<div className="flex items-center mb-3">
					<MessageSquare className="h-6 w-6 mr-3 text-emerald-500" />
					<div>
						<h1 className="text-xl font-bold text-white">{forum.name}</h1>
						{forum.minXp && forum.minXp > 0 && (
							<Badge className="mt-1 bg-amber-600 hover:bg-amber-500">
								{forum.minXp} XP Required
							</Badge>
						)}
					</div>
				</div>

				{forum.description && <p className="text-zinc-300 mb-3">{forum.description}</p>}

				<div className="flex items-center text-sm text-zinc-400 gap-4">
					<div className="flex items-center">
						<MessageSquare className="h-4 w-4 mr-1 opacity-70" />
						<span>{forum.threadCount || 0} threads</span>
					</div>
					<div className="flex items-center">
						<Users className="h-4 w-4 mr-1 opacity-70" />
						<span>{forum.postCount || 0} posts</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
