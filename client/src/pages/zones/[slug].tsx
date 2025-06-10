import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

// Import components
import { SiteFooter } from '@/components/layout/site-footer';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Import icons
import { AlertCircle, Folder, MessageSquare } from 'lucide-react';

// Import types
import { Link } from 'wouter';
import { ForumEntity } from '@/features/forum/hooks/useForumStructure';

export default function ZonePage() {
	// Get the slug from the route
	const [match, params] = useRoute<{ slug: string }>('/zones/:slug');
	const slug = params?.slug;

	// Fetch category data based on slug
	const {
		data: category,
		isLoading,
		isError,
		error
	} = useQuery<ForumEntity>({
		queryKey: [`/api/categories/${slug}`],
		queryFn: getQueryFn({ on401: 'returnNull' }),
		enabled: !!slug
	});

	// Generate breadcrumb items
	const breadcrumbItems = React.useMemo(() => {
		if (!category)
			return [
				{ label: 'Home', href: '/' },
				{ label: 'Forums', href: '/forums' }
			];

		return [
			{ label: 'Home', href: '/' },
			{ label: 'Forums', href: '/forums' },
			{ label: category.name, href: `/zones/${category.slug}` }
		];
	}, [category]);

	if (!match) {
		return <div>404 Not Found</div>;
	}

	return (
		<div className="min-h-screen bg-black">
			<main className="container mx-auto px-4 py-8">
				{/* Breadcrumbs */}
				<Breadcrumbs items={breadcrumbItems} className="mb-4" />

				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-96 w-full" />
					</div>
				) : isError ? (
					<div className="text-center py-12">
						<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<h2 className="text-xl font-bold text-white mb-2">Error Loading Category</h2>
						<p className="text-zinc-400">Could not load this category. Please try again later.</p>
					</div>
				) : category ? (
					<>
						{/* Category Header */}
						<Card className="mb-6 bg-zinc-900/60 border-zinc-800">
							<CardHeader>
								<CardTitle className="flex items-center text-2xl">
									<Folder className="h-6 w-6 mr-2 text-amber-500" />
									{category.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{category.description && (
									<p className="text-zinc-300 mb-4">{category.description}</p>
								)}
							</CardContent>
						</Card>

						{/* Child Forums List */}
						<div className="space-y-4">
							<h2 className="text-xl font-bold text-white mb-4">Forums in this Category</h2>

							{category.children && category.children.length > 0 ? (
								<div className="grid gap-4">
									{category.children.map((forum) => (
										<Link key={forum.id} href={`/forums/${forum.slug}`}>
											<Card className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all">
												<CardContent className="p-5">
													<div className="flex items-center mb-2">
														<MessageSquare className="h-5 w-5 mr-2 text-emerald-500" />
														<h3 className="text-lg font-semibold text-white">{forum.name}</h3>
													</div>

													{forum.description && (
														<p className="text-zinc-400 text-sm mb-3">{forum.description}</p>
													)}

													<div className="flex items-center text-xs text-zinc-500">
														<span className="mr-4">{forum.threadCount || 0} threads</span>
														<span>{forum.postCount || 0} posts</span>
													</div>
												</CardContent>
											</Card>
										</Link>
									))}
								</div>
							) : (
								<Card className="bg-zinc-900/60 border-zinc-800 p-6 text-center">
									<p className="text-zinc-400">No forums available in this category.</p>
								</Card>
							)}
						</div>
					</>
				) : (
					<div className="text-center py-12">
						<AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
						<h2 className="text-xl font-bold text-white mb-2">Category Not Found</h2>
						<p className="text-zinc-400">
							The category you're looking for doesn't exist or has been moved.
						</p>
					</div>
				)}
			</main>

			<SiteFooter />
		</div>
	);
}
