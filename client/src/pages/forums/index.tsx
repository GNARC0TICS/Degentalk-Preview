// TODO: @syncSchema Update based on recent changes in schema.ts: ForumCategory now has 'color' and 'icon' fields.
import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { 
  Home, 
  Search,
  LayoutGrid,
  Folder,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Flame,
  Target,
  Archive,
  Dices,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { ForumGuidelines } from '@/components/forum/forum-guidelines';
import { ForumSearch } from '@/components/forum/forum-search';
import { useForumStructure } from '@/features/forum/hooks/useForumStructure';
import { ForumEntityBase } from '@/utils/forum-routing-helper';
import { ZoneCardData } from '@/components/forum/CanonicalZoneGrid';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { getForumEntityUrl, isPrimaryZone } from '@/utils/forum-routing-helper';
import { ActiveMembersWidget, ActiveUser } from '@/components/users';
import { useActiveUsers } from '@/features/users/hooks';

// Map theme keys to icon components and colors
const THEME_ICONS = {
  'pit': Flame,
  'mission': Target,
  'casino': Dices,
  'briefing': FileText,
  'archive': Archive,
  'default': Folder
} as const;

const THEME_COLORS = {
  'pit': 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  'mission': 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'casino': 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  'briefing': 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  'archive': 'from-gray-500/20 to-zinc-500/20 border-gray-500/30',
  'default': 'from-zinc-800/80 to-zinc-900/80 border-zinc-700/30'
} as const;

const CATEGORY_COLORS = [
  'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-700/10',
  'border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-700/10',
  'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-700/10',
  'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-700/10',
  'border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-700/10',
  'border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-700/10',
  'border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-indigo-700/10',
  'border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-700/10'
];

export default function ForumPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [location, setLocation] = useLocation();
  
  const queryParams = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  const searchQuery = queryParams.get('q') || '';
  
  const [searchText, setSearchText] = useState(searchQuery);
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Use centralized forum structure hook
  const {
    primaryZones,
    categories,
    isLoading: structureLoading, 
    error: structureErrorDetails
  } = useForumStructure();
  
  // Fetch active users
  const {
    data: activeUsers,
    isLoading: activeUsersLoading
  } = useActiveUsers({ limit: 5 });
  
  const breadcrumbs = [
    { label: 'Home', href: '/', icon: <Home className="h-4 w-4 mr-1" /> },
    { label: 'Forum', href: '/forum', icon: null },
  ];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      setLocation(`/forum/search?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  // Carousel navigation
  const nextZone = () => {
    if (primaryZones.length === 0) return;
    setCurrentZoneIndex((prev) => (prev + 1) % primaryZones.length);
    scrollCarousel(1);
  };

  const prevZone = () => {
    if (primaryZones.length === 0) return;
    setCurrentZoneIndex((prev) => (prev - 1 + primaryZones.length) % primaryZones.length);
    scrollCarousel(-1);
  };

  const scrollCarousel = (direction: number) => {
    if (!carouselRef.current) return;
    
    const scrollAmount = direction * 320; // Approximate card width
    carouselRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Convert primary zones to the format expected by carousel
  const zoneCardData: ZoneCardData[] = (primaryZones || []).map((zone) => {
    // Extract properties from ForumEntityBase
    const { id, name, slug, description, icon, colorTheme, threadCount, postCount } = zone;
    
    // Return the complete ZoneCardData object with additional properties
    return {
      id,
      name,
      slug,
      description: description || '',
      icon: icon || '📁',
      colorTheme: colorTheme || 'default',
      threadCount: threadCount || 0,
      postCount: postCount || 0,
      // Add properties required by ZoneCardData but not in ForumEntityBase
      activeUsersCount: 0,
      hasXpBoost: false,
      boostMultiplier: 1
    };
  });
  
  // Helper to render forum stats
  const renderForumStats = (entity: ForumEntityBase) => {
    return (
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <div className="flex items-center">
          <MessageSquare className="h-3.5 w-3.5 mr-1 text-zinc-500" />
          {entity.threadCount || 0} threads
        </div>
        <div>
          {entity.postCount || 0} posts
        </div>
      </div>
    );
  };

  // Render a zone card for the carousel
  const renderZoneCard = (zone: ForumEntityBase, index: number) => {
    const IconComponent = zone.colorTheme && zone.colorTheme in THEME_ICONS 
      ? THEME_ICONS[zone.colorTheme as keyof typeof THEME_ICONS] 
      : THEME_ICONS.default;
    
    const gradientClasses = zone.colorTheme && zone.colorTheme in THEME_COLORS
      ? THEME_COLORS[zone.colorTheme as keyof typeof THEME_COLORS]
      : THEME_COLORS.default;

    // Only use canHaveThreads if it exists and id is a number
    const canHaveThreads = typeof zone.canHaveThreads === 'boolean' ? zone.canHaveThreads : true;

    return (
      canHaveThreads ? (
        <Link 
          key={zone.id} 
          href={`/forum/${zone.slug}`}
          className={`flex-shrink-0 w-72 h-48 rounded-lg border ${gradientClasses} bg-gradient-to-br p-5 flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-900/10 overflow-hidden`}
        >
          <div className="flex items-center mb-3">
            <IconComponent className={`h-5 w-5 mr-2 ${zone.colorTheme ? `text-${zone.colorTheme}-400` : 'text-emerald-400'}`} />
            <h3 className="text-lg font-bold text-white">{zone.name}</h3>
          </div>
          
          {zone.description && (
            <p className="text-sm text-zinc-300 mb-auto line-clamp-2">{zone.description}</p>
          )}
          
          <div className="mt-auto pt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                {zone.threadCount} threads
              </div>
              <div>
                {zone.postCount} posts
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div
          key={zone.id}
          className={`flex-shrink-0 w-72 h-48 rounded-lg border ${gradientClasses} bg-gradient-to-br p-5 flex flex-col opacity-60 cursor-not-allowed`}
          aria-label="This is a container and does not support threads."
          title="This is a container and does not support threads."
        >
          <div className="flex items-center mb-3">
            <IconComponent className={`h-5 w-5 mr-2 ${zone.colorTheme ? `text-${zone.colorTheme}-400` : 'text-emerald-400'}`} />
            <h3 className="text-lg font-bold text-white">{zone.name}</h3>
          </div>
          
          {zone.description && (
            <p className="text-sm text-zinc-300 mb-auto line-clamp-2">{zone.description}</p>
          )}
          
          <div className="mt-auto pt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                {zone.threadCount} threads
              </div>
              <div>
                {zone.postCount} posts
              </div>
            </div>
          </div>
        </div>
      )
    );
  };

  // Before rendering categories, map them to ensure parentSlug and parentName are string | undefined (never null)
  const safeCategories = (categories || []).map(category => ({
    ...category,
    parentSlug: category.parentSlug === null ? undefined : category.parentSlug,
    parentName: category.parentName === null ? undefined : category.parentName,
    forums: (category.forums || []).map(forum => ({
      ...forum,
      parentSlug: forum.parentSlug === null ? undefined : forum.parentSlug,
      parentName: forum.parentName === null ? undefined : forum.parentName
    }))
  }));

  // Render a category with its child forums
  const renderCategory = (category: ForumEntityBase & { forums?: ForumEntityBase[] }, index: number) => {
    if (!category.forums || category.forums.length === 0) return null;
    
    // Calculate aggregate counts
    const threadCount = category.forums.reduce((sum: number, forum: ForumEntityBase) => sum + (forum.threadCount || 0), 0);
    const postCount = category.forums.reduce((sum: number, forum: ForumEntityBase) => sum + (forum.postCount || 0), 0);
    
    // Determine category color based on index or color property
    const categoryColor = category.colorTheme && category.colorTheme in THEME_COLORS
      ? THEME_COLORS[category.colorTheme as keyof typeof THEME_COLORS]
      : CATEGORY_COLORS[index % CATEGORY_COLORS.length];
    
    return (
      <Card key={category.id} className={`overflow-hidden border mb-8 ${categoryColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Folder className="h-5 w-5 mr-2 text-amber-400" />
              {category.name}
            </CardTitle>
            <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700/50">
              {category.forums.length} {category.forums.length === 1 ? 'forum' : 'forums'}
            </Badge>
          </div>
          {category.description && (
            <CardDescription className="text-zinc-300">
              {category.description}
            </CardDescription>
          )}
          <div className="text-xs text-zinc-400">
            {threadCount} threads • {postCount} posts
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800/50">
            {category.forums.map((forum: ForumEntityBase) => (
              forum.canHaveThreads ? (
                <Link 
                  key={forum.id}
                  href={`/forum/${forum.slug}`}
                  className="block p-4 hover:bg-black/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">{forum.name}</h3>
                      {forum.description && (
                        <p className="text-sm text-zinc-400 mb-2">{forum.description}</p>
                      )}
                      {renderForumStats(forum)}
                    </div>
                    <MessageSquare className="h-5 w-5 text-zinc-600" />
                  </div>
                </Link>
              ) : (
                <div
                  key={forum.id}
                  className="block p-4 text-zinc-500 opacity-60 cursor-not-allowed"
                  aria-label="This is a container and does not support threads."
                  title="This is a container and does not support threads."
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">{forum.name}</h3>
                      {forum.description && (
                        <p className="text-sm text-zinc-400 mb-2">{forum.description}</p>
                      )}
                      {renderForumStats(forum)}
                    </div>
                    <MessageSquare className="h-5 w-5 text-zinc-600" />
                  </div>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (structureLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
          <LoadingSpinner text="Loading Forums..." />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (structureErrorDetails) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
          <ErrorDisplay title="Error loading forums" error={structureErrorDetails} />
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-6 flex-grow">
        {/* Hero Section with Search */}
        <div className="mb-12">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-4 text-white">DegenTalk Forum</h1>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Join the conversation with fellow degens. Discuss crypto, share insights, and stay ahead of the market.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="search"
                  placeholder="Search topics, posts, or users..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9 bg-zinc-800 border-zinc-700 w-full"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
          
          {/* Primary Zones Carousel */}
          <section className="relative mb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <LayoutGrid className="h-6 w-6 mr-2 text-emerald-500" />
                Primary Zones
              </h2>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={prevZone}
                  disabled={(primaryZones || []).length <= 1}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={nextZone}
                  disabled={(primaryZones || []).length <= 1}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {structureLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-72 flex-shrink-0" />
                ))}
              </div>
            ) : primaryZones.length > 0 ? (
              <div 
                ref={carouselRef} 
                className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar" 
                style={{ scrollbarWidth: 'none' }}
              >
                {primaryZones.map((zone, index) => renderZoneCard(zone as ForumEntityBase, index))}
              </div>
            ) : (primaryZones || []).length > 0 ? (
              <div 
                ref={carouselRef} 
                className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar" 
                style={{ scrollbarWidth: 'none' }}
              >
                {primaryZones.map((zone, index) => renderZoneCard(zone as ForumEntityBase, index))}
              </div>
            ) : (
              <div className="text-center py-10 text-zinc-500">
                <p>No primary zones available</p>
              </div>
            )}
          </section>
        </div>
        
        {/* Categories Section - Centered */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold mb-8 text-white flex items-center justify-center">
            <Folder className="h-6 w-6 mr-2 text-amber-500" />
            Forums & Categories
          </h2>
          
          {structureLoading ? (
            <div className="space-y-8 max-w-4xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : safeCategories.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              {safeCategories.map((category, index) => renderCategory(category, index))}
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500 max-w-4xl mx-auto">
              <p>No categories available</p>
            </div>
          )}
        </div>
        
        {/* Forum Guidelines and Active Members at the bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 max-w-4xl mx-auto">
          <ForumGuidelines className="h-full" />
          
          <ActiveMembersWidget 
            users={activeUsers || []}
            isLoading={activeUsersLoading}
            description="Members active in the last 30 minutes"
            viewAllLink="/users"
            className="h-full"
          />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
