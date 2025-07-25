/**
 * Unified Leaderboard Widget Component
 * 
 * A modular, scalable widget system that maintains visual consistency
 * with the main leaderboard page while offering flexible display options
 */

import React, { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Award,
  ArrowRight,
  Sparkles,
  Clock,
  Users
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@app/components/ui/avatar';
import { Button } from '@app/components/ui/button';
import { Skeleton } from '@app/components/ui/skeleton';
import { Badge } from '@app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@app/components/ui/select';
import { cn } from '@app/utils/utils';
import { formatNumber } from '@app/utils/utils';
import type { UserId } from '@shared/types/ids';
import { leaderboardTheme, getRankStyle, getMetricColor, getSizeConfig } from './leaderboard-theme';

// Types
interface LeaderboardEntry {
  userId: UserId;
  username: string;
  level: number;
  xp: number;
  totalXp: number;
  weeklyXp: number;
  rank: number;
  trend?: 'up' | 'down' | 'stable';
  avatar?: string;
  // Additional metrics
  reputation?: number;
  tips?: number;
  posts?: number;
}

export interface LeaderboardWidgetProps {
  variant?: 'micro' | 'compact' | 'standard' | 'expanded';
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  metric?: 'xp' | 'reputation' | 'tips' | 'activity';
  limit?: number;
  showViewAll?: boolean;
  animated?: boolean;
  className?: string;
  title?: string;
}

// Get appropriate metric value from entry
const getMetricValue = (entry: LeaderboardEntry, metric: string, timeframe: string) => {
  if (metric === 'xp') {
    return timeframe === 'weekly' ? entry.weeklyXp : entry.totalXp;
  }
  if (metric === 'reputation') return entry.reputation || 0;
  if (metric === 'tips') return entry.tips || 0;
  if (metric === 'activity') return entry.posts || 0;
  return entry.totalXp;
};

// Get metric label
const getMetricLabel = (metric: string, timeframe: string) => {
  const labels = {
    xp: timeframe === 'all-time' ? 'Total XP' : `${timeframe} XP`,
    reputation: 'Reputation',
    tips: 'DGT Tipped',
    activity: 'Posts'
  };
  return labels[metric as keyof typeof labels] || 'Score';
};

// Get rank icon
const getRankIcon = (rank: number, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const iconClass = sizeClasses[size];
  
  switch (rank) {
    case 1:
      return <Crown className={cn(iconClass, 'text-amber-500')} />;
    case 2:
      return <Medal className={cn(iconClass, 'text-gray-400')} />;
    case 3:
      return <Award className={cn(iconClass, 'text-amber-700')} />;
    default:
      return null;
  }
};

// Get trend icon
const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    case 'stable':
      return <Minus className="h-3 w-3 text-zinc-500" />;
    default:
      return null;
  }
};

