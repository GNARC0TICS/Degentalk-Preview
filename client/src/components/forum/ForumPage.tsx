import React, { useState, memo } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, TrendingUp, Clock, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { API_ROUTES } from '@/constants/apiRoutes';

import { ResponsiveForumLayout, AdaptiveForumGrid } from '@/components/forum/layouts';
import ThreadCard from '@/components/forum/ThreadCard';
import CryptoEngagementBar from '@/components/forum/enhanced/CryptoEngagementBar';
import QuickReactions from '@/components/forum/enhanced/QuickReactions';
import MobileForumNavigation from '@/components/forum/enhanced/MobileForumNavigation';
import { ThreadFilters } from '@/components/forum/ThreadFilters';
import { BreadcrumbNav } from '@/components/forum/breadcrumb-nav';

export interface ForumPageProps {
	className?: string;
}

interface ThreadData {
	id: string;
	title: string;
	slug: string;
	excerpt?: string;
	createdAt: string;
	lastPostAt?: string;
	viewCount: number;
	postCount: number;
	isSticky?: boolean;
	isLocked?: boolean;
	isHot?: boolean;
	hotScore?: number;
	user: {
		id: string;
		username: string;
		avatarUrl?: string;
		reputation?: number;
		isVerified?: boolean;
	};
	zone: {
		name: string;
		slug: string;
		colorTheme: string;
	};
	tags?: Array<{
		id: number;
		name: string;
		color?: string;
	}>;
	prefix?: {
		name: string;
		color: string;
	};
	engagement?: {
		totalTips: number;
		uniqueTippers: number;
		bookmarks: number;
		momentum: 'bullish' | 'bearish' | 'neutral';
		reputationScore?: number;
		qualityScore?: number;
		hotScore?: number;
	};
	reactions?: Array<{
		id: string;
		type: string;
		emoji: string;
		label: string;
		count: number;
		hasReacted: boolean;
		color: string;
		bgColor: string;
		borderColor: string;
	}>;
}

