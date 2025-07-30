import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  Eye, 
  Clock, 
  Pin,
  Lock,
  CheckCircle,
  Flame,
  Star,
  TrendingUp,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import type { Thread, ThreadListItem } from '@shared/types/thread.types';
import type { ForumId } from '@shared/types/ids';

interface ModernThreadListProps {
  threads: (Thread | ThreadListItem)[];
  forumName: string;
  forumSlug: string;
  forumId?: ForumId;
  isLoading?: boolean;
  onNewThread?: () => void;
}

export function ModernThreadList({ 
  threads, 
  forumName, 
  forumSlug,
  forumId,
  isLoading = false,
  onNewThread 
}: ModernThreadListProps) {
  const navigate = useNavigate();

  // Get thread status badges
  const getThreadBadges = (thread: Thread | ThreadListItem) => {
    const badges = [];
    
    if (thread.isSticky || thread.isPinned) {
      badges.push(
        <Badge key="pinned" className="bg-cyan-900/60 text-cyan-300 text-xs">
          <Pin className="w-3 h-3 mr-1" />
          Pinned
        </Badge>
      );
    }
    
    if (thread.isLocked) {
      badges.push(
        <Badge key="locked" className="bg-red-900/60 text-red-300 text-xs">
          <Lock className="w-3 h-3 mr-1" />
          Locked
        </Badge>
      );
    }
    
    if (thread.isSolved) {
      badges.push(
        <Badge key="solved" className="bg-emerald-900/60 text-emerald-300 text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Solved
        </Badge>
      );
    }
    
    if ('isHot' in thread && thread.isHot) {
      badges.push(
        <Badge key="hot" className="bg-orange-900/60 text-orange-300 text-xs animate-pulse">
          <Flame className="w-3 h-3 mr-1" />
          Hot
        </Badge>
      );
    }
    
    return badges;
  };

  // Get thread icon
  const getThreadIcon = (thread: Thread | ThreadListItem) => {
    const hasNewPosts = 'hasNewReplies' in thread && thread.hasNewReplies;
    
    if (thread.isLocked) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
          <Lock className="w-4 h-4 text-white" />
        </div>
      );
    }
    
    if ('isHot' in thread && thread.isHot) {
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

  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Category Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-t-lg px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          Threads in {forumName}
          <Badge className="bg-white/20 text-white border-white/30 text-xs">
            {threads.length} threads
          </Badge>
        </h3>
        
        {onNewThread && (
          <Button
            size="sm"
            variant="outline"
            onClick={onNewThread}
            className="text-xs font-medium"
          >
            New Thread
          </Button>
        )}
      </div>

      {/* Threads Table */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-b-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="w-12 text-xs"></TableHead>
              <TableHead className="text-zinc-400 text-xs">Thread / Author</TableHead>
              <TableHead className="text-center text-zinc-400 w-20 text-xs">Replies</TableHead>
              <TableHead className="text-center text-zinc-400 w-20 text-xs">Views</TableHead>
              <TableHead className="text-zinc-400 w-48 text-xs">Last Post</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {threads.map((thread, index) => (
              <TableRow 
                key={thread.id}
                className={cn(
                  "hover:bg-zinc-800/50 cursor-pointer transition-colors",
                  index % 2 === 0 ? "bg-zinc-900/30" : "bg-zinc-900/50"
                )}
                onClick={() => navigate(thread.structure?.slug ? `/forums/${thread.structure.slug}/${thread.slug}` : `/threads/${thread.slug}`)}
              >
                {/* Icon */}
                <TableCell className="py-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {getThreadIcon(thread)}
                  </motion.div>
                </TableCell>

                {/* Thread Info */}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Thread prefix if available */}
                      {'prefix' in thread && thread.prefix && (
                        <Badge 
                          className="text-xs"
                          style={{
                            backgroundColor: thread.prefix.backgroundColor || thread.prefix.color,
                            color: thread.prefix.color === '#FFFFFF' ? '#000' : '#FFF'
                          }}
                        >
                          {thread.prefix.name}
                        </Badge>
                      )}
                      
                      <Link 
                        to={thread.structure?.slug ? `/forums/${thread.structure.slug}/${thread.slug}` : `/threads/${thread.slug}`}
                        className="text-sm font-medium text-white hover:text-emerald-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {thread.title}
                      </Link>
                      
                      {getThreadBadges(thread)}
                    </div>
                    
                    {/* Author info */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>by</span>
                      <Link
                        to={`/users/${thread.user.username}`}
                        className="text-zinc-300 hover:text-zinc-100 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={thread.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.user.username}`} />
                          <AvatarFallback className="bg-zinc-700 text-[8px]">
                            {thread.user.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        {thread.user.username}
                      </Link>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Reply Count */}
                <TableCell className="text-center">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-sm font-semibold text-zinc-200"
                  >
                    {thread.postCount || 0}
                  </motion.div>
                </TableCell>

                {/* View Count */}
                <TableCell className="text-center">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-sm font-semibold text-zinc-200"
                  >
                    {thread.viewCount || 0}
                  </motion.div>
                </TableCell>

                {/* Last Post */}
                <TableCell>
                  {thread.lastPostAt ? (
                    <div className="text-xs">
                      <div className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(thread.lastPostAt), { addSuffix: true })}
                      </div>
                      {'lastPost' in thread && thread.lastPost?.user && (
                        <div className="text-xs text-zinc-500 mt-1">
                          by{' '}
                          <Link
                            to={`/users/${thread.lastPost.user.username}`}
                            className="text-zinc-400 hover:text-zinc-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {thread.lastPost.user.username}
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      No replies yet
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {threads.length === 0 && (
          <div className="p-8 text-center text-zinc-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No threads yet. Be the first to start a discussion!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}