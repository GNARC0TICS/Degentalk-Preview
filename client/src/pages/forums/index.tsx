// TODO: @syncSchema Update based on recent changes in schema.ts: ForumCategory now has 'color' and 'icon' fields.
import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import {
	Home,
	Search,
	LayoutGrid,
	Folder,
	MessageSquare,
	ChevronLeft,
	ChevronRight,
	Flame,
	Target,
	Archive,
	Dices,
	FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { ForumGuidelines } from '@/components/forum/forum-guidelines';
// ForumSearch seems unused, can be removed if not needed.
// import { ForumSearch } from '@/components/forum/forum-search'; 
import { 
	useForumStructure, 
	ForumStructureProvider 
} from '@/contexts/ForumStructureContext';
import type { MergedZone, MergedForum, MergedTheme } from '@/contexts/ForumStructureContext';
// ZoneCardData might not be directly needed if renderZoneCard adapts to MergedZone
// import type { ZoneCardData } from '@/components/forum/CanonicalZoneGrid'; 
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
// getForumEntityUrl and isPrimaryZone might need to be re-evaluated or adapted
// import { getForumEntityUrl, isPrimaryZone } from '@/utils/forum-routing-helper'; 
import { ActiveMembersWidget } from '@/components/users';
import type { ActiveUser } from '@/components/users';
import { useActiveUsers } from '@/features/users/hooks';
// ForumCard seems unused
// import { ForumCard } from '@/components/forum/forum-card';
// ForumCategoryWithStats is replaced by MergedZone/MergedForum
// import type { ForumCategoryWithStats } from '@db_types/forum.types';
import { 
	THEME_ICONS, 
	THEME_COLORS_BG, // Renamed from THEME_COLORS to THEME_COLORS_BG in themeConstants.ts
	ZONE_THEMES // For icon color classes
} from '@/config/themeConstants';


const CATEGORY_COLORS = [ // This can remain for generic category styling if no theme is matched
	'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-700/10',
	'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-700/10',
	'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-700/10',
	'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-700/10',
	'border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-700/10',
	'border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-700/10',
	'border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-indigo-700/10',
	'border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-700/10'
];

function ForumPage() { // Changed to regular function
	const { user } = useAuth();
	const isLoggedIn = !!user;
	const [location, setLocation] = useLocation();

	const queryParams = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
	const searchQuery = queryParams.get('q') || '';

	const [searchText, setSearchText] = useState(searchQuery);
	const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
	const carouselRef = useRef<HTMLDivElement>(null);

	// Use centralized forum structure hook from context
	const { 
		zones: allZones, 
		isLoading: structureLoading, 
		error: structureErrorDetails 
	} = useForumStructure();

	// Extract primary zones and categories (non-primary zones)
	const primaryZones: MergedZone[] = allZones.filter(zone => zone.canonical === true);
	const categories: MergedZone[] = allZones.filter(zone => zone.canonical !== true && zone.forums && zone.forums.length > 0);

	// Fetch active users
	const { data: activeUsers, isLoading: activeUsersLoading } = useActiveUsers({ limit: 5 });

	const breadcrumbs = [
		{ label: 'Home', href: '/', icon: <Home className="h-4 w-4 mr-1" /> },
		{ label: 'Forum', href: '/forums', icon: null } // Changed from /forum to /forums
	];

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchText.trim()) {
			setLocation(`/forums/search?q=${encodeURIComponent(searchText.trim())}`); // Changed from /forum to /forums
		}
	};

	// Carousel navigation
	const nextZone = () => {
		if (primaryZones.length === 0) return;
		setCurrentZoneIndex((prev) => (prev + 1) % primaryZones.length);
		scrollCarousel(1);
	};

	const prevZone = () => {
		if (primaryZones.length === 0) return;
		setCurrentZoneIndex((prev) => (prev - 1 + primaryZones.length) % primaryZones.length);
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

	// Helper to render forum stats (can accept MergedForum or MergedZone)
	const renderForumStats = (entity: MergedForum | MergedZone) => {
		return (
			<div className="flex items-center gap-3 text-xs text-zinc-400">
				<div className="flex items-center">
					<MessageSquare className="h-3.5 w-3.5 mr-1 text-zinc-500" />
					{entity.threadCount || 0} threads
				</div>
				<div>{entity.postCount || 0} posts</div>
			</div>
		);
	};

	// Render a zone card for the carousel, now using MergedZone
	const renderZoneCard = (zone: MergedZone, index: number) => {
		const semanticThemeKey = zone.colorTheme || 'default';
		const IconComponent = THEME_ICONS[semanticThemeKey as keyof typeof THEME_ICONS] || THEME_ICONS.default;
		// Use THEME_COLORS_BG for background/border classes
		const gradientClasses = THEME_COLORS_BG[semanticThemeKey as keyof typeof THEME_COLORS_BG] || THEME_COLORS_BG.default;
		
		// Determine icon color class from the imported ZONE_THEMES
		const iconColorClass = ZONE_THEMES[semanticThemeKey as keyof typeof ZONE_THEMES]?.color || ZONE_THEMES.default.color;

		return (
			<Link
				key={zone.id.toString()} 
				href={`/zones/${zone.slug}`} // Link to zone page
				className={`flex-shrink-0 w-72 h-48 rounded-lg border ${gradientClasses} bg-gradient-to-br p-5 flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-900/10 overflow-hidden`}
			>
				<div className="flex items-center mb-3">
					<IconComponent
						className={`h-5 w-5 mr-2 ${iconColorClass}`}
					/>
					<h3 className="text-lg font-bold text-white">{zone.name}</h3>
				</div>

				{zone.description && (
					<p className="text-sm text-zinc-300 mb-auto line-clamp-2">{zone.description}</p>
				)}
				{zone.hasXpBoost && (
					<Badge className="mt-2" variant="destructive">XP Boost x{zone.boostMultiplier}</Badge>
				)}
				<div className="mt-auto pt-3">
					{renderForumStats(zone)}
				</div>
			</Link>
		);
	};

	// Render a category (which is a MergedZone) with its child forums (MergedForum[])
	const renderCategory = (categoryZone: MergedZone, index: number) => {
		if (!categoryZone.forums || categoryZone.forums.length === 0) return null;

		const totalChildThreadCount = categoryZone.forums.reduce((sum, forum) => sum + (forum.threadCount || 0), 0);
		const totalChildPostCount = categoryZone.forums.reduce((sum, forum) => sum + (forum.postCount || 0), 0);

		const categorySemanticThemeKey = categoryZone.colorTheme || 'default';
		// Use THEME_COLORS_BG for background/border classes
		const categoryColorClass = THEME_COLORS_BG[categorySemanticThemeKey as keyof typeof THEME_COLORS_BG] || CATEGORY_COLORS[index % CATEGORY_COLORS.length];
		
		// Determine IconComponent based on categoryZone.icon (direct emoji/char) or its semanticThemeKey
		let CategoryIconComponent = Folder; // Default
		if (categoryZone.icon && typeof categoryZone.icon === 'string' && THEME_ICONS[categoryZone.icon as keyof typeof THEME_ICONS]) {
			CategoryIconComponent = THEME_ICONS[categoryZone.icon as keyof typeof THEME_ICONS];
		} else if (categorySemanticThemeKey && THEME_ICONS[categorySemanticThemeKey as keyof typeof THEME_ICONS]) {
			CategoryIconComponent = THEME_ICONS[categorySemanticThemeKey as keyof typeof THEME_ICONS];
		}
		// If categoryZone.icon is an emoji, it will be handled by the span rendering later.

		const categoryIconColorClass = (categorySemanticThemeKey && ZONE_THEMES[categorySemanticThemeKey as keyof typeof ZONE_THEMES]?.color)
			? ZONE_THEMES[categorySemanticThemeKey as keyof typeof ZONE_THEMES].color
			: ZONE_THEMES.default.color;


		return (
			<Card key={categoryZone.id.toString()} className={`overflow-hidden border mb-8 ${categoryColorClass}`}>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg font-semibold flex items-center">
							{categoryZone.icon && !THEME_ICONS[categoryZone.icon as keyof typeof THEME_ICONS] ? ( // If icon is an emoji/char not in THEME_ICONS
								<span className={`mr-2 text-xl ${categoryIconColorClass}`}>{categoryZone.icon}</span>
							) : (
								<CategoryIconComponent className={`h-5 w-5 mr-2 ${categoryIconColorClass}`} />
							)}
							{categoryZone.name}
						</CardTitle>
						<Badge variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700/50">
							{categoryZone.forums.length} {categoryZone.forums.length === 1 ? 'forum' : 'forums'}
						</Badge>
					</div>
					{categoryZone.description && (
						<CardDescription className="text-zinc-300">{categoryZone.description}</CardDescription>
					)}
					<div className="text-xs text-zinc-400">
						{categoryZone.threadCount} threads • {categoryZone.postCount} posts 
						(Children: {totalChildThreadCount} threads • {totalChildPostCount} posts)
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="divide-y divide-zinc-800/50">
						{categoryZone.forums.map((forum: MergedForum) =>
							forum.canHaveThreads ? ( 
								<Link
									key={forum.id.toString()}
									href={`/forums/${forum.slug}`} 
									className="block p-4 hover:bg-black/20 transition-colors"
								>
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-white font-medium mb-1">{forum.name}</h3>
											{forum.description && (
												<p className="text-sm text-zinc-400 mb-2">{forum.description}</p>
											)}
											{renderForumStats(forum)}
										</div>
										{/* Use forum.icon (direct emoji/char) or a default icon */}
										{forum.icon ? 
											<span className="text-xl" style={{color: forum.color || categoryZone.color || undefined}}>{forum.icon}</span> : 
											<MessageSquare className="h-5 w-5 text-zinc-600" />
										}
									</div>
								</Link>
							) : (
								<div
									key={forum.id.toString()}
									className="block p-4 text-zinc-500 opacity-60 cursor-not-allowed"
									aria-label="This is a container and does not support threads."
									title="This is a container and does not support threads."
								>
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-white font-medium mb-1">{forum.name}</h3>
											{forum.description && (
												<p className="text-sm text-zinc-400 mb-2">{forum.description}</p>
											)}
											{renderForumStats(forum)}
										</div>
										<MessageSquare className="h-5 w-5 text-zinc-600" />
									</div>
								</div>
							)
						)}
					</div>
				</CardContent>
			</Card>
		);
	};

	if (structureLoading) {
		return (
			<div className="flex flex-col min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
					<LoadingSpinner text="Loading Forums..." />
				</div>
				<SiteFooter />
			</div>
		);
	}

	if (structureErrorDetails) {
		return (
			<div className="flex flex-col min-h-screen">
				<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
					<ErrorDisplay title="Error loading forums" error={structureErrorDetails} />
				</div>
				<SiteFooter />
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen">
			<div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
				{/* Hero Section with Search */}
				<div className="mb-12">
					<div className="-mt-16 text-center">
						<img
							src="/images/ForumsGrafitti.PNG"
							alt="DegenTalk Forum"
							className="mx-auto -mb-12 w-auto max-h-64 object-contain"
						/>
						<p className="text-zinc-400 max-w-2xl mx-auto">
							Join the conversation with fellow degens. Discuss crypto, share insights, and stay
							ahead of the market.
						</p>
					</div>

					{/* Search Bar */}
					<div className="max-w-2xl mx-auto mb-10">
						<form onSubmit={handleSearch} className="flex gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
								<Input
									type="search"
									placeholder="Search topics, posts, or users..."
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									className="pl-9 bg-zinc-800 border-zinc-700 w-full"
								/>
							</div>
							<Button type="submit">Search</Button>
						</form>
					</div>

					{/* Primary Zones Carousel */}
					<section className="relative mb-14">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-bold text-white flex items-center">
								<LayoutGrid className="h-6 w-6 mr-2 text-emerald-500" />
								Primary Zones
							</h2>

							<div className="flex space-x-2">
								<Button
									variant="outline"
									size="icon"
									onClick={prevZone}
									disabled={(primaryZones || []).length <= 1}
									className="h-8 w-8 rounded-full"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={nextZone}
									disabled={(primaryZones || []).length <= 1}
									className="h-8 w-8 rounded-full"
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{structureLoading ? (
							<div className="flex gap-4 overflow-x-auto pb-4">
								{Array.from({ length: 3 }).map((_, i) => (
									<Skeleton key={i} className="h-48 w-72 flex-shrink-0" />
								))}
							</div>
						) : primaryZones.length > 0 ? (
							<div
								ref={carouselRef}
								className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar"
								style={{ scrollbarWidth: 'none' }}
							>
								{primaryZones.map((zone: MergedZone, index: number) => 
									renderZoneCard(zone, index)
								)}
							</div>
						) : (
							<div className="text-center py-10 text-zinc-500">
								<p>No primary zones available</p>
							</div>
						)}
					</section>
				</div>

				{/* Categories Section - Centered */}
				<div className="mb-14">
					<h2 className="text-2xl font-bold mb-8 text-white flex items-center justify-center">
						<Folder className="h-6 w-6 mr-2 text-amber-500" />
						Forums & Categories
					</h2>

					{structureLoading ? (
						<div className="space-y-8 max-w-4xl mx-auto">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-64 w-full" />
							))}
						</div>
					) : categories.length > 0 ? ( 
						<div className="max-w-4xl mx-auto">
							{categories.map((categoryZone: MergedZone, index: number) => renderCategory(categoryZone, index))}
						</div>
					) : (
						<div className="text-center py-10 text-zinc-500 max-w-4xl mx-auto">
							<p>No categories available</p>
						</div>
					)}
				</div>

				{/* Forum Guidelines and Active Members at the bottom */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 max-w-4xl mx-auto">
					<ForumGuidelines className="h-full" />

					<ActiveMembersWidget
						users={activeUsers || []}
						isLoading={activeUsersLoading}
						description="Members active in the last 30 minutes"
						viewAllLink="/users"
						className="h-full"
					/>
				</div>
			</div>
			<SiteFooter />
		</div>
	);
}

// Wrap with Provider if not done at a higher level
const ForumIndexPageWithProvider = () => (
	<ForumStructureProvider>
		<ForumPage />
	</ForumStructureProvider>
);

export default ForumIndexPageWithProvider;
