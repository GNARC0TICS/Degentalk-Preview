import React, { useState, memo, useCallback } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';

import { Button } from '@app/components/ui/button';
import { getCreateThreadUrl } from '@app/utils/forum';
import { useForumStructure } from '@app/features/forum/contexts/ForumStructureContext';
import { useForumFilters } from '@app/hooks/useForumFilters';
import { Wide } from '@app/layout/primitives';
import { ThreadFilters } from '@app/components/forum/ThreadFilters';
import { ForumBreadcrumbs, createForumBreadcrumbs } from '@app/components/navigation/ForumBreadcrumbs';
import ThreadList from '@app/features/forum/components/ThreadList';
import { DynamicSidebar } from '@app/components/forum/sidebar';
import { ForumHeader } from '@app/features/forum/components/ForumHeader';
import { MyBBThreadList } from '@app/components/forum/MyBBThreadList';
import type { ForumId, StructureId, UserId, ThreadId } from '@shared/types/ids';
import { toUserId, toThreadId, toStructureId, toForumId } from '@shared/utils/id';
import type { Thread } from '@shared/types/thread.types';

export interface ForumPageProps {
	className?: string;
}

// Demo threads for fallback mode
function getDemoThreads(forumSlug: string): Thread[] {
	const baseThreads = [
		{
			id: '1',
			title: '🚀 Bitcoin hitting $100k EOY - Here\'s why',
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
	return baseThreads.map(thread => ({
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
			name: forumSlug === 'market-analysis' ? 'Market Analysis' : 
			      forumSlug === 'live-trade-reacts' ? 'Live-Trade Reacts' : 'Shill Zone',
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
		forumName: forumSlug === 'market-analysis' ? 'Market Analysis' : 
		           forumSlug === 'live-trade-reacts' ? 'Live-Trade Reacts' : 'Shill Zone',
		forumSlug
	})) as Thread[];
}

const ForumPage = memo(() => {
	const params = useParams<{ zoneSlug?: string; forumSlug?: string; subforumSlug?: string }>();
	// Use subforum slug if present, otherwise forum slug
	const forumSlug = params?.subforumSlug || params?.forumSlug;
	const zoneSlug = params?.zoneSlug;

	// If no forum slug present, redirect to forums index
	if (!forumSlug) {
		return <Navigate to="/forums" replace />;
	}

	const { getForum, getZone, zones, isUsingFallback } = useForumStructure();

	// State management
	const [showFilters, setShowFilters] = useState(false);

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
		// First try to find it as a top-level forum (zone)
		forum = forumSlug ? getZone(forumSlug) : null;
		
		// If not found as top-level, try as a child forum
		if (!forum && forumSlug) {
			forum = getForum(forumSlug);
		}

		// If we have a subforum, find its parent
		if (params?.subforumSlug && params?.forumSlug) {
			// Parent could be either a zone or a forum
			parentForum = getZone(params.forumSlug) || getForum(params.forumSlug);
		}
	} catch (error) {
		throw error as Error; // bubble up to error boundary
	}

	// Find parent zone - either from URL or by searching
	const parentZone = zoneSlug
		? zones?.find((zone) => zone.slug === zoneSlug)
		: zones?.find((zone) => zone.forums.some((f) => f.slug === forumSlug));

	const handleFiltersChange = useCallback(
		(newFilters: typeof filters) => {
			setFilters(newFilters);
		},
		[setFilters]
	);

	const handleNewThread = useCallback(() => {
		// Navigate to create thread page using smart URL generation
		if (forumSlug) {
			const createUrl = getCreateThreadUrl(forumSlug, parentZone?.slug);
			window.location.href = createUrl;
		}
	}, [parentZone, forumSlug]);

	const breadcrumbItems = React.useMemo(() => {
		if (!forum) return [];
		return createForumBreadcrumbs.smartForum(parentForum, forum);
	}, [parentZone, forum, parentForum]);

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
		<div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
			<Wide className="py-8">
				{/* Breadcrumbs */}
				<div className="mb-6">
					<ForumBreadcrumbs items={breadcrumbItems} />
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8">
					{/* Main Content */}
					<div className="space-y-6">
						{/* Forum Header */}
						{forum && (
							<ForumHeader forum={forum} variant="detailed" onNewThread={handleNewThread} />
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
							<MyBBThreadList
								threads={getDemoThreads(forum.slug)}
								forumName={forum.name}
								forumSlug={forum.slug}
							/>
						) : forum?.id ? (
							<ThreadList
								forumId={toForumId(forum.id)}
								forumSlug={forum.slug}
								availableTags={[]}
								filters={filters}
								displayMode="table"
							/>
						) : (
							<div className="text-center py-8 text-zinc-400">
								{'No forum data available'}
							</div>
						)}
					</div>

					{/* Right Sidebar */}
					<aside className="space-y-6">
						{parentZone && forum?.id && (
							<DynamicSidebar structureId={toStructureId(forum.id)} zoneSlug={parentZone.slug} />
						)}
					</aside>
				</div>
			</Wide>
		</div>
	);
});

ForumPage.displayName = 'ForumPage';

export default ForumPage;
