import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { 
  Folder, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown, 
  Flame, 
  Target, 
  Archive, 
  Dices, 
  FileText, 
  LayoutGrid,
  Hash,
  Users
} from 'lucide-react';
import { useForumStructure } from '@/features/forum/hooks/useForumStructure';
import { LoadingSpinner } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { ForumCategoryWithStats } from '@shared/types';
import { motion, AnimatePresence } from 'framer-motion';
import { primaryZonesArray, PrimaryZone } from '@/constants/primaryZones.tsx'; // Import primaryZonesArray and PrimaryZone

// Enhanced theme configuration
const ZONE_THEMES = {
  'theme-pit': { 
    icon: Flame, 
    color: 'text-red-400', 
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30',
    label: 'The Pit'
  },
  'theme-mission': { 
    icon: Target, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    label: 'Mission Control'
  },
  'theme-casino': { 
    icon: Dices, 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500/30',
    label: 'Casino Floor'
  },
  'theme-briefing': { 
    icon: FileText, 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-500/30',
    label: 'Briefing Room'
  },
  'theme-archive': { 
    icon: Archive, 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-500/30',
    label: 'Archive'
  }
} as const;

interface HierarchicalZoneNavProps {
  className?: string;
  currentZoneId?: number;
  currentForumId?: number;
  showCounts?: boolean;
  compact?: boolean;
}