const ForumPage = memo(({ className }: ForumPageProps) => {
	const params = useParams<{ slug?: string }>();
	const [location] = useLocation();
	const forumSlug = params?.slug;
	const { getForum, zones } = useForumStructure();

	// State management
	const [layout, setLayout] = useState<'grid' | 'list' | 'masonry'>('list');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState('latest');
	const [showFilters, setShowFilters] = useState(false);

	// Get forum data
	const forum = forumSlug ? getForum(forumSlug) : null;
	const parentZone = zones?.find((zone) => zone.forums.some((f) => f.slug === forumSlug));

	// Fetch threads data
	const { data: threads = [], isLoading } = useQuery({
		queryKey: [API_ROUTES.forums.threadsByForum(forum?.id ?? 'none'), sortBy, searchQuery],
		queryFn: async () => {
			if (!forum?.id) return [];
			const response = await apiRequest<ThreadData[]>({
				url: API_ROUTES.forums.threadsByForum(forum.id),
				method: 'GET',
				params: { sort: sortBy, search: searchQuery }
			});
			return response || [];
		},
		enabled: !!forum?.id
	});

	// Enhanced thread rendering with engagement
	const renderThread = (thread: ThreadData, index: number) => (
		<motion.div
			key={thread.id}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
			className="space-y-3"
		>
			<ThreadCard
				thread={thread}
				variant={layout === 'grid' ? 'compact' : 'default'}
				onTip={(threadId, amount) => console.log('Tip thread:', threadId, amount)}
				onBookmark={(threadId) => console.log('Bookmark thread:', threadId)}
			/>

			{thread.engagement && (
				<CryptoEngagementBar
					engagement={thread.engagement}
					onTip={(amount) => console.log('Tip amount:', amount)}
					onBookmark={() => console.log('Bookmark')}
					showDetailed={false}
				/>
			)}

			{thread.reactions && thread.reactions.length > 0 && (
				<QuickReactions
					reactions={thread.reactions}
					onReact={(type) => console.log('React:', type)}
					compact={layout === 'compact'}
					showTipIntegration={false}
				/>
			)}
		</motion.div>
	);

	const breadcrumbItems = [
		...(parentZone
			? [
					{
						label: parentZone.name,
						href: `/zones/${parentZone.slug}`,
						icon: <span className="text-lg">{parentZone.icon}</span>
					}
				]
			: []),
		...(forum ? [{ label: forum.name, href: `/forums/${forum.slug}` }] : [])
	];

	const sortOptions = [
		{ value: 'latest', label: 'Latest Activity' },
		{ value: 'popular', label: 'Most Popular' },
		{ value: 'trending', label: 'Trending' },
		{ value: 'hot', label: 'Hot Threads' },
		{ value: 'tips', label: 'Most Tipped' },
		{ value: 'oldest', label: 'Oldest First' }
	];

	const forumHeader = forum && (
		<div className="space-y-4">
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						{forum.theme?.icon && (
							<div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center text-2xl">
								{forum.theme.icon}
							</div>
						)}
						<div>
							<h1 className="text-3xl font-bold text-white">{forum.name}</h1>
							<p className="text-zinc-400">{forum.description}</p>
						</div>
					</div>
					<div className="flex items-center gap-4 text-sm text-zinc-400">
						<div className="flex items-center gap-1">
							<MessageSquare className="w-4 h-4" />
							<span>{forum.threadCount} threads</span>
						</div>
						<div className="flex items-center gap-1">
							<span>{forum.postCount} posts</span>
						</div>
					</div>
				</div>
				<Button className="bg-emerald-600 hover:bg-emerald-700">
					<Plus className="w-4 h-4 mr-2" />
					New Thread
				</Button>
			</div>
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
					<Input
						placeholder={`Search ${forum.name}...`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 bg-zinc-800/50 border-zinc-700/50"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className="cursor-pointer hover:bg-zinc-700/50"
						onClick={() => setSortBy('hot')}
					>
						<TrendingUp className="w-3 h-3 mr-1" />
						Hot
					</Badge>
					<Badge
						variant="outline"
						className="cursor-pointer hover:bg-zinc-700/50"
						onClick={() => setSortBy('latest')}
					>
						<Clock className="w-3 h-3 mr-1" />
						Latest
					</Badge>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setShowFilters(!showFilters)}
					className="text-zinc-400 hover:text-white"
				>
					<Filter className="w-4 h-4 mr-2" />
					Filters
				</Button>
			</div>
		</div>
	);

	const threadFilters = (
		<ThreadFilters
			forumSlug={forumSlug || ''}
			availableTags={[]}
			availablePrefixes={[]}
			onFiltersChange={(filters) => console.log('Filters changed:', filters)}
		/>
	);

	if (!forum) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-white mb-4">Forum Not Found</h1>
					<p className="text-zinc-400 mb-6">The forum you're looking for doesn't exist.</p>
					<Button onClick={() => window.history.back()}>Go Back</Button>
				</div>
			</div>
		);
	}

	return (
		<ResponsiveForumLayout
			layout={layout}
			onLayoutChange={setLayout}
			breadcrumbs={<BreadcrumbNav items={breadcrumbItems} />}
			header={forumHeader}
			filters={showFilters ? threadFilters : undefined}
			showFilters={showFilters}
			className={className}
		>
			<AdaptiveForumGrid
				items={threads}
				renderItem={renderThread}
				layout={layout}
				columns={{
					mobile: 1,
					tablet: layout === 'grid' ? 2 : 1,
					desktop: layout === 'grid' ? 3 : 1,
					large: layout === 'grid' ? 4 : 1
				}}
				virtualized={threads.length > 20}
				estimateSize={layout === 'compact' ? 200 : 300}
				onLayoutChange={setLayout}
				sortOptions={sortOptions}
				onSortChange={setSortBy}
				currentSort={sortBy}
				isLoading={isLoading}
				loadingSkeletons={8}
			/>
		</ResponsiveForumLayout>
	);
});

ForumPage.displayName = 'ForumPage';

export default ForumPage;
