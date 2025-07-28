import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, TrendingUp, Clock, Star, Monitor, Layout, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/layout/primitives';
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MyBBForumList } from '@/components/forum/MyBBForumList';
import { MyBBStats, MyBBLegend } from '@/components/forum/MyBBStats';
import { ModernForumList, ModernForumStats } from '@/components/forum/ModernForumList';
import { WidgetSkeleton } from '@/components/forum/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ActiveMembersWidget from '@/components/users/ActiveMembersWidget';
import { ForumGuidelines } from '@/components/forum/forum-guidelines';
import { MyBBActiveMembers } from '@/components/forum/MyBBActiveMembers';
import { MyBBForumGuidelines } from '@/components/forum/MyBBForumGuidelines';
import { MyBBQuickStats } from '@/components/forum/MyBBQuickStats';
import { MyBBCategoryFilter } from '@/components/forum/MyBBCategoryFilter';
import { MyBBFeaturedNav } from '@/components/forum/MyBBFeaturedNav';
import { ModernQuickStats } from '@/components/forum/ModernQuickStats';
import { useForumViewTheme } from '@/contexts/ForumViewThemeContext';

// Theme color utility function
const getForumThemeClass = (theme?: string, prefix = 'bg') => {
	const themeMap: Record<string, string> = {
		emerald: `${prefix}-emerald-500`,
		purple: `${prefix}-purple-500`,
		orange: `${prefix}-orange-500`,
		pink: `${prefix}-pink-500`,
		blue: `${prefix}-blue-500`,
		red: `${prefix}-red-500`,
		yellow: `${prefix}-yellow-500`
	};
	return themeMap[theme || ''] || `${prefix}-zinc-700`;
};


