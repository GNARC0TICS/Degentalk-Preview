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
import { getForumSpacing, getForumLayout } from '@/utils/spacing-constants';

// Removed grid-related UI imports (Skeleton, Button, icons)

import type { ZoneCardProps } from '@/components/forum/ZoneCard';
import ForumErrorBoundary from '@/components/forum/ForumErrorBoundary';

function HomePage() {
	// Get forum structure from context
	const { zones: mergedZones } = useForumStructure();

	const primaryZonesFromContext = mergedZones.filter((zone) => zone.isPrimary === true);

	const zoneCardDataForGrid: ZoneCardProps['zone'][] = primaryZonesFromContext.map(
		(zone: MergedZone) => ({
			id: String(zone.id),
			name: zone.name,
			slug: zone.slug,
			description: zone.description || '',
			icon: zone.icon ?? undefined,
			colorTheme: zone.theme?.colorTheme || zone.slug,
			bannerImage: zone.theme?.bannerImage ?? undefined,
			stats: {
				activeUsers: 0, // TODO: Replace with real-time data
				totalThreads: zone.threadCount ?? 0,
				totalPosts: zone.postCount ?? 0,
				todaysPosts: 0
			},
			features: {
				hasXpBoost: zone.hasXpBoost,
				boostMultiplier: zone.boostMultiplier,
				isEventActive: false,
				isPremium: false
			},
			activity: zone.updatedAt
				? {
						trendingThreads: 0,
						momentum: 'stable',
						lastActiveUser: undefined
					}
				: undefined,
			forums: zone.forums.map((forum) => ({
				id: String(forum.id),
				name: forum.name,
				threadCount: forum.threadCount,
				isPopular: forum.isPopular ?? false,
				subforums: forum.subforums?.map((s) => ({ id: s.id, name: s.name }))
			}))
		})
	);

	return (
		<ForumErrorBoundary>
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
		</ForumErrorBoundary>
	);
}

export default HomePage;
