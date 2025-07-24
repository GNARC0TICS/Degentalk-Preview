import React, { useState } from 'react';
import { cn } from '@app/utils/utils';
import { TrendingUp, Clock, Users, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ContentTab } from '@app/hooks/use-content';

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
		description: 'Hot discussions right now',
		icon: TrendingUp,
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
		description: 'From people you follow',
		icon: Users,
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
		<div className={cn('relative border-b border-zinc-800/60 backdrop-blur-sm', className)}>
			{/* Animated background glow */}
			<div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			<nav className="relative flex space-x-1 sm:space-x-6" aria-label="Content tabs">
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
								'group relative flex items-center gap-2 py-3 px-2 sm:px-3 text-sm font-medium transition-all duration-300',
								'border-b-2 border-transparent rounded-t-lg',
								'hover:bg-zinc-800/30 hover:scale-105 transform-gpu',
								'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
								isActive
									? 'text-orange-400 border-orange-400 bg-zinc-800/20 shadow-lg shadow-orange-500/10'
									: 'text-zinc-400 hover:text-orange-300 hover:border-orange-300/50',
								isHovered && !isActive && 'text-orange-200 border-orange-200/30'
							)}
							aria-current={isActive ? 'page' : undefined}
						>
							{/* Tab icon with special effects */}
							<div className="relative">
								<Icon
									className={cn(
										'h-4 w-4 transition-all duration-300',
										isActive
											? 'text-orange-400 drop-shadow-lg'
											: 'text-zinc-500 group-hover:text-orange-300',
										isHovered && !isActive && 'scale-110 text-orange-200',
										isChanging && isActive && 'opacity-75'
									)}
								/>

								{/* Sparkle effect for trending tab when active */}
								{tab.id === 'trending' && isActive && (
									<Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-orange-300" />
								)}

								{/* Notification dot for following tab (if needed) */}
								{tab.id === 'following' && isAuthenticated && isActive && (
									<div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 bg-green-400 rounded-full" />
								)}
							</div>

							{/* Tab content */}
							<div className="flex flex-col items-start transition-all duration-300">
								<span className={cn('text-left font-medium', isActive && 'drop-shadow-sm')}>
									{tab.label}
								</span>
								{!isCompact && (
									<span
										className={cn(
											'text-xs opacity-70 text-left transition-all duration-300',
											isActive ? 'text-orange-300/90' : 'text-zinc-500',
											isHovered && !isActive && 'text-orange-200/80 opacity-90'
										)}
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
