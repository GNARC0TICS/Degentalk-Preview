import React from 'react';
import { Link } from 'wouter';
import '../styles/ticker.css';
import '../styles/zone-themes.css';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
// import { forumMap } from '@/config/forumMap.config'; // REMOVED: Will use context
// import type { Zone } from '@/config/forumMap.config'; // REMOVED: MergedZone from context will be used

// Import context and hook
import { ForumStructureProvider, useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone } from '@/contexts/ForumStructureContext';


// Import components
import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { SiteFooter } from '@/components/layout/site-footer';
import { LeaderboardWidget } from '@/components/sidebar/leaderboard-widget';
import { WalletSummaryWidget } from '@/components/sidebar/wallet-summary-widget';
import DailyTasksWidget from '@/components/dashboard/DailyTasksWidget';
import {
	ShoutboxSidebarTop,
	ShoutboxSidebarBottom,
	ShoutboxMainTop,
	ShoutboxMainBottom,
	PositionedShoutbox
} from '@/components/shoutbox/positioned-shoutbox';
import { useShoutbox } from '@/contexts/shoutbox-context';
import { HierarchicalZoneNav } from '@/features/forum/components/HierarchicalZoneNav'; // Will need update to use forumMap
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid';
// import type { ZoneCardData } from '@/components/forum/CanonicalZoneGrid'; // ZoneCardData will be derived differently
import { HotThreads } from '@/features/forum/components/HotThreads'; // Links inside need audit
// import { useForumStructure } from '@/features/forum/hooks/useForumStructure'; // REMOVED: Using new context hook
import { ActiveMembersWidget } from '@/components/users/ActiveMembersWidget';
import { useActiveUsers } from '@/features/users/hooks';
// import { RecentActivityFeed } from '@/components/activity/RecentActivityFeed';
// import { AnnouncementCard } from '@/components/platform-energy/announcements/AnnouncementCard';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// import { Alert, AlertDescription } from '@/components/ui/alert'; // Not used directly after refactor
import { Button } from '@/components/ui/button';
import { ArrowRight, FolderOpen } from 'lucide-react';

// Import icons
import { AlertCircle } from 'lucide-react';

// Import types
import type { User } from '@schema';
import { useAuth } from '@/hooks/use-auth';
// import { getThreadTitle } from '@/utils/thread-utils';

// Define API Path Constants
const API_PATHS = {
	HOT_THREADS: '/api/hot-threads',
	LEADERBOARD_XP: '/api/leaderboards/xp'
};

