import React, { useState, memo } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, TrendingUp, Clock, MessageSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import { ResponsiveForumLayout } from '@/components/forum/layouts';
import { ThreadFilters, type ThreadFiltersState } from '@/components/forum/ThreadFilters';
import {
	ForumBreadcrumbs,
	createForumBreadcrumbs,
	type BreadcrumbItem
} from '@/components/navigation/ForumBreadcrumbs';
import ThreadList from '@/features/forum/components/ThreadList';

export interface ForumPageProps {
	className?: string;
}

const ForumPage = memo(({ className }: ForumPageProps) => {
	const params = useParams<{ slug?: string }>();
	const [location] = useLocation();
	const forumSlug = params?.slug;
	const { getForum, zones, forums, isUsingFallback } = useForumStructure();

	// State management
	const [layout, setLayout] = useState<'grid' | 'list' | 'masonry'>('list');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState('latest');
	const [showFilters, setShowFilters] = useState(false);

	// Get forum data with error handling
	let forum = null as ReturnType<typeof getForum> | null;
	try {
		forum = forumSlug ? getForum(forumSlug) : null;
	} catch (error) {
		console.error('Error retrieving forum data:', error);
		throw error as Error; // bubble up to error boundary
	}

	const parentZone = zones?.find((zone) => zone.forums.some((f) => f.slug === forumSlug));

	// Default filters for ThreadList
	const [filters, setFilters] = useState<ThreadFiltersState>({
		sortBy: sortBy as any,
		tags: [],
		prefixId: null,
		solved: null,
		bookmarked: false,
		mine: false,
		replied: false,
		q: searchQuery
	});

	// Update filters when search or sort changes
	React.useEffect(() => {
		setFilters((prev) => ({
			...prev,
			sortBy: sortBy as any,
			q: searchQuery
		}));
	}, [sortBy, searchQuery]);

	const handleFiltersChange = (newFilters: ThreadFiltersState) => {
		setFilters(newFilters);
	};

	const breadcrumbItems = React.useMemo(() => {
		return createForumBreadcrumbs.forumInZone(parentZone ?? null, forum ?? null);
	}, [parentZone, forum]);

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
			onFiltersChange={handleFiltersChange}
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
			breadcrumbs={<ForumBreadcrumbs items={breadcrumbItems} />}
			header={forumHeader}
			filters={showFilters ? threadFilters : undefined}
			showFilters={showFilters}
			className={className}
		>
			{forum?.id && !isUsingFallback ? (
				<ThreadList
					forumId={forum.id}
					forumSlug={forum.slug}
					availableTags={[]}
					filters={filters}
				/>
			) : (
				<div className="text-center py-8 text-zinc-400">
					{isUsingFallback ? 'Forum data is loading...' : 'No forum data available'}
				</div>
			)}
		</ResponsiveForumLayout>
	);
});

ForumPage.displayName = 'ForumPage';

export default ForumPage;
