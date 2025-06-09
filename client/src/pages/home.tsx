import React from 'react';
import { Link } from 'wouter';
import '../styles/ticker.css';
import '../styles/zone-themes.css';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

// Import components
import { HeroSection } from '@/components/layout/hero-section';
import { AnnouncementTicker } from '@/components/layout/announcement-ticker';
import { SiteFooter } from '@/components/layout/site-footer';
import { LeaderboardWidget } from '@/components/sidebar/leaderboard-widget';
import { WalletSummaryWidget } from '@/components/sidebar/wallet-summary-widget';
import {
  ShoutboxSidebarTop,
  ShoutboxSidebarBottom,
  ShoutboxMainTop,
  ShoutboxMainBottom,
  PositionedShoutbox
} from '@/components/shoutbox/positioned-shoutbox';
import { useShoutbox } from '@/contexts/shoutbox-context';
import { HierarchicalZoneNav } from '@/features/forum/components/HierarchicalZoneNav';
// import { CanonicalZoneGrid, ZoneCardData } from '@/components/forum/CanonicalZoneGrid'; // ZoneCardData might not be needed here anymore
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid';
import { HotThreads } from '@/features/forum/components/HotThreads';
// import { useForumStructure } from '@/features/forum/hooks/useForumStructure'; // To be removed
import { getPrimaryZoneIds } from '@/constants/primaryZones.tsx'; // Explicit .tsx extension
import { ActiveMembersWidget } from '@/components/users';
import { useActiveUsers } from '@/features/users/hooks';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Import icons
import {
  AlertCircle,
  FolderOpen
} from 'lucide-react';

// Import types
import { ThreadWithUser } from '@shared/types';
import { User } from '@schema';
import { useAuth } from '@/hooks/use-auth';
import { useShopConfig } from '@/hooks/useShopConfig';
import { ForumEntityBase } from '@/utils/forum-routing-helper';
import { getThreadTitle } from '@/utils/thread-utils';
import { ChevronRightIcon, ChatBubbleBottomCenterTextIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { PageLayout } from '@/components/layout/PageLayout';
import { apiRequest } from '@/lib/queryClient';

// Define API Path Constants
const API_PATHS = {
  HOT_THREADS: '/api/hot-threads',
  LEADERBOARD_XP: '/api/leaderboards/xp',
};

// Degentalk™ Home Page
// Shows main forum zones, announcements, and featured content.
export default function HomePage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const { position } = useShoutbox();

  // Directly use primaryZones from constants
  // const { 
  //   data: forumStructure,
  //   isLoading: structureLoading,
  //   error: forumStructureError
  // } = useForumStructure(); // REMOVED

  // const primaryZonesFromHook = forumStructure?.primaryZones || []; // REMOVED
  // const categories = forumStructure?.categories || []; // REMOVED

  // const allZonesFromHook: ForumEntityBase[] = [ // REMOVED
  //   ...(primaryZonesFromHook || []),
  //   ...(categories || []), 
  // ];

  // Extract zone IDs from the imported primaryZones constant
  const primaryZoneIds = getPrimaryZoneIds();
  // For now, structureLoading and forumStructureError will need to be handled or removed
  // if CanonicalZoneGrid depends on them. Let's assume it will be simplified.
  const structureLoading = false; // Placeholder, as we are not loading structure anymore for primary zones
  const forumStructureError = null; // Placeholder

  // Fetch hot threads
  const {
    data: threads,
    isLoading: threadsLoading,
    error: threadsError
  } = useQuery<ThreadWithUser[]>({
    queryKey: [API_PATHS.HOT_THREADS, { limit: 5 }],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  // Fetch top users for leaderboard
  const {
    data: topUsers,
    isLoading: usersLoading,
    error: usersError
  } = useQuery<User[]>({
    queryKey: [API_PATHS.LEADERBOARD_XP, { limit: 5, current: true }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: false // Temporarily disabled until we have this API route
  });

  // Fetch active users
  const {
    data: activeUsers,
    isLoading: activeUsersLoading
  } = useActiveUsers({ limit: 5 });

  // Component to handle floating shoutbox position
  const FloatingShoutboxPositioner = () => {
    if (position !== 'floating') return null;
    return <PositionedShoutbox />;
  };

  // No longer need to convert allZonesForGrid as CanonicalZoneGrid now takes zoneIds
  // const allZonesForGrid: ZoneCardData[] = ... // REMOVED

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Announcement Ticker */}
      <AnnouncementTicker />

      {/* Floating Shoutbox */}
      <FloatingShoutboxPositioner />

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
        {/* Main Content Area (2/3 width) */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Shoutbox at main-top position */}
          <ShoutboxMainTop />

          {/* Hot Threads */}
          <HotThreads className="mb-6" />

          {/* Primary Zones Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Primary Zones</h2>
                <p className="text-zinc-400">Jump into the action</p>
              </div>
              <Link href="/zones">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  View All Zones
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {forumStructureError ? (
              <div className="text-center py-12">
                <p className="text-red-400">Failed to load zones</p>
              </div>
            ) : structureLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-zinc-900 rounded-xl h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <CanonicalZoneGrid
                zoneIds={primaryZoneIds} // Pass the array of primary zone IDs
                includeShopCard={true}
              />
            )}
          </section>
        </div>

        {/* Sidebar (1/3 width) */}
        <aside className="w-full lg:w-1/3 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Shoutbox at sidebar-top */}
          <ShoutboxSidebarTop />

          {/* Wallet Summary */}
          <WalletSummaryWidget isLoggedIn={isLoggedIn} />

          {/* Forum Navigation */}
          <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FolderOpen className="h-5 w-5 text-emerald-500 mr-2" />
                Forum Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {structureLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : forumStructureError ? ( // This error handling might need adjustment if useForumStructure is fully removed
                <div className="text-red-500 p-4" role="alert">
                  <p className="text-sm">Failed to load forum structure</p>
                  {/* forumStructureError might be null now, adjust if needed */}
                  {forumStructureError && <p className="text-xs mt-1 opacity-75">{(forumStructureError as Error).message}</p>}
                </div>
              ) : (
                // HierarchicalZoneNav might still rely on useForumStructure.
                // This needs to be addressed. For now, leaving it, but it might break or show no data.
                <HierarchicalZoneNav className="text-zinc-200" />
              )}
            </CardContent>
          </Card>

          {/* Leaderboard Widget */}
          <LeaderboardWidget users={topUsers} />

          {/* Active Members Widget */}
          <ActiveMembersWidget
            users={activeUsers || []}
            title="Active Degens"
            description="Community members online now"
            isLoading={activeUsersLoading}
            className="mt-auto"
          />

          {/* Shoutbox at sidebar-bottom */}
          <ShoutboxSidebarBottom />
        </aside>
      </main>

      {/* Shoutbox at main-bottom for mobile */}
      <div className="container mx-auto px-3 sm:px-4 mb-6">
        <ShoutboxMainBottom />
      </div>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
