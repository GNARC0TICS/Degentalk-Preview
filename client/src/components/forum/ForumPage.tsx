import React, { useState, memo, useCallback, useEffect } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Monitor, Layout } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import { useForumFilters } from '@/hooks/useForumFilters';
import { Container } from '@/layout/primitives';
import { ThreadFilters } from '@/components/forum/ThreadFilters';
import {
	ForumBreadcrumbs,
	createForumBreadcrumbs
} from '@/components/navigation/ForumBreadcrumbs';
import ThreadList from '@/features/forum/components/ThreadList';
import { DynamicSidebar } from '@/components/forum/sidebar';
import { ForumHeader } from '@/features/forum/components/ForumHeader';
import { MyBBThreadList } from '@/components/forum/MyBBThreadList';
import { MyBBBreadcrumb } from '@/components/forum/MyBBBreadcrumb';
import { MyBBForumList } from '@/components/forum/MyBBForumList';
import { MyBBStats, MyBBLegend } from '@/components/forum/MyBBStats';
import { MyBBQuickStats } from '@/components/forum/MyBBQuickStats';
import { MyBBForumGuidelines } from '@/components/forum/MyBBForumGuidelines';
import { MyBBActiveMembers } from '@/components/forum/MyBBActiveMembers';
import { ModernQuickStats } from '@/components/forum/ModernQuickStats';
import { ModernThreadList } from '@/components/forum/ModernThreadList';
import { ForumGuidelines } from '@/components/forum/forum-guidelines';
import ActiveMembersWidget from '@/components/users/ActiveMembersWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/utils';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ForumId, StructureId, UserId, ThreadId } from '@shared/types/ids';
import { toUserId, toThreadId, toStructureId, toForumId } from '@shared/utils/id';
import type { Thread } from '@shared/types/thread.types';
import { useForumViewTheme } from '@/contexts/ForumViewThemeContext';

export interface ForumPageProps {
	className?: string;
}

