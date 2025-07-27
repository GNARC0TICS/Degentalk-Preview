import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Users, MessageSquare, Plus } from 'lucide-react';
import { cn } from '@/utils/utils';
import type { MergedForum } from '@/features/forum/contexts/ForumStructureContext';

interface ForumHeaderProps {
	forum: MergedForum;
	isFeaturedZone?: boolean;
	className?: string;
	variant?: 'compact' | 'detailed' | 'minimal' | 'themed';
	slots?: {
		actions?: React.ReactNode;
		stats?: React.ReactNode;
		description?: React.ReactNode;
	};
	onNewThread?: () => void;
}

/**
 * Unified ForumHeader Component
 * 
 * Combines themed styling for primary zones with flexible slots pattern.
 * Supports multiple variants and customizable content areas.
 */
export function ForumHeader({ 
	forum, 
	isFeaturedZone = false, 
	className = '',
	variant = 'detailed',
	slots,
	onNewThread
}: ForumHeaderProps) {
	// Icon rendering logic
	const renderIcon = (size: 'sm' | 'md' | 'lg' = 'md') => {
		const icon = 'icon' in forum ? forum.icon : forum.theme?.icon;
		const sizeClasses = {
			sm: 'text-xl w-8 h-8',
			md: 'text-2xl w-10 h-10', 
			lg: 'text-4xl w-12 h-12'
		};
		
		if (icon && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(icon)) {
			return <span className={`mr-3 ${sizeClasses[size].split(' ')[0]}`}>{icon}</span>;
		}
		
		const iconSize = sizeClasses[size].split(' ').slice(1).join(' ');
		return <Flame className={`mr-3 text-amber-500 ${iconSize}`} />;
	};

	// Stats rendering logic
	const renderStats = () => {
		if (slots?.stats) return slots.stats;
		
		return (
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
		);
	};

	// Actions rendering logic
	const renderActions = () => {
		if (slots?.actions) return slots.actions;
		if (!onNewThread) return null;
		
		const buttonSize = variant === 'minimal' ? 'sm' : 'default';
		return (
			<Button 
				size={buttonSize}
				className="bg-emerald-600 hover:bg-emerald-700" 
				onClick={onNewThread}
			>
				<Plus className="w-4 h-4 mr-2" />
				{variant !== 'minimal' && 'New Thread'}
			</Button>
		);
	};

	// Themed primary zone variant
	if ((variant === 'themed' || isFeaturedZone) && isFeaturedZone) {
		const colorTheme = 'theme' in forum ? forum.theme?.colorTheme : undefined;
		const dynamicThemeClass = `theme-header-${colorTheme || 'zinc'}`;
		
		return (
			<div className={cn('forum-header primary-zone-header mb-6', dynamicThemeClass, className)}>
				<div className="rounded-2xl p-6 bg-gradient-to-r from-forum-header-gradient-from to-forum-header-gradient-to border-2 border-forum-header-border">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center">
							{renderIcon('lg')}
							<div>
								<h1 className="text-2xl font-bold text-white">{forum.name}</h1>
								<div className="flex items-center mt-1 gap-2">
									<Badge className="bg-forum-header-badge-bg hover:bg-forum-header-badge-bg-hover">
										Primary Zone
									</Badge>
									{(forum as MergedForum).hasXpBoost && (
										<Badge className="bg-emerald-600 hover:bg-emerald-500">
											{(forum as MergedForum).boostMultiplier || 2}x XP
										</Badge>
									)}
								</div>
							</div>
						</div>
						{renderActions()}
					</div>

					{(slots?.description || forum.description) && (
						<div className="mb-4">
							{slots?.description || <p className="text-zinc-300">{forum.description}</p>}
						</div>
					)}

					{renderStats()}
				</div>
			</div>
		);
	}

	// Compact variant
	if (variant === 'compact') {
		return (
			<div className={cn('flex items-center justify-between', className)}>
				<div className="flex items-center gap-3">
					{renderIcon('sm')}
					<div>
						<h1 className="text-xl font-bold text-white">{forum.name}</h1>
						{renderStats()}
					</div>
				</div>
				{renderActions()}
			</div>
		);
	}

	// Minimal variant
	if (variant === 'minimal') {
		return (
			<div className={cn('flex items-center justify-between', className)}>
				<h1 className="text-xl font-semibold text-white">{forum.name}</h1>
				{renderActions()}
			</div>
		);
	}

	// Detailed variant (default) - regular forum header
	return (
		<Card className={cn('forum-header regular-forum-header mb-6', className)}>
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="space-y-3">
						<div className="flex items-center">
							{renderIcon('md')}
							<div>
								<h1 className="text-xl font-bold text-white">{forum.name}</h1>
								{'minXp' in forum && forum.minXp && forum.minXp > 0 && (
									<Badge className="mt-1 bg-amber-600 hover:bg-amber-500">
										{forum.minXp} XP Required
									</Badge>
								)}
							</div>
						</div>

						{(slots?.description || forum.description) && (
							<div>
								{slots?.description || <p className="text-zinc-300">{forum.description}</p>}
							</div>
						)}

						{renderStats()}
					</div>
					{renderActions()}
				</div>
			</CardContent>
		</Card>
	);
}

ForumHeader.displayName = 'ForumHeader';