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

// Import icons
import { 
  AlertCircle,
  FolderOpen
} from 'lucide-react';

// Import types
import { ThreadWithUser } from '@shared/types';
import { User } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { ForumEntityBase } from '@/utils/forum-routing-helper';

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
    error
  } = useForumStructure();
  
  const primaryZones = forumStructure?.primaryZones || [];
  const categories = forumStructure?.categories || [];

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

  // Convert primary zones to the format expected by CanonicalZoneGrid
  const zoneCardData: ZoneCardData[] = primaryZones.map((zone) => {
    // Extract properties from ForumEntityBase
    const { id, name, slug, description, icon, colorTheme, threadCount, postCount } = zone;
    
    // Return the complete ZoneCardData object with additional properties
    return {
      id,
      name,
      slug,
      description: description || '',
      icon: icon || '📁',
      colorTheme: colorTheme || 'default',
      threadCount: threadCount || 0,
      postCount: postCount || 0,
      // Add properties required by ZoneCardData but not in ForumEntityBase
      activeUsersCount: 0,
      hasXpBoost: false,
      boostMultiplier: 1
    };
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
          
          {/* Primary Zones Grid */}
          {structureLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load forum structure. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          ) : (
            <CanonicalZoneGrid zones={zoneCardData} />
          )}
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
              ) : error ? (
                <div className="text-red-500 p-4" role="alert">
                  <p className="text-sm">Failed to load forum structure</p>
                  {error && <p className="text-xs mt-1 opacity-75">{error.message}</p>}
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
