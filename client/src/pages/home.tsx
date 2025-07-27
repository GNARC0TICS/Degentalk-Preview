// Removed Link (no longer needed after zone grid removal)
// Import context and hook
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import type { MergedFeaturedForum, MergedForum } from '@/features/forum/contexts/ForumStructureContext';

// Import components
import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { ResponsiveLayoutWrapper } from '@/components/layout/ResponsiveLayoutWrapper';
import { FeaturedForumCarousel } from '@/components/forum/FeaturedForumCarousel';
import { Wide } from '@/layout/primitives/Wide';
import { HomeContentArea } from '@/components/ui/content-area';
import { ContentFeedProvider } from '@/contexts/content-feed-context';
import { getForumSpacing } from '@/utils/spacing-constants';
import { useActiveUsers } from '@/features/users/hooks';
import { useFeaturedForumStatsMap } from '@/hooks/useFeaturedForumStats';
import { getMomentumLabel } from '@/utils/forum';
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton';

// Removed grid-related UI imports (Skeleton, Button, icons)

import type { ConfigurableFeaturedForumCardProps } from '@/components/forum/ConfigurableFeaturedForumCard';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

function HomePage() {
	// Get forum structure from context
	const { zones: mergedZones, isLoading: structureLoading } = useForumStructure();

	// Fetch currently active users once for quick homepage stats –
	// this is a light-weight query (cached for 1 min via React-Query)
	const { data: activeUsers = [] } = useActiveUsers({ limit: 100, enabled: true });
	const activeUsersCount = activeUsers.length;

	// Get primary zones for featured forums
	const primaryFeaturedForumsFromContext = mergedZones?.filter((zone) => zone.isFeatured === true) || [];

	// Fetch stats for all primary featured forums in a single batch of queries
	const featuredForumStatsMap = useFeaturedForumStatsMap(primaryFeaturedForumsFromContext.map((f) => f.slug));

	if (structureLoading) {
		return <HomePageSkeleton />;
	}

	const featuredForumCardDataForGrid: ConfigurableFeaturedForumCardProps['forum'][] = primaryFeaturedForumsFromContext.map(
		(zone: MergedForum) => {
			const stats = featuredForumStatsMap[zone.slug] ?? {
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
			{/* Primary Featured Forum Carousel */}
			{primaryFeaturedForumsFromContext.length > 0 && (
				<FeaturedForumCarousel
					forums={featuredForumCardDataForGrid}
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
		</ErrorBoundary>
	);
}

export default HomePage;
