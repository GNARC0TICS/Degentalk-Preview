import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity as XPIcon, 
  Clock, 
  Filter, 
  ChevronDown, 
  X,
  MessageSquare,
  FileText,
  Heart,
  LogIn,
  AtSign,
  MessageCircleReply as Reply,
  UserCheck
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

// Types
interface XpLogEntry {
  id: number;
  userId: number;
  action: string;
  amount: number;
  metadata: any;
  createdAt: string;
}

interface XpLogResponse {
  logs: XpLogEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    action?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface XpActionDefinition {
  action: string;
  description: string;
  baseValue: number;
  enabled: boolean;
}

// Icon mapping for different XP actions
const actionIcons: Record<string, React.ReactNode> = {
  POST_CREATE: <MessageSquare className="h-4 w-4" />,
  THREAD_CREATE: <FileText className="h-4 w-4" />,
  POST_LIKE: <Heart className="h-4 w-4" />,
  LOGIN: <LogIn className="h-4 w-4" />,
  USER_MENTION: <AtSign className="h-4 w-4" />,
  REPLY_RECEIVED: <Reply className="h-4 w-4" />,
  PROFILE_UPDATE: <UserCheck className="h-4 w-4" />,
};

// Default icon if no mapping exists
const DefaultIcon = () => <XPIcon className="h-4 w-4" />;

// Helper function to get icon for action
const getActionIcon = (action: string) => {
  return actionIcons[action] || <DefaultIcon />;
};

// Helper to get a nice color for XP amount based on value
const getXpColor = (amount: number) => {
  if (amount >= 50) return 'text-gradient-purple';
  if (amount >= 30) return 'text-gradient-blue';
  if (amount >= 10) return 'text-gradient-green';
  return 'text-gradient-gold';
};

const XpLogView: React.FC<{ userId?: number }> = ({ userId }) => {
  // State for filters and pagination
  const [period, setPeriod] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 10;

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [period, selectedAction]);

  // Fetch XP logs with current filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['xpLogs', userId, period, selectedAction, page],
    queryFn: async () => {
      // Use domain-based endpoints
      let url = userId 
        ? `/api/xp/users/${userId}/logs` 
        : `/api/xp/me/logs`;
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      params.append('offset', String(page * limit));
      
      if (period && period !== 'all') {
        params.append('period', period);
      }
      
      if (selectedAction) {
        params.append('action', selectedAction);
      }
      
      return apiRequest(`${url}?${params.toString()}`);
    },
    keepPreviousData: true
  });

  // Fetch actions for the dropdown filter
  const { data: actionsData } = useQuery({
    queryKey: ['xpActions'],
    queryFn: async () => {
      return apiRequest('/api/xp/actions');
    }
  });

  // Handle loading more logs
  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Clear all filters
  const clearFilters = () => {
    setPeriod('all');
    setSelectedAction(null);
  };

  // Format the XP log entry timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const isToday = new Date().toDateString() === date.toDateString();
    
    if (isToday) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    return format(date, 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="w-full rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10 shadow-xl p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <XPIcon className="mr-2 h-5 w-5 text-green-400" />
            XP History
          </h2>
          
          {/* Action filter dropdown */}
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center ${selectedAction ? 'text-green-400 border-green-400/20 border' : ''}`}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {selectedAction ? 'Filtered' : 'Filter Actions'}
                  <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black/80 backdrop-blur-md border border-white/10">
                <DropdownMenuCheckboxItem
                  checked={!selectedAction}
                  onCheckedChange={() => setSelectedAction(null)}
                >
                  All Actions
                </DropdownMenuCheckboxItem>
                <div className="max-h-[200px] overflow-y-auto py-1">
                  {actionsData?.actions?.map(action => (
                    <DropdownMenuCheckboxItem
                      key={action.action}
                      checked={selectedAction === action.action}
                      onCheckedChange={() => setSelectedAction(selectedAction === action.action ? null : action.action)}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{getActionIcon(action.action)}</span>
                        {action.description}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(period !== 'all' || selectedAction) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Time period tabs */}
        <Tabs value={period} onValueChange={setPeriod} className="w-full">
          <TabsList className="bg-black/60 mb-4">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          
          <TabsContent value={period} className="mt-0">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center py-3 border-b border-white/5">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-4 space-y-2 w-full">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="text-center py-8 text-gray-400">
                <p>Error loading XP logs. Please try again.</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : data?.logs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-2">No XP activity found</p>
                <p className="text-sm opacity-70">
                  {period !== 'all'
                    ? `Try checking a different time period or removing filters`
                    : `Get active on the forum to earn XP!`}
                </p>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {data?.logs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-start py-3 border-b border-white/5 hover:bg-white/5 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-black/40 backdrop-filter backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="ml-3 flex-grow">
                        <div className="flex justify-between items-center">
                          <span className={`font-bold text-lg ${getXpColor(log.amount)}`}>
                            +{log.amount} XP
                          </span>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(log.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm opacity-80 mt-0.5">
                          {actionsData?.actions?.find(a => a.action === log.action)?.description || log.action}
                        </p>
                        
                        {log.metadata && (
                          <div className="mt-1">
                            {log.metadata.postId && (
                              <Badge variant="outline" className="text-xs mr-2">
                                Post #{log.metadata.postId}
                              </Badge>
                            )}
                            {log.metadata.threadId && (
                              <Badge variant="outline" className="text-xs">
                                Thread #{log.metadata.threadId}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {data?.pagination.hasMore && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4 border border-white/10 hover:bg-white/10"
                    onClick={loadMore}
                  >
                    Load More
                  </Button>
                )}
                
                <div className="text-center text-xs text-gray-500 mt-3">
                  Showing {data?.logs.length} of {data?.pagination.total} activities
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default XpLogView; 