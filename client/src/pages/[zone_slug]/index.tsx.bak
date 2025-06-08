import React from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  getPrimaryZone, 
  isPrimaryZoneSlug, 
  componentMap,
  PrimaryZone 
} from '@/constants/primaryZones.tsx';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

// Import components
import { SiteFooter } from '@/components/layout/site-footer';
import { HierarchicalZoneNav } from '@/features/forum/components/HierarchicalZoneNav';
import { 
  ShoutboxSidebarTop, 
  ShoutboxSidebarBottom, 
  ShoutboxMainTop, 
  ShoutboxMainBottom,
  PositionedShoutbox
} from '@/components/shoutbox/positioned-shoutbox';
import { useShoutbox } from '@/contexts/shoutbox-context';
import { LeaderboardWidget } from '@/components/sidebar/leaderboard-widget';
import { WalletSummaryWidget } from '@/components/sidebar/wallet-summary-widget';
import { ActiveMembersWidget } from '@/components/users';
import { useActiveUsers } from '@/features/users/hooks';
import { HotThreads } from '@/features/forum/components/HotThreads';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// Import icons
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  Hash, 
  Activity,
  FolderOpen,
  AlertCircle,
  Plus,
  Shield,
  Zap
} from 'lucide-react';

// Import styles
import '@/styles/zone-themes.css';

// Import types and utils
import { useAuth } from '@/hooks/use-auth';
import { ThreadWithUser } from '@shared/types';
import { User } from '@schema';

// Dynamic Zone Layout Component
function DynamicZoneComponents({ zone }: { zone: PrimaryZone }) {
  if (!zone.components || zone.components.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {zone.components.map((componentKey) => {
        const Component = componentMap[componentKey];
        if (!Component) {
          console.warn(`Component "${componentKey}" not found in componentMap`);
          return null;
        }
        return (
          <motion.div
            key={componentKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="zone-dynamic-component"
          >
            <Component zone={zone} />
          </motion.div>
        );
      })}
    </div>
  );
}

// Thread Creation Rules Display
function ThreadRulesIndicator({ zone }: { zone: PrimaryZone }) {
  const { threadRules } = zone;
  
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {!threadRules.allowUserPosts && (
        <span className="px-2 py-1 bg-red-900/50 border border-red-700/50 rounded text-red-300">
          <Shield className="w-3 h-3 inline mr-1" />
          Admin Only
        </span>
      )}
      {threadRules.requireDGT && (
        <span className="px-2 py-1 bg-yellow-900/50 border border-yellow-700/50 rounded text-yellow-300">
          💎 DGT Required
        </span>
      )}
      {zone.features?.xpBoost?.enabled && (
        <span className="px-2 py-1 bg-emerald-900/50 border border-emerald-700/50 rounded text-emerald-300">
          <Zap className="w-3 h-3 inline mr-1" />
          {zone.features.xpBoost.multiplier}x XP
        </span>
      )}
      {threadRules.allowPolls && (
        <span className="px-2 py-1 bg-blue-900/50 border border-blue-700/50 rounded text-blue-300">
          📊 Polls Enabled
        </span>
      )}
    </div>
  );
}

