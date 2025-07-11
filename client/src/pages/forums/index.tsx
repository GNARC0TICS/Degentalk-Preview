import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Search, Folder, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SiteFooter } from '@/components/footer';
import { ForumGuidelines } from '@/components/forum/forum-guidelines';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone, MergedForum } from '@/contexts/ForumStructureContext';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { ActiveMembersWidget } from '@/components/users';
import { useActiveUsers } from '@/features/users/hooks';
import { getForumSpacing, getForumLayout } from '@/utils/spacing-constants';
import { useForumTheme } from '@/contexts/ForumThemeProvider';
import { Wide } from '@/layout/primitives';
import { BackToHomeButton } from '@/components/common';
import { ZoneCard } from '@/components/forum';
import { ForumListItem } from '@/features/forum/components';
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent
} from '@/components/ui/accordion';
import { DynamicSidebar } from '@/components/forum/sidebar';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { PageBackdrop } from '@/layout/primitives';


// Generate dynamic theme colors based on zone theme
const getDynamicZoneColors = (colorTheme: string | null) => {
	const colorMap: Record<string, string> = {
		pit: 'from-red-500/20 to-orange-500/20 border-red-500/30',
		mission: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
		casino: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
		briefing: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
		archive: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
		shop: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
		default: 'from-zinc-500/20 to-gray-500/20 border-zinc-500/30'
	};

	return colorMap[colorTheme || 'default'] || colorMap.default;
};

// Temporary fallback palette for non-themed zones - replaced with dynamic generation
const CATEGORY_COLORS = [
	'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
	'from-sky-500/20 to-blue-500/20 border-sky-500/30',
	'from-pink-500/20 to-red-500/20 border-pink-500/30',
	'from-indigo-500/20 to-purple-500/20 border-indigo-500/30'
];

