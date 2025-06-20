import React from 'react'; // Removed useState
import { useParams, Link } from 'wouter';
// import { useQuery } from '@tanstack/react-query'; // Removed
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedForum } from '@/contexts/ForumStructureContext'; // Removed MergedZone as it's inferred from useForumStructure or not directly typed here
// import ThreadCard from '@/components/forum/ThreadCard'; // Removed
// import { Pagination } from '@/components/ui/pagination'; // Removed
// import { getQueryFn } from '@/lib/queryClient'; // Removed
// import type { ThreadsApiResponse, ApiThread } from '@/features/forum/components/ThreadList'; // Removed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
// import { Badge } from '@/components/ui/badge';
import {
	MessageSquare,
	FileText,
	ChevronRight,
	Home,
	AlertCircle,
	Plus,
	Users
} from 'lucide-react';
// import { cn } from '@/lib/utils'; // Removed
import { ForumListItem } from '@/features/forum/components/ForumListItem';

const ZonePage: React.FC = () => {
	const params = useParams<{ slug: string }>();
	const slug = params?.slug;
	const { getZone, isLoading, error: contextError } = useForumStructure();
	// const [currentPage, setCurrentPage] = useState(1); // Removed
	// const threadsPerPage = 20; // Removed

	if (!slug) {
		return <NotFound />;
	}

	const zone = getZone(slug);

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

	const displayName = zone.name;
	const displayDescription = zone.description;
	const theme = zone.theme;

	// --- SEO: set document title ---
	React.useEffect(() => {
		if (displayName) {
			document.title = `${displayName} | Zones | Degentalk`;
		}
	}, [displayName]);

	return (
		<div className="min-h-screen bg-black">
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

				<div className="relative z-10 container mx-auto px-4 py-8">
					{/* Breadcrumbs */}
					<nav className="flex items-center space-x-2 text-sm text-zinc-400 mb-6">
						<Link href="/">
							<a className="flex items-center hover:text-white transition-colors">
								<Home className="w-4 h-4 mr-1" />
								Home
							</a>
						</Link>
						<ChevronRight className="w-4 h-4" />
						<span className="text-white font-medium">{displayName}</span>
					</nav>

					{/* Zone Header */}
					<div className="flex items-start gap-6">
						{theme?.icon && (
							<div className="flex-shrink-0">
								{theme.icon.startsWith('/') || theme.icon.startsWith('http') ? (
									<img
										src={theme.icon}
										alt={`${displayName} icon`}
										className="w-20 h-20 rounded-xl shadow-lg"
									/>
								) : (
									<div
										className="w-20 h-20 rounded-xl shadow-lg flex items-center justify-center text-4xl"
										style={{ backgroundColor: theme?.color || '#1f2937' }}
									>
										{theme.icon}
									</div>
								)}
							</div>
						)}

						<div className="flex-1">
							<h1 className="text-4xl font-bold text-white mb-2">{displayName}</h1>
							{displayDescription && (
								<p className="text-lg text-zinc-300 mb-4">{displayDescription}</p>
							)}

							<div className="flex items-center gap-6 text-sm">
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

						<Link href="/threads/create">
							<Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
								<Plus className="w-4 h-4 mr-2" />
								New Thread
							</Button>
						</Link>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
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

						{/* Quick Actions */}
						<Card className="bg-zinc-900 border-zinc-800">
							<CardHeader>
								<CardTitle className="text-lg text-white">Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Link href="/threads/create">
									<Button className="w-full justify-start" variant="outline">
										<Plus className="w-4 h-4 mr-2" />
										Create Thread
									</Button>
								</Link>
								<Link href="/zones">
									<Button className="w-full justify-start" variant="outline">
										<Users className="w-4 h-4 mr-2" />
										Browse All Zones
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

// Helper Components
const NotFound: React.FC = () => (
	<div className="min-h-screen bg-black flex items-center justify-center">
		<div className="text-center">
			<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
			<h1 className="text-3xl font-bold text-white mb-2">Zone Not Found</h1>
			<p className="text-zinc-400 mb-6">The zone you're looking for doesn't exist.</p>
			<Link href="/">
				<Button variant="outline">Return Home</Button>
			</Link>
		</div>
	</div>
);

const LoadingState: React.FC = () => (
	<div className="min-h-screen bg-black">
		<div className="container mx-auto px-4 py-8">
			<Skeleton className="h-8 w-48 mb-6 bg-zinc-900" />
			<Skeleton className="h-64 w-full mb-8 bg-zinc-900" />
			<div className="space-y-4">
				{[...Array(5)].map((_, i) => (
					<Skeleton key={i} className="h-24 bg-zinc-900" />
				))}
			</div>
		</div>
	</div>
);

const ErrorState: React.FC<{ error: Error }> = ({ error }) => (
	<div className="min-h-screen bg-black flex items-center justify-center">
		<Card className="bg-red-900/20 border-red-800 max-w-md">
			<CardContent className="p-8 text-center">
				<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
				<h2 className="text-2xl font-bold text-white mb-2">Error Loading Zone</h2>
				<p className="text-red-400">{error.message}</p>
			</CardContent>
		</Card>
	</div>
);

export default ZonePage;
