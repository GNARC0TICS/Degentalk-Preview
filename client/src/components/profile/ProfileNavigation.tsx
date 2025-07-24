import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, ShoppingBag, Users, Sparkles, Eye, Bell, Gift } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { cn } from '@app/utils/utils';
import { useAuth } from '@app/hooks/use-auth';

interface ProfileNavigationProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	isOwnProfile: boolean;
	pendingFriendRequests?: number;
	unreadNotifications?: number;
	newAchievements?: number;
}

const TAB_GRID_CLASSES =
	'flex overflow-x-auto gap-1 min-w-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-600';

export function ProfileNavigation({
	activeTab,
	onTabChange,
	isOwnProfile,
	pendingFriendRequests = 0,
	unreadNotifications = 0,
	newAchievements = 0
}: ProfileNavigationProps) {
	const [recentlyVisited, setRecentlyVisited] = useState<string[]>([]);

	useEffect(() => {
		// Track tab usage for smart ordering
		if (activeTab && !recentlyVisited.includes(activeTab)) {
			setRecentlyVisited((prev) => [activeTab, ...prev.slice(0, 2)]);
		}
	}, [activeTab]);

	const tabs = getTabConfiguration(isOwnProfile, {
		pendingFriendRequests,
		unreadNotifications,
		newAchievements,
		recentlyVisited
	});

	return (
		<div className="mb-4">
			<TabsList
				className={`${TAB_GRID_CLASSES} bg-black/40 backdrop-blur-sm p-1 w-full justify-start`}
			>
				{tabs.map((tab) => (
					<TabTrigger
						key={tab.value}
						value={tab.value}
						onClick={() => onTabChange(tab.value)}
						className={cn(
							'flex items-center justify-center text-xs sm:text-sm px-3 py-2 whitespace-nowrap flex-shrink-0 relative',
							'data-[state=active]:text-white transition-all duration-200',
							tab.color
						)}
					>
						<div className="flex items-center gap-1 sm:gap-2">
							<div className="relative">
								{tab.icon}
								{tab.badge > 0 && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
									>
										{tab.badge > 99 ? '99+' : tab.badge}
									</motion.div>
								)}
								{tab.pulse && (
									<motion.div
										animate={{ scale: [1, 1.2, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
										className="absolute inset-0 rounded-full bg-current opacity-20"
									/>
								)}
							</div>
							<span
								className={cn(
									'transition-all duration-200',
									tab.hideTextOnMobile ? 'hidden sm:inline' : ''
								)}
							>
								{tab.label}
							</span>
							{tab.showShortLabel && <span className="sm:hidden">{tab.shortLabel}</span>}
						</div>
						{tab.isNew && (
							<motion.div
								initial={{ opacity: 0, x: 10 }}
								animate={{ opacity: 1, x: 0 }}
								className="ml-1 px-1 py-0.5 bg-emerald-500 text-white text-[8px] rounded font-bold"
							>
								NEW
							</motion.div>
						)}
					</TabTrigger>
				))}
			</TabsList>
		</div>
	);
}

interface TabConfig {
	value: string;
	label: string;
	shortLabel?: string;
	icon: React.ReactNode;
	color: string;
	badge: number;
	pulse: boolean;
	isNew: boolean;
	hideTextOnMobile: boolean;
	showShortLabel: boolean;
	priority: number;
}

function getTabConfiguration(
	isOwnProfile: boolean,
	metrics: {
		pendingFriendRequests: number;
		unreadNotifications: number;
		newAchievements: number;
		recentlyVisited: string[];
	}
): TabConfig[] {
	const baseTabs: TabConfig[] = [
		{
			value: 'overview',
			label: 'Overview',
			shortLabel: 'Home',
			icon: <Home className="h-3 w-3 sm:h-4 sm:w-4" />,
			color: 'data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400',
			badge: 0,
			pulse: false,
			isNew: false,
			hideTextOnMobile: true,
			showShortLabel: true,
			priority: 10
		},
		{
			value: 'achievements',
			label: 'Achievements',
			shortLabel: 'XP',
			icon: <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />,
			color: 'data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400',
			badge: metrics.newAchievements,
			pulse: metrics.newAchievements > 0,
			isNew: false,
			hideTextOnMobile: true,
			showShortLabel: true,
			priority: 8
		},
		{
			value: 'inventory',
			label: 'Inventory',
			shortLabel: 'Items',
			icon: <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />,
			color: 'data-[state=active]:bg-zinc-600/20 data-[state=active]:text-zinc-300',
			badge: 0,
			pulse: false,
			isNew: false,
			hideTextOnMobile: true,
			showShortLabel: true,
			priority: 6
		},
		{
			value: 'friends',
			label: 'Friends',
			shortLabel: 'Friends',
			icon: <Users className="h-3 w-3 sm:h-4 sm:w-4" />,
			color: 'data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300',
			badge: metrics.pendingFriendRequests,
			pulse: metrics.pendingFriendRequests > 0,
			isNew: false,
			hideTextOnMobile: false,
			showShortLabel: false,
			priority: 7
		},
		{
			value: 'whale-watch',
			label: 'Whale Watch',
			shortLabel: 'Watch',
			icon: <Eye className="h-3 w-3 sm:h-4 sm:w-4" />,
			color: 'data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400',
			badge: 0,
			pulse: false,
			isNew: false,
			hideTextOnMobile: true,
			showShortLabel: true,
			priority: 5
		}
	];

	// Add self-only tabs
	if (isOwnProfile) {
		baseTabs.push(
			{
				value: 'cosmetics',
				label: 'Cosmetics',
				shortLabel: 'Style',
				icon: <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />,
				color: 'data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400',
				badge: 0,
				pulse: false,
				isNew: false,
				hideTextOnMobile: true,
				showShortLabel: true,
				priority: 4
			},
			{
				value: 'notifications',
				label: 'Notifications',
				shortLabel: 'Alerts',
				icon: <Bell className="h-3 w-3 sm:h-4 sm:w-4" />,
				color: 'data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400',
				badge: metrics.unreadNotifications,
				pulse: metrics.unreadNotifications > 0,
				isNew: true,
				hideTextOnMobile: true,
				showShortLabel: true,
				priority: 9
			}
		);
	}

	// Boost priority for recently visited tabs
	baseTabs.forEach((tab) => {
		const recentIndex = metrics.recentlyVisited.indexOf(tab.value);
		if (recentIndex !== -1) {
			tab.priority += 3 - recentIndex; // Boost recently visited
		}
	});

	// Sort by priority (higher = first)
	return baseTabs.sort((a, b) => b.priority - a.priority);
}

// Tab trigger component for additional customization
function TabTrigger({
	value,
	onClick,
	className,
	children
}: {
	value: string;
	onClick: () => void;
	className: string;
	children: React.ReactNode;
}) {
	return (
		<button onClick={onClick} className={className} data-state={value}>
			{children}
		</button>
	);
}
