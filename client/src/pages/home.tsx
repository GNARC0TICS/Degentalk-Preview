import React from 'react';
import { Link } from 'wouter';
import '../styles/ticker.css';
import '../styles/zone-themes.css';

// Import context and hook
import { ForumStructureProvider, useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone } from '@/contexts/ForumStructureContext';
import { ProfileCardProvider } from '@/contexts/ProfileCardContext';

// Import components
import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { SiteFooter } from '@/components/layout/site-footer';
import { LayoutRenderer } from '@/components/layout/LayoutRenderer';
import {
	PositionedShoutbox
} from '@/components/shoutbox/positioned-shoutbox';
import { useShoutbox } from '@/contexts/shoutbox-context';
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid';
import { WidgetFrame } from '@/components/layout/WidgetFrame';
import { useLayoutStore } from '@/stores/useLayoutStore';

// Import UI components
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Import icons
import { AlertCircle } from 'lucide-react';

function HomePage() {
	const { position } = useShoutbox();
	const order = useLayoutStore(s => s.order);

	// Get forum structure from context
	const { 
		zones: mergedZones, 
		isLoading: structureLoadingFromContext, 
		error: forumStructureErrorFromContext 
	} = useForumStructure();

	const primaryZonesFromContext = mergedZones.filter((zone) => zone.isPrimary === true);

	// Component to handle floating shoutbox position
	const FloatingShoutboxPositioner = () => {
		if (position !== 'floating') return null;
		return <PositionedShoutbox />;
	};

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
			bannerImage: zone.theme?.bannerImage ?? undefined,
		},
		threadCount: zone.threadCount,
		postCount: zone.postCount,
		activeUsersCount: 0,
		hasXpBoost: zone.hasXpBoost,
		boostMultiplier: zone.boostMultiplier,
		isEventActive: false,
		eventData: { name: '', endsAt: new Date() },
		lastActivityAt: zone.updatedAt ? new Date(zone.updatedAt) : undefined,
	}));

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			<HeroSection />
			<AnnouncementTicker />
			<FloatingShoutboxPositioner />

			<main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
				
				{/* Main Content Area */}
				<div className="w-full lg:w-1/2 xl:w-1/2 space-y-6 order-2">
					{/* MAIN TOP WIDGETS */}
					{order['main/top']?.map(instanceId => (
						<WidgetFrame key={instanceId} instanceId={instanceId} />
					))}

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
								className="lg:grid-cols-2 xl:grid-cols-3"
							/>
						)}
					</section>

					{/* MAIN BOTTOM WIDGETS */}
					{order['main/bottom']?.map(instanceId => (
						<WidgetFrame key={instanceId} instanceId={instanceId} />
					))}
				</div>

                <LayoutRenderer page="home" />

			</main>

			<SiteFooter />
		</div>
	);
}

const HomePageWithProvider = () => (
	<ForumStructureProvider>
		<ProfileCardProvider>
			<HomePage />
		</ProfileCardProvider>
	</ForumStructureProvider>
);

export default HomePageWithProvider;
