import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Folder, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { ForumEntityBase, getForumEntityUrl, isPrimaryZone, isCategory, isEntityActive } from '@/utils/forum-routing-helper';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Local type for user-pinned items
interface PinnedItem extends ForumEntityBase {
  type: 'zone' | 'category' | 'forum';
}

interface SidebarNavigationProps {
  entities: ForumEntityBase[];
  className?: string;
  userPinnedItems?: PinnedItem[];
}

/**
 * SidebarNavigation - Main navigation component for forum structure
 * Displays Primary Zones, Expandable Categories, and Child Forums
 */
export function SidebarNavigation({
  entities,
  className = '',
  userPinnedItems = [],
}: SidebarNavigationProps) {
  const [location] = useLocation();
  const [expandedCategories, setExpandedCategories] = useLocalStorage<Record<string | number, boolean>>(
    'dt-expanded-categories',
    {}
  );
  
  // Filter entities into primary zones and categories (with their child forums)
  const primaryZones = entities.filter(entity => isPrimaryZone(entity));
  const categories = entities.filter(entity => isCategory(entity));
  const childForumsByParentId = entities
    .filter(entity => !isPrimaryZone(entity) && !isCategory(entity))
    .reduce((acc, forum) => {
      if (forum.parentId) {
        if (!acc[forum.parentId]) {
          acc[forum.parentId] = [];
        }
        acc[forum.parentId].push(forum);
      }
      return acc;
    }, {} as Record<string | number, ForumEntityBase[]>);
    
  // Toggle category expansion
  const toggleCategory = (categoryId: string | number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Auto-expand category of active child forum
  useEffect(() => {
    if (location.startsWith('/forums/')) {
      const activeEntity = entities.find(entity => 
        !isPrimaryZone(entity) && 
        isEntityActive(entity, location)
      );
      
      if (activeEntity?.parentId && !expandedCategories[activeEntity.parentId]) {
        setExpandedCategories(prev => ({
          ...prev,
          [activeEntity.parentId]: true
        }));
      }
    }
  }, [location, entities, expandedCategories, setExpandedCategories]);
  
  return (
    <nav className={`space-y-6 ${className}`}>
      {/* Pinned Items Section (if available) */}
      {userPinnedItems.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500">
            Pinned
          </div>
          <div className="space-y-1 mt-1">
            {userPinnedItems.map(item => (
              <Link
                key={`${item.type}-${item.id}`}
                href={getForumEntityUrl(item)}
                className={`
                  flex items-center px-3 py-1.5 rounded-md text-sm hover:bg-zinc-800/50
                  ${isEntityActive(item, location) ? 'bg-zinc-800 font-medium text-emerald-400' : 'text-zinc-300'}
                `}
              >
                <span className="text-zinc-400 mr-2">{item.icon || '•'}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Primary Zones Section */}
      <div>
        <div className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500">
          Primary Zones
        </div>
        <div className="space-y-1 mt-1">
          {primaryZones.map(zone => (
            <Link
              key={`zone-${zone.id}`}
              href={getForumEntityUrl(zone)}
              className={`
                flex items-center px-3 py-2 rounded-md transition-colors
                ${isEntityActive(zone, location) ? 'bg-zinc-800 font-medium' : 'hover:bg-zinc-800/50'}
                ${zone.colorTheme ? `zone-nav-theme-${zone.colorTheme}` : 'text-zinc-300'}
                ${isEntityActive(zone, location) && zone.colorTheme ? `active` : ''}
              `}
            >
              {zone.icon && <span className="mr-2 text-lg">{zone.icon}</span>}
              <span>{zone.name}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-zinc-800 mx-2" />
      
      {/* Categories Section */}
      <div>
        <div className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500">
          Categories
        </div>
        <div className="space-y-1 mt-1">
          {categories.map(category => {
            const isExpanded = !!expandedCategories[category.id];
            const childForums = childForumsByParentId[category.id] || [];
            const hasChildren = childForums.length > 0;
            
            return (
              <div key={`category-${category.id}`}>
                <div
                  className={`
                    flex items-center justify-between px-3 py-2 cursor-pointer 
                    hover:bg-zinc-800/50 rounded-md
                    ${isEntityActive(category, location) ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-300'}
                  `}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center">
                    {hasChildren && (
                      <span className="mr-2">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    )}
                    <Link
                      href={getForumEntityUrl(category)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      {category.name}
                    </Link>
                  </div>
                </div>
                
                {isExpanded && hasChildren && (
                  <div className="pl-6 mt-1 space-y-1 border-l border-zinc-700 ml-4">
                    {childForums.map(forum => (
                      <Link
                        key={`forum-${forum.id}`}
                        href={getForumEntityUrl(forum)}
                        className={`
                          block px-3 py-1.5 rounded-md text-sm
                          ${isEntityActive(forum, location)
                            ? 'bg-zinc-800 text-emerald-400 font-medium'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}
                        `}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5 inline-block" />
                        {forum.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default SidebarNavigation; 