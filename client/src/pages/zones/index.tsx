import React from 'react';
import { SiteFooter } from '@/components/footer';
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid';
import HierarchicalZoneNav from '@/features/forum/components/HierarchicalZoneNav';
// Corrected import path for useForumStructure and MergedZone type
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import type { MergedZone } from '@/features/forum/contexts/ForumStructureContext';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Folder, LayoutGrid } from 'lucide-react';
import type { ZoneCardProps } from '@/components/forum/ZoneCard';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

function ZonesPage() {
	// Changed to regular function for clarity with provider
	// The hook now returns `zones` which contains all zones, and `forums` (a flat map).
	const { zones: allZones, isLoading, error } = useForumStructure();

	// Filter primary zones (canonical zones)
	const primaryZones = allZones.filter((zone) => zone.isPrimary === true);
	// HierarchicalZoneNav should ideally consume the context directly or be passed allZones.
	// For now, we pass allZones, assuming HierarchicalZoneNav can handle this or will be updated.
	const categoriesForNav = allZones;

	if (isLoading) {
		return (
			<ErrorBoundary level="component">
				<div className="flex flex-col min-h-screen">
					<div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
						<LoadingSpinner text="Loading Zones..." />
					</div>
					<SiteFooter />
				</div>
			</ErrorBoundary>
		);
	}

	if (error) {
		return (
			<ErrorBoundary level="component">
				<div className="flex flex-col min-h-screen">
					<div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
						<ErrorDisplay title="Error loading zones" error={error} />
					</div>
					<SiteFooter />
				</div>
			</ErrorBoundary>
		);
	}

	return (
		<ErrorBoundary level="component">
			<div className="flex flex-col min-h-screen">
				<div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-white mb-4">Zones & Categories</h1>
						<p className="text-zinc-400">Explore our community's zones and categories.</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<h2 className="text-2xl font-bold text-white mb-4 flex items-center">
								<LayoutGrid className="h-5 w-5 mr-2 text-emerald-500" />
								Primary Zones
							</h2>
							{primaryZones && primaryZones.length > 0 ? (
								<CanonicalZoneGrid
									zones={primaryZones.map((zone: MergedZone): ZoneCardProps['zone'] => ({
										id: String(zone.id),
										name: zone.name,
										slug: zone.slug,
										description: zone.description || '',
										icon: zone.icon ?? undefined,
										colorTheme: zone.theme?.colorTheme || zone.slug,
										bannerImage: zone.theme?.bannerImage ?? undefined,
										stats: {
											activeUsers: 0,
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
										forums: zone.forums?.map((f) => ({
											id: f.id,
											name: f.name,
											threadCount: f.threadCount,
											isPopular: f.isPopular ?? false,
											subforums: f.subforums?.map((s) => ({ id: s.id, name: s.name }))
										}))
									}))}
								/>
							) : (
								<div className="text-zinc-500">No primary zones available.</div>
							)}
						</div>

						<div>
							<h2 className="text-2xl font-bold text-white mb-4 flex items-center">
								<Folder className="h-5 w-5 mr-2 text-amber-500" />
								All Zones & Forums
							</h2>
							{/* HierarchicalZoneNav should consume useForumStructure internally */}
							{categoriesForNav && categoriesForNav.length > 0 ? (
								<HierarchicalZoneNav />
							) : (
								<div className="text-zinc-500">No zones or categories available.</div>
							)}
						</div>
					</div>
				</div>
				<SiteFooter />
			</div>
		</ErrorBoundary>
	);
}

export default ZonesPage;
