import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Folder, MessageSquare, ChevronRight, ChevronDown, Flame, Target, Archive, Dices, FileText, LayoutGrid } from 'lucide-react';
import { useForumStructure } from '@/features/forum/hooks/useForumStructure';
import { LoadingSpinner } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { ForumCategoryWithStats } from '@shared/types';

// Map theme keys to icon components
const THEME_ICONS = {
  'pit': Flame,
  'mission': Target,
  'casino': Dices,
  'briefing': FileText,
  'archive': Archive,
  'default': Folder
} as const;

interface HierarchicalZoneNavProps {
  className?: string;
  currentZoneId?: number;
  currentForumId?: number;
  showCounts?: boolean; // Option to show/hide count badges
}

/**
 * HierarchicalZoneNav - Primary forum navigation component
 * Displays Primary Zones at the top, followed by Expandable Categories
 * with proper theming, accessibility, and state management
 */
export function HierarchicalZoneNav({ 
  className = '',
  currentZoneId,
  currentForumId,
  showCounts = true // Default to showing counts
}: HierarchicalZoneNavProps) {
  const { data: forumStructure, isLoading, error } = useForumStructure();
  const primaryZones = forumStructure?.primaryZones || [];
  const categories = forumStructure?.categories || [];
  
  // Local state for expanded categories with localStorage persistence
  const [expandedCategories, setExpandedCategories] = useState<Record<string | number, boolean>>({});
  
  // Load expanded state from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('dt-expanded-forum-categories');
    if (stored) {
      try {
        setExpandedCategories(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored expanded categories', e);
      }
    }
  }, []);
  
  // Save expanded state to localStorage whenever it changes
  const toggleCategory = (categoryId: string | number) => {
    const newExpanded = { 
      ...expandedCategories, 
      [categoryId]: !expandedCategories[categoryId] 
    };
    setExpandedCategories(newExpanded);
    localStorage.setItem('dt-expanded-forum-categories', JSON.stringify(newExpanded));
  };

  // Keyboard handling for accessibility
  const handleCategoryKeyDown = (e: React.KeyboardEvent, categoryId: string | number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCategory(categoryId);
    }
  };
  
  // Helper to render the correct icon based on theme or emoji
  const renderZoneIcon = (zone: ForumCategoryWithStats) => {
    // If zone has an emoji icon, render it directly
    if (zone.icon && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(zone.icon)) {
      return <span className="mr-2 text-lg" role="img" aria-label={`${zone.name} icon`}>{zone.icon}</span>;
    }
    
    // Otherwise use the themed icon based on colorTheme
    const IconComponent = zone.colorTheme ? 
      THEME_ICONS[zone.colorTheme as keyof typeof THEME_ICONS] || THEME_ICONS.default 
      : THEME_ICONS.default;
    
    return <IconComponent className={`w-4 h-4 mr-2 ${zone.colorTheme ? `text-${zone.colorTheme}-400` : 'text-zinc-400'}`} />;
  };

  // Calculate aggregated statistics for categories
  const getCategoryStats = (category: ForumCategoryWithStats) => {
    if (!category.childForums || category.childForums.length === 0) {
      return { forumCount: 0, threadCount: 0, postCount: 0 };
    }
    
    return category.childForums.reduce((stats: { forumCount: number; threadCount: number; postCount: number }, forum: ForumCategoryWithStats) => {
      return {
        forumCount: stats.forumCount + 1,
        threadCount: stats.threadCount + (forum.threadCount || 0),
        postCount: stats.postCount + (forum.postCount || 0)
      };
    }, { forumCount: 0, threadCount: 0, postCount: 0 });
  };

  // Render count badges for forums/zones
  const renderCountBadges = (entity: ForumCategoryWithStats, isCategory = false) => {
    if (!showCounts) return null;
    
    let counts = {
      threadCount: entity.threadCount || 0,
      postCount: entity.postCount || 0,
      forumCount: 0
    };
    
    // If this is a category, calculate aggregate counts from child forums
    if (isCategory && 'childForums' in entity && entity.childForums) {
      counts = getCategoryStats(entity);
    }
    
    return (
      <div className="ml-auto flex items-center space-x-1 text-xs">
        {counts.forumCount > 0 && (
          <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700">
            {counts.forumCount} {counts.forumCount === 1 ? 'forum' : 'forums'}
          </Badge>
        )}
        {counts.threadCount > 0 && (
          <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700">
            {counts.threadCount} {counts.threadCount === 1 ? 'thread' : 'threads'}
          </Badge>
        )}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-4" role="status" aria-label="Loading forum navigation">
        <LoadingSpinner size="sm" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-red-500 p-4" role="alert">
        <p className="text-sm">Failed to load forum structure</p>
        {error && <p className="text-xs mt-1 opacity-75">{error.message}</p>}
      </div>
    );
  }
  
  // Empty state
  if (!primaryZones.length && !categories.length) {
    return (
      <div className="text-zinc-500 p-4 text-center">
        <p className="text-sm">No zones available</p>
      </div>
    );
  }
  
  return (
    <nav className={`space-y-2 ${className}`} aria-label="Forum Navigation" role="navigation">
      {/* All Forums Link */}
      <Link 
        href="/forums"
        className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-zinc-800 transition-colors w-full ${
          currentZoneId === undefined && currentForumId === undefined ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text极-zinc-300'
        }`}
        aria-current={currentZoneId === undefined && currentForumId === undefined ? 'page' : undefined}
      >
        <Folder className="w-4 h-4 mr-2 text-zinc-400" />
        All Forums
      </Link>

      {/* Zones Link */}
      <Link 
        href="/zones"
        className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-zinc-800 transition-colors w-full ${
          currentZoneId === undefined && currentForumId === undefined ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-300'
        }`}
        aria-current={currentZoneId === undefined && currentForumId === undefined ? 'page' : undefined}
      >
        <LayoutGrid className="w-4 h-4 mr-2 text-zinc-400" />
        Zones
      </Link>
      
      {/* Primary Zones Section - Collapsible */}
      {primaryZones.length > 0 && (
        <>
          <div 
            className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500 flex justify-between items-center"
            role="heading" 
            aria-level={3}
          >
            <span>Primary Zones</span>
            <span className="text-xs text-zinc-600">{primaryZones.length} zones</span>
          </div>
          
          <div className="space-y-1" role="list">
            {primaryZones.map(zone => (
              zone.canHaveThreads ? (
                <Link 
                  key={zone.id}
                  href={`/forum/${zone.slug}`}
                  className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-zinc-800 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                    currentZoneId === zone.id ? `bg-zinc-800 text-${zone.colorTheme || 'emerald'}-400 font-medium` : 'text-zinc-300'
                  } ${zone.colorTheme ? `zone-nav-theme-${zone.colorTheme}` : ''}`}
                  aria-current={currentZoneId === zone.id ? 'page' : undefined}
                  role="listitem"
                >
                  {renderZoneIcon(zone)}
                  <span className="mr-auto">{zone.name}</span>
                  {renderCountBadges(zone)}
                </Link>
              ) : (
                <div
                  key={zone.id}
                  className="flex items-center px-3 py-2 text-sm rounded-md text-zinc-500 opacity-60 cursor-not-allowed w-full"
                  aria-label="This is a container and does not support threads."
                  title="This is a container and does not support threads."
                  role="listitem"
                >
                  {renderZoneIcon(zone)}
                  <span className="mr-auto">{zone.name}</span>
                  {renderCountBadges(zone)}
                </div>
              )
            ))}
          </div>
          
          {/* Divider between primary zones and categories */}
          <div className="h-px bg-zinc-800 my-2" role="separator" aria-hidden="true"></div>
        </>
      )}
      
      {/* Categories Section - Always Collapsible */}
      {categories.length > 0 && (
        <>
          <div 
            className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500 flex justify-between items-center"
            role="heading" 
            aria-level={3}
          >
            <span>Categories</span>
            <span className="text-xs text-zinc-600">{categories.length} categories</span>
          </div>
          
          <div className="space-y-1" role="list">
            {categories.map(category => (
              <div key={category.id} className="space-y-1" role="listitem">
                {/* Category header (expandable) */}
                <div 
                  className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-zinc-800 transition-colors w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                    currentZoneId === category.id ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-300'
                  }`}
                  onClick={() => toggleCategory(category.id)}
                  onKeyDown={(e) => handleCategoryKeyDown(e, category.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={!!expandedCategories[category.id]}
                  aria-controls={`category-${category.id}-forums`}
                  aria-label={`${expandedCategories[category.id] ? 'Collapse' : 'Expand'} ${category.name} category`}
                >
                  {expandedCategories[category.id] ? (
                    <ChevronDown className="w-4 h-4 mr-2 text-zinc-400" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2 text-zinc-极400" aria-hidden="true" />
                  )}
                  <Folder className="w-4 h-4 mr-2 text-amber-400" aria-hidden="true" />
                  <span className="mr-auto">{category.name}</span>
                  {renderCountBadges(category, true)}
                </div>
                
                {/* Forums under this category */}
                {expandedCategories[category.id] && category.childForums && category.childForums.length > 0 && (
                  <div 
                    id={`category-${category.id}-forums`} 
                    className="ml-6 space-y-1 border-l border-zinc-700 pl-2"
                    role="list"
                    aria-label={`Forums in ${category.name}`}
                  >
                    {category.childForums.map(forum => (
                      forum.canHaveThreads ? (
                        <Link 
                          key={forum.id}
                          href={`/forum/${forum.slug}`}
                          className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-zinc-800 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                            currentForumId === forum.id ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400'
                          }`}
                          aria-current={currentForumId === forum.id ? 'page' : undefined}
                          role="listitem"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-zinc-500" aria-hidden="true" />
                          <span className="mr-auto">{forum.name}</span>
                          {renderCountBadges(forum)}
                        </Link>
                      ) : (
                        <div
                          key={forum.id}
                          className="flex items-center px-3 py-2 text-sm rounded-md text-zinc-500 opacity-60 cursor-not-allowed w-full"
                          aria-label="This is a container and does not support threads."
                          title="This is a container and does not support threads."
                          role="listitem"
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-zinc-500" aria-hidden="true" />
                          <span className="mr-auto">{forum.name}</span>
                          {renderCountBadges(forum)}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}

// Export both named and default for backwards compatibility
export { HierarchicalZoneNav as HierarchicalForumNav };
export default HierarchicalZoneNav;
