import React from 'react';
import { useRoute, Link } from 'wouter';
import { forumMap } from '@/config/forumMap.config'; // Import forumMap
import type { Zone } from '@/config/forumMap.config';
import NotFoundPage from '@/pages/not-found'; // Import NotFoundPage

// Import components
import { SiteFooter } from '@/components/layout/site-footer';
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // Keep for initial loading if needed, though direct config access is fast

// Import icons
import { AlertCircle, Folder, MessageSquare } from 'lucide-react';

export default function ZonePage() {
	// Get the zone_slug from the route, ensure param name matches filename
	const [match, params] = useRoute<{ zone_slug: string }>('/zones/:zone_slug');
	const zone_slug = params?.zone_slug;

	const [isLoading, setIsLoading] = React.useState(true); // Simulate loading for router readiness
	const [zone, setZone] = React.useState<Zone | undefined>(undefined);

	React.useEffect(() => {
		if (zone_slug) {
			const foundZone = forumMap.zones.find((z) => z.slug === zone_slug);
			setZone(foundZone);
		}
		setIsLoading(false); // Config access is synchronous
	}, [zone_slug]);

	// Generate breadcrumb items
	const breadcrumbItems = React.useMemo(() => {
		if (!zone) {
			return [
				{ label: 'Home', href: '/' },
				{ label: 'Zones', href: '/zones' }, // Link to a potential zones index page
			];
		}
		return [
			{ label: 'Home', href: '/' },
			{ label: 'Zones', href: '/zones' },
			{ label: zone.name, href: `/zones/${zone.slug}` },
		];
	}, [zone]);

	if (isLoading) {
		// This will likely not be hit for long with direct config access,
		// but good practice if there were async operations for router readiness.
		return (
			<div className="min-h-screen bg-black flex flex-col justify-center items-center">
				<Skeleton className="h-16 w-1/2 mb-4" />
				<Skeleton className="h-96 w-full max-w-4xl" />
			</div>
		);
	}

	if (!match || !zone_slug || !zone) {
		return <NotFoundPage />;
	}

	// Determine theme for the zone
	const currentTheme = zone.theme;

	return (
		<div className="min-h-screen bg-black text-white">
			<main className="container mx-auto px-4 py-8">
				{/* Breadcrumbs */}
				<Breadcrumb className="mb-4">
					<BreadcrumbList>
						{breadcrumbItems.map((item, index) => (
							<React.Fragment key={item.href || index}>
								<BreadcrumbItem>
									{index === breadcrumbItems.length - 1 ? (
										<BreadcrumbPage>{item.label}</BreadcrumbPage>
									) : (
										<BreadcrumbLink asChild>
											<Link href={item.href}>{item.label}</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
								{index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
							</React.Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>

				{/* Zone Header */}
				<Card className="mb-6 bg-zinc-900/60 border-zinc-800" style={{ borderColor: currentTheme?.color }}>
					<CardHeader>
						<CardTitle className="flex items-center text-2xl">
							{currentTheme?.icon && <span className="mr-2 text-2xl">{currentTheme.icon}</span>}
							{!currentTheme?.icon && <Folder className="h-6 w-6 mr-2" style={{ color: currentTheme?.color || '#FFD700' }} />}
							{zone.name}
						</CardTitle>
					</CardHeader>
					{zone.theme?.bannerImage && (
						<img src={zone.theme.bannerImage} alt={`${zone.name} banner`} className="w-full h-48 object-cover"/>
					)}
					{/* You might want a zone description here if it's added to forumMap */}
					{/* <CardContent><p className="text-zinc-300 mb-4">{zone.description || ''}</p></CardContent> */}
				</Card>

				{/* Forums List in this Zone */}
				<div className="space-y-4">
					<h2 className="text-xl font-bold text-white mb-4">Forums in {zone.name}</h2>

					{zone.forums && zone.forums.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{zone.forums.map((forum) => (
								<Link key={forum.slug} href={`/forums/${forum.slug}`}>
									<Card className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all h-full flex flex-col">
										<CardHeader className="pb-2">
											<CardTitle className="flex items-center text-lg">
												{/* Forum icon can come from forum.themeOverride or zone.theme */}
												{(forum.themeOverride?.icon || zone.theme?.icon) && <span className="mr-2 text-xl">{(forum.themeOverride?.icon || zone.theme?.icon)}</span>}
												{!(forum.themeOverride?.icon || zone.theme?.icon) && <MessageSquare className="h-5 w-5 mr-2" style={{color: forum.themeOverride?.color || zone.theme?.color || 'text-emerald-500'}}/>}
												{forum.name}
											</CardTitle>
										</CardHeader>
										<CardContent className="flex-grow">
											{/* Forum description can be added to forumMap if needed */}
											{/* <p className="text-zinc-400 text-sm mb-3">{forum.description || ''}</p> */}
											<div className="flex items-center text-xs text-zinc-500 mt-auto pt-2">
												{/* Thread/Post counts would need to be fetched or added to map if static */}
												{/* For now, just show rule-based info */}
												<span className="mr-4">{forum.rules.allowPosting ? 'Posting Enabled' : 'Posting Disabled'}</span>
												<span>{forum.rules.xpEnabled ? 'XP Enabled' : 'XP Disabled'}</span>
											</div>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>
					) : (
						<Card className="bg-zinc-900/60 border-zinc-800 p-6 text-center">
							<p className="text-zinc-400">No forums available in this zone.</p>
						</Card>
					)}
				</div>
			</main>
			<SiteFooter />
		</div>
	);
} 