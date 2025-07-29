import React from 'react';
import type { SlotId } from '@/stores/useLayoutStore';
import type { LucideIcon } from 'lucide-react';

export interface WidgetMetadata {
	id: string;
	name: string;
	description: string;
	icon?: LucideIcon;
	category: 'navigation' | 'social' | 'data' | 'interactive' | 'economy' | 'forum';
	defaultSlots: SlotId[];
	minWidth?: number; // Minimum width in pixels
	maxWidth?: number; // Maximum width in pixels
	responsive?: boolean; // Whether widget adjusts to container width
	requiresAuth?: boolean; // Whether widget requires authentication
}

export interface WidgetConfig {
	component: () => Promise<{ default: React.ComponentType<any> }>;
	metadata: WidgetMetadata;
}

// Import icons for widget metadata
import {
	User,
	MessageSquare,
	Wallet,
	CheckSquare,
	Flame,
	LayoutGrid,
	Trophy,
	Users,
	Navigation,
	TrendingUp,
	Activity,
	Calendar,
	Bell,
	Settings
} from 'lucide-react';

/**
 * Enhanced widget registry with metadata and better organization
 */
export const widgetRegistry: Record<string, WidgetConfig> = {
	// Profile & User Widgets
	profileCard: {
		component: () => import('@/components/widgets/ProfileCardWidget'),
		metadata: {
			id: 'profileCard',
			name: 'Profile Card',
			description: 'Displays user profile information and stats',
			icon: User,
			category: 'data',
			defaultSlots: ['sidebar/left'],
			minWidth: 250,
			responsive: true,
			requiresAuth: true
		}
	},

	// Social & Communication Widgets
	shoutbox: {
		component: () =>
			import('@/components/shoutbox/positioned-shoutbox').then((module) => ({
				default: module.default
			})),
		metadata: {
			id: 'shoutbox',
			name: 'Shoutbox',
			description: 'Real-time chat with other users',
			icon: MessageSquare,
			category: 'social',
			defaultSlots: ['sidebar/right', 'main/top', 'mobile/widgets'],
			minWidth: 300,
			responsive: true,
			requiresAuth: true
		}
	},

	// Economy & Wallet Widgets
	walletSummary: {
		component: () => import('@/components/widgets/WalletSummaryWidgetWrapper'),
		metadata: {
			id: 'walletSummary',
			name: 'Wallet Summary',
			description: 'Quick overview of your digital assets',
			icon: Wallet,
			category: 'economy',
			defaultSlots: ['sidebar/right', 'mobile/widgets'],
			minWidth: 250,
			responsive: true,
			requiresAuth: true
		}
	},

	// Task & Activity Widgets
	dailyTasks: {
		component: () =>
			import('@/components/dashboard/DailyTasksWidget').then((module) => ({
				default: module.default
			})),
		metadata: {
			id: 'dailyTasks',
			name: 'Daily Tasks',
			description: 'Track and complete daily objectives',
			icon: CheckSquare,
			category: 'interactive',
			defaultSlots: ['sidebar/right', 'main/top'],
			minWidth: 280,
			responsive: true,
			requiresAuth: true
		}
	},

	// Forum & Content Widgets
	hotThreads: {
		component: () =>
			import('@/features/forum/components/HotThreads').then((module) => ({
				default: module.default
			})),
		metadata: {
			id: 'hotThreads',
			name: 'Hot Threads',
			description: 'Trending discussions from the forum',
			icon: Flame,
			category: 'forum',
			defaultSlots: ['sidebar/right', 'main/bottom'],
			minWidth: 300,
			responsive: true
		}
	},

	// Navigation Widgets
	forumNav: {
		component: () => import("@/features/forum/components/ForumTreeNav").then((module) => ({
			default: module.default
		})),
		metadata: {
			id: 'forumNav',
			name: 'Forum Navigation',
			description: 'Hierarchical forum and zone navigation',
			icon: Navigation,
			category: 'navigation',
			defaultSlots: ['sidebar/left', 'sidebar/right'],
			minWidth: 280,
			maxWidth: 400,
			responsive: true
		}
	},

	sidebarNav: {
		component: () =>
			import('@/components/layout/SidebarNavigation').then((module) => ({
				default: module.default
			})),
		metadata: {
			id: 'sidebarNav',
			name: 'Compact Navigation',
			description: 'Simplified navigation for sidebars',
			icon: LayoutGrid,
			category: 'navigation',
			defaultSlots: ['sidebar/left'],
			minWidth: 200,
			responsive: true
		}
	},

	// Leaderboard & Competition Widgets
	leaderboard: {
		component: () =>
			import('@/components/sidebar/leaderboard-widget').then((module) => ({
				default: module.default
			})),
		metadata: {
			id: 'leaderboard',
			name: 'Leaderboard',
			description: 'Top performers and rankings',
			icon: Trophy,
			category: 'data',
			defaultSlots: ['sidebar/right', 'main/bottom', 'mobile/widgets'],
			minWidth: 280,
			responsive: true
		}
	},

	// Community & Social Widgets
	activeMembers: {
		component: () =>
			import('@/components/users/ActiveMembersWidget').then((module) => ({
				default: module.default
			})),
		metadata: {
			id: 'activeMembers',
			name: 'Active Members',
			description: 'Currently online community members',
			icon: Users,
			category: 'social',
			defaultSlots: ['sidebar/right'],
			minWidth: 250,
			responsive: true
		}
	},

	// Platform Statistics
	platformStats: {
		component: () =>
			import('@/components/platform-energy/stats/platform-stats-widget').then((module) => ({
				default: module.PlatformStatsWidget || module.default
			})),
		metadata: {
			id: 'platformStats',
			name: 'Platform Stats',
			description: 'Real-time platform statistics',
			icon: Activity,
			category: 'data',
			defaultSlots: ['main/top', 'sidebar/right'],
			minWidth: 300,
			responsive: true
		}
	},

	// Recent Activity Feed
	recentActivity: {
		component: () =>
			import('@/components/forum/RecentActivity').then((module) => ({
				default: module.RecentActivity || module.default
			})),
		metadata: {
			id: 'recentActivity',
			name: 'Recent Activity',
			description: 'Latest platform activity feed',
			icon: TrendingUp,
			category: 'social',
			defaultSlots: ['main/bottom'],
			minWidth: 400,
			responsive: true
		}
	},

	// Featured Content
	featuredThreads: {
		component: () =>
			import('@/components/platform-energy/featured-threads/featured-threads-slider').then(
				(module) => ({
					default: module.FeaturedThreadsSlider || module.default
				})
			),
		metadata: {
			id: 'featuredThreads',
			name: 'Featured Threads',
			description: 'Highlighted community discussions',
			icon: TrendingUp,
			category: 'forum',
			defaultSlots: ['main/top'],
			minWidth: 400,
			responsive: true
		}
	},

	// Upcoming Events
	upcomingEvents: {
		component: () =>
			import('@/components/dashboard/UpcomingEventsWidget').then((module) => ({
				default: module.default
			})),
		metadata: {
			id: 'upcomingEvents',
			name: 'Upcoming Events',
			description: 'Community events and deadlines',
			icon: Calendar,
			category: 'interactive',
			defaultSlots: ['sidebar/right', 'main/top'],
			minWidth: 280,
			responsive: true
		}
	},

	// Notifications - TODO: Fix API endpoints (getPaginatedNotifications, messages, mentions, unread-count)
	notificationCenter: {
		component: () =>
			import('@/components/notifications/NotificationPanel').then((module) => ({
				default: module.NotificationPanel || module.default
			})),
		metadata: {
			id: 'notificationCenter',
			name: 'Notifications',
			description: 'Recent notifications and alerts',
			icon: Bell,
			category: 'interactive',
			defaultSlots: ['sidebar/right'],
			minWidth: 280,
			responsive: true,
			requiresAuth: true
		}
	}
};

// Helper functions
export function getWidgetsByCategory(category: WidgetMetadata['category']): WidgetConfig[] {
	return Object.values(widgetRegistry).filter((widget) => widget.metadata.category === category);
}

export function getWidgetsBySupportedSlot(slotId: SlotId): WidgetConfig[] {
	return Object.values(widgetRegistry).filter((widget) =>
		widget.metadata.defaultSlots.includes(slotId)
	);
}

export function getWidgetMetadata(widgetId: string): WidgetMetadata | undefined {
	return widgetRegistry[widgetId]?.metadata;
}

// Type exports
export type WidgetId = keyof typeof widgetRegistry;
