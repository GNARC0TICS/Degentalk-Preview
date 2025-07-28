import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  ChevronRight,
  Lock,
  Star,
  Flame,
  Shield,
  Crown,
  Zap,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MergedForum } from '@/features/forum/contexts/ForumStructureContext';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { OnlineUsersDisplay } from './OnlineUsersDisplay';

interface ModernForumListProps {
  forums: MergedForum[];
  categoryName: string;
  categoryColor?: string;
  showNewThreadButton?: boolean;
  onNewThread?: (forumSlug: string) => void;
}

export function ModernForumList({ 
  forums, 
  categoryName, 
  categoryColor = 'emerald',
  showNewThreadButton = false,
  onNewThread 
}: ModernForumListProps) {
  const navigate = useNavigate();

  // Get category gradient based on color
  const getCategoryGradient = (color: string) => {
    const gradients: Record<string, string> = {
      emerald: 'from-emerald-600 to-emerald-700',
      blue: 'from-blue-600 to-blue-700',
      purple: 'from-purple-600 to-purple-700',
      amber: 'from-amber-600 to-amber-700',
      red: 'from-red-600 to-red-700',
      pink: 'from-pink-600 to-pink-700',
      zinc: 'from-zinc-700 to-zinc-800'
    };
    return gradients[color] || gradients.zinc;
  };

  // Get forum status icon
  const getForumIcon = (forum: MergedForum) => {
    const hasNewPosts = forum.hasNewPosts || Math.random() > 0.5; // Mock for now
    
    if (forum.isLocked) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
          <Lock className="w-4 h-4 text-white" />
        </div>
      );
    }
    
    if (forum.isPopular) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg animate-pulse">
          <Flame className="w-4 h-4 text-white" />
        </div>
      );
    }
    
    if (hasNewPosts) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center">
        <MessageSquare className="w-4 h-4 text-zinc-400" />
      </div>
    );
  };

  // Get access level badge
  const getAccessBadge = (forum: MergedForum) => {
    if (forum.minXp && forum.minXp > 0) {
      return (
        <Badge variant="outline" className="text-amber-400 border-amber-400/50 text-xs">
          <Zap className="w-3 h-3 mr-1" />
          {forum.minXp} XP
        </Badge>
      );
    }
    
    if (forum.requiresVip) {
      return (
        <Badge variant="outline" className="text-purple-400 border-purple-400/50 text-xs">
          <Crown className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      );
    }
    
    if (forum.requiresModerator) {
      return (
        <Badge variant="outline" className="text-blue-400 border-blue-400/50 text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Staff
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Category Header */}
      <div className={cn(
        "bg-gradient-to-r rounded-t-lg px-4 py-2 flex items-center justify-between",
        getCategoryGradient(categoryColor)
      )}>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          {categoryName}
          <Badge className="bg-white/20 text-white border-white/30 text-xs">
            {forums.length} forums
          </Badge>
        </h3>
        
        {showNewThreadButton && onNewThread && (
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => onNewThread(forums[0]?.slug || '')}
          >
            New Thread
          </Button>
        )}
      </div>

      {/* Forums Table */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-b-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="w-12 text-xs"></TableHead>
              <TableHead className="text-zinc-400 text-xs">Forum</TableHead>
              <TableHead className="text-center text-zinc-400 w-24 text-xs">Threads</TableHead>
              <TableHead className="text-center text-zinc-400 w-24 text-xs">Posts</TableHead>
              <TableHead className="text-zinc-400 w-32 text-xs">Recent Activity</TableHead>
              <TableHead className="text-zinc-400 w-48 text-xs">Last Post</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forums.map((forum, index) => (
              <TableRow 
                key={forum.id}
                className={cn(
                  "hover:bg-zinc-800/50 cursor-pointer transition-colors",
                  index % 2 === 0 ? "bg-zinc-900/30" : "bg-zinc-900/50"
                )}
                onClick={() => navigate(`/forums/${forum.slug}`)}
              >
                {/* Icon */}
                <TableCell className="py-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {getForumIcon(forum)}
                  </motion.div>
                </TableCell>

                {/* Forum Info */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/forums/${forum.slug}`}
                        className="text-sm font-medium text-white hover:text-emerald-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {forum.name}
                      </Link>
                      {getAccessBadge(forum)}
                      {forum.isPopular && (
                        <Badge className="bg-red-600/20 text-red-400 border-red-600/50 text-xs">
                          <Flame className="w-3 h-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    
                    {forum.description && (
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {forum.description}
                      </p>
                    )}
                    
                    {/* Subforums */}
                    {forum.forums && forum.forums.length > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-zinc-500 text-xs">Subforums:</span>
                        <div className="flex items-center flex-wrap">
                          {forum.forums.slice(0, 3).map((subforum, idx) => (
                            <span key={subforum.id}>
                              <Link
                                to={`/forums/${forum.slug}/${subforum.slug}`}
                                className="text-emerald-400 hover:text-emerald-300"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {subforum.name}
                              </Link>
                              {idx < Math.min(2, forum.forums.length - 1) && (
                                <span className="text-zinc-500 mx-1">,</span>
                              )}
                            </span>
                          ))}
                          {forum.forums.length > 3 && (
                            <span className="text-zinc-500 ml-1">
                              +{forum.forums.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Thread Count */}
                <TableCell className="text-center">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-sm font-semibold text-zinc-200"
                  >
                    {forum.threadCount || 0}
                  </motion.div>
                </TableCell>

                {/* Post Count */}
                <TableCell className="text-center">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-sm font-semibold text-zinc-200"
                  >
                    {forum.postCount || 0}
                  </motion.div>
                </TableCell>

                {/* Recent Activity - Avatar Stack */}
                <TableCell>
                  <div className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex -space-x-2">
                            {/* Mock recent users - in production, this would come from forum.recentContributors */}
                            {[...Array(Math.min(4, Math.floor(Math.random() * 5) + 1))].map((_, i) => {
                              const mockUsers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
                              const isOnline = Math.random() > 0.5;
                              return (
                                <div key={i} className="relative">
                                  <Avatar className="w-6 h-6 border-2 border-zinc-900">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUsers[i]}`} />
                                    <AvatarFallback className="bg-zinc-700 text-[10px]">
                                      {mockUsers[i]?.[0] || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  {isOnline && (
                                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-900" />
                                  )}
                                </div>
                              );
                            })}
                            {/* Show +X more if there are more contributors */}
                            {Math.random() > 0.5 && (
                              <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center">
                                <span className="text-[10px] text-zinc-400">+{Math.floor(Math.random() * 10) + 1}</span>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="p-2">
                          <div className="text-xs space-y-1">
                            <div className="font-semibold text-white">Recent Activity</div>
                            <div className="text-zinc-400">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span>3 users online</span>
                              </div>
                              <div>Last: 2 minutes ago</div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>

                {/* Last Post */}
                <TableCell>
                  {forum.lastPost ? (
                    <div className="text-xs">
                      <Link
                        to={`/threads/${forum.lastPost.threadSlug}`}
                        className="text-xs text-emerald-400 hover:text-emerald-300 line-clamp-1 block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {forum.lastPost.threadTitle || 'Latest post'}
                      </Link>
                      <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(forum.lastPost.createdAt), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-zinc-500">
                        by{' '}
                        <Link
                          to={`/users/${forum.lastPost.user?.username}`}
                          className="text-zinc-400 hover:text-zinc-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {forum.lastPost.user?.username || 'Unknown'}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      No posts yet
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

// Stats component to match the modern theme
export function ModernForumStats({ 
  stats,
  onlineUsersList
}: { 
  stats: {
    totalThreads: number;
    totalPosts: number;
    totalMembers: number;
    onlineUsers: number;
    newestMember?: string;
    postsToday?: number;
    threadsToday?: number;
    mostOnlineEver?: number;
    mostOnlineDate?: string;
  };
  onlineUsersList?: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 px-6 py-3 border-b border-zinc-700">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Board Statistics
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.totalThreads.toLocaleString()}</div>
            <div className="text-xs text-zinc-400 mt-1">Total Threads</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.totalPosts.toLocaleString()}</div>
            <div className="text-xs text-zinc-400 mt-1">Total Posts</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.totalMembers.toLocaleString()}</div>
            <div className="text-xs text-zinc-400 mt-1">Total Members</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.onlineUsers}</div>
            <div className="text-xs text-zinc-400 mt-1">Users Online</div>
          </div>
        </div>
        
        {/* Today's Activity */}
        <div className="pt-4 border-t border-zinc-800">
          <h4 className="text-xs font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <Clock className="w-3 h-3 text-blue-400" />
            Today's Activity
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">New Threads</span>
              <span className="font-semibold text-blue-400">{stats.threadsToday || 12}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">New Posts</span>
              <span className="font-semibold text-blue-400">{stats.postsToday || 342}</span>
            </div>
          </div>
        </div>
        
        {/* Online Users List */}
        {onlineUsersList && onlineUsersList.length > 0 && (
          <div className="pt-4 border-t border-zinc-800">
            <OnlineUsersDisplay
              users={onlineUsersList}
              theme="modern"
              maxAvatars={12}
            />
          </div>
        )}
        
        {/* Record & Newest Member */}
        <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
          {stats.mostOnlineEver && (
            <div className="flex items-center gap-1 text-zinc-400">
              <Star className="w-3 h-3 text-amber-400" />
              <span>
                Most users ever online was <strong className="text-zinc-200">{stats.mostOnlineEver}</strong>
                {stats.mostOnlineDate && ` on ${stats.mostOnlineDate}`}
              </span>
            </div>
          )}
          
          {stats.newestMember && (
            <div className="flex items-center gap-1 text-zinc-400">
              <UserPlus className="w-3 h-3 text-emerald-400" />
              <span>
                Welcome our newest member,{' '}
                <Link to={`/users/${stats.newestMember}`} className="text-emerald-400 hover:text-emerald-300 hover:underline">
                  {stats.newestMember}
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}