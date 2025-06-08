import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Users,
  MessageCircle,
  Hash,
  Star,
  ArrowLeft,
  Zap,
  Clock
} from 'lucide-react';

// Import components and utilities
import { getPrimaryZoneIds, primaryZonesArray } from '@/constants/primaryZones.tsx';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid'; // Import CanonicalZoneGrid
import { useForumStructure } from '@/features/forum/hooks/useForumStructure'; // Import useForumStructure
import { LoadingSpinner } from '@/components/ui/loader'; // Import LoadingSpinner
import { ForumCategoryWithStats } from '@shared/types'; // Import ForumCategoryWithStats

type ForumType = 'all' | 'primary' | 'general';
type SortBy = 'priority' | 'activity' | 'name' | 'threads' | 'posts';

export default function ForumIndexPage() { // Renamed component
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ForumType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Use static primary zones from constants
  const primaryZoneIds = getPrimaryZoneIds();
  const primaryZones = primaryZonesArray.sort((a, b) => a.displayPriority - b.displayPriority);

  // Fetch general categories from API
  const { data: forumStructure, isLoading, error } = useForumStructure();
  const categories = forumStructure?.categories || [];

  // Filter zones based on search term and type (only applies to primary zones for now)
  const filteredPrimaryZones = primaryZones.filter(zone => {
    const matchesSearch = searchTerm === '' || 
      zone.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.tagline?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || filterType === 'primary';
    
    return matchesSearch && matchesType;
  });

  // Filter categories based on search term and type
  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchTerm === '' ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || filterType === 'general';

    return matchesSearch && matchesType;
  });

  // Sort categories (basic sorting for now)
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'threads':
        comparison = (a.threadCount || 0) - (b.threadCount || 0);
        break;
      case 'posts':
        comparison = (a.postCount || 0) - (b.postCount || 0);
        break;
      // Add other sorting options for categories if needed
      default:
        comparison = 0; // Default to no specific sort for categories
    }
     return sortOrder === 'asc' ? comparison : -comparison;
  });


  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Calculate total stats (including general forums once implemented)
  const totalStats = {
    zones: primaryZones.length,
    categories: categories.length,
    threads: primaryZones.reduce((sum, zone) => sum + (zone.stats?.threadCount || 0), 0) + categories.reduce((sum, cat) => sum + (cat.threadCount || 0), 0),
    posts: primaryZones.reduce((sum, zone) => sum + (zone.stats?.postCount || 0), 0) + categories.reduce((sum, cat) => sum + (cat.postCount || 0), 0),
    activeUsers: primaryZones.reduce((sum, zone) => sum + (zone.stats?.activeUsersCount || 0), 0), // Active users stat is currently only on primary zones
  };


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Degentalk Forums</h1>
              <p className="text-zinc-400">Explore all zones and communities</p>
            </div>
            
            {/* Stats Overview */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Star className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-white">{totalStats.zones}</span>
                <span>Primary Zones</span>
              </div>
               <div className="flex items-center gap-2 text-zinc-400">
                <Folder className="w-4 h-4 text-amber-400" /> {/* Use Folder icon for categories */}
                <span className="font-medium text-white">{totalStats.categories}</span>
                <span>Categories</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">{totalStats.activeUsers}</span>
                <span>Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <MessageCircle className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-white">{totalStats.threads}</span>
                <span>Threads</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-400" />
              Filter & Sort Forums
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    placeholder="Search forums..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                  />
                </div>
              </div>
              
              {/* Type Filter */}
              <div className="w-full md:w-48">
                <Select value={filterType} onValueChange={(value: ForumType) => setFilterType(value)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">All Forums</SelectItem>
                    <SelectItem value="primary">Primary Zones</SelectItem>
                    <SelectItem value="general">General Forums</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort By */}
              <div className="w-full md:w-48">
                <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="priority">Display Priority</SelectItem> {/* Only applies to Primary Zones */}
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem> {/* Only applies to Primary Zones */}
                    <SelectItem value="threads">Thread Count</SelectItem>
                    <SelectItem value="posts">Post Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort Order */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-8">
          {/* Primary Zones Section */}
          {(filterType === 'all' || filterType === 'primary') && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Primary Zones</h2>
                  <p className="text-zinc-400">Feature-rich ecosystems with unique layouts and functionality</p>
                </div>
                <div className="text-sm text-zinc-500">
                  {filteredPrimaryZones.length} zone{filteredPrimaryZones.length !== 1 ? 's' : ''}
                </div>
              </div>

              {filteredPrimaryZones.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-400">No primary zones match your search criteria</p>
                </div>
              ) : (
                // Use CanonicalZoneGrid for primary zones
                <CanonicalZoneGrid 
                  zoneIds={filteredPrimaryZones.map(zone => zone.id)} // Pass filtered primary zone IDs
                  includeShopCard={true} // Include shop card as on homepage
                  shopCardData={{ // Placeholder shop card data
                    name: "Legendary Diamond Frame",
                    price: 2500
                  }}
                />
              )}
            </section>
          )}

          {/* General Forums Section */}
          {(filterType === 'all' || filterType === 'general') && (
            <section>
              {/* Add a separator if both sections are visible */}
              {(filterType === 'all' && filteredPrimaryZones.length > 0) && (
                 <div className="h-px bg-zinc-800/50 my-8" />
              )}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">General Forums</h2>
                  <p className="text-zinc-400">Classic forum structure for community discussions</p>
                </div>
                 <div className="text-sm text-zinc-500">
                  {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
                </div>
              </div>

              {isLoading ? (
                 <div className="flex justify-center py-12">
                    <LoadingSpinner size="md" />
                 </div>
              ) : error ? (
                 <div className="text-center py-12 text-red-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>Failed to load general forums.</p>
                 </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-400">No general forums match your search criteria</p>
                </div>
              ) : (
                // Render general categories and their child forums
                <div className="space-y-6">
                  {sortedCategories.map(category => (
                    <Card key={category.id} className="bg-zinc-900/50 border-zinc-800">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                           <Folder className="w-5 h-5 text-amber-400" />
                           {category.name}
                        </CardTitle>
                         {/* Category Stats */}
                         <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{category.threadCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              <span>{category.postCount || 0}</span>
                            </div>
                         </div>
                      </CardHeader>
                      {category.description && (
                         <CardContent className="pb-2 text-sm text-zinc-400">
                            {category.description}
                         </CardContent>
                      )}
                      {category.childForums && category.childForums.length > 0 && (
                        <CardContent className="pt-2">
                          <div className="space-y-2">
                            {category.childForums.map(forum => (
                              <Link key={forum.id} href={`/forum/${forum.slug}`}>
                                <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-700/50 transition-colors duration-200">
                                  <div className="flex items-center gap-3">
                                    <MessageCircle className="w-4 h-4 text-blue-400" />
                                    <span className="font-medium text-zinc-200">{forum.name}</span>
                                  </div>
                                  {/* Forum Stats */}
                                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                                     <div className="flex items-center gap-1">
                                       <MessageCircle className="w-3 h-3" />
                                       <span>{forum.threadCount || 0}</span>
                                     </div>
                                     <div className="flex items-center gap-1">
                                       <Hash className="w-3 h-3" />
                                       <span>{forum.postCount || 0}</span>
                                     </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
