import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForumStructure } from '@/features/forum/contexts/ForumStructureContext';
import type { MergedForum } from '@/features/forum/contexts/ForumStructureContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	MessageSquare,
	FileText,
	ChevronRight,
	Home,
	AlertCircle,
	Plus,
	Users,
	Map
} from 'lucide-react';
import { ForumListItem } from '@/features/forum/components/ForumListItem';
import { Wide } from '@/layout/primitives/Wide';
import { ForumBreadcrumbs, type BreadcrumbItem } from '@/components/navigation/ForumBreadcrumbs';
import { getForumSpacing, getForumLayout } from '@/utils/spacing-constants';

const ZonePage: React.FC = () => {
	const params = useParams<{ slug: string }>();
	const slug = params?.slug;
	const { getZone, isLoading, error: contextError } = useForumStructure();

	const zone = slug ? getZone(slug) : null;
	const displayName = zone?.name;
	const displayDescription = zone?.description;
	const theme = zone?.theme;

	// --- SEO: set document title ---
	React.useEffect(() => {
		if (displayName) {
			document.title = `${displayName} | Zones | Degentalk`;
		}
	}, [displayName]);

	if (slug === 'general') {
		// Navigate to forums page with general section
		React.useEffect(() => {
			window.location.href = '/forums#general-forums';
		}, []);
		return <LoadingState />;
	}

	if (!slug) {
		return <NotFound />;
	}

	// Handle loading/error states AFTER hooks
	if (isLoading) {
		return <LoadingState />;
	}

	if (contextError) {
		return <ErrorState error={contextError} />;
	}

	if (!zone) {
		return <NotFound />;
	}

	return (
		<div className={getForumLayout('page')}>
			{/* Hero Section with Theme */}
			<div
				className="relative overflow-hidden"
				style={{
					backgroundColor: theme?.color ? `${theme.color}20` : undefined
				}}
			>
				{theme?.bannerImage && (
					<div className="absolute inset-0 z-0">
						<img
							src={theme.bannerImage}
							alt={`${displayName} banner`}
							className="w-full h-full object-cover opacity-20"
						/>
					</div>
				)}

				<Wide className={`relative z-10 ${getForumSpacing('container')}`}>
					{/* Breadcrumbs - simplified: Home > Zone Name */}
					{slug !== 'general' && (
						<ForumBreadcrumbs
							items={
								[
									{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
									{ label: displayName || 'Zone', href: `/zones/${slug}` }
								] as BreadcrumbItem[]
							}
						/>
					)}

					{/* Zone Header */}
					<div className="flex flex-col sm:flex-row sm:items-start gap-6">
						<div className="flex items-start gap-4 flex-1">
							{theme?.icon && (
								<div className="flex-shrink-0">
									{theme.icon.startsWith('/') || theme.icon.startsWith('http') ? (
										<img
											src={theme.icon}
											alt={`${displayName} icon`}
											className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-lg"
										/>
									) : (
										<div
											className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-lg flex items-center justify-center text-3xl sm:text-4xl"
											style={{ backgroundColor: theme?.color || '#1f2937' }}
										>
											{theme.icon}
										</div>
									)}
								</div>
							)}

							<div className="flex-1">
								<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
									{displayName}
								</h1>
								{displayDescription && (
									<p className="text-base sm:text-lg text-zinc-300 mb-4">{displayDescription}</p>
								)}

								<div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
									<div className="flex items-center gap-2">
										<MessageSquare className="w-4 h-4 text-emerald-500" />
										<span className="text-zinc-400">
											<span className="font-semibold text-white">{zone.threadCount}</span> threads
										</span>
									</div>
									<div className="flex items-center gap-2">
										<FileText className="w-4 h-4 text-blue-500" />
										<span className="text-zinc-400">
											<span className="font-semibold text-white">{zone.postCount}</span> posts
										</span>
									</div>
								</div>
							</div>
						</div>

						{zone.forums && zone.forums.length > 0 && (
							<Button
								className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
								size="lg"
								onClick={() => {
									// Go to the first forum to create a thread
									const firstForum = zone.forums[0];
									window.location.href = `/forums/${firstForum.slug}/create`;
								}}
							>
								<Plus className="w-4 h-4 mr-2" />
								New Thread
							</Button>
						)}
					</div>
				</Wide>
			</div>

			<Wide className={getForumSpacing('container')}>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Forums Section */}
						{zone.forums && zone.forums.length > 0 ? (
							<Card className="bg-zinc-900 border-zinc-800">
								<CardHeader>
									<CardTitle className="text-xl text-white flex items-center gap-2">
										<Users className="w-5 h-5 text-emerald-500" />
										Forums in {displayName}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{/* Display forums directly under the zone */}
									{zone.forums.map((forum: MergedForum) => (
										<div
											key={`direct-${forum.slug}`}
											className="bg-zinc-800/50 rounded-lg overflow-hidden"
										>
											<ForumListItem
												forum={forum}
												href={`/forums/${forum.slug}`}
												parentZoneColor={theme?.color ?? undefined}
											/>
										</div>
									))}
								</CardContent>
							</Card>
						) : (
							<Card className="bg-zinc-900 border-zinc-800">
								<CardContent className="p-12 text-center">
									<Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
									<p className="text-zinc-400 text-lg">No forums found in this zone.</p>
									{/* Optionally, add a link to create a forum if applicable for admins */}
								</CardContent>
							</Card>
						)}

						{/* Threads Section - REMOVED */}
						{/* 
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-500" />
                Recent Threads
              </h2>
              ... (entire thread listing logic removed) ...
            </div>
            */}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Zone Stats */}
						<Card className="bg-zinc-900 border-zinc-800">
							<CardHeader>
								<CardTitle className="text-lg text-white">Zone Statistics</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-zinc-400">Total Forums</span>
									<span className="font-semibold text-white">{zone.forums.length}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-zinc-400">Total Threads</span>
									<span className="font-semibold text-white">{zone.threadCount}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-zinc-400">Total Posts</span>
									<span className="font-semibold text-white">{zone.postCount}</span>
								</div>
							</CardContent>
						</Card>

						{/* Quick Navigation */}
						<Card className="bg-zinc-900 border-zinc-800">
							<CardHeader>
								<CardTitle className="text-lg text-white">Quick Navigation</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Link to="/forums">
									<Button className="w-full justify-start" variant="outline">
										<Map className="w-4 h-4 mr-2" />
										Browse All Forums
									</Button>
								</Link>
								<Link to="/">
									<Button className="w-full justify-start" variant="outline">
										<Home className="w-4 h-4 mr-2" />
										Back to Homepage
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</Wide>
		</div>
	);
};