// Thread List Wrapper Component for Modern View
const ThreadListWithModernDisplay: React.FC<{
	forum: any;
	filters: any;
	onNewThread: () => void;
}> = ({ forum, filters, onNewThread }) => {
	const [page, setPage] = React.useState(1);
	const threadsPerPage = 20;

	const queryKey = [
		`/api/forum/threads?structureId=${forum.id}`,
		page,
		threadsPerPage,
		filters
	];

	const { data: apiResponse, isLoading } = useQuery<any>({
		queryKey,
		queryFn: async () => {
			const params = new URLSearchParams({
				structureId: forum.id,
				page: page.toString(),
				limit: threadsPerPage.toString(),
				sortBy: filters.sortBy || 'latest'
			});

			const response = await fetch(`/api/forum/threads?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch threads');
			return response.json();
		},
		enabled: !!forum.id
	});

	const threads = apiResponse?.threads || apiResponse?.data?.threads || [];
	
	console.log('ThreadListWithModernDisplay:', {
		forumId: forum.id,
		apiResponse,
		threads,
		isLoading
	});

	return (
		<ModernThreadList
			threads={threads}
			forumName={forum.name}
			forumSlug={forum.slug}
			forumId={toForumId(forum.id)}
			isLoading={isLoading}
			onNewThread={onNewThread}
		/>
	);
};

// Thread List Wrapper Component for Classic View
const MyBBThreadListWrapper: React.FC<{
	forum: any;
	filters: any;
}> = ({ forum, filters }) => {
	const [page, setPage] = React.useState(1);
	const threadsPerPage = 20;

	const queryKey = [
		`/api/forum/threads?structureId=${forum.id}`,
		page,
		threadsPerPage,
		filters
	];

	const { data: apiResponse, isLoading } = useQuery<any>({
		queryKey,
		queryFn: async () => {
			const params = new URLSearchParams({
				structureId: forum.id,
				page: page.toString(),
				limit: threadsPerPage.toString(),
				sortBy: filters.sortBy || 'latest'
			});

			const response = await fetch(`/api/forum/threads?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to fetch threads');
			return response.json();
		},
		enabled: !!forum.id
	});

	const threads = apiResponse?.threads || apiResponse?.data?.threads || [];
	
	console.log('MyBBThreadListWrapper:', {
		forumId: forum.id,
		apiResponse,
		threads,
		isLoading
	});

	if (isLoading) {
		return (
			<MyBBThreadList
				threads={[]}
				forumName={forum.name}
				forumSlug={forum.slug}
			/>
		);
	}

	return (
		<MyBBThreadList
			threads={threads}
			forumName={forum.name}
			forumSlug={forum.slug}
		/>
	);
};

// Demo threads for fallback mode
function getDemoThreads(forumSlug: string): Thread[] {
	const baseThreads = [
		{
			id: '1',
			title: "🚀 Bitcoin hitting $100k EOY - Here's why",
			slug: 'bitcoin-hitting-100k-eoy-heres-why',
			user: { id: '1', username: 'CryptoKing', avatarUrl: null, isOnline: true },
			createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			lastPostAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			viewCount: 1337,
			postCount: 43,
			isSticky: true,
			isLocked: false,
			isSolved: false
		},
		{
			id: '2',
			title: '⚠️ WARNING: New DeFi scam targeting wallets',
			slug: 'warning-new-defi-scam-targeting-wallets',
			user: { id: '2', username: 'SecurityExpert', avatarUrl: null, isOnline: false },
			createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
			lastPostAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
			viewCount: 2456,
			postCount: 67,
			isSticky: false,
			isLocked: false,
			isSolved: false
		},
		{
			id: '3',
			title: '💎 Hidden gem alert: $PEPE mooning soon?',
			slug: 'hidden-gem-alert-pepe-mooning-soon',
			user: { id: '3', username: 'MoonBoi', avatarUrl: null, isOnline: true },
			createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
			lastPostAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
			viewCount: 892,
			postCount: 15,
			isSticky: false,
			isLocked: false,
			isSolved: false
		},
		{
			id: '4',
			title: '📊 Daily market analysis thread',
			slug: 'daily-market-analysis-thread',
			user: { id: '4', username: 'TradingGuru', avatarUrl: null, isOnline: false },
			createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
			lastPostAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
			viewCount: 567,
			postCount: 23,
			isSticky: false,
			isLocked: false,
			isSolved: true
		},
		{
			id: '5',
			title: '🎯 Airdrop hunting strategies that actually work',
			slug: 'airdrop-hunting-strategies',
			user: { id: '5', username: 'AirdropHunter', avatarUrl: null, isOnline: true },
			createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
			lastPostAt: null,
			viewCount: 234,
			postCount: 1,
			isSticky: false,
			isLocked: false,
			isSolved: false
		}
	];

	// Add required properties to make threads conform to Thread type
	return baseThreads.map((thread) => ({
		...thread,
		id: toThreadId(thread.id),
		// Add missing Thread properties
		structureId: toStructureId('struct_1'),
		isHidden: false,
		firstPostLikeCount: 0,
		userId: toUserId(thread.user.id),

		// Add structure relationship
		structure: {
			id: toStructureId('struct_1'),
			name:
				forumSlug === 'market-analysis'
					? 'Market Analysis'
					: forumSlug === 'live-trade-reacts'
						? 'Live-Trade Reacts'
						: 'Shill Zone',
			slug: forumSlug,
			type: 'forum' as const
		},

		// Add featured forum relationship
		featuredForum: {
			id: toForumId('forum_1'),
			name: 'Trading',
			slug: 'trading',
			colorTheme: 'emerald',
			description: 'Trading and market discussion',
			isFeatured: true,
			sortOrder: 1,
			isVisible: true,
			bannerImage: null,
			icon: null,
			forums: [],
			stats: {
				totalForums: 3,
				totalThreads: 150,
				totalPosts: 1200,
				lastActivity: undefined
			},
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},

		// Add enhanced user data for Thread
		user: {
			...thread.user,
			id: toUserId(thread.user.id),
			displayName: thread.user.username,
			activeAvatarUrl: thread.user.avatarUrl,
			role: 'user' as const,
			forumStats: {
				level: 1,
				xp: 100,
				reputation: 50,
				totalPosts: 10,
				totalThreads: 2,
				totalLikes: 5,
				totalTips: 0
			},
			lastSeenAt: new Date().toISOString(),
			joinedAt: new Date().toISOString(),
			isAdmin: false,
			isModerator: false,
			isVerified: false,
			isBanned: false
		},

		// Add tags array
		tags: [],

		// Add permissions
		permissions: {
			canEdit: false,
			canDelete: false,
			canReply: true,
			canMarkSolved: false,
			canModerate: false
		},

		// Legacy fields for compatibility
		zoneName: 'Trading',
		zoneSlug: 'trading',
		forumName:
			forumSlug === 'market-analysis'
				? 'Market Analysis'
				: forumSlug === 'live-trade-reacts'
					? 'Live-Trade Reacts'
					: 'Shill Zone',
		forumSlug
	})) as Thread[];
}

const ForumPage = memo(() => {
	const params = useParams<{ zoneSlug?: string; forumSlug?: string; subforumSlug?: string }>();
	const navigate = useNavigate();
	// Use subforum slug if present, otherwise forum slug
	const forumSlug = params?.subforumSlug || params?.forumSlug;

	// We need zones because that's where top-level forums are stored (unfortunately)
	const { getForum, forumsById, zones, isUsingFallback } = useForumStructure();

	// State management
	const [showFilters, setShowFilters] = useState(false);
	const { viewTheme, setViewTheme } = useForumViewTheme();

	// Use the consolidated filter hook with optional storage key
	const forumFiltersOptions = React.useMemo(() => {
		const options: Parameters<typeof useForumFilters>[0] = {
			defaultSort: 'latest',
			syncWithUrl: true
		};
		if (forumSlug) {
			options.storageKey = `forum-filters-${forumSlug}`;
		}
		return options;
	}, [forumSlug]);

	const { filters, setFilters } = useForumFilters(forumFiltersOptions);

	// Get forum data with error handling
	let forum = null as ReturnType<typeof getForum> | null;
	let parentForum = null as ReturnType<typeof getForum> | null;
	try {
		// Try to find the forum by slug in child forums first
		forum = forumSlug ? getForum(forumSlug) : null;

		// If not found, check top-level forums (stored in zones)
		if (!forum && forumSlug) {
			forum = zones.find((f) => f.slug === forumSlug) || null;
		}

		// If still not found, search all forums by ID
		if (!forum && forumSlug) {
			forum = Object.values(forumsById).find((f) => f.slug === forumSlug) || null;
		}

		// If we have a subforum, find its parent
		if (params?.subforumSlug && params?.forumSlug) {
			parentForum =
				getForum(params.forumSlug) ||
				zones.find((f) => f.slug === params.forumSlug) ||
				Object.values(forumsById).find((f) => f.slug === params.forumSlug) ||
				null;
		}
	} catch (error) {
		throw error as Error; // bubble up to error boundary
	}

	// Find parent forum if this is a child forum
	const parentTopLevelForum =
		forum && forum.parentId ? Object.values(forumsById).find((f) => f.id === forum.parentId) : null;

	const handleFiltersChange = useCallback(
		(newFilters: typeof filters) => {
			setFilters(newFilters);
		},
		[setFilters]
	);

	const handleNewThread = useCallback(() => {
		// Navigate to create thread page with forum slug
		if (forum) {
			navigate(`/threads/create?forumSlug=${forum.slug}`);
		}
	}, [forum, navigate]);

	const breadcrumbItems = React.useMemo(() => {
		if (!forum) return [];
		
		// If we're viewing a subforum (URL has both forumSlug and subforumSlug)
		if (params?.subforumSlug && parentForum) {
			return createForumBreadcrumbs.smartForum(parentForum, forum);
		}
		
		// If this forum has a parentId but we couldn't find the parent forum
		// (might happen during navigation), try to find it
		if (forum.parentId && !parentForum) {
			const parent = zones.find(f => f.id === forum.parentId) || 
						  Object.values(forumsById).find(f => f.id === forum.parentId);
			if (parent) {
				return createForumBreadcrumbs.smartForum(parent, forum);
			}
		}
		
		// Otherwise, this is a top-level forum
		return createForumBreadcrumbs.smartForum(forum, null);
	}, [forum, parentForum, params?.subforumSlug, zones, forumsById]);

	// If no forum slug present, redirect to forums index
	if (!forumSlug) {
		return <Navigate to="/forums" replace />;
	}

	if (!forum) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-white mb-4">Forum Not Found</h1>
					<p className="text-zinc-400 mb-6">The forum you're looking for doesn't exist.</p>
					<Button onClick={() => window.history.back()}>Go Back</Button>
				</div>
			</div>
		);
	}

	return (
		<Container className="py-8">
				{/* Header with Theme Toggle */}
				<div className="flex justify-between items-center mb-6">
					{/* Breadcrumbs */}
					<div className="flex-1">
						<AnimatePresence mode="wait">
							{viewTheme === 'modern' ? (
								<motion.div
									key="modern-breadcrumb"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									<ForumBreadcrumbs items={breadcrumbItems} />
								</motion.div>
							) : (
								<motion.div
									key="classic-breadcrumb"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									<MyBBBreadcrumb items={breadcrumbItems} />
								</motion.div>
							)}
						</AnimatePresence>
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

				<AnimatePresence mode="wait">
					{viewTheme === 'modern' ? (
						/* Modern View */
						<motion.div
							key="modern-view"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
						>
							<div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
								{/* Main Content */}
								<div className="space-y-6">
									{/* Forum Header - Standardized typography */}
									{forum && (
										<div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
											<div className="flex items-start justify-between">
												<div>
													<h1 className="text-xl font-bold text-white mb-2">{forum.name}</h1>
													{forum.description && (
														<p className="text-sm text-zinc-400">{forum.description}</p>
													)}
												</div>
												<Button onClick={handleNewThread} size="sm" variant="outline">
													New Thread
												</Button>
											</div>
										</div>
									)}

									{/* Subforums Display */}
									{forum && forum.forums && forum.forums.length > 0 && (
										<div className="mb-8">
											<h3 className="text-base font-semibold mb-4 text-zinc-200">Subforums</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
												{forum.forums.map((subforum) => (
													<Link
														key={subforum.id}
														to={`/forums/${forum.slug}/${subforum.slug}`}
														className="group p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 hover:border-zinc-700 transition-all"
													>
														<div className="flex items-center justify-between">
															<div>
																<h4 className="text-sm font-medium text-zinc-100 group-hover:text-white">
																	{subforum.name}
																</h4>
																<p className="text-xs text-zinc-500 mt-1">
																	{subforum.threadCount || 0} threads •{' '}
																	{subforum.postCount || 0} posts
																</p>
															</div>
															<ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400" />
														</div>
													</Link>
												))}
											</div>
										</div>
									)}

									{/* Filter Toggle */}
									<div className="flex justify-end">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowFilters(!showFilters)}
											className="text-zinc-400 hover:text-white"
										>
											<Filter className="w-4 h-4 mr-2" />
											{showFilters ? 'Hide' : 'Show'} Filters
										</Button>
									</div>

									{/* Filters */}
									{showFilters && (
										<div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-4">
											<ThreadFilters
												forumSlug={forumSlug || ''}
												availableTags={[]}
												availablePrefixes={[]}
												onFiltersChange={handleFiltersChange}
											/>
										</div>
									)}

									{/* Thread List */}
									{isUsingFallback ? (
										<ModernThreadList
											threads={getDemoThreads(forum.slug)}
											forumName={forum.name}
											forumSlug={forum.slug}
											forumId={forum?.id ? toForumId(forum.id) : undefined}
											onNewThread={handleNewThread}
										/>
									) : forum?.id ? (
										<ThreadListWithModernDisplay
											forum={forum}
											filters={filters}
											onNewThread={handleNewThread}
										/>
									) : (
										<div className="text-center py-8 text-zinc-400">{'No forum data available'}</div>
									)}
								</div>

								{/* Right Sidebar */}
								<aside className="space-y-6">
									<ModernQuickStats 
										stats={{
											online: 42,
											postsToday: 89,
											hotTopics: 7,
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
							key="classic-view"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
							className="mybb-classic"
						>
							<div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
								{/* Main Content */}
								<div>
									{/* Forum Header for Classic View */}
									{forum && (
										<div className="mybb-forum-header mb-6">
											<h1 className="text-xl font-bold text-zinc-100">{forum.name}</h1>
											{forum.description && (
												<p className="text-sm text-zinc-400 mt-1">{forum.description}</p>
											)}
										</div>
									)}

									{/* Subforums in Classic Style */}
									{forum && forum.forums && forum.forums.length > 0 && (
										<div className="mb-6">
											<MyBBForumList 
												forums={forum.forums} 
												categoryName="Subforums"
												categoryColor="blue"
											/>
										</div>
									)}

									{/* Thread List */}
									<div className="mb-6">
										{isUsingFallback || !forum?.id ? (
											<MyBBThreadList
												threads={getDemoThreads(forum?.slug || '')}
												forumName={forum?.name || 'Forum'}
												forumSlug={forum?.slug || ''}
											/>
										) : (
											<MyBBThreadListWrapper
												forum={forum}
												filters={filters}
											/>
										)}
									</div>

									{/* Forum Stats */}
									<div className="mt-6 space-y-4">
										<MyBBStats stats={{
											totalThreads: forum?.threadCount || 0,
											totalPosts: forum?.postCount || 0,
											totalMembers: 1337,
											onlineUsers: 42,
											newestMember: 'NewDegen'
										}} />
										
										<MyBBLegend />
									</div>
								</div>

								{/* Classic Sidebar */}
								<aside className="space-y-4">
									<MyBBQuickStats stats={{
										online: 42,
										postsToday: 89,
										hotTopics: 7,
										totalThreads: forum?.threadCount || 0,
										totalPosts: forum?.postCount || 0
									}} />
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
		</Container>
	);
});

ForumPage.displayName = 'ForumPage';

export default ForumPage;
