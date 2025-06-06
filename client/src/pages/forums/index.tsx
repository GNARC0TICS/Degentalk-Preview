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

type ForumType = 'all' | 'primary' | 'general';
type SortBy = 'priority' | 'activity' | 'name' | 'threads' | 'posts';

export default function ForumsIndexPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ForumType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get primary zones from registry
  const primaryZones = primaryZonesArray.sort((a, b) => a.displayPriority - b.displayPriority);

  // Filter zones based on search term and type
  const filteredZones = primaryZones.filter(zone => {
    const matchesSearch = searchTerm === '' || 
      zone.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.tagline?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || filterType === 'primary';
    
    return matchesSearch && matchesType;
  });

  // Sort zones
  const sortedZones = [...filteredZones].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'priority':
        comparison = a.displayPriority - b.displayPriority;
        break;
      case 'name':
        comparison = a.label.localeCompare(b.label);
        break;
      case 'threads':
        comparison = (a.stats?.threadCount || 0) - (b.stats?.threadCount || 0);
        break;
      case 'posts':
        comparison = (a.stats?.postCount || 0) - (b.stats?.postCount || 0);
        break;
      case 'activity':
        comparison = (a.stats?.activeUsersCount || 0) - (b.stats?.activeUsersCount || 0);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Calculate total stats
  const totalStats = primaryZones.reduce((acc, zone) => ({
    zones: acc.zones + 1,
    threads: acc.threads + (zone.stats?.threadCount || 0),
    posts: acc.posts + (zone.stats?.postCount || 0),
    activeUsers: acc.activeUsers + (zone.stats?.activeUsersCount || 0),
  }), { zones: 0, threads: 0, posts: 0, activeUsers: 0 });

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
                    <SelectItem value="priority">Display Priority</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
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
                  {sortedZones.length} zone{sortedZones.length !== 1 ? 's' : ''}
                </div>
              </div>

              {sortedZones.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-400">No zones match your search criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedZones.map((zone, index) => (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <Link href={`/${zone.slug}`}>
                        <div className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-emerald-900/20">
                          {/* Zone Type Badge */}
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              <Star className="w-3 h-3 mr-1" />
                              Primary
                            </span>
                          </div>

                          {/* XP Boost Badge */}
                          {zone.features?.xpBoost?.enabled && (
                            <div className="absolute top-4 left-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                <Zap className="w-3 h-3 mr-1" />
                                {zone.features.xpBoost.multiplier}x XP
                              </span>
                            </div>
                          )}

                          {/* Icon and Title */}
                          <div className="flex items-start gap-4 mb-4 mt-8">
                            <div className="text-3xl">
                              {typeof zone.icon === 'string' ? zone.icon : '📁'}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                {zone.label}
                              </h3>
                              {zone.tagline && (
                                <p className="text-sm text-zinc-500 mt-1">
                                  {zone.tagline}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-zinc-400 mb-6 line-clamp-2">
                            {zone.description}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{zone.stats?.threadCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              <span>{zone.stats?.postCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>{zone.stats?.activeUsersCount || 0}</span>
                            </div>
                          </div>

                          {/* Thread Rules Indicators */}
                          <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                            {zone.threadRules.requireDGT && (
                              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                                DGT Required
                              </span>
                            )}
                            {!zone.threadRules.allowUserPosts && (
                              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                                Admin Only
                              </span>
                            )}
                            {zone.features?.xpBoost?.enabled && (
                              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                                XP Boost
                              </span>
                            )}
                          </div>

                          {/* Hover effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* General Forums Section - Placeholder for future implementation */}
          {(filterType === 'all' || filterType === 'general') && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">General Forums</h2>
                  <p className="text-zinc-400">Classic forum structure for community discussions</p>
                </div>
              </div>

              <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 text-lg mb-2">General forums coming soon...</p>
                <p className="text-sm text-zinc-600">
                  Classic forum categories will be displayed here once the migration is complete
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
} 