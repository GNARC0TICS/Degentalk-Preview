import React from 'react';
import { SiteFooter } from '@/components/layout/site-footer';
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid';
import { HierarchicalZoneNav } from '@/features/forum/components/HierarchicalZoneNav';
// Corrected import path for useForumStructure and MergedZone type
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone } from '@/contexts/ForumStructureContext';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Folder, LayoutGrid } from 'lucide-react';

function ZonesPage() {
	// Changed to regular function for clarity with provider
	// The hook now returns `zones` which contains all zones, and `forums` (a flat map).
	const { zones: allZones, isLoading, error } = useForumStructure();

	// Filter primary zones (canonical zones)
	const primaryZones = allZones.filter((zone) => zone.canonical === true);
	// HierarchicalZoneNav should ideally consume the context directly or be passed allZones.
	// For now, we pass allZones, assuming HierarchicalZoneNav can handle this or will be updated.
	const categoriesForNav = allZones;

	if (isLoading) {
		return (
			<div className="flex flex-col min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
					<LoadingSpinner text="Loading Zones..." />
				</div>
				<SiteFooter />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
					<ErrorDisplay title="Error loading zones" error={error} />
				</div>
				<SiteFooter />
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen">
			<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
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
								zones={primaryZones.map((zone: MergedZone) => ({
									id: zone.slug, // Using slug as ID, consistent with home.tsx
									name: zone.name,
									slug: zone.slug,
									description: zone.description || '',
									icon: zone.icon, // Use the direct icon field from MergedZone
									colorTheme: zone.colorTheme || zone.slug, // Use colorTheme directly from MergedZone, fallback to slug
									theme: {
										// Pass the MergedTheme object for additional theme properties
										icon: zone.theme?.icon,
										color: zone.theme?.color,
										bannerImage: zone.theme?.bannerImage
									},
									threadCount: zone.threadCount,
									postCount: zone.postCount,
									activeUsersCount: 0, // Placeholder - would need separate API
									lastActivityAt: zone.updatedAt ? new Date(zone.updatedAt) : undefined,
									hasXpBoost: zone.hasXpBoost,
									boostMultiplier: zone.boostMultiplier,
									isEventActive: false, // Placeholder - would need event system
									eventData: {
										name: '',
										endsAt: new Date()
									}
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
	);
}

export default ZonesPage;