export default function ForumsIndexPage() {
	const [, setLocation] = useLocation();
	const {
		zones: allZones,
		primaryZones,
		generalZones,
		isLoading: structureLoading,
		error: structureErrorDetails
	} = useForumStructure();

	const { data: activeUsers = [], isLoading: activeUsersLoading } = useActiveUsers();

	const [searchText, setSearchText] = useState('');
	const carouselRef = useRef<HTMLDivElement>(null);

	const { getTheme } = useForumTheme();

	// Memoized calculations for performance
	const totalStats = useMemo(() => {
		return allZones.reduce(
			(acc, zone) => ({
				totalThreads: acc.totalThreads + (zone.threadCount || 0),
				totalPosts: acc.totalPosts + (zone.postCount || 0)
			}),
			{ totalThreads: 0, totalPosts: 0 }
		);
	}, [allZones]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchText.trim()) {
			setLocation(`/search/forums?q=${encodeURIComponent(searchText.trim())}`);
		}
	};

	// Carousel navigation
	const nextZone = () => {
		if (primaryZones.length === 0) return;
		scrollCarousel(1);
	};

	const prevZone = () => {
		if (primaryZones.length === 0) return;
		scrollCarousel(-1);
	};

	const scrollCarousel = (direction: number) => {
		if (!carouselRef.current) return;

		const scrollAmount = direction * 320; // Approximate card width
		carouselRef.current.scrollBy({
			left: scrollAmount,
			behavior: 'smooth'
		});
	};

	// Render a zone card using the consistent ZoneCard component
	const renderZoneCard = (zone: MergedZone) => {
		return (
			<ZoneCard
				key={zone.id.toString()}
				zone={{
					id: String(zone.id),
					name: zone.name,
					slug: zone.slug,
					description: zone.description || '',
					icon: zone.icon ?? undefined,
					colorTheme: zone.theme.colorTheme || 'default',
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
						id: String(f.id),
						name: f.name,
						threadCount: f.threadCount,
						isPopular: f.isPopular ?? false
					}))
				}}
				layout="compact"
				showPreview={true}
				className="flex-shrink-0 w-full max-w-md"
				onEnter={(zoneId) => {
					// For now, clicking a zone card simply navigates to forums index
					// In the future, this could filter to show only that zone's forums
					setLocation('/forums');
				}}
			/>
		);
	};

	// Render a general zone (which is a MergedZone) with its child forums (MergedForum[])
	const renderGeneralZone = (zoneData: MergedZone, index: number) => {
		const allForums = zoneData.forums ?? [];

		if (allForums.length === 0) return null; // Nothing to show

		const totalChildThreadCount = allForums.reduce(
			(sum, forum) => sum + (forum.threadCount || 0),
			0
		);
		const totalChildPostCount = allForums.reduce((sum, forum) => sum + (forum.postCount || 0), 0);

		const zoneSemanticThemeKey = zoneData.theme.colorTheme || 'default';
		const theme = getTheme(zoneSemanticThemeKey);

		// Use dynamic color generation instead of static THEME_COLORS_BG
		const zoneColorClass =
			getDynamicZoneColors(zoneSemanticThemeKey) || CATEGORY_COLORS[index % CATEGORY_COLORS.length];

		const IconFromThemeOrFallback = theme.icon ?? Folder;
		const zoneIconColorClass = theme.color || 'text-emerald-400';

		const combinedThreadCount = zoneData.threadCount + totalChildThreadCount;
		const combinedPostCount = zoneData.postCount + totalChildPostCount;

		return (
			<Card
				key={zoneData.id.toString()}
				className={`overflow-hidden border mb-8 ${zoneColorClass} hover-scale`}
			>
				<CardHeader className="pb-3">
					<Link
						href={`/zones/${zoneData.slug}`}
						className="block cursor-pointer hover:bg-zinc-800/30 transition-colors -m-4 p-4"
					>
						<div className="flex flex-col">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg font-semibold flex items-center">
									{typeof IconFromThemeOrFallback === 'string' ? (
										<span className={`mr-2 text-xl ${zoneIconColorClass}`}>
											{IconFromThemeOrFallback}
										</span>
									) : (
										<IconFromThemeOrFallback className={`h-5 w-5 mr-2 ${zoneIconColorClass}`} />
									)}
									{zoneData.name}
								</CardTitle>
								<Badge
									variant="outline"
									className="bg-zinc-800/50 text-zinc-300 border-zinc-700/50"
								>
									{allForums.length} {allForums.length === 1 ? 'forum' : 'forums'}
								</Badge>
							</div>
							{zoneData.description && (
								<CardDescription className="text-zinc-300">{zoneData.description}</CardDescription>
							)}
							<div className="text-xs text-zinc-400">
								{combinedThreadCount} threads • {combinedPostCount} posts
							</div>
						</div>
					</Link>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y divide-zinc-800/50">
						{allForums.map((forum: MergedForum) => (
							<ForumListItem
								key={forum.id.toString()}
								forum={forum}
								href={`/zones/${zoneData.slug}/${forum.slug}`}
								parentZoneColor={zoneData.theme.color ?? undefined}
								zoneSlug={zoneData.slug}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		);
	};

	// Animation variants for sections
	const sectionVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: (delay = 0) => ({
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, delay }
		})
	};

	if (structureLoading) {
		return (
            <ErrorBoundary level='component'>
                <PageBackdrop className="flex flex-col min-h-screen">
					<div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
						<LoadingSpinner text="Loading Zones..." />
					</div>
					<SiteFooter />
				</PageBackdrop>
            </ErrorBoundary>
        );
	}

	if (structureErrorDetails) {
		return (
            <ErrorBoundary level='component'>
                <PageBackdrop className="flex flex-col min-h-screen">
					<div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
						<ErrorDisplay title="Error loading forums" error={structureErrorDetails} />
					</div>
					<SiteFooter />
				</PageBackdrop>
            </ErrorBoundary>
        );
	}

	return (
        <ErrorBoundary level='component'>
            <PageBackdrop className="flex flex-col min-h-screen">
				<div className={getForumLayout('page')}>
					<Wide className={`${getForumSpacing('container')} flex-grow`}>
						<BackToHomeButton />
						<div className={getForumLayout('forumGrid')}>
							{/* Main Content Area */}
							<div className={`lg:col-span-9 ${getForumSpacing('cardStack')}`}>
								{/* Forum Header & Search */}
								<motion.section
									variants={sectionVariants}
									initial="hidden"
									animate="visible"
									custom={0}
								>
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
										<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text mb-4 sm:mb-0">
											Community Forums
										</h1>
										{/* ... existing breadcrumbs or other elements ... */}
									</div>
									<form onSubmit={handleSearch} className="flex gap-2">
										<Input
											type="text"
											value={searchText}
											onChange={(e) => setSearchText(e.target.value)}
											placeholder="Search forums..."
											className="flex-grow bg-zinc-800/50 border-zinc-700 placeholder-zinc-500"
										/>
										<Button
											type="submit"
											variant="outline"
											className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
										>
											<Search className="h-4 w-4 mr-2" />
											Search
										</Button>
									</form>
								</motion.section>

								{/* Primary Zones Carousel */}
								{primaryZones.length > 0 && (
									<motion.section
										variants={sectionVariants}
										initial="hidden"
										animate="visible"
										custom={0.1} // Stagger delay
									>
										<div className="flex justify-between items-center mb-3">
											<h2 className="text-xl font-semibold text-white">Primary Zones</h2>
											<div className="flex gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={prevZone}
													className="text-zinc-400 hover:text-white"
												>
													<ChevronLeft className="h-5 w-5" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={nextZone}
													className="text-zinc-400 hover:text-white"
												>
													<ChevronRight className="h-5 w-5" />
												</Button>
											</div>
										</div>
										<div className="no-scrollbar flex overflow-x-auto gap-4 pb-2" ref={carouselRef}>
											{primaryZones.map((zone, idx) => (
												<motion.div
													key={zone.id.toString()}
													initial={{ opacity: 0, x: 20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.4, delay: idx * 0.1 }}
													className="flex-shrink-0 w-full max-w-md"
												>
													{renderZoneCard(zone)}
												</motion.div>
											))}
										</div>
									</motion.section>
								)}

								{/* General Forum Zones List */}
								<motion.section
									variants={sectionVariants}
									initial="hidden"
									animate="visible"
									custom={0.2} // Stagger delay
								>
									<h2 className="text-xl font-semibold text-white mb-4">
										{generalZones.length > 0 ? 'All Forums' : 'No forum categories found.'}
									</h2>
									<Accordion
										type="multiple"
										className="space-y-4"
										defaultValue={generalZones.map((zone) => zone.slug)} // Open all by default
									>
										{generalZones.map((zoneData, index) => (
											<AccordionItem value={zoneData.slug} key={zoneData.id.toString()}>
												<AccordionTrigger className="focus:outline-none">
													{zoneData.name}
												</AccordionTrigger>
												<AccordionContent asChild>
													<motion.div
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ duration: 0.4 }}
													>
														{renderGeneralZone(zoneData, index)}
													</motion.div>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</motion.section>
							</div>

							{/* Sidebar */}
							<aside className="lg:col-span-3 space-y-6">
								<motion.div
									variants={sectionVariants}
									initial="hidden"
									animate="visible"
									custom={0.3}
								>
									<DynamicSidebar zoneSlug="general" />
								</motion.div>
								<motion.div
									variants={sectionVariants}
									initial="hidden"
									animate="visible"
									custom={0.45}
								>
									<ActiveMembersWidget />
								</motion.div>
								<motion.div
									variants={sectionVariants}
									initial="hidden"
									animate="visible"
									custom={0.5}
								>
									<ForumGuidelines />
								</motion.div>
							</aside>
						</div>
					</Wide>
					<SiteFooter />
				</div>
			</PageBackdrop>
        </ErrorBoundary>
    );
}