export default function PrimaryZonePage() {
  const params = useParams();
  const zoneSlug = params.zone_slug as string;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { position } = useShoutbox();
  
  // Check if this is a valid primary zone slug
  if (!isPrimaryZoneSlug(zoneSlug)) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Zone Not Found</h1>
          <p className="text-zinc-400 mb-6">
            The zone "{zoneSlug}" doesn't exist or has been moved.
          </p>
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
        <SiteFooter />
      </div>
    );
  }

  const zone = getPrimaryZone(zoneSlug)!; // Safe because we checked above

  // Fetch zone-specific threads/content
  const { 
    data: zoneThreads, 
    isLoading: threadsLoading, 
    error: threadsError
  } = useQuery<ThreadWithUser[]>({
    queryKey: [`/api/zones/${zone.id}/threads`, { limit: 10 }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!zone
  });

  // Fetch zone-specific stats 
  const { 
    data: zoneStats, 
    isLoading: statsLoading
  } = useQuery({
    queryKey: [`/api/zones/${zone.id}/stats`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!zone
  });

  // Fetch active users
  const { data: activeUsers, isLoading: activeUsersLoading } = useActiveUsers({ limit: 5 });

  // Get theme class for styling
  const themeClass = zone.colorTheme ? `zone-theme-${zone.colorTheme}` : 'zone-theme-default';
  const navThemeClass = zone.colorTheme ? `zone-nav-theme-${zone.colorTheme}` : '';

  // Component to handle floating shoutbox position
  const FloatingShoutboxPositioner = () => {
    if (position !== 'floating') return null;
    return <PositionedShoutbox />;
  };

  // Render zone icon
  const renderZoneIcon = () => {
    if (zone.icon && typeof zone.icon === 'string') {
      // Handle emoji icons
      if (/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(zone.icon)) {
        return <span className="text-4xl" role="img" aria-label={`${zone.label} icon`}>{zone.icon}</span>;
      }
    }
    return <FolderOpen className="w-10 h-10 text-zinc-400" />;
  };

  // Check if user can post based on access control
  const canPost = () => {
    if (!user) return zone.accessControl.canPost.includes('all');
    // This would need to be implemented with actual user role checking
    return zone.accessControl.canPost.includes('all') || 
           zone.accessControl.canPost.includes(user.role || 'user');
  };

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col ${themeClass}`}>
      {/* Zone Header */}
      <motion.section 
        className="relative py-12 px-4 border-b border-zinc-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-zinc-400 mb-6">
            <button 
              onClick={() => setLocation('/')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className={navThemeClass}>{zone.label}</span>
          </nav>

          {/* Zone Info */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 p-4 rounded-xl bg-black/20 border border-zinc-700/50">
              {renderZoneIcon()}
            </div>
            
            <div className="flex-1">
              <motion.h1 
                className="text-4xl font-bold text-white mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {zone.label}
              </motion.h1>
              
              {zone.tagline && (
                <motion.p 
                  className={`text-lg mb-4 ${navThemeClass || 'text-zinc-300'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {zone.tagline}
                </motion.p>
              )}
              
              <motion.p 
                className="text-zinc-400 max-w-2xl mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {zone.description}
              </motion.p>

              {/* Zone Rules/Features */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <ThreadRulesIndicator zone={zone} />
              </motion.div>
            </div>

            {/* Zone Stats */}
            <motion.div 
              className="flex-shrink-0 grid grid-cols-3 gap-4 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="p-4 rounded-lg bg-black/20 border border-zinc-700/50">
                <MessageCircle className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                <div className="text-xl font-bold text-white">
                  {statsLoading ? '...' : zoneStats?.threadCount || zone.stats?.threadCount || '0'}
                </div>
                <div className="text-xs text-zinc-500">Threads</div>
              </div>
              
              <div className="p-4 rounded-lg bg-black/20 border border-zinc-700/50">
                <Hash className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                <div className="text-xl font-bold text-white">
                  {statsLoading ? '...' : zoneStats?.postCount || zone.stats?.postCount || '0'}
                </div>
                <div className="text-xs text-zinc-500">Posts</div>
              </div>
              
              <div className="p-4 rounded-lg bg-black/20 border border-zinc-700/50">
                <Users className="w-6 h-6 mx-auto text-zinc-400 mb-2" />
                <div className="text-xl font-bold text-white">
                  {statsLoading ? '...' : zoneStats?.activeUsers || zone.stats?.activeUsersCount || '0'}
                </div>
                <div className="text-xs text-zinc-500">Active</div>
              </div>
            </motion.div>
          </div>

          {/* Create Thread Button */}
          {canPost() && (
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => setLocation(`/threads/create?zone=${zone.id}`)}
                className={`${navThemeClass ? 'bg-current' : 'bg-emerald-600'} hover:opacity-90`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Thread
              </Button>
            </motion.div>
          )}
        </div>
      </motion.section>

      <FloatingShoutboxPositioner />

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
        {/* Main Content Area (2/3 width) */}
        <div className="w-full lg:w-2/3 space-y-6">
          <ShoutboxMainTop />
          
          {/* Dynamic Zone Components */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <DynamicZoneComponents zone={zone} />
          </motion.section>

          {/* Zone-specific content */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {/* Custom zone layout component if available */}
            {zone.customComponents?.layoutOverride ? (
              <zone.customComponents.layoutOverride zone={zone} />
            ) : (
              <div className="space-y-6">
                {/* Latest Threads in Zone */}
                <Card className="bg-zinc-900/50 border border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 text-emerald-500 mr-2" />
                      Latest in {zone.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {threadsLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : threadsError ? (
                      <Alert className="border-red-800 bg-red-900/50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Failed to load threads for this zone.
                        </AlertDescription>
                      </Alert>
                    ) : zoneThreads && zoneThreads.length > 0 ? (
                      <div className="space-y-3">
                        {zoneThreads.map((thread) => (
                          <motion.div
                            key={thread.id}
                            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setLocation(`/threads/${thread.slug || thread.id}`)}
                          >
                            <h4 className="font-medium text-white mb-1">{thread.title}</h4>
                            <p className="text-sm text-zinc-400 truncate">{thread.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                              <span>by {thread.user?.display_name || thread.user?.username}</span>
                              <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-zinc-400">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No threads yet in this zone.</p>
                        <p className="text-sm mt-1">Be the first to start a conversation!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Global Hot Threads */}
                <HotThreads className="mb-6" />
              </div>
            )}
          </motion.section>
        </div>

        {/* Sidebar (1/3 width) */}
        <aside className="w-full lg:w-1/3 space-y-4 sm:space-y-6 md:space-y-8">
          <ShoutboxSidebarTop />
          
          {/* Wallet Summary */}
          <WalletSummaryWidget isLoggedIn={!!user} />
          
          {/* Forum Navigation */}
          <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FolderOpen className="h-5 w-5 text-emerald-500 mr-2" />
                Forum Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HierarchicalZoneNav className="text-zinc-200" />
            </CardContent>
          </Card>
          
          {/* Leaderboard */}
          <LeaderboardWidget users={[]} />
          
          {/* Active Members */}
          <ActiveMembersWidget 
            users={activeUsers || []}
            title="Active Degens"
            description="Community members online now"
            isLoading={activeUsersLoading}
            className="mt-auto"
          />
          
          <ShoutboxSidebarBottom />
        </aside>
      </main>

      {/* Mobile shoutbox */}
      <div className="container mx-auto px-3 sm:px-4 mb-6">
        <ShoutboxMainBottom />
      </div>

      <SiteFooter />
    </div>
  );
} 