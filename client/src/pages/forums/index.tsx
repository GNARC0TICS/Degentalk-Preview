import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, TrendingUp, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/layout/primitives';
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';

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

export default function ForumsIndexPage() {
	const navigate = useNavigate();
	const context = useForumStructure();
	const [selectedCategory, setSelectedCategory] = useState<'all' | 'featured' | 'general'>('all');

	// The context unfortunately still uses 'zones' for top-level forums
	// We need to work with this until we can refactor the context
	const topLevelForums = context.zones || [];
	const childForums = context.forums || {};
	const allForumsById = context.forumsById || {};
	const loading = context.isLoading;
	const error = context.error;

	// For now, display top-level forums only
	const allForums = topLevelForums;

	if (loading) {
		return (
			<Container className="py-8">
				<div className="animate-pulse space-y-6">
					<div className="space-y-4">
						<div className="h-10 bg-zinc-800 rounded-lg w-1/3" />
						<div className="h-5 bg-zinc-800 rounded-lg w-2/3" />
					</div>
					<div className="flex gap-2">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="h-9 bg-zinc-800 rounded-lg w-24" />
						))}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="h-48 bg-zinc-800 rounded-lg" />
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

	return (
		<Container className="py-8">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4">
					<h1 className="text-3xl font-bold">Community Forums</h1>
					<p className="text-muted-foreground">
						Join the conversation in our vibrant community forums
					</p>
				</div>

				{/* Category Filter */}
				<div className="flex gap-2">
					<Button
						variant={selectedCategory === 'all' ? 'default' : 'outline'}
						onClick={() => setSelectedCategory('all')}
						size="sm"
					>
						All Forums
					</Button>
					<Button
						variant={selectedCategory === 'featured' ? 'default' : 'outline'}
						onClick={() => setSelectedCategory('featured')}
						size="sm"
					>
						<Star className="w-4 h-4 mr-1" />
						Featured
					</Button>
					<Button
						variant={selectedCategory === 'general' ? 'default' : 'outline'}
						onClick={() => setSelectedCategory('general')}
						size="sm"
					>
						General
					</Button>
				</div>

				{/* Forums Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredForums.map((forum) => (
						<Card
							key={forum.id}
							className={cn(
								'cursor-pointer transition-all hover:shadow-lg bg-zinc-900/50 border-zinc-800 hover:border-zinc-700',
								forum.isFeatured && 'ring-2 ring-yellow-500/20 border-yellow-500/30'
							)}
							onClick={() => navigate(`/forums/${forum.slug}`)}
						>
							<CardContent className="p-6">
								<div className="space-y-4">
									{/* Forum Header */}
									<div className="flex items-start justify-between">
										<div>
											<h3 className="font-semibold text-lg flex items-center gap-2">
												{forum.name}
												{forum.isFeatured && (
													<Star className="w-4 h-4 text-yellow-500 fill-current" />
												)}
											</h3>
											<p className="text-sm text-muted-foreground mt-1">
												{forum.description || 'Join the discussion'}
											</p>
										</div>
										<div
											className={cn(
												'w-10 h-10 rounded-lg flex items-center justify-center',
												getForumThemeClass(forum.theme?.colorTheme)
											)}
										>
											<MessageSquare className="w-5 h-5 text-white" />
										</div>
									</div>

									{/* Forum Stats */}
									<div className="grid grid-cols-3 gap-2 text-sm">
										<div className="flex flex-col">
											<span className="text-zinc-500 text-xs">Threads</span>
											<span className="font-semibold">{forum.stats?.totalThreads || 0}</span>
										</div>
										<div className="flex flex-col">
											<span className="text-zinc-500 text-xs">Posts</span>
											<span className="font-semibold">{forum.stats?.totalPosts || 0}</span>
										</div>
										<div className="flex flex-col">
											<span className="text-zinc-500 text-xs">Active</span>
											<span className="font-semibold">{forum.stats?.activeUsers || 0}</span>
										</div>
									</div>

									{/* Subforums Preview */}
									{forum.forums && forum.forums.length > 0 && (
										<div className="pt-2 border-t border-zinc-800">
											<p className="text-xs text-zinc-500 mb-2 font-medium">
												{forum.forums.length} subforum{forum.forums.length !== 1 ? 's' : ''}
											</p>
											<div className="flex flex-wrap gap-1">
												{forum.forums.slice(0, 3).map((subforum) => (
													<span
														key={subforum.id}
														className="text-xs bg-zinc-800/50 text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-800 transition-colors"
													>
														{subforum.name}
													</span>
												))}
												{forum.forums.length > 3 && (
													<span className="text-xs text-zinc-500">
														+{forum.forums.length - 3} more
													</span>
												)}
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Empty State */}
				{filteredForums.length === 0 && (
					<div className="text-center py-12">
						<MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">No forums found in this category.</p>
					</div>
				)}
			</div>
		</Container>
	);
}
