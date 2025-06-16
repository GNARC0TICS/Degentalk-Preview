import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ForumStructureProvider, useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedZone, MergedForum } from '@/contexts/ForumStructureContext';
import ThreadCard from '@/components/forum/ThreadCard';
import { Pagination } from '@/components/ui/pagination';
import { getQueryFn } from '@/lib/queryClient';
import type { ThreadsApiResponse, ApiThread } from '@/features/forum/components/ThreadList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  Home,
  AlertCircle,
  Plus,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ForumListItem } from '@/features/forum/components/ForumListItem';

const ZonePage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { getZone, zones, isLoading, error: contextError } = useForumStructure();
  const [currentPage, setCurrentPage] = useState(1);
  const threadsPerPage = 20;

  if (!slug) {
    return <NotFound />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (contextError) {
    return <ErrorState error={contextError} />;
  }

  const zone = getZone(slug);
  
  // Also check if this is actually a category (not a zone)
  const isCategory = !zone && zones.some(z => 
    z.forums.some(f => f.slug === slug)
  );

  if (!zone && !isCategory) {
    return <NotFound />;
  }

  // If it's a category, get all forums with this parent
  const categoryForums = isCategory ? 
    zones.flatMap(z => z.forums).filter(f => f.parentForumSlug === slug) : 
    zone?.forums || [];

  const displayName = zone?.name || slug;
  const displayDescription = zone?.description;
  const theme = zone?.theme;

  // For categories, we need to aggregate threads from all child forums
  const forumIds = isCategory ? 
    categoryForums.map(f => f.id).filter(id => id > 0) :
    zone?.forums.map(f => f.id).filter(id => id > 0) || [];

  // Fetch threads - for now just use the first forum ID since backend doesn't support multiple
  // TODO: Update backend to support multiple categoryIds or create zone-specific endpoint
  const primaryForumId = forumIds[0];
  
  const {
    data: threadsResponse,
    isLoading: isLoadingThreads,
    error: threadsError,
  } = useQuery<ThreadsApiResponse | null, Error>({
    queryKey: [`/api/forum/threads`, primaryForumId, currentPage, threadsPerPage],
    queryFn: async () => {
      if (!primaryForumId) return null;
      
      // Use single categoryId for now
      const url = `/api/forum/threads?categoryId=${primaryForumId}&page=${currentPage}&limit=${threadsPerPage}&sortBy=latest`;
      
      const fetcher = getQueryFn<ThreadsApiResponse>({ on401: 'returnNull' });
      try {
        const response = await fetcher({ queryKey: [url], meta: undefined } as any);
        return response;
      } catch (e) {
        console.error(`Error fetching threads for zone/category ${slug}:`, e);
        throw e;
      }
    },
    enabled: primaryForumId > 0,
    staleTime: 1 * 60 * 1000,
  });

  const threads = threadsResponse?.threads || [];
  const pagination = threadsResponse?.pagination || {
    page: 1,
    limit: threadsPerPage,
    totalThreads: 0,
    totalPages: 0,
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Theme */}
      <div 
        className="relative overflow-hidden"
        style={{
          backgroundColor: theme?.color ? `${theme.color}20` : undefined,
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
                    <span className="font-semibold text-white">{zone?.threadCount || 0}</span> threads
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-zinc-400">
                    <span className="font-semibold text-white">{zone?.postCount || 0}</span> posts
                  </span>
                </div>
                {zone?.hasXpBoost && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {zone.boostMultiplier}x XP Boost
                  </Badge>
                )}
              </div>
            </div>

            <Link href="/threads/create">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
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
            {(zone?.forums || categoryForums).length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Forums
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(zone?.forums || categoryForums).map((forum: MergedForum) => (
                    <div key={forum.slug} className="bg-zinc-800/50 rounded-lg overflow-hidden">
                      <ForumListItem 
                        forum={forum}
                        href={`/forums/${forum.slug}`}
                        parentZoneColor={zone?.color}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Threads Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-500" />
                Recent Threads
              </h2>

              {isLoadingThreads ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 bg-zinc-900" />
                  ))}
                </div>
              ) : threadsError ? (
                <Card className="bg-red-900/20 border-red-800">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-400">Failed to load threads</p>
                    <p className="text-sm text-zinc-500 mt-1">{threadsError.message}</p>
                  </CardContent>
                </Card>
              ) : threads.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400 text-lg mb-4">No threads yet</p>
                    <Link href="/threads/create">
                      <Button variant="outline" className="border-emerald-600 text-emerald-500 hover:bg-emerald-600/10">
                        Create the first thread
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {threads.map((thread: ApiThread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                  ))}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                    showSummary={true}
                    totalItems={pagination.totalThreads}
                    pageSize={threadsPerPage}
                  />
                </div>
              )}
            </div>
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
                  <span className="font-semibold text-white">{(zone?.forums || categoryForums).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Threads</span>
                  <span className="font-semibold text-white">{zone?.threadCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Posts</span>
                  <span className="font-semibold text-white">{zone?.postCount || 0}</span>
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

const ZonePageWithProvider: React.FC = () => (
  <ForumStructureProvider>
    <ZonePage />
  </ForumStructureProvider>
);

export default ZonePageWithProvider;