function HomePage() { // Changed to a regular function
	const { user } = useAuth();
	const isLoggedIn = !!user;
	const { position } = useShoutbox();

	// Get forum structure from context
	const { 
		zones: mergedZones, 
		isLoading: structureLoadingFromContext, 
		error: forumStructureErrorFromContext 
	} = useForumStructure();

	const primaryZonesFromContext = mergedZones.filter((zone) => zone.isPrimary === true);

	// Fetch top users for leaderboard (remains as API call)
	const {
		data: topUsers,
		// isLoading: usersLoading,
		// error: usersError,
	} = useQuery<User[]>({
		queryKey: [API_PATHS.LEADERBOARD_XP, { limit: 5, current: true }],
		queryFn: getQueryFn({ on401: 'returnNull' }),
		enabled: false, // Still disabled as per original
	});

	// Fetch active users (remains as API call)
	const { data: activeUsers, isLoading: activeUsersLoading } = useActiveUsers({ limit: 5 });

	// Component to handle floating shoutbox position
	const FloatingShoutboxPositioner = () => {
		if (position !== 'floating') return null;
		return <PositionedShoutbox />;
	};

	// Data for CanonicalZoneGrid - now directly from forumMap
	// Note: CanonicalZoneGrid might need adjustments if it expects all original ZoneCardData fields
	const zoneCardDataForGrid = primaryZonesFromContext.map((zone: MergedZone) => ({
		id: zone.slug, // Using slug as ID as per original comment. Consider if numeric zone.id is better.
		name: zone.name,
		slug: zone.slug,
		description: zone.description || '',
		icon: zone.icon, // Use the direct MergedZone.icon
		colorTheme: zone.theme?.colorTheme || zone.slug, // Use colorTheme from theme object, fallback to slug
		// 'theme' object can be kept for other MergedTheme properties if ZoneCard uses them,
		// or simplified if ZoneCard primarily relies on top-level props.
		theme: {
			icon: zone.theme?.icon ?? undefined, // Fallback/additional icon from MergedZone.theme, ensuring no null
			color: zone.theme?.color ?? undefined, // Fallback/additional color from MergedZone.theme, ensuring no null
			bannerImage: zone.theme?.bannerImage ?? undefined, // Fallback/additional banner image, ensuring no null
		},
		threadCount: zone.threadCount,
		postCount: zone.postCount,
		activeUsersCount: 0, // Placeholder - this would likely come from a separate API or calculation
		hasXpBoost: zone.hasXpBoost, // Directly from MergedZone
		boostMultiplier: zone.boostMultiplier, // Directly from MergedZone
		// Ensure all other fields expected by CanonicalZoneGrid's ZoneCardData type are present
		isEventActive: false, // Placeholder
		eventData: { name: '', endsAt: new Date() }, // Placeholder
		lastActivityAt: zone.updatedAt ? new Date(zone.updatedAt) : undefined, // Assuming updatedAt can be used for lastActivityAt
		// rarity field removed - not part of ZoneCardData interface
	}));

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			{/* Hero Section */}
			<HeroSection />

			{/* Announcement Ticker */}
			<AnnouncementTicker />

			{/* Floating Shoutbox */}
			<FloatingShoutboxPositioner />

			{/* Main Content */}
			<main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
				{/* Main Content Area (2/3 width) */}
				<div className="w-full lg:w-2/3 space-y-6">
					{/* Shoutbox at main-top position */}
					<ShoutboxMainTop />

					{/* Hot Threads - Fetches its own data */}
					<HotThreads className="mb-6" limit={5} />

					{/* Primary Zones Section */}
					<section className="mb-16">
						<div className="flex items-center justify-between mb-8">
							<div>
								<h2 className="text-2xl font-bold text-white mb-2">Primary Zones</h2>
								<p className="text-zinc-400">Jump into the action</p>
							</div>
							<Link href="/zones">
								<Button variant="ghost" className="text-zinc-400 hover:text-white">
									View All Zones
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</div>

						{forumStructureErrorFromContext ? (
							<div className="text-center py-12">
								<AlertCircle className="mx-auto h-12 w-12 text-red-400" />
								<p className="mt-4 text-red-400">Failed to load forum structure.</p>
								<p className="text-sm text-zinc-500">{(forumStructureErrorFromContext as Error)?.message || 'Unknown error'}</p>
							</div>
						) : structureLoadingFromContext ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{Array.from({ length: primaryZonesFromContext.length || 3 }).map((_, i) => (
									<Skeleton key={i} className="bg-zinc-900 rounded-xl h-48" />
								))}
							</div>
						) : (
							<CanonicalZoneGrid
								zones={zoneCardDataForGrid}
							/>
						)}
					</section>
				</div>

				{/* Sidebar (1/3 width) */}
				<aside className="w-full lg:w-1/3 space-y-4 sm:space-y-6 md:space-y-8">
					{/* Shoutbox at sidebar-top */}
					<ShoutboxSidebarTop />

					{/* Wallet Summary */}
					<WalletSummaryWidget isLoggedIn={isLoggedIn} />

					{/* Daily Tasks Widget */}
					<DailyTasksWidget />

					{/* Forum Navigation */}
					<Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg flex items-center">
								<FolderOpen className="h-5 w-5 text-emerald-500 mr-2" />
								Forum Navigation
							</CardTitle>
						</CardHeader>
						<CardContent>
							{structureLoadingFromContext ? (
								<div className="space-y-2">
									{Array.from({ length: 3 }).map((_, i) => (
										<Skeleton key={i} className="h-8 w-full" />
									))}
								</div>
							) : forumStructureErrorFromContext ? (
								<div className="text-red-500 p-4" role="alert">
									<AlertCircle className="inline h-5 w-5 mr-2" />
									<p className="text-sm inline">Failed to load forum navigation.</p>
								</div>
							) : (
								// HierarchicalZoneNav will need to be updated to use the context internally.
								// Removing props for now, as it should consume from useForumStructure.
								<HierarchicalZoneNav />
							)}
						</CardContent>
					</Card>

					{/* Leaderboard Widget */}
					<LeaderboardWidget users={topUsers || []} />

					{/* Active Members Widget */}
					<ActiveMembersWidget
						users={activeUsers || []}
						title="Active Degens"
						description="Community members online now"
						isLoading={activeUsersLoading}
						className="mt-auto"
					/>

					{/* Shoutbox at sidebar-bottom */}
					<ShoutboxSidebarBottom />
				</aside>
			</main>

			{/* Shoutbox at main-bottom for mobile */}
			<div className="container mx-auto px-3 sm:px-4 mb-6">
				<ShoutboxMainBottom />
			</div>

			{/* Footer */}
			<SiteFooter />
		</div>
	);
}

// It's generally better to wrap at a higher level (e.g., _app.tsx or main.tsx)
// But for this specific task, we wrap HomePage directly as per instructions.
const HomePageWithProvider = () => (
	<ForumStructureProvider>
		<HomePage />
	</ForumStructureProvider>
);

export default HomePageWithProvider;
