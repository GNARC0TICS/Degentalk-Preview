import React, { useState, memo, useCallback } from 'react';
import { useParams } from 'wouter';
import { Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import { useForumFilters } from '@/hooks/useForumFilters';
import { Wide } from '@/layout/primitives';
import { ThreadFilters } from '@/components/forum/ThreadFilters';
import { ForumBreadcrumbs, createForumBreadcrumbs } from '@/components/navigation/ForumBreadcrumbs';
import ThreadList from '@/features/forum/components/ThreadList';
import { DynamicSidebar } from '@/components/forum/sidebar';
import { SiteFooter } from '@/components/footer';
import { ForumHeader } from '@/components/forum/ForumHeader';

export interface ForumPageProps {
	className?: string;
}

const ForumPage = memo(({ className }: ForumPageProps) => {
	const params = useParams<{ zoneSlug?: string; forumSlug?: string; subforumSlug?: string }>();
	// Use subforum slug if present, otherwise forum slug
	const forumSlug = params?.subforumSlug || params?.forumSlug;
	const zoneSlug = params?.zoneSlug;
	const { getForum, zones, isUsingFallback } = useForumStructure();

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
		forum = forumSlug ? getForum(forumSlug) : null;

		// If we have a subforum, find its parent
		if (params?.subforumSlug && params?.forumSlug) {
			parentForum = getForum(params.forumSlug);
		}
	} catch (error) {
		console.error('Error retrieving forum data:', error);
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
		// Navigate to create thread page with proper hierarchy
		if (parentZone && forumSlug) {
			const basePath = params?.subforumSlug
				? `/zones/${parentZone.slug}/${params.forumSlug}/${params.subforumSlug}`
				: `/zones/${parentZone.slug}/${forumSlug}`;
			window.location.href = `${basePath}/create`;
		}
	}, [parentZone, forumSlug, params]);

	const breadcrumbItems = React.useMemo(() => {
		if (!parentZone || !forum) return [];
		return createForumBreadcrumbs.forumInZone(parentZone, forum, parentForum ?? undefined);
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
						{forum?.id && !isUsingFallback ? (
							<ThreadList
								forumId={forum.id as number}
								forumSlug={forum.slug}
								availableTags={[]}
								filters={filters}
								displayMode="table"
							/>
						) : (
							<div className="text-center py-8 text-zinc-400">
								{isUsingFallback ? 'Forum data is loading...' : 'No forum data available'}
							</div>
						)}
					</div>

					{/* Right Sidebar */}
					<aside className="space-y-6">
						{parentZone && (
							<DynamicSidebar structureId={forum?.id as number} zoneSlug={parentZone.slug} />
						)}
					</aside>
				</div>
			</Wide>
			<SiteFooter />
		</div>
	);
});

ForumPage.displayName = 'ForumPage';

export default ForumPage;
