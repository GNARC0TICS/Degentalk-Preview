import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { getQueryFn } from '@/lib/queryClient';

// Import components
import ThreadList from '@/features/forum/components/ThreadList'; // Changed to default import
import { SiteFooter } from '@/components/layout/site-footer';
// import { Breadcrumbs } from '@/components/navigation/breadcrumbs'; // Removed incorrect import
import { ForumHeader } from '@/features/forum/components/ForumHeader';

// Import UI components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Import icons
import { PlusCircle, AlertCircle } from 'lucide-react';

// Import utilities
import { getThemeClass, isPrimaryZone } from '@/utils/forum-routing-helper';

// Import types
// import { ForumEntity } from '@/features/forum/hooks/useForumStructure'; // Old import
import type { MergedForum } from '@/contexts/ForumStructureContext'; // New import

import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function ForumPage() {
	// Get the slug from the route
	const [match, params] = useRoute<{ slug: string }>('/forums/:slug');
	const slug = params?.slug;

	// Fetch forum data based on slug
	const {
		data: forum,
		isLoading,
		isError,
		error
	} = useQuery<MergedForum>({ // Use MergedForum type
		queryKey: [`/api/forums/${slug}`],
		queryFn: getQueryFn({ on401: 'returnNull' }),
		enabled: !!slug
	});

	// Determine if this is a Primary Zone or a Child Forum
	const isPrimary = forum ? isPrimaryZone({ 
		...forum, 
		description: forum.description === null ? undefined : forum.description,
		icon: forum.icon === null ? undefined : forum.icon,
		colorTheme: forum.colorTheme === null ? undefined : forum.colorTheme
	}) : false;

	// Get the appropriate theme class
	const themeClass = forum?.colorTheme ? `forum-theme-${forum.colorTheme}` : '';

	// Generate breadcrumb items
	const breadcrumbItems = React.useMemo(() => {
		if (!forum)
			return [
				{ label: 'Home', href: '/' },
				{ label: 'Forums', href: '/forums' }
			];

		const items = [
			{ label: 'Home', href: '/' },
			{ label: 'Forums', href: '/forums' }
		];

		if (isPrimary) {
			// Primary Zone (direct link from home)
			items.push({ label: forum.name, href: `/forums/${forum.slug}` });
		} else if (forum.parentId) {
			// Child Forum (within a category)
			// We'd need to fetch the parent category name here
			// This is a placeholder - ideally we'd have the category info already
			items.push(
				{ label: 'Category', href: `/zones/${forum.parentId}` },
				{ label: forum.name, href: `/forums/${forum.slug}` }
			);
		} else {
			// Fallback
			items.push({ label: forum.name, href: `/forums/${forum.slug}` });
		}

		return items;
	}, [forum]);

	if (!match) {
		return <div>404 Not Found</div>;
	}

	return (
		<div className={`min-h-screen bg-black ${themeClass}`}>
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
											<a href={item.href}>{item.label}</a>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
								{index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
							</React.Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>

				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-96 w-full" />
					</div>
				) : isError ? (
					<div className="text-center py-12">
						<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h2 className="text-xl font-bold text-white mb-2">Error Loading Forum</h2>
						<p className="text-zinc-400">Could not load this forum. Please try again later.</p>
					</div>
				) : forum ? (
					<>
						{/* Forum Header */}
						<ForumHeader forum={forum} isPrimaryZone={isPrimary} />

						{/* Action Button */}
						<div className="flex justify-end mb-6">
							<Button className="gap-2">
								<PlusCircle className="h-4 w-4" />
								New Thread
							</Button>
						</div>

						{/* Thread List */}
						<ThreadList forumId={forum.id} forumSlug={forum.slug} />
					</>
				) : (
					<div className="text-center py-12">
						<AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
						<h2 className="text-xl font-bold text-white mb-2">Forum Not Found</h2>
						<p className="text-zinc-400">
							The forum you're looking for doesn't exist or has been moved.
						</p>
					</div>
				)}
			</main>

			<SiteFooter />
		</div>
	);
}
