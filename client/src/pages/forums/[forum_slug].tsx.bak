import React, { useState, useEffect } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { ForumCategoryWithStats } from '@shared/types';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { 
  Home, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  LayoutGrid,
  Flame,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { SiteFooter } from '@/components/layout/site-footer';
import { ForumGuidelines } from '@/components/forum/forum-guidelines';
import { ForumSearch } from '@/components/forum/forum-search';
import { ThreadList } from '@/features/forum/components/ThreadList';
import { CreateThreadButton } from '@/features/forum/components/CreateThreadButton';
import { useForumCategory, useThreads } from '@/features/forum/hooks/useForumQueries';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ForumDetailPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [, setLocation] = useLocation();
  
  const [match, params] = useRoute('/forums/:slug');
  const forumSlug = params?.slug || '';
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'pinned' | 'solved'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  // Step 1: Fetch forum details by slug
  const { 
    data: forum,
    isLoading: isLoadingForum,
    isError: isErrorForum,
    error: errorForum
  } = useForumCategory(forumSlug);

  // Step 2: Fetch threads for the forum, enabled only when forum.id is available
  const { 
    data: threadsData,
    isLoading: isLoadingThreads,
    isError: isErrorThreads,
    error: errorThreads
  } = useThreads({
    categoryId: forum?.id,
    page: currentPage,
    limit: pageSize,
    sortBy,
    search: searchQuery,
  }, !isLoadingForum && !!forum?.id);

  const isLoading = isLoadingForum || (!!forumSlug && !forum && !isErrorForum) || (!!forum && isLoadingThreads && !threadsData && !isErrorThreads);
  const isError = isErrorForum || (!!forum && isErrorThreads);
  const combinedError = errorForum || errorThreads;
  
  // Build breadcrumbs (adjust to use forum directly)
  const breadcrumbs = [
    { label: 'Home', href: '/', icon: <Home className="h-4 w-4 mr-1" /> },
    { label: 'Forums', href: ROUTES.FORUMS, icon: null },
    forum ? { 
      label: forum.name, 
      href: ROUTES.FORUM_DETAIL(forum.slug), 
      icon: null 
    } : null,
  ].filter(Boolean);
  
  // Handle sorting change
  const handleSortChange = (newSortBy: 'latest' | 'hot' | 'pinned' | 'solved') => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // State to hold child forums if not present in forum object
  const [childForums, setChildForums] = useState<any[]>([]);

  // Fetch child forums if this is a container and forums are not present
  useEffect(() => {
    if (forum && !forum.canHaveThreads && (!Array.isArray(forum.forums) || forum.forums.length === 0)) {
      // Fetch child forums by parentId (forum.id)
      console.log(`[ForumPage] Container detected, fetching child forums for ${forum.name} (ID: ${forum.id})`);
      
      fetch(`/api/forum/forums?parentId=${forum.id}`)
        .then(res => {
          console.log(`[ForumPage] Child forums API response status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log(`[ForumPage] Child forums API response data:`, data);
          
          // Handle different response formats
          let forumsArray = [];
          if (Array.isArray(data)) {
            // Direct array response
            forumsArray = data;
          } else if (data.forums && Array.isArray(data.forums)) {
            // { forums: [] } format
            forumsArray = data.forums;
          } else if (data.data && Array.isArray(data.data)) {
            // { data: [] } format
            forumsArray = data.data;
          } else if (data.topics && Array.isArray(data.topics)) {
            // { topics: [] } format from getForumBySlugWithTopics
            forumsArray = data.topics;
          }
          
          if (forumsArray.length > 0) {
            console.log(`[ForumPage] Setting ${forumsArray.length} child forums for ${forum.name}`);
            setChildForums(forumsArray);
          } else {
            console.warn(`[ForumPage] No forums found in response:`, data);
            
            // Try fetching with alternative endpoint as fallback
            console.log('[ForumPage] Trying alternative endpoint /api/forum/forums/' + forum.slug + '/topics');
            fetch(`/api/forum/forums/${forum.slug}/topics`)
              .then(res => res.json())
              .then(topicsData => {
                console.log('[ForumPage] Alternative endpoint response:', topicsData);
                if (topicsData.topics && Array.isArray(topicsData.topics)) {
                  console.log(`[ForumPage] Setting ${topicsData.topics.length} topics from alternative endpoint`);
                  setChildForums(topicsData.topics);
                } else {
                  console.warn('[ForumPage] No topics found in alternative endpoint');
                }
              })
              .catch(altErr => {
                console.error('[ForumPage] Failed to fetch from alternative endpoint:', altErr);
              });
          }
        })
        .catch(err => {
          console.error('[ForumPage] Failed to fetch child forums for container:', err);
        });
    } else if (forum && !forum.canHaveThreads && Array.isArray(forum.forums)) {
      console.log(`[ForumPage] Using ${forum.forums.length} child forums already in forum object`);
      setChildForums(forum.forums);
    }
  }, [forum]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
          <LoadingSpinner text="Loading Forum..." />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (isError || (!isLoadingForum && !forum)) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
          <ErrorDisplay 
            title={isErrorForum && forumSlug ? "Error loading forum" : "Forum not found"} 
            error={combinedError || new Error(`Failed to load forum data for ${forumSlug}`)} 
          />
          <div className="mt-4">
            <Button onClick={() => setLocation(ROUTES.FORUMS)}>
              Return to Forums
            </Button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // Ensure forum is loaded before trying to use its properties or render thread-dependent UI
  if (!forum) {
      // This case should ideally be caught by the isLoading or isError checks above,
      // but as a safeguard:
      return (
        <div className="flex flex-col min-h-screen">
          <div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
            <LoadingSpinner text="Initializing forum data..." />
          </div>
          <SiteFooter />
        </div>
      );
  }
  
  // Destructure threadsData only if available and forum is loaded
  const threads = threadsData?.threads || [];
  const pagination = threadsData?.pagination || {
    page: currentPage,
    limit: pageSize,
    totalThreads: 0,
    totalPages: 0
  };

  // After forum is loaded, check canHaveThreads
  if (!forum.canHaveThreads) {
    // Defensive log for debugging
    console.warn('[ForumPage] Loaded non-threadable forum entity:', forum);
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
          {/* Breadcrumb navigation */}
          <div className="flex items-center mb-6 text-sm text-zinc-400">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="h-3 w-3 mx-2" />}
                {crumb?.href ? (
                  <Link href={crumb.href} className="flex items-center hover:text-zinc-300">
                    {crumb.icon} {crumb.label}
                  </Link>
                ) : (
                  <span className="flex items-center">{crumb?.icon} {crumb?.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <Card className="border border-zinc-700/50 bg-zinc-900/50 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{forum.name}</CardTitle>
              {forum.description && (
                <CardDescription className="text-zinc-300">{forum.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-amber-500 mb-4 font-medium text-lg">
                This is a category that contains the following forums:
              </div>
              
              {/* Display child forums in a more user-friendly way */}
              {childForums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {childForums.map((childForum: any) => (
                    <Link 
                      key={childForum.id} 
                      href={`/forums/${childForum.slug}`}
                      className="border border-zinc-700/50 bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
                    >
                      <h3 className="text-emerald-400 font-medium text-lg mb-1">{childForum.name}</h3>
                      {childForum.description && (
                        <p className="text-zinc-400 text-sm mb-2">{childForum.description}</p>
                      )}
                      <div className="flex items-center text-xs text-zinc-500">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span>{childForum.threadCount || 0} threads</span>
                        <span className="mx-2">•</span>
                        <span>{childForum.postCount || 0} posts</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-400">
                  No forums found in this category. Please check back later.
                </div>
              )}
              
              <div className="mt-6">
                <Button onClick={() => setLocation(ROUTES.FORUMS)}>
                  Return to Forums
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
        {/* Breadcrumbs */}
        <nav className="flex mb-6 text-sm flex-wrap" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <ChevronRight className="text-zinc-600 h-4 w-4 mx-1" />}
                <li className="flex items-center">
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-zinc-300 flex items-center">
                      {crumb.icon}
                      {crumb.label}
                    </span>
                  ) : (
                    <Link 
                      href={crumb.href}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center"
                    >
                      {crumb.icon}
                      {crumb.label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (1/4 width) */}
          <div className="w-full lg:w-1/4 order-2 lg:order-1">
            <ForumSearch 
              initialQuery={searchQuery} 
              className="mb-4" 
              onSearch={handleSearch}
            />
            <ForumGuidelines className="hidden lg:block mt-4" />
          </div>
          
          {/* Main Content (3/4 width) */}
          <main className="w-full lg:w-3/4 order-1 lg:order-2">
            {/* Forum Header */}
            <Card 
              className="bg-zinc-900/60 border border-zinc-800 shadow-md mb-6"
              style={{ borderLeft: forum.color ? `4px solid ${forum.color}` : undefined }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center">
                    {forum.icon ? (
                      <span className="mr-2">{/* Render icon based on forum.icon string */}</span>
                    ) : (
                      <LayoutGrid className="h-6 w-6 mr-2 text-emerald-500" />
                    )}
                    {forum.name}
                  </CardTitle>
                  
                  {/* New Thread Button */}
                  {isLoggedIn && (
                    <CreateThreadButton 
                      categoryId={forum.id}
                      className="hidden md:flex"
                    />
                  )}
                </div>
                {forum.description && (
                  <CardDescription className="mt-2 text-zinc-400">
                    {forum.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-400">Threads: <span className="text-zinc-200">{pagination.totalThreads || 0}</span></span>
                  <span className="text-zinc-400">Posts: <span className="text-zinc-200">{forum.postCount || 0}</span></span>
                </div>
                
                {/* Mobile New Thread Button */}
                {isLoggedIn && (
                  <div className="mt-4 md:hidden">
                    <CreateThreadButton 
                      categoryId={forum.id}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thread List Header with Sorting */}
            <Card className="bg-zinc-900/60 border border-zinc-800 shadow-md mb-6">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-xl font-bold flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-amber-500" />
                    Topics
                  </CardTitle>
                  
                  {/* Sort Tabs */}
                  <Tabs 
                    value={sortBy} 
                    onValueChange={(value) => handleSortChange(value as any)}
                    className="w-full md:w-auto"
                  >
                    <TabsList className="grid grid-cols-4 w-full md:w-auto">
                      <TabsTrigger value="latest" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Latest
                      </TabsTrigger>
                      <TabsTrigger value="hot" className="text-xs">
                        <Flame className="h-3 w-3 mr-1" />
                        Hot
                      </TabsTrigger>
                      <TabsTrigger value="pinned" className="text-xs">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="h-3 w-3 mr-1"
                        >
                          <line x1="12" y1="17" x2="12" y2="22" />
                          <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                        </svg>
                        Pinned
                      </TabsTrigger>
                      <TabsTrigger value="solved" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Solved
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
            </Card>

            {/* Thread List */}
            <React.Fragment>
              <ThreadList 
                threads={threads}
                totalThreads={pagination.totalThreads}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                isLoading={isLoadingThreads && !threadsData}
                error={errorThreads as Error || null}
                emptyMessage="No topics have been posted in this forum yet."
                categoryId={forum.id}
                categorySlug={forum.slug}
                className="mb-6"
              />
            </React.Fragment>
            
            {/* Sticky New Thread Button for Mobile */}
            {isLoggedIn && (
              <div className="fixed bottom-4 right-4 md:hidden">
                <CreateThreadButton
                  categoryId={forum.id}
                  size="lg"
                  className="shadow-lg rounded-full w-14 h-14 flex items-center justify-center"
                >
                  <Plus className="h-6 w-6" />
                </CreateThreadButton>
              </div>
            )}
          </main>
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 py-4 lg:hidden">
          <ForumGuidelines />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
} 