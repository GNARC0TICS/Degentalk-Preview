import React from 'react';

/**
 * The component registry maps a unique string ID to a function that returns a dynamic import.
 * This enables lazy loading for each widget, improving initial page load performance.
 *
 * The `satisfies` keyword ensures that the object structure matches the expected type,
 * providing better type-checking and autocompletion.
 */
export const componentRegistry = {
	profileCard: () =>
		import('@/components/profile/ProfileCard').then((module) => ({ default: module.default })),
	shoutbox: () =>
		import('@/components/shoutbox/positioned-shoutbox').then((module) => ({
			default: module.PositionedShoutbox
		})),
	walletSummary: () =>
		import('@/components/sidebar/wallet-summary-widget').then((module) => ({
			default: module.default
		})),
	dailyTasks: () =>
		import('@/components/dashboard/DailyTasksWidget').then((module) => ({
			default: module.default
		})),
	hotThreads: () =>
		import('@/features/forum/components/HotThreads').then((module) => ({
			default: module.default
		})),
	forumNav: () =>
		import('@/features/forum/components/HierarchicalZoneNav').then((module) => ({
			default: module.default
		})),
	leaderboard: () =>
		import('@/components/sidebar/leaderboard-widget').then((module) => ({
			default: module.default
		})),
	activeMembers: () =>
		import('@/components/users/ActiveMembersWidget').then((module) => ({ default: module.default }))
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<string, () => Promise<{ default: React.ComponentType<any> }>>;

// This creates a TypeScript type that is a union of all the keys in the componentRegistry.
// e.g., 'profileCard' | 'shoutbox' | 'walletSummary' | ...
export type ComponentId = keyof typeof componentRegistry;
