import { Link } from 'wouter';
import '../styles/zone-themes.css';

// Import context and hook
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone } from '@/contexts/ForumStructureContext';

// Import components
import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { SiteFooter } from '@/components/footer';
import { ResponsiveLayoutWrapper } from '@/components/layout/ResponsiveLayoutWrapper';
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid';
import { Wide } from '@/layout/primitives/Wide';
import { HomeContentArea } from '@/components/ui/content-area';
import { ContentFeedProvider } from '@/contexts/content-feed-context';
import { getForumSpacing, getForumLayout } from '@/utils/spacing-constants';

// Import UI components
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Import icons
import { AlertCircle } from 'lucide-react';

import type { ZoneCardProps } from '@/components/forum/ZoneCard';
import ForumErrorBoundary from '@/components/forum/ForumErrorBoundary';

function HomePage() {
	// Get forum structure from context
	const {
		zones: mergedZones,
		isLoading: structureLoadingFromContext,
		error: forumStructureErrorFromContext
	} = useForumStructure();

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
			<ContentFeedProvider initialTab="trending">
				<ResponsiveLayoutWrapper page="home">
					<Wide as="div" className={getForumSpacing('container')}>
						{/* New tab-based content feed */}
						<HomeContentArea className={getForumSpacing('sectionLarge')} />

						<section className={getForumSpacing('sectionLarge')}>
							<div className={`${getForumLayout('headerFlex')} ${getForumSpacing('headerMargin')}`}>
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
									<p className="text-sm text-zinc-500">
										{(forumStructureErrorFromContext as Error)?.message || 'Unknown error'}
									</p>
								</div>
							) : structureLoadingFromContext ? (
								<div
									className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${getForumSpacing('cardGrid')}`}
								>
									{Array.from({ length: primaryZonesFromContext.length || 3 }).map((_, i) => (
										<Skeleton key={i} className="bg-zinc-900 rounded-xl h-48" />
									))}
								</div>
							) : (
								<CanonicalZoneGrid zones={zoneCardDataForGrid} />
							)}
						</section>
					</Wide>
				</ResponsiveLayoutWrapper>
			</ContentFeedProvider>
			<SiteFooter />
		</ForumErrorBoundary>
	);
}

export default HomePage;
