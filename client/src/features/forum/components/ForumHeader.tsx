import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Users, MessageSquare } from 'lucide-react';
import { ForumEntity } from '@/features/forum/hooks/useForumStructure';
import { getThemeClass } from '@/utils/forum-routing-helper';

interface ForumHeaderProps {
	forum: ForumEntity;
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
		return (
			<div className={`forum-header primary-zone-header ${themeClass} mb-6 ${className}`}>
				<div
					className={`rounded-2xl p-6 ${forum.colorTheme ? `bg-gradient-to-r from-${forum.colorTheme}-900/60 to-${forum.colorTheme}-800/40` : 'bg-zinc-900/80'} border-2 ${forum.colorTheme ? `border-${forum.colorTheme}-600/40` : 'border-zinc-700'}`}
				>
					<div className="flex items-center mb-4">
						{renderIcon()}
						<div>
							<h1 className="text-2xl font-bold text-white">{forum.name}</h1>
							<div className="flex items-center mt-1">
								<Badge
									className={`mr-2 ${forum.colorTheme ? `bg-${forum.colorTheme}-700 hover:bg-${forum.colorTheme}-600` : 'bg-zinc-700 hover:bg-zinc-600'}`}
								>
									Primary Zone
								</Badge>
								{forum.hasXpBoost && (
									<Badge className="bg-emerald-600 hover:bg-emerald-500">
										{forum.boostMultiplier || 2}x XP
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
