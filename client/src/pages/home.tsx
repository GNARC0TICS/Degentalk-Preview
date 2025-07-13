// Removed Link (no longer needed after zone grid removal)
// Import context and hook
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone } from '@/contexts/ForumStructureContext';

// Import components
import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { SiteFooter } from '@/components/footer';
import { ResponsiveLayoutWrapper } from '@/components/layout/ResponsiveLayoutWrapper';
import { PrimaryZoneCarousel } from '@/components/zone/PrimaryZoneCarousel';
import { Wide } from '@/layout/primitives/Wide';
import { HomeContentArea } from '@/components/ui/content-area';
import { ContentFeedProvider } from '@/contexts/content-feed-context';
import { getForumSpacing } from '@/utils/spacing-constants';
import { useActiveUsers } from '@/features/users/hooks';
import { useZoneStatsMap } from '@/hooks/useZoneStats';
import { getMomentumLabel } from '@/utils/forumStats';
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton';

// Removed grid-related UI imports (Skeleton, Button, icons)

import type { ZoneCardProps } from '@/components/forum/ZoneCard';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

function HomePage() {
	// Get forum structure from context
	const { zones: mergedZones, isLoading: structureLoading } = useForumStructure();

	const primaryZonesFromContext = mergedZones.filter((zone) => zone.isPrimary === true);

	if (structureLoading) {
		return <HomePageSkeleton />;
	}

	// Fetch currently active users once for quick homepage stats –
	// this is a light-weight query (cached for 1 min via React-Query)
	const { data: activeUsers = [] } = useActiveUsers({ limit: 100, enabled: true });
	const activeUsersCount = activeUsers.length;

	// Fetch stats for all primary zones in a single batch of queries
	const zoneStatsMap = useZoneStatsMap(primaryZonesFromContext.map((z) => z.slug));

	const zoneCardDataForGrid: ZoneCardProps['zone'][] = primaryZonesFromContext.map(
		(zone: MergedZone) => {
			const stats = zoneStatsMap[zone.slug] ?? {
				todaysPosts: 0,
				trendingThreads: 0,
				lastActiveUser: undefined,
				daysOld: 1
			};
			const { todaysPosts, trendingThreads, lastActiveUser, daysOld } = stats;
			return {
				id: String(zone.id),
				name: zone.name,
				slug: zone.slug,
				description: zone.description || '',
				icon: zone.icon ?? undefined,
				colorTheme: zone.theme?.colorTheme || zone.slug,
				bannerImage: zone.theme?.bannerImage ?? undefined,
				stats: {
					activeUsers: activeUsersCount,
					totalThreads: zone.threadCount ?? 0,
					totalPosts: zone.postCount ?? 0,
					todaysPosts
				},
				features: {
					hasXpBoost: zone.hasXpBoost,
					boostMultiplier: zone.boostMultiplier,
					isEventActive: false,
					isPremium: false
				},
				activity: {
					trendingThreads,
					momentum: getMomentumLabel(todaysPosts, zone.postCount ?? 0, daysOld),
					lastActiveUser
				},
				forums: zone.forums.map((forum) => ({
					id: String(forum.id),
					name: forum.name,
					threadCount: forum.threadCount,
					isPopular: forum.isPopular ?? false,
					subforums: forum.subforums?.map((s) => ({ id: s.id, name: s.name }))
				}))
			};
		}
	);

	return (
		<ErrorBoundary level="component">
			<HeroSection />
			<AnnouncementTicker />
			{/* Primary Zone Carousel */}
			{primaryZonesFromContext.length > 0 && (
				<PrimaryZoneCarousel
					zones={zoneCardDataForGrid}
					autoRotateMs={8000}
					className="bg-gradient-to-b from-zinc-900/50 to-transparent"
				/>
			)}
			<ContentFeedProvider initialTab="trending">
				<ResponsiveLayoutWrapper page="home">
					<Wide as="div" className={getForumSpacing('container')}>
						{/* New tab-based content feed */}
						<HomeContentArea className={getForumSpacing('sectionLarge')} />
					</Wide>
				</ResponsiveLayoutWrapper>
			</ContentFeedProvider>
			<SiteFooter />
		</ErrorBoundary>
	);
}

export default HomePage;