export function LeaderboardWidget({
  variant = 'compact',
  timeframe = 'weekly',
  metric = 'xp',
  limit,
  showViewAll = true,
  animated = true,
  className,
  title = 'Top Degens'
}: LeaderboardWidgetProps) {
  const sizeConfig = getSizeConfig(variant);
  const displayLimit = limit || sizeConfig.userLimit;
  
  // Fetch leaderboard data
  const { data, isLoading, isError } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', metric, timeframe],
    queryFn: async () => {
      const isCurrentWeek = timeframe === 'weekly';
      const response = await fetch(
        `/api/analytics/leaderboards/${metric}?current=${isCurrentWeek}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: []
  });
  
  // Process data based on limit
  const displayData = useMemo(() => {
    if (!data) return [];
    return data.slice(0, displayLimit);
  }, [data, displayLimit]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn(leaderboardTheme.classes.container, className)}>
        <CardHeader className={cn(leaderboardTheme.classes.header, sizeConfig.padding)}>
          <CardTitle className={sizeConfig.text.username}>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className={sizeConfig.padding}>
          <div className={cn('space-y-2', sizeConfig.gap)}>
            {Array.from({ length: displayLimit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className={cn(sizeConfig.avatar, 'rounded-full')} />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  {variant !== 'micro' && <Skeleton className="h-3 w-16" />}
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (isError || !displayData.length) {
    return (
      <Card className={cn(leaderboardTheme.classes.container, className)}>
        <CardHeader className={cn(leaderboardTheme.classes.header, sizeConfig.padding)}>
          <CardTitle className={cn('flex items-center gap-2', sizeConfig.text.username)}>
            <Trophy className="h-4 w-4 text-emerald-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(sizeConfig.padding, 'text-center text-zinc-500')}>
          {isError ? 'Failed to load leaderboard' : 'No data available yet'}
        </CardContent>
      </Card>
    );
  }
  
  // Render based on variant
  const renderMicroVariant = () => (
    <div className={cn('space-y-1', sizeConfig.gap)}>
      {displayData.map((entry, index) => {
        const rankStyle = getRankStyle(entry.rank);
        
        return (
          <Link
            key={entry.userId}
            to={`/user/${entry.username}`}
            className={cn(
              'flex items-center gap-2 p-1.5 rounded',
              leaderboardTheme.classes.item,
              leaderboardTheme.classes.itemHover,
              entry.rank <= 3 && `bg-gradient-to-r ${rankStyle.gradient}`
            )}
          >
            <div className={cn('text-xs font-bold', rankStyle.text)}>
              {entry.rank <= 3 ? getRankIcon(entry.rank, 'sm') : `#${entry.rank}`}
            </div>
            <Avatar className={sizeConfig.avatar}>
              <AvatarImage src={entry.avatar} />
              <AvatarFallback className="text-[10px]">
                {entry.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={cn('truncate font-medium', sizeConfig.text.username)}>
                {entry.username}
              </p>
            </div>
            <div className={cn('text-right', sizeConfig.text.metric)}>
              <span className={cn('font-mono', `text-${getMetricColor(metric)}`)}>
                {formatNumber(getMetricValue(entry, metric, timeframe))}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
  
  const renderCompactVariant = () => (
    <div className={cn('space-y-2', sizeConfig.gap)}>
      {displayData.map((entry, index) => {
        const rankStyle = getRankStyle(entry.rank);
        const isActive = entry.weeklyXp > 0; // Simple activity indicator
        
        return (
          <motion.div
            key={entry.userId}
            initial={animated ? leaderboardTheme.animations.itemEnter.initial : false}
            animate={animated ? leaderboardTheme.animations.itemEnter.animate : false}
            transition={{
              ...leaderboardTheme.animations.itemEnter.transition,
              delay: index * 0.05
            }}
          >
            <Link
              to={`/user/${entry.username}`}
              className={cn(
                'flex items-center gap-3 p-2 rounded-md',
                leaderboardTheme.classes.item,
                leaderboardTheme.classes.itemHover,
                entry.rank <= 3 && `bg-gradient-to-r ${rankStyle.gradient} ${rankStyle.border} border`
              )}
            >
              <div className={cn('font-bold', rankStyle.text)}>
                {entry.rank <= 3 ? getRankIcon(entry.rank) : (
                  <span className="text-sm">#{entry.rank}</span>
                )}
              </div>
              <Avatar className={sizeConfig.avatar}>
                <AvatarImage src={entry.avatar} />
                <AvatarFallback className={sizeConfig.text.label}>
                  {entry.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium truncate', sizeConfig.text.username)}>
                  {entry.username}
                </p>
                <p className={cn('text-zinc-500', sizeConfig.text.label)}>
                  Lvl {entry.level}
                  {isActive && (
                    <Sparkles className="h-3 w-3 text-emerald-400 inline-block ml-1" />
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-mono',
                  sizeConfig.text.metric,
                  leaderboardTheme.classes.metric,
                  `text-${getMetricColor(metric)}`
                )}>
                  {formatNumber(getMetricValue(entry, metric, timeframe))}
                </p>
                {entry.trend && (
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {getTrendIcon(entry.trend)}
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
  
  const renderStandardOrExpanded = () => (
    <div className={cn('space-y-3', sizeConfig.gap)}>
      {/* Top 3 showcase cards for standard/expanded */}
      {variant !== 'compact' && displayData.slice(0, 3).length === 3 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {displayData.slice(0, 3).map((entry, index) => {
            const rankStyle = getRankStyle(entry.rank);
            
            return (
              <motion.div
                key={entry.userId}
                initial={animated ? { opacity: 0, y: 20 } : false}
                animate={animated ? { opacity: 1, y: 0 } : false}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    'relative overflow-hidden border-2 cursor-pointer',
                    `bg-gradient-to-br ${rankStyle.gradient} ${rankStyle.border}`,
                    'hover:shadow-lg transition-all'
                  )}
                  onClick={() => window.location.href = `/user/${entry.username}`}
                >
                  <div className="absolute top-2 right-2">
                    {getRankIcon(entry.rank, 'lg')}
                  </div>
                  <CardContent className="p-4 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-2 ring-4 ring-background">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-sm mb-1">{entry.username}</h3>
                    <Badge variant="secondary" className="mb-2">
                      Lvl {entry.level}
                    </Badge>
                    <p className={cn('text-2xl font-bold', rankStyle.text)}>
                      {formatNumber(getMetricValue(entry, metric, timeframe))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getMetricLabel(metric, timeframe)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* Rest of the leaderboard */}
      <div className="space-y-2">
        {displayData.slice(variant !== 'compact' ? 3 : 0).map((entry, index) => {
          const actualIndex = variant !== 'compact' ? index + 3 : index;
          
          return renderCompactVariant();
        })}
      </div>
    </div>
  );
  
  return (
    <Card className={cn(
      leaderboardTheme.classes.container,
      sizeConfig.container,
      className
    )}>
      <CardHeader className={cn(leaderboardTheme.classes.header, sizeConfig.padding)}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn('flex items-center gap-2', sizeConfig.text.username)}>
            <Trophy className="h-4 w-4 text-emerald-500" />
            {title}
          </CardTitle>
          {variant !== 'micro' && (
            <Select
              value={timeframe}
              onValueChange={(value) => {
                // This would typically be handled by parent component
                // For now, just showing the UI
              }}
            >
              <SelectTrigger className={cn('w-32', sizeConfig.text.label)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn(sizeConfig.padding, 'overflow-y-auto')}>
        {variant === 'micro' && renderMicroVariant()}
        {variant === 'compact' && renderCompactVariant()}
        {(variant === 'standard' || variant === 'expanded') && renderStandardOrExpanded()}
      </CardContent>
      
      {showViewAll && (
        <CardFooter className={cn('border-t border-zinc-800', sizeConfig.padding)}>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between"
            onClick={() => window.location.href = '/leaderboard'}
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}