// Page transition wrapper
const ForumPageTransition = ({ children, forumId }: { children: React.ReactNode; forumId?: string }) => (
	<AnimatePresence mode="wait">
		<motion.div
			key={forumId || 'main'}
			initial={{ x: 300, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			exit={{ x: -300, opacity: 0 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	</AnimatePresence>
);

// View preferences type
interface ViewPreferences {
	theme: 'modern' | 'classic';
	density: 'comfortable' | 'compact';
	showStats: boolean;
	autoPlayAnimations: boolean;
}

// Default preferences
const DEFAULT_PREFERENCES: ViewPreferences = {
	theme: 'modern',
	density: 'comfortable',
	showStats: true,
	autoPlayAnimations: true
};

// Load preferences from localStorage
const loadPreferences = (): ViewPreferences => {
	try {
		const saved = localStorage.getItem('forum-view-preferences');
		return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
	} catch {
		return DEFAULT_PREFERENCES;
	}
};

// Save preferences to localStorage
const savePreferences = (prefs: ViewPreferences) => {
	localStorage.setItem('forum-view-preferences', JSON.stringify(prefs));
};

// Get neon color from theme
const getNeonColor = (theme?: any) => {
	if (!theme) return '#10b981'; // Default emerald
	return theme.hexColor || theme.color || '#10b981';
};

// Featured Forum Navigation Component
const FeaturedForumNav = ({ forums, onForumClick }: { forums: any[]; onForumClick: (slug: string) => void }) => {
	const featuredForums = forums.filter(f => f.isFeatured);
	
	if (featuredForums.length === 0) return null;
	
	return (
		<div className="mb-6">
			<h3 className="text-sm font-medium text-zinc-400 mb-3">Featured Forums</h3>
			<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap">
				{featuredForums.map(forum => {
					const neonColor = getNeonColor(forum.theme);
					return (
						<motion.button
							key={forum.id}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => onForumClick(forum.slug)}
							className="relative px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 md:flex-shrink bg-zinc-900/50 backdrop-blur-sm border overflow-hidden group"
							style={{
								borderColor: `${neonColor}50`,
								color: neonColor,
								boxShadow: `0 0 15px ${neonColor}20`
							}}
							onMouseEnter={() => {
								// Preload classic view on hover
								import('@/components/forum/MyBBForumList');
							}}
						>
							{/* Neon glow effect on hover */}
							<div 
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								style={{
									background: `radial-gradient(circle at center, ${neonColor}15 0%, transparent 70%)`,
								}}
							/>
							
							{/* Button content */}
							<span className="relative z-10 flex items-center">
								{forum.theme?.icon && <span className="mr-2">{forum.theme.icon}</span>}
								{forum.name}
							</span>
							
							{/* Neon border glow on hover */}
							<motion.div
								className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								style={{
									boxShadow: `inset 0 0 20px ${neonColor}30, 0 0 20px ${neonColor}40`
								}}
							/>
						</motion.button>
					);
				})}
			</div>
		</div>
	);
};

// Quick Stats Bar Component
const QuickStatsBar = ({ stats }: { stats: any }) => {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800"
			>
				<div className="flex items-center gap-2">
					<Users className="w-4 h-4 text-emerald-500" />
					<div>
						<div className="text-xs text-zinc-500">Online</div>
						<div className="font-semibold">{stats?.online || 0}</div>
					</div>
				</div>
			</motion.div>
			
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800"
			>
				<div className="flex items-center gap-2">
					<MessageSquare className="w-4 h-4 text-blue-500" />
					<div>
						<div className="text-xs text-zinc-500">Posts Today</div>
						<div className="font-semibold">{stats?.postsToday || 0}</div>
					</div>
				</div>
			</motion.div>
			
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800"
			>
				<div className="flex items-center gap-2">
					<TrendingUp className="w-4 h-4 text-orange-500" />
					<div>
						<div className="text-xs text-zinc-500">Hot Topics</div>
						<div className="font-semibold">{stats?.hotTopics || 0}</div>
					</div>
				</div>
			</motion.div>
			
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800"
			>
				<div className="flex items-center gap-2">
					<Clock className="w-4 h-4 text-purple-500" />
					<div>
						<div className="text-xs text-zinc-500">Avg Response</div>
						<div className="font-semibold">2.3m</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default function ForumsIndexPage() {
	const navigate = useNavigate();
	const context = useForumStructure();
	const { user } = useAuth();
	const { viewTheme, setViewTheme } = useForumViewTheme();
	const [selectedCategory, setSelectedCategory] = useState<'all' | 'featured' | 'general'>('all');

	// Use the new context properties
	const topLevelForums = context.topLevelForums || [];
	const childForums = context.forumsBySlug || {};
	const allForumsById = context.forumsById || {};
	const loading = context.isLoading;
	const error = context.error;

	// For now, display top-level forums only
	const allForums = topLevelForums;

	// Add keyboard shortcut for theme toggle (Alt+T)
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.altKey && e.key === 't') {
				e.preventDefault();
				setViewTheme(viewTheme === 'modern' ? 'classic' : 'modern');
			}
		};
		
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [viewTheme, setViewTheme]);

	if (loading) {
		return (
			<Container className="py-8">
				<div className="space-y-6">
					{/* Header Skeleton */}
					<div className="space-y-4">
						<div className="h-10 bg-zinc-800 rounded-lg w-1/3 animate-pulse" />
						<div className="h-5 bg-zinc-800 rounded-lg w-2/3 animate-pulse" />
					</div>
					
					{/* Theme Toggle Skeleton */}
					<div className="flex justify-between items-center">
						<div className="flex gap-2">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="h-9 bg-zinc-800 rounded-lg w-24 animate-pulse" />
							))}
						</div>
						<div className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" />
					</div>
					
					{/* Featured Forums Skeleton */}
					<div className="space-y-3">
						<div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
						<div className="flex gap-2">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" />
							))}
						</div>
					</div>
					
					{/* Stats Skeleton */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{[...Array(4)].map((_, i) => (
							<WidgetSkeleton key={i} className="h-20" />
						))}
					</div>
					
					{/* Forum Cards Skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[...Array(6)].map((_, i) => (
							<WidgetSkeleton key={i} className="h-48" />
						))}
					</div>
				</div>
			</Container>
		);
	}

	if (error) {
		return (
			<Container className="py-8">
				<div className="text-center text-red-500">
					<p>Error loading forums: {error}</p>
				</div>
			</Container>
		);
	}

	// Filter forums based on selection
	const filteredForums = allForums.filter((forum) => {
		if (selectedCategory === 'all') return true;
		if (selectedCategory === 'featured') return forum.isFeatured;
		if (selectedCategory === 'general') return !forum.isFeatured;
		return true;
	});

	// Mock stats - in production, these would come from API
	const forumStats = {
		online: 127,
		postsToday: 342,
		hotTopics: 15,
		totalThreads: 1234,
		totalPosts: 5678,
		totalMembers: 890,
		onlineUsers: 127,
		newestMember: user?.username || 'NewDegen'
	};

	return (
		<ForumPageTransition>
			<Container className="py-8">
				<div className="space-y-6">
					{/* Header with Theme Toggle */}
					<div className="flex flex-col gap-4">
						<div className="flex justify-between items-start">
							<div>
								<h1 className="text-3xl font-bold">Community Forums</h1>
								<p className="text-muted-foreground mt-1">
									Join the conversation in our vibrant community forums
								</p>
							</div>
							
							{/* Theme Toggle */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								className="flex items-center gap-3 bg-zinc-900/50 rounded-lg px-3 py-2 border border-zinc-800"
							>
								<div className="flex items-center gap-2">
									<Monitor className={cn("w-4 h-4", viewTheme === 'modern' && "text-blue-500")} />
									<span className={cn("text-xs font-medium", viewTheme === 'modern' ? "text-blue-500" : "text-zinc-500")}>
										Modern
									</span>
								</div>
								<Switch
									checked={viewTheme === 'classic'}
									onCheckedChange={(checked) => setViewTheme(checked ? 'classic' : 'modern')}
									className="data-[state=checked]:bg-amber-600"
									aria-label="Toggle between Modern and Classic theme"
								/>
								<div className="flex items-center gap-2">
									<Layout className={cn("w-4 h-4", viewTheme === 'classic' && "text-amber-500")} />
									<span className={cn("text-xs font-medium", viewTheme === 'classic' ? "text-amber-500" : "text-zinc-500")}>
										Classic
									</span>
								</div>
							</motion.div>
						</div>
					</div>

				{/* Featured Forums Navigation - Only in modern view */}
				{viewTheme === 'modern' && (
					<FeaturedForumNav 
						forums={allForums} 
						onForumClick={(slug) => navigate(`/forums/${slug}`)} 
					/>
				)}


				{/* Category Filter - Only in modern view */}
				{viewTheme === 'modern' && (
					<div className="flex gap-2">
					<Button
						variant={selectedCategory === 'all' ? 'outline' : 'ghost'}
						onClick={() => setSelectedCategory('all')}
						size="sm"
						className={selectedCategory === 'all' ? 'border-emerald-500 text-emerald-400' : ''}
					>
						All Forums
					</Button>
					<Button
						variant={selectedCategory === 'featured' ? 'outline' : 'ghost'}
						onClick={() => setSelectedCategory('featured')}
						size="sm"
						className={selectedCategory === 'featured' ? 'border-emerald-500 text-emerald-400' : ''}
					>
						<Star className="w-4 h-4 mr-1" />
						Featured
					</Button>
					<Button
						variant={selectedCategory === 'general' ? 'outline' : 'ghost'}
						onClick={() => setSelectedCategory('general')}
						size="sm"
						className={selectedCategory === 'general' ? 'border-emerald-500 text-emerald-400' : ''}
					>
						General
					</Button>
					</div>
				)}

				{/* Conditional Theme Rendering */}
				<AnimatePresence mode="wait">
					{viewTheme === 'modern' ? (
						/* Modern View */
						<motion.div
							key="modern"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
						>
							<div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
								{/* Main Content */}
								<div className="space-y-6">
									{/* Group forums by featured/general */}
									{selectedCategory !== 'general' && filteredForums.filter(f => f.isFeatured).length > 0 && (
										<ModernForumList 
											forums={filteredForums.filter(f => f.isFeatured)}
											categoryName="Featured Forums"
											categoryColor="amber"
											showNewThreadButton={false}
										/>
									)}
									
									{selectedCategory !== 'featured' && filteredForums.filter(f => !f.isFeatured).length > 0 && (
										<ModernForumList 
											forums={filteredForums.filter(f => !f.isFeatured)}
											categoryName="General Forums"
											categoryColor="emerald"
											showNewThreadButton={false}
										/>
									)}
									
									{/* Modern Stats - Enhanced with more details */}
									<ModernForumStats 
										stats={{
											...forumStats,
											threadsToday: 12,
											mostOnlineEver: 523,
											mostOnlineDate: 'Dec 25, 2023'
										}}
										onlineUsersList={['CryptoKing', 'MoonBoi', 'DiamondHands', 'HODLer', 'DeFiDegen', 'NFTCollector', 'WhaleWatcher']}
									/>
								</div>
								
								{/* Sidebar */}
								<aside className="space-y-6">
									<ModernQuickStats 
										stats={{
											online: forumStats.onlineUsers,
											postsToday: forumStats.postsToday,
											hotTopics: forumStats.hotTopics,
											avgResponseTime: '2.3m'
										}}
									/>
									<ForumGuidelines />
									<ActiveMembersWidget 
										title="Who's Online"
										description="Active in the last 15 minutes"
										limit={8}
									/>
								</aside>
							</div>
						</motion.div>
					) : (
						/* Classic MyBB View */
						<motion.div
							key="classic"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="mybb-classic"
						>
							<div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
								{/* Main Content */}
								<div>
									{/* Featured Forums Navigation */}
									<MyBBFeaturedNav 
										forums={allForums} 
										onForumClick={(slug) => navigate(`/forums/${slug}`)} 
									/>
									
									{/* Category Filter */}
									<MyBBCategoryFilter 
										selectedCategory={selectedCategory}
										onCategoryChange={setSelectedCategory}
									/>

									{/* Group forums by featured/general */}
									{selectedCategory !== 'general' && filteredForums.filter(f => f.isFeatured).length > 0 && (
										<MyBBForumList 
											forums={filteredForums.filter(f => f.isFeatured)}
											categoryName="Featured Forums"
											categoryColor="yellow"
										/>
									)}
									
									{selectedCategory !== 'featured' && filteredForums.filter(f => !f.isFeatured).length > 0 && (
										<MyBBForumList 
											forums={filteredForums.filter(f => !f.isFeatured)}
											categoryName="General Forums"
											categoryColor="blue"
										/>
									)}
									
									{/* MyBB Stats and Legend */}
									<div className="mt-6 space-y-4">
										<MyBBStats 
											stats={forumStats} 
											onlineUsersList={['CryptoKing', 'MoonBoi', 'DiamondHands', 'HODLer', 'DeFiDegen', 'NFTCollector', 'WhaleWatcher']}
										/>
										<MyBBLegend />
									</div>
								</div>
								
								{/* Classic Sidebar */}
								<aside className="space-y-4">
									<MyBBQuickStats stats={forumStats} />
									<MyBBForumGuidelines />
									<MyBBActiveMembers 
										title="Who's Online"
										limit={10}
									/>
								</aside>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Empty State */}
				{filteredForums.length === 0 && (
					<motion.div 
						className="text-center py-12"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">No forums found in this category.</p>
					</motion.div>
				)}
			</div>
		</Container>
		</ForumPageTransition>
	);
}
