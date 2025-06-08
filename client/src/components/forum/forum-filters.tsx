import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Flame, Clock, ThumbsUp, MessageSquare } from 'lucide-react';
import { forumRulesConfig, PrefixStyle } from '@/config/forumRules.config.ts'; // [CONFIG-REFAC]
import { cosmeticsConfig, TagStyle } from '@/config/cosmetics.config.ts'; // [CONFIG-REFAC]

// Helper function to map icon names to components [CONFIG-REFAC]
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    Flame: <Flame className="h-4 w-4 mr-1" />,
    ThumbsUp: <ThumbsUp className="h-4 w-4 mr-1" />,
    MessageSquare: <MessageSquare className="h-4 w-4 mr-1" />,
    Clock: <Clock className="h-4 w-4 mr-1" />,
  };
  return iconMap[iconName] || <MessageSquare className="h-4 w-4 mr-1" />;
};

interface ForumFiltersProps {
  onFilterChange?: (type: string, value: string) => void;
  onSortChange?: (sortOption: string) => void;
  selectedPrefix?: string | null;
  selectedTag?: string | null;
  selectedSort?: string;
  prefixes?: string[];
  tags?: string[];
  className?: string;
}

export function ForumFilters({
  onFilterChange = () => { },
  onSortChange = () => { },
  selectedPrefix = null,
  selectedTag = null,
  selectedSort = forumRulesConfig.threadSortOptions.hot.key, // [CONFIG-REFAC]
  prefixes = Object.keys(forumRulesConfig.prefixStyles), // [CONFIG-REFAC]
  tags = Object.keys(cosmeticsConfig.tagStyles), // [CONFIG-REFAC]
  className = '',
}: ForumFiltersProps) {
  const handlePrefixClick = (prefix: string) => {
    onFilterChange('prefix', prefix === selectedPrefix ? '' : prefix);
  };

  const handleTagClick = (tag: string) => {
    onFilterChange('tag', tag === selectedTag ? '' : tag);
  };

  const handleSortClick = (sort: string) => {
    onSortChange(sort);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter by heading */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300 flex items-center">
          <Filter className="h-4 w-4 mr-2 text-zinc-400" />
          Filter by:
        </h3>
      </div>

      {/* Prefixes filter */}
      <div>
        <h4 className="text-xs text-zinc-500 mb-2">PREFIXES</h4>
        <div className="flex flex-wrap gap-2">
          {/* Dynamic prefixes from forumRulesConfig [CONFIG-REFAC] */}
          {Object.values(forumRulesConfig.prefixStyles).map((prefixStyle: PrefixStyle) => (
            <Badge
              key={prefixStyle.key}
              className={`cursor-pointer ${prefixStyle.cssClasses} ${selectedPrefix === prefixStyle.key ? 'ring-2 ring-white/20' : ''}`}
              onClick={() => handlePrefixClick(prefixStyle.key)}
            >
              {getIconComponent(prefixStyle.icon)}
              {prefixStyle.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags filter */}
      <div>
        <h4 className="text-xs text-zinc-500 mb-2">TAGS</h4>
        <div className="flex flex-wrap gap-2">
          {/* Dynamic tags from cosmeticsConfig [CONFIG-REFAC] */}
          {Object.values(cosmeticsConfig.tagStyles).map((tagStyle: TagStyle) => (
            <Badge
              key={tagStyle.key}
              variant="outline"
              className={`cursor-pointer ${tagStyle.cssClasses} ${selectedTag === tagStyle.key ? 'ring-2 ring-white/20' : ''}`}
              onClick={() => handleTagClick(tagStyle.key)}
            >
              {tagStyle.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sort options */}
      <div>
        <h4 className="text-xs text-zinc-500 mb-2">SORT BY</h4>
        <div className="flex flex-wrap gap-2">
          {/* Dynamic sort options from forumRulesConfig [CONFIG-REFAC] */}
          {['hot', 'new', 'top'].map((sortKey) => {
            const sortOption = forumRulesConfig.threadSortOptions[sortKey];
            if (!sortOption) return null;

            return (
              <Button
                key={sortKey}
                variant={selectedSort === sortKey ? 'default' : 'outline'}
                size="sm"
                className={selectedSort !== sortKey ? 'border-zinc-700 bg-zinc-800/40' : ''}
                onClick={() => handleSortClick(sortKey)}
              >
                {sortKey === 'hot' && <Flame className="h-4 w-4 mr-1" />}
                {sortKey === 'new' && <Clock className="h-4 w-4 mr-1" />}
                {sortKey === 'top' && <ThumbsUp className="h-4 w-4 mr-1" />}
                {sortOption.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 