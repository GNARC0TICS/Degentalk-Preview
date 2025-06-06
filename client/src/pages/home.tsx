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
import { CanonicalZoneGrid, ZoneCardData } from '@/components/forum/CanonicalZoneGrid';
import { HotThreads } from '@/features/forum/components/HotThreads';
import { useForumStructure } from '@/features/forum/hooks/useForumStructure';
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
import { ForumEntityBase } from '@/utils/forum-routing-helper';
import { getThreadTitle } from '@/utils/thread-utils';
import { ChevronRightIcon, ChatBubbleBottomCenterTextIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';

// Define API Path Constants
const API_PATHS = {
  HOT_THREADS: '/api/hot-threads',
  LEADERBOARD_XP: '/api/leaderboards/xp',
};

export default function HomePage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const { position } = useShoutbox();

  // Use centralized forum structure hook
  const { 
    data: forumStructure,
    isLoading: structureLoading,
    error: forumStructureError
  } = useForumStructure();
  
  const primaryZones = forumStructure?.primaryZones || [];
  const categories = forumStructure?.categories || []; // Assuming these are general forums/zones

  // Combine primary zones and categories (general zones) for the grid
  // It's assumed that items in 'categories' from useForumStructure 
  // are also compatible with ForumEntityBase and have forum_type: 'general' and a position.
  const allZonesFromHook: ForumEntityBase[] = [
    ...(primaryZones || []),
    ...(categories || []), // Ensure categories are also ForumEntityBase compatible
  ];

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

  // Convert all zones (primary and general) to the format expected by CanonicalZoneGrid
  // This mapping ensures all necessary fields for ZoneCardData are present.
  // The CanonicalZoneGrid itself will handle sorting by primary/general and then by position.
  const allZonesForGrid: ZoneCardData[] = allZonesFromHook.map((zone) => {
    // Ensure all properties from ForumEntityBase are passed through,
    // and add any additional ones specific to ZoneCardData's direct fields if necessary.
    return {
      ...zone, // Spread all properties from ForumEntityBase (id, name, slug, forum_type, position, etc.)
      description: zone.description || '', // Ensure description is not undefined
      icon: zone.icon || '📁', // Default icon
      colorTheme: zone.colorTheme || 'default', // Default theme
      threadCount: zone.threadCount || 0,
      postCount: zone.postCount || 0,
      // Optional fields for ZoneCardData, if not present in ForumEntityBase from hook:
      activeUsersCount: zone.activeUsersCount || 0, // Assuming activeUsersCount might come from hook or be defaulted
      hasXpBoost: zone.hasXpBoost || false,
      boostMultiplier: zone.boostMultiplier || 1,
      // isEventActive and eventData would also be mapped if available
    } as ZoneCardData; // Cast to ZoneCardData to satisfy the type
  });

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
                zones={allZonesForGrid} // Pass the combined and mapped list of all zones
                includeShopCard={true}
                shopCardData={{
                  name: "Legendary Diamond Frame",
                  price: 2500
                }}
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
              ) : forumStructureError ? (
                <div className="text-red-500 p-4" role="alert">
                  <p className="text-sm">Failed to load forum structure</p>
                  {forumStructureError && <p className="text-xs mt-1 opacity-75">{forumStructureError.message}</p>}
                </div>
              ) : (
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
