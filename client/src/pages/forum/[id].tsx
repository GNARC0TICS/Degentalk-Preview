import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import { CategoryCard } from '@/components/forum/category-card';
import { BreadcrumbNav } from '@/components/forum/breadcrumb-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Info, TrendingUp } from 'lucide-react';

interface Forum {
	id: number;
	name: string;
	description: string | null;
	slug: string;
	isLocked: boolean;
	isVip: boolean;
}

interface Category {
	id: number;
	name: string;
	description: string | null;
	slug: string;
	isLocked: boolean;
	isVip: boolean;
	threadCount: number;
	postCount: number;
	lastActivity?: Date | string;
	parentId: number;
}

export default function ForumPage() {
	const { id } = useParams();
	const forumId = Number(id);

	const [sortBy, setSortBy] = useState<'position' | 'activity' | 'popularity'>('position');

	const { data: forum, isLoading: isLoadingForum } = useQuery<Forum>({
		queryKey: [`/api/forums/${forumId}`],
		enabled: !isNaN(forumId)
	});

	const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
		queryKey: [`/api/forums/${forumId}/categories`],
		enabled: !isNaN(forumId)
	});

	const sortedCategories = [...categories].sort((a, b) => {
		if (sortBy === 'activity' && a.lastActivity && b.lastActivity) {
			return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
		} else if (sortBy === 'popularity') {
			return b.threadCount - a.threadCount;
		}
		return 0; // Default order by position
	});

	if (isNaN(forumId)) {
		return (
			<div className="container max-w-6xl mx-auto py-6 px-4">
				<Card className="bg-zinc-900/60 border border-zinc-800">
					<CardContent className="p-6 text-center">
						<Info className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
						<p className="text-zinc-400">Invalid forum ID.</p>
						<Button variant="default" className="mt-4" asChild>
							<a href="/forum">Return to Forum</a>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container max-w-6xl mx-auto py-6 px-4">
			<Helmet>
				<title>{forum?.name ? `${forum.name} | DegenTalk Forums` : 'Loading Forum...'}</title>
			</Helmet>

			<div className="mb-6">
				{isLoadingForum ? (
					<div className="animate-pulse">
						<div className="h-8 bg-zinc-800 rounded-md w-1/3 mb-3" />
						<div className="h-4 bg-zinc-800 rounded-md w-2/3" />
					</div>
				) : forum ? (
					<>
						<h1 className="text-3xl font-bold mb-2 text-zinc-100">{forum.name}</h1>
						<BreadcrumbNav
							items={[
								{ label: 'Forum', href: '/forum' },
								{ label: forum.name, href: `/forum/${forum.id}` }
							]}
						/>
						{forum.description && <p className="text-zinc-400 mt-2">{forum.description}</p>}
					</>
				) : (
					<div className="text-zinc-400">Forum not found.</div>
				)}
			</div>

			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-zinc-200">Categories</h2>

					<div className="flex space-x-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSortBy('position')}
							className={sortBy === 'position' ? 'bg-zinc-800' : ''}
						>
							Default
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSortBy('activity')}
							className={sortBy === 'activity' ? 'bg-zinc-800' : ''}
						>
							<ArrowUpDown className="h-4 w-4 mr-1" />
							Activity
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSortBy('popularity')}
							className={sortBy === 'popularity' ? 'bg-zinc-800' : ''}
						>
							<TrendingUp className="h-4 w-4 mr-1" />
							Popularity
						</Button>
					</div>
				</div>

				{isLoadingCategories ? (
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, index) => (
							<Card key={index} className="bg-zinc-900/60 border border-zinc-800">
								<CardHeader className="p-4 animate-pulse">
									<div className="h-6 bg-zinc-800 rounded-md w-3/4" />
									<div className="h-4 bg-zinc-800 rounded-md w-1/2 mt-2" />
								</CardHeader>
								<CardContent className="p-4 animate-pulse">
									<div className="flex justify-between">
										<div className="h-4 bg-zinc-800 rounded-md w-1/4" />
										<div className="h-4 bg-zinc-800 rounded-md w-1/4" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div className="space-y-4">
						{sortedCategories.map((category) => (
							<CategoryCard
								key={category.id}
								id={category.id}
								slug={category.slug}
								name={category.name}
								description={category.description}
								threadCount={category.threadCount}
								postCount={category.postCount}
								lastActivity={category.lastActivity}
								isLocked={category.isLocked}
								isVip={category.isVip}
							/>
						))}

						{categories.length === 0 && !isLoadingCategories && (
							<Card className="bg-zinc-900/60 border border-zinc-800">
								<CardContent className="p-6 text-center">
									<Info className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
									<p className="text-zinc-400">No categories found in this forum.</p>
								</CardContent>
							</Card>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
