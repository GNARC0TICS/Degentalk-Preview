import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@app/utils/utils';
import {
  Filter,
  Calendar,
  TrendingUp,
  MessageSquare,
  Eye,
  X,
  Check,
  ChevronDown,
  Clock
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Button } from '@app/components/ui/button';
import { Label } from '@app/components/ui/label';
import { Switch } from '@app/components/ui/switch';
import theme from '@app/config/theme.config';

export interface FeedFilter {
  sortBy: 'recent' | 'hot' | 'views' | 'replies';
  timeRange: 'all' | 'today' | 'week' | 'month' | 'year';
  showSticky: boolean;
  showSolved: boolean;
  minReplies?: number;
  minViews?: number;
}

interface FeedFiltersProps {
  filters: FeedFilter;
  onFiltersChange: (filters: FeedFilter) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

const defaultFilters: FeedFilter = {
  sortBy: 'recent',
  timeRange: 'all',
  showSticky: true,
  showSolved: true
};

const sortOptions = [
  { value: 'recent', label: 'Recent Activity', icon: Clock },
  { value: 'hot', label: 'Trending', icon: TrendingUp },
  { value: 'views', label: 'Most Viewed', icon: Eye },
  { value: 'replies', label: 'Most Replies', icon: MessageSquare }
];

const timeRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

export function FeedFilters({
  filters,
  onFiltersChange,
  className,
  variant = 'default'
}: FeedFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FeedFilter>(filters);

  // Sync filters with URL on mount
  useEffect(() => {
    const urlFilters: Partial<FeedFilter> = {};
    
    const sortBy = searchParams.get('sort');
    if (sortBy && ['recent', 'hot', 'views', 'replies'].includes(sortBy)) {
      urlFilters.sortBy = sortBy as FeedFilter['sortBy'];
    }
    
    const timeRange = searchParams.get('time');
    if (timeRange && ['all', 'today', 'week', 'month', 'year'].includes(timeRange)) {
      urlFilters.timeRange = timeRange as FeedFilter['timeRange'];
    }
    
    const showSticky = searchParams.get('sticky');
    if (showSticky !== null) {
      urlFilters.showSticky = showSticky === 'true';
    }
    
    const showSolved = searchParams.get('solved');
    if (showSolved !== null) {
      urlFilters.showSolved = showSolved === 'true';
    }
    
    const minReplies = searchParams.get('min_replies');
    if (minReplies && !isNaN(parseInt(minReplies))) {
      urlFilters.minReplies = parseInt(minReplies);
    }
    
    const minViews = searchParams.get('min_views');
    if (minViews && !isNaN(parseInt(minViews))) {
      urlFilters.minViews = parseInt(minViews);
    }
    
    if (Object.keys(urlFilters).length > 0) {
      const newFilters = { ...defaultFilters, ...urlFilters };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    }
  }, []);

  // Update URL when filters change
  const updateFilters = (newFilters: FeedFilter) => {
    setLocalFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    
    // Only set non-default values
    if (newFilters.sortBy !== defaultFilters.sortBy) {
      params.set('sort', newFilters.sortBy);
    } else {
      params.delete('sort');
    }
    
    if (newFilters.timeRange !== defaultFilters.timeRange) {
      params.set('time', newFilters.timeRange);
    } else {
      params.delete('time');
    }
    
    if (newFilters.showSticky !== defaultFilters.showSticky) {
      params.set('sticky', newFilters.showSticky.toString());
    } else {
      params.delete('sticky');
    }
    
    if (newFilters.showSolved !== defaultFilters.showSolved) {
      params.set('solved', newFilters.showSolved.toString());
    } else {
      params.delete('solved');
    }
    
    if (newFilters.minReplies) {
      params.set('min_replies', newFilters.minReplies.toString());
    } else {
      params.delete('min_replies');
    }
    
    if (newFilters.minViews) {
      params.set('min_views', newFilters.minViews.toString());
    } else {
      params.delete('min_views');
    }
    
    setSearchParams(params, { replace: true });
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    updateFilters(defaultFilters);
    setIsOpen(false);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.sortBy !== defaultFilters.sortBy ||
      localFilters.timeRange !== defaultFilters.timeRange ||
      localFilters.showSticky !== defaultFilters.showSticky ||
      localFilters.showSolved !== defaultFilters.showSolved ||
      localFilters.minReplies ||
      localFilters.minViews
    );
  };

  const isCompact = variant === 'compact';
  const currentSort = sortOptions.find(opt => opt.value === localFilters.sortBy);
  const SortIcon = currentSort?.icon || Filter;

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={isCompact ? 'sm' : 'default'}
            className={cn(
              'gap-2',
              hasActiveFilters() && 'border-orange-500/50 text-orange-300'
            )}
          >
            <SortIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{currentSort?.label || 'Filters'}</span>
            {hasActiveFilters() && (
              <span className="ml-1 h-2 w-2 rounded-full bg-orange-400" />
            )}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-0 bg-zinc-950/95 backdrop-blur-md border-zinc-800"
          align="end"
        >
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">Feed Filters</h3>
              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs text-zinc-400 hover:text-orange-300"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Sort By */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Sort By</Label>
              <div className="grid grid-cols-2 gap-2">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = localFilters.sortBy === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => updateFilters({ ...localFilters, sortBy: option.value as FeedFilter['sortBy'] })}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                        'border border-zinc-800 hover:border-zinc-700',
                        isActive
                          ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                          : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-300'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-xs">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Range */}
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Time Range</Label>
              <select
                value={localFilters.timeRange}
                onChange={(e) => updateFilters({ ...localFilters, timeRange: e.target.value as FeedFilter['timeRange'] })}
                className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:border-orange-500/50 focus:outline-none"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Filters */}
            <div className="space-y-3 border-t border-zinc-800 pt-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-sticky" className="text-xs text-zinc-400 cursor-pointer">
                  Show Sticky Threads
                </Label>
                <Switch
                  id="show-sticky"
                  checked={localFilters.showSticky}
                  onCheckedChange={(checked) => updateFilters({ ...localFilters, showSticky: checked })}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-solved" className="text-xs text-zinc-400 cursor-pointer">
                  Show Solved Threads
                </Label>
                <Switch
                  id="show-solved"
                  checked={localFilters.showSolved}
                  onCheckedChange={(checked) => updateFilters({ ...localFilters, showSolved: checked })}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="space-y-3 border-t border-zinc-800 pt-3">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Minimum Replies</Label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.minReplies || ''}
                  onChange={(e) => updateFilters({ 
                    ...localFilters, 
                    minReplies: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="Any"
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Minimum Views</Label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.minViews || ''}
                  onChange={(e) => updateFilters({ 
                    ...localFilters, 
                    minViews: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="Any"
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default FeedFilters;