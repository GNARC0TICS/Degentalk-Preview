import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiteFooter } from '@/components/footer';
import { ForumGuidelines } from '@/components/forum/forum-guidelines';
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import type { MergedZone, MergedForum } from '@/features/forum/contexts/ForumStructureContext';
import { Input } from '@/components/ui/input';
import { ActiveMembersWidget } from '@/components/users';
import { useActiveUsers } from '@/features/users/hooks';
import { getForumSpacing, getForumLayout } from '@/utils/spacing-constants';
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
import { MyBBForumList } from '@/components/forum/MyBBForumList';
import { MyBBStats, MyBBLegend } from '@/components/forum/MyBBStats';
import '@/styles/mybb-classic.css';

export default function ForumsIndexPage() {
	const navigate = useNavigate();
	const {
		zones: allZones,
		primaryZones,
		generalZones,
		isLoading: structureLoading,
		error: structureErrorDetails,
		isUsingFallback
	} = useForumStructure();

	const { data: activeUsers = [] } = useActiveUsers();

	const [searchText, setSearchText] = useState('');
	const [viewMode, setViewMode] = useState<'modern' | 'classic'>(() => {
		return (localStorage.getItem('forumViewMode') as 'modern' | 'classic') || 'modern';
	});
	const carouselRef = useRef<HTMLDivElement>(null);

	const handleViewModeChange = (mode: 'modern' | 'classic') => {
		setViewMode(mode);
		localStorage.setItem('forumViewMode', mode);
	};

	React.useEffect(() => {
		if (window.location.hash === '#general-forums') {
			setTimeout(() => {
				document.getElementById('general-forums')?.scrollIntoView({ behavior: 'smooth' });
			}, 100);
		}
	}, []);

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
			navigate(`/search/forums?q=${encodeURIComponent(searchText.trim())}`);
		}
	};

	const scrollCarousel = (direction: number) => {
		if (!carouselRef.current) return;
		const scrollAmount = direction * 320;
		carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
	};

	const renderZoneCard = (zone: MergedZone) => (
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
				activity: zone.updatedAt ? { trendingThreads: 0, momentum: 'stable', lastActiveUser: undefined } : undefined,
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
			onEnter={() => navigate(`/forums/${zone.slug}`)}
		/>
	);

	const renderGeneralZoneForums = (zoneData: MergedZone) => {
		const allForums = zoneData.forums ?? [];
		if (allForums.length === 0) return null;
		return (
			<div className="space-y-2 pt-2">
				{allForums.map((forum: MergedForum) => (
					<ForumListItem
						key={forum.id.toString()}
						forum={forum}
						href={`/forums/${forum.slug}`}
						parentZoneColor={zoneData.theme.color ?? undefined}
						zoneSlug={zoneData.slug}
					/>
				))}
			</div>
		);
	};

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
			<PageBackdrop className="flex flex-col min-h-screen">
				<div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
					<LoadingSpinner text="Loading Forums..." />
				</div>
				<SiteFooter />
			</PageBackdrop>
		);
	}

	if (structureErrorDetails) {
		return (
			<PageBackdrop className="flex flex-col min-h-screen">
				<div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
					<ErrorDisplay title="Error loading forums" error={structureErrorDetails} />
				</div>
				<SiteFooter />
			</PageBackdrop>
		);
	}

	return (
		<ErrorBoundary level="component">
			<PageBackdrop className="flex flex-col min-h-screen">
				<div className={getForumLayout('page')}>
					<Wide className={`${getForumSpacing('container')} flex-grow`}>
						<BackToHomeButton />
						<div className={getForumLayout('forumGrid')}>
							<div className={`lg:col-span-9 ${getForumSpacing('cardStack')}`}>
								<motion.section variants={sectionVariants} initial="hidden" animate="visible" custom={0}>
									{isUsingFallback && (
										<div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg text-yellow-200 text-sm">
											<span className="font-semibold">Development Mode:</span> Using local forum configuration. Connect to database for live data.
										</div>
									)}
									<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
										<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text mb-4 sm:mb-0">
											Community Forums
										</h1>
										<div className="flex items-center gap-2">
											<Button variant={viewMode === 'modern' ? 'default' : 'outline'} size="sm" onClick={() => handleViewModeChange('modern')}>Modern</Button>
											<Button variant={viewMode === 'classic' ? 'default' : 'outline'} size="sm" onClick={() => handleViewModeChange('classic')}>Classic</Button>
										</div>
									</div>
									<form onSubmit={handleSearch} className="flex gap-2">
										<Input
											type="text"
											value={searchText}
											onChange={(e) => setSearchText(e.target.value)}
											placeholder="Search forums..."
											className="flex-grow bg-zinc-800/50 border-zinc-700 placeholder-zinc-500"
										/>
										<Button type="submit" variant="outline" className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700">
											<Search className="h-4 w-4 mr-2" />
											Search
										</Button>
									</form>
								</motion.section>

								{primaryZones.length > 0 && (
									<motion.section variants={sectionVariants} initial="hidden" animate="visible" custom={0.1}>
										<div className="flex justify-between items-center mb-3">
											<h2 className="text-xl font-semibold text-white">Featured Forums</h2>
											{viewMode === 'modern' && (
												<div className="flex gap-2">
													<Button variant="ghost" size="icon" onClick={() => scrollCarousel(-1)} className="text-zinc-400 hover:text-white"><ChevronLeft className="h-5 w-5" /></Button>
													<Button variant="ghost" size="icon" onClick={() => scrollCarousel(1)} className="text-zinc-400 hover:text-white"><ChevronRight className="h-5 w-5" /></Button>
												</div>
											)}
										</div>
										{viewMode === 'classic' ? (
											<div className="space-y-6">
												{primaryZones.map((zone) => (
													<MyBBForumList key={zone.id.toString()} forums={zone.forums} categoryName={zone.name} categoryColor={zone.theme.color || '#5c8fb8'} />
												))}
											</div>
										) : (
											<div className="no-scrollbar flex overflow-x-auto gap-4 pb-2" ref={carouselRef}>
												{primaryZones.map((zone, idx) => (
													<motion.div key={zone.id.toString()} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }} className="flex-shrink-0 w-full max-w-md">
														{renderZoneCard(zone)}
													</motion.div>
												))}
											</div>
										)}
									</motion.section>
								)}

								<motion.section id="general-forums" variants={sectionVariants} initial="hidden" animate="visible" custom={0.2}>
									<h2 className="text-xl font-semibold text-white my-4">
										{generalZones.length > 0 ? 'General Forums' : 'No forum categories found.'}
									</h2>
									{viewMode === 'classic' ? (
										<div className="space-y-6">
											{generalZones.map((zoneData) => (
												<MyBBForumList key={zoneData.id.toString()} forums={zoneData.forums} categoryName={zoneData.name} categoryColor={zoneData.theme.color || '#5c8fb8'} />
											))}
										</div>
									) : (
										<Accordion type="multiple" className="space-y-4" defaultValue={generalZones.map((zone) => zone.slug)}>
											{generalZones.map((zoneData) => (
												<AccordionItem value={zoneData.slug} key={zoneData.id.toString()}>
													<AccordionTrigger className="focus:outline-none text-lg font-medium">
														{zoneData.name}
													</AccordionTrigger>
													<AccordionContent>
														{renderGeneralZoneForums(zoneData)}
													</AccordionContent>
												</AccordionItem>
											))}
										</Accordion>
									)}
								</motion.section>
							</div>

							<aside className="lg:col-span-3 space-y-6">
								<motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0.3}><DynamicSidebar zoneSlug="general" /></motion.div>
								<motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0.45}><ActiveMembersWidget /></motion.div>
								<motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0.5}><ForumGuidelines /></motion.div>
							</aside>
						</div>

						{viewMode === 'classic' && (
							<motion.div variants={sectionVariants} initial="hidden" animate="visible" custom={0.6} className="mt-8">
								<MyBBStats stats={{ totalThreads: totalStats.totalThreads, totalPosts: totalStats.totalPosts, totalMembers: activeUsers.length || 42, onlineUsers: activeUsers.length || 7, newestMember: activeUsers[0]?.username || 'NewDegen' }} />
								<MyBBLegend />
							</motion.div>
						)}
					</Wide>
					<SiteFooter />
				</div>
			</PageBackdrop>
		</ErrorBoundary>
	);
}