// Helper Components
const NotFound: React.FC = () => (
	<div className="min-h-screen bg-black flex items-center justify-center">
		<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
			<div className="text-center">
				<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
				<h1 className="text-3xl font-bold text-white mb-2">Zone Not Found</h1>
				<p className="text-zinc-400 mb-6">The zone you're looking for doesn't exist.</p>
				<Link to="/">
					<Button variant="outline">Return Home</Button>
				</Link>
			</div>
		</Wide>
	</div>
);

const LoadingState: React.FC = () => (
	<div className="min-h-screen bg-black">
		<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
			<div className="animate-pulse">
				<Skeleton className="h-8 w-48 mb-6 bg-zinc-900" />
				<Skeleton className="h-40 sm:h-64 w-full mb-8 bg-zinc-900" />
				<div className="space-y-4">
					{[...Array(5)].map((_, i) => (
						<Skeleton key={i} className="h-24 bg-zinc-900" />
					))}
				</div>
			</div>
		</Wide>
	</div>
);

const ErrorState: React.FC<{ error: Error }> = ({ error }) => (
	<div className="min-h-screen bg-black flex items-center justify-center">
		<Wide className="px-2 sm:px-4 py-6 sm:py-8 md:py-12">
			<Card className="bg-red-900/20 border-red-800 max-w-md mx-auto">
				<CardContent className="p-6 sm:p-8 text-center">
					<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
					<h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Error Loading Zone</h2>
					<p className="text-red-400 text-sm sm:text-base">{error.message}</p>
					<Button asChild variant="outline" className="mt-4">
						<Link to="/zones">Browse Zones</Link>
					</Button>
				</CardContent>
			</Card>
		</Wide>
	</div>
);

export default ZonePage;
