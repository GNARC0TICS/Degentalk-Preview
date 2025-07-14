import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContentFeedState } from '@/contexts/content-feed-context';
import {
	TrendingUp,
	Clock,
	Heart,
	Compass,
	Home,
	Users,
	MessageSquare,
	Settings,
	ChevronRight
} from 'lucide-react';
import { cn } from '@/utils/utils';

interface NavigationItem {
	id: string;
	label: string;
	icon: React.ComponentType<any>;
	href?: string;
	badge?: number;
	isActive?: boolean;
	variant?: 'default' | 'feed-tab' | 'section';
}

interface NavigationWidgetProps {
	compact?: boolean;
}

export default function NavigationWidget({ compact = false }: NavigationWidgetProps) {
	const { activeTab, badges } = useContentFeedState();

	// Define navigation structure with feed-aware badges
	const navigationItems: NavigationItem[] = [
		{
			id: 'home',
			label: 'Home',
			icon: Home,
			href: '/',
			variant: 'section'
		},
		{
			id: 'trending',
			label: 'Trending',
			icon: TrendingUp,
			badge: badges.hotCount,
			isActive: activeTab === 'trending',
			variant: 'feed-tab'
		},
		{
			id: 'recent',
			label: 'Recent',
			icon: Clock,
			badge: badges.newCount,
			isActive: activeTab === 'recent',
			variant: 'feed-tab'
		},
		{
			id: 'following',
			label: 'Following',
			icon: Heart,
			badge: badges.followingActiveCount,
			isActive: activeTab === 'following',
			variant: 'feed-tab'
		},
		{
			id: 'divider-1',
			label: '',
			icon: () => null,
			variant: 'section'
		},
		{
			id: 'explore',
			label: 'Explore Zones',
			icon: Compass,
			href: '/zones',
			variant: 'section'
		},
		{
			id: 'community',
			label: 'Community',
			icon: Users,
			href: '/community',
			variant: 'section'
		},
		{
			id: 'discussions',
			label: 'All Discussions',
			icon: MessageSquare,
			href: '/discussions',
			variant: 'section'
		}
	];

	const handleItemClick = (item: NavigationItem) => {
		if (item.href) {
			window.location.href = item.href;
		}
		// Feed tab clicks are handled by the main content area
	};

	const renderNavigationItem = (item: NavigationItem) => {
		if (item.id.startsWith('divider-')) {
			return <div key={item.id} className="my-2 border-t border-zinc-800/50" />;
		}

		const Icon = item.icon;
		const isFeedTab = item.variant === 'feed-tab';
		const hasActiveState = item.isActive || item.href === window.location.pathname;

		return (
			<Button
				key={item.id}
				variant="ghost"
				size={compact ? 'sm' : 'default'}
				onClick={() => handleItemClick(item)}
				className={cn(
					'w-full justify-start text-left px-3 py-2 h-auto font-normal transition-all duration-200',
					hasActiveState
						? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
						: 'text-zinc-300 hover:text-white hover:bg-zinc-800/50',
					isFeedTab && 'cursor-default', // Feed tabs are controlled by main content
					compact && 'text-sm px-2 py-1.5'
				)}
				disabled={isFeedTab} // Prevent direct clicking on feed tabs
			>
				<div className="flex items-center justify-between w-full min-w-0">
					<div className="flex items-center gap-3 min-w-0">
						<Icon
							className={cn(
								'flex-shrink-0',
								compact ? 'h-4 w-4' : 'h-5 w-5',
								hasActiveState ? 'text-emerald-400' : 'text-zinc-500'
							)}
						/>
						<span className="truncate flex-1">{item.label}</span>
					</div>

					<div className="flex items-center gap-2 flex-shrink-0">
						{/* Badge for content counts */}
						{item.badge !== undefined && item.badge > 0 && (
							<Badge
								variant="secondary"
								className={cn(
									'h-5 px-1.5 text-xs font-medium transition-all duration-300',
									hasActiveState
										? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
										: 'bg-zinc-700 text-zinc-300',
									// Pulse animation for new content
									item.badge > 0 && item.variant === 'feed-tab' && 'animate-pulse'
								)}
							>
								{item.badge > 99 ? '99+' : item.badge}
							</Badge>
						)}

						{/* Arrow for external links */}
						{item.href && !isFeedTab && (
							<ChevronRight className="h-3 w-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
						)}
					</div>
				</div>
			</Button>
		);
	};

	return (
		<Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
			<CardHeader className={cn('pb-3', compact ? 'px-3 pt-3' : 'px-4 pt-4')}>
				<CardTitle
					className={cn('flex items-center text-zinc-100', compact ? 'text-base' : 'text-lg')}
				>
					<Compass className={cn('text-emerald-500 mr-2', compact ? 'h-4 w-4' : 'h-5 w-5')} />
					Navigation
				</CardTitle>
			</CardHeader>

			<CardContent className={cn('space-y-1', compact ? 'px-3 pb-3' : 'px-4 pb-4')}>
				{navigationItems.map(renderNavigationItem)}

				{/* Settings at bottom */}
				<div className="pt-3 mt-3 border-t border-zinc-800/50">
					<Button
						variant="ghost"
						size={compact ? 'sm' : 'default'}
						onClick={() => (window.location.href = '/settings')}
						className={cn(
							'w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800/50',
							compact ? 'text-sm px-2 py-1.5' : 'px-3 py-2'
						)}
					>
						<Settings className={cn('mr-3', compact ? 'h-4 w-4' : 'h-5 w-5')} />
						Settings
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