// Separate component for navigation items to improve reusability
const NavItem = ({ 
  href, 
  isActive, 
  icon: Icon, 
  children, 
  theme,
  counts,
  disabled = false,
  onClick
}: {
  href?: string;
  isActive?: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
  theme?: keyof typeof ZONE_THEMES;
  counts?: { threads?: number; posts?: number; forums?: number };
  disabled?: boolean;
  onClick?: () => void;
}) => {
  const themeConfig = theme ? ZONE_THEMES[theme] : null;
  
  const content = (
    <div 
      className={`
        flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 w-full group
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${isActive 
          ? `${themeConfig?.bgColor || 'bg-emerald-900/20'} ${themeConfig?.color || 'text-emerald-400'} font-medium ${themeConfig?.borderColor || 'border-emerald-500/30'} border-l-2`
          : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center">
        <Icon className={`w-4 h-4 mr-3 ${isActive ? themeConfig?.color || 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-300'}`} />
        <span className="font-medium">{children}</span>
      </div>
      {counts && (
        <div className="flex items-center gap-2">
          {counts.forums && counts.forums > 0 && (
            <Badge variant="outline" className="text-xs bg-zinc-800/50 text-zinc-500 border-zinc-700/50 px-1.5 py-0.5">
              {counts.forums}
            </Badge>
          )}
          {counts.threads && counts.threads > 0 && (
            <Badge variant="outline" className="text-xs bg-zinc-800/50 text-zinc-500 border-zinc-700/50 px-1.5 py-0.5">
              <Hash className="w-3 h-3 mr-0.5" />
              {counts.threads}
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  if (disabled || !href) {
    return content;
  }

  return (
    <Link href={href}>
      <div className="block">
        {content}
      </div>
    </Link>
  );
};

// Category component for better organization
const CategorySection = ({ 
  category, 
  isExpanded, 
  onToggle, 
  currentForumId 
}: { 
  category: ForumCategoryWithStats;
  isExpanded: boolean;
  onToggle: () => void;
  currentForumId?: number;
}) => {
  const stats = useMemo(() => {
    if (!category.childForums?.length) return null;
    return category.childForums.reduce((acc, forum) => ({
      forums: acc.forums + 1,
      threads: acc.threads + (forum.threadCount || 0),
      posts: acc.posts + (forum.postCount || 0)
    }), { forums: 0, threads: 0, posts: 0 });
  }, [category.childForums]);

  return (
    <div className="space-y-1">
      {/* Category Header */}
      <div 
        className={`
          flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-200 
          hover:bg-zinc-800/50 group
        `}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 mr-2 text-zinc-400 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2 text-zinc-400 transition-transform" />
          )}
          <Folder className="w-4 h-4 mr-3 text-amber-400" />
          <span className="font-medium text-zinc-300 group-hover:text-white">
            {category.name}
          </span>
        </div>
        {stats && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-zinc-800/50 text-zinc-500 border-zinc-700/50 px-1.5 py-0.5">
              <Users className="w-3 h-3 mr-0.5" />
              {stats.forums}
            </Badge>
            {stats.threads > 0 && (
              <Badge variant="outline" className="text-xs bg-zinc-800/50 text-zinc-500 border-zinc-700/50 px-1.5 py-0.5">
                <Hash className="w-3 h-3 mr-0.5" />
                {stats.threads}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Child Forums */}
      <AnimatePresence>
        {isExpanded && category.childForums && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-6 space-y-1 border-l-2 border-zinc-800/50 pl-4"
          >
            {category.childForums.map(forum => (
              <NavItem
                key={forum.id}
                href={forum.canHaveThreads ? `/forum/${forum.slug}` : undefined}
                isActive={currentForumId === forum.id}
                icon={MessageSquare}
                disabled={!forum.canHaveThreads}
                counts={{ threads: forum.threadCount, posts: forum.postCount }}
              >
                {forum.name}
              </NavItem>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function HierarchicalZoneNav({ 
  className = '',
  currentZoneId,
  currentForumId,
  showCounts = true,
  compact = false
}: HierarchicalZoneNavProps) {
  // Fetch general categories from API
  const { data: forumStructure, isLoading, error } = useForumStructure();
  const categories = forumStructure?.categories || [];
  
  // Use static primary zones from constants
  const primaryZones: PrimaryZone[] = primaryZonesArray;

  // Optimized state management with localStorage persistence
  const [expandedCategories, setExpandedCategories] = useState<Record<string | number, boolean>>({});
  
  // Load state from localStorage on mount
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

  // Debounced localStorage save
  const saveToStorage = useCallback((newState: Record<string | number, boolean>) => {
    localStorage.setItem('dt-expanded-forum-categories', JSON.stringify(newState));
  }, []);

  const toggleCategory = useCallback((categoryId: string | number) => {
    setExpandedCategories(prev => {
      const newState = { ...prev, [categoryId]: !prev[categoryId] };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  // Memoized icon renderer for Primary Zones (using PrimaryZone type)
  const renderPrimaryZoneIcon = useCallback((zone: PrimaryZone) => {
    // Handle emoji icons
    if (zone.icon && typeof zone.icon === 'string' && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(zone.icon)) {
      return <span className="mr-3 text-lg" role="img" aria-label={`${zone.label} icon`}>{zone.icon}</span>;
    }
    
    // Handle themed icons
    const theme = zone.colorTheme as keyof typeof ZONE_THEMES;
    const themeConfig = ZONE_THEMES[theme];
    if (themeConfig) {
      const IconComponent = themeConfig.icon;
      return <IconComponent className={`w-4 h-4 mr-3 ${themeConfig.color}`} />;
    }
    
    return <Folder className="w-4 h-4 mr-3 text-zinc-400" />;
  }, []);

  // Loading state for API data (categories)
  if (isLoading) {
    return (
      <div className="flex justify-center p-6" role="status" aria-label="Loading forum navigation">
        <LoadingSpinner size="sm" />
      </div>
    );
  }
  
  // Error state for API data (categories)
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4" role="alert">
        <p className="text-sm text-red-400 font-medium">Failed to load general forum structure</p>
        {error && <p className="text-xs text-red-300/70 mt-1">{error.message}</p>}
      </div>
    );
  }
  
  // Empty state (only if NO primary zones AND NO categories)
  if (primaryZones.length === 0 && categories.length === 0) {
    return (
      <div className="text-center p-6 bg-zinc-900/30 rounded-lg border border-zinc-800">
        <Folder className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
        <p className="text-sm text-zinc-500">No forums available</p>
      </div>
    );
  }
  
  return (
    <nav className={`space-y-3 ${className}`} aria-label="Forum Navigation" role="navigation">
      {/* Quick Navigation */}
      <div className="space-y-1">
        <NavItem
          href="/forum" // Link to the new main forum page
          isActive={currentZoneId === undefined && currentForumId === undefined}
          icon={LayoutGrid}
        >
          All Forums
        </NavItem>
      </div>
      
      {/* Primary Zones */}
      {primaryZones.length > 0 && (
        <section className="space-y-2">
          <div className="px-3 py-1">
            <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
              Primary Zones
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">{primaryZones.length} zones</p>
          </div>
          
          <div className="space-y-1">
            {primaryZones.map(zone => (
              <NavItem
                key={zone.id}
                href={`/${zone.slug}`} // Link directly to primary zone slug
                isActive={currentZoneId === zone.id} // Need to adjust isActive logic if zoneId is string
                icon={() => renderPrimaryZoneIcon(zone)} // Use the new icon renderer
                theme={zone.colorTheme as keyof typeof ZONE_THEMES}
                disabled={!zone.forums || zone.forums.length === 0} // Disable if no associated forums
                counts={showCounts ? { threads: zone.stats?.threadCount, posts: zone.stats?.postCount } : undefined} // Use stats from PrimaryZone
              >
                {zone.label} {/* Use label for PrimaryZone */}
              </NavItem>
            ))}
          </div>
        </section>
      )}
      
      {/* Categories (General Forums) */}
      {categories.length > 0 && (
        <section className="space-y-2">
          {primaryZones.length > 0 && (
            <div className="h-px bg-zinc-800/50 my-4" />
          )}
          
          <div className="px-3 py-1">
            <h3 className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
              Categories
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">{categories.length} categories</p>
          </div>
          
          <div className="space-y-1">
            {categories.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                isExpanded={!!expandedCategories[category.id]}
                onToggle={() => toggleCategory(category.id)}
                currentForumId={currentForumId}
              />
            ))}
          </div>
        </section>
      )}
    </nav>
  );
}

export { HierarchicalZoneNav as HierarchicalForumNav };
export default HierarchicalZoneNav;
