import React from 'react';
import { SiteFooter } from '@/components/layout/site-footer';
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid';
import { HierarchicalZoneNav } from '@/features/forum/components/HierarchicalZoneNav';
import { useForumStructure } from '@/features/forum/hooks/useForumStructure';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Folder, LayoutGrid } from 'lucide-react';

export default function ZonesPage() {
	const { primaryZones, categories, isLoading, error } = useForumStructure();

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
								zones={primaryZones.map((zone) => ({
									id: zone.id,
									name: zone.name,
									slug: zone.slug,
									description: zone.description || '',
									icon: zone.icon,
									colorTheme: zone.colorTheme,
									threadCount: zone.threadCount,
									postCount: zone.postCount,
									activeUsersCount: 0,
									lastActivityAt: new Date(), // Provide a default value
									hasXpBoost: false,
									boostMultiplier: 1,
									isEventActive: false,
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
							Categories
						</h2>
						{categories && categories.length > 0 ? (
							<HierarchicalZoneNav />
						) : (
							<div className="text-zinc-500">No categories available.</div>
						)}
					</div>
				</div>
			</div>
			<SiteFooter />
		</div>
	);
}
