import React from 'react';
import { Link } from 'wouter';
import '../styles/ticker.css';
import '../styles/zone-themes.css';

// Import context and hook
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone } from '@/contexts/ForumStructureContext';

// Import components
import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { SiteFooter } from '@/components/layout/site-footer';
import { ResponsiveLayoutWrapper } from '@/components/layout/ResponsiveLayoutWrapper';
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid';
import { Wide } from '@/layout/primitives';

// Import UI components
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Import icons
import { AlertCircle } from 'lucide-react';

function HomePage() {
	// Get forum structure from context
	const {
		zones: mergedZones,
		isLoading: structureLoadingFromContext,
		error: forumStructureErrorFromContext
	} = useForumStructure();

	const primaryZonesFromContext = mergedZones.filter((zone) => zone.isPrimary === true);

	const zoneCardDataForGrid = primaryZonesFromContext.map((zone: MergedZone) => ({
		id: zone.slug,
		name: zone.name,
		slug: zone.slug,
		description: zone.description || '',
		icon: zone.icon,
		colorTheme: zone.theme?.colorTheme || zone.slug,
		theme: {
			icon: zone.theme?.icon ?? undefined,
			color: zone.theme?.color ?? undefined,
			bannerImage: zone.theme?.bannerImage ?? undefined
		},
		threadCount: zone.threadCount,
		postCount: zone.postCount,
		activeUsersCount: 0,
		hasXpBoost: zone.hasXpBoost,
		boostMultiplier: zone.boostMultiplier,
		isEventActive: false,
		eventData: { name: '', endsAt: new Date() },
		lastActivityAt: zone.updatedAt ? new Date(zone.updatedAt) : undefined
	}));

	return (
		<>
			<HeroSection />
			<AnnouncementTicker />
			<ResponsiveLayoutWrapper page="home">
				<Wide as="div" className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
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
								<p className="text-sm text-zinc-500">
									{(forumStructureErrorFromContext as Error)?.message || 'Unknown error'}
								</p>
							</div>
						) : structureLoadingFromContext ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
			<SiteFooter />
		</>
	);
}

export default HomePage;
