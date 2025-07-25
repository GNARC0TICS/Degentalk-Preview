import React, { useState } from 'react';
import { cn } from '@app/utils/utils';
import { Flame, Clock, Users, Newspaper, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ContentTab } from '@app/hooks/use-content';
import theme from '@app/config/theme.config';

export interface TabConfig {
	id: ContentTab;
	label: string;
	description: string;
	icon: LucideIcon;
	requiresAuth?: boolean;
}

export interface TabSwitcherProps {
	activeTab: ContentTab;
	onTabChange: (tab: ContentTab) => void;
	className?: string;
	variant?: 'default' | 'compact';
	isAuthenticated?: boolean;
}

const DEFAULT_TABS: TabConfig[] = [
	{
		id: 'trending',
		label: 'Trending',
		description: 'Hot threads',
		icon: Flame,
		requiresAuth: false
	},
	{
		id: 'recent',
		label: 'Recent',
		description: 'Latest posts',
		icon: Clock,
		requiresAuth: false
	},
	{
		id: 'following',
		label: 'Following',
		description: 'Your follows',
		icon: Users,
		requiresAuth: true
	},
	{
		id: 'announcements',
		label: 'News/Updates',
		description: 'Official news',
		icon: Newspaper,
		requiresAuth: false
	},
	{
		id: 'my-threads',
		label: 'My Threads',
		description: 'Your posts',
		icon: User,
		requiresAuth: true
	}
];

export function TabSwitcher({
	activeTab,
	onTabChange,
	className,
	variant = 'default',
	isAuthenticated = false
}: TabSwitcherProps) {
	const [isChanging, setIsChanging] = useState(false);
	const [hoveredTab, setHoveredTab] = useState<ContentTab | null>(null);

	// Filter tabs based on auth status
	const availableTabs = DEFAULT_TABS.filter((tab) => {
		if (tab.requiresAuth && !isAuthenticated) {
			return false;
		}
		return true;
	});

	const isCompact = variant === 'compact';

	const handleTabChange = async (tabId: ContentTab) => {
		if (tabId === activeTab || isChanging) return;

		setIsChanging(true);

		// Add slight delay for visual feedback
		setTimeout(() => {
			onTabChange(tabId);
			setIsChanging(false);
		}, 150);
	};

	return (
		<div className={cn('border-b border-zinc-800', className)}>

			<nav className="relative flex space-x-1 sm:space-x-4 overflow-x-auto overflow-y-hidden scrollbar-none" aria-label="Content tabs">
				{availableTabs.map((tab, index) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;
					const isHovered = hoveredTab === tab.id;
					const isDisabled = isChanging && !isActive;

					return (
						<button
							key={tab.id}
							onClick={() => handleTabChange(tab.id)}
							onMouseEnter={() => setHoveredTab(tab.id)}
							onMouseLeave={() => setHoveredTab(null)}
							disabled={isDisabled}
							className={cn(
								'relative flex items-center gap-2 py-3 px-2 sm:px-3 text-sm font-medium transition-colors',
								'border-b-2 border-transparent',
								'hover:text-zinc-200',
								'disabled:opacity-50 disabled:cursor-not-allowed',
								isActive
									? 'text-white border-orange-400'
									: 'text-zinc-400'
							)}
							aria-current={isActive ? 'page' : undefined}
						>
							{/* Tab icon with special effects */}
							<div className="relative">
								<Icon
									className={cn(
										'h-4 w-4 transition-colors',
										isActive ? 'text-orange-400' : 'text-zinc-500'
									)}
								/>

								{/* Special effects for different tabs */}
								{tab.id === 'trending' && isActive && (
									<div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
								)}
								{tab.id === 'announcements' && (
									<div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
								)}

								{/* Notification dot for following tab (if needed) */}
								{tab.id === 'following' && isAuthenticated && isActive && (
									<div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-green-400 rounded-full" />
								)}
							</div>

							{/* Tab content */}
							<div className="flex flex-col items-start">
								<span className="text-left whitespace-nowrap">
									{tab.label}
								</span>
								{!isCompact && (
									<span
										className={cn(
											'text-xs opacity-70 text-left transition-all whitespace-nowrap',
											isActive ? 'text-orange-300/90' : 'text-zinc-500',
											isHovered && !isActive && 'text-orange-200/80 opacity-90'
										)}
										style={{ transitionDuration: theme.animation.durations.normal }}
									>
										{tab.description}
									</span>
								)}
							</div>

							{/* Enhanced active indicator with animation */}
							{isActive && (
								<>
									<div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 shadow-lg shadow-orange-500/30" />
								</>
							)}

							{/* Hover indicator */}
							{isHovered && !isActive && (
								<div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-orange-300/50 to-red-300/50 transform transition-transform duration-200" />
							)}

							{/* Ripple effect overlay */}
							<div
								className={cn(
									'absolute inset-0 rounded-t-lg overflow-hidden opacity-0 transition-opacity duration-200',
									isHovered && 'opacity-100'
								)}
							>
								<div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-red-400/10" />
							</div>
						</button>
					);
				})}
			</nav>

			{/* Loading progress bar */}
			{isChanging && (
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800 overflow-hidden">
					<div
						className="h-full bg-gradient-to-r from-orange-400 to-red-400"
						style={{
							animation: 'shimmer 1s ease-in-out infinite',
							background: 'linear-gradient(90deg, transparent, #fb923c, #dc2626, transparent)',
							backgroundSize: '200% 100%'
						}}
					/>
				</div>
			)}
		</div>
	);
}

export default TabSwitcher;
