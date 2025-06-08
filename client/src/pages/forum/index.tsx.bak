import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Filter,
  Search,
  Users,
  MessageCircle,
  Hash,
  Star,
  ArrowLeft,
  Folder,
  AlertCircle
} from 'lucide-react';
import { primaryZonesArray, getPrimaryZoneIds } from '@/constants/primaryZones.tsx';
import { CanonicalZoneGrid } from '@/components/forum/CanonicalZoneGrid.tsx';

export default function ForumIndexPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Degentalk™ Forums</h1>
              <p className="text-zinc-400">Explore all zones and communities</p>
            </div>
            
            {/* Stats Overview */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Star className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-white">{primaryZonesArray.length}</span>
                <span>Primary Zones</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Folder className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-white">0</span>
                <span>Categories</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">0</span>
                <span>Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <MessageCircle className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-white">0</span>
                <span>Threads</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-400" />
            Filter & Sort Forums
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Primary Zones Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Primary Zones</h2>
              <p className="text-zinc-400">Feature-rich ecosystems with unique layouts and functionality</p>
            </div>
            <div className="text-sm text-zinc-500">{primaryZonesArray.length} zones</div>
          </div>

          {/* Primary Zone Grid - Using CanonicalZoneGrid without shop card */}
          <CanonicalZoneGrid 
            zoneIds={getPrimaryZoneIds()} 
            includeShopCard={false}
          />
        </section>

        {/* General Forums Section */}
        <section>
          <div className="h-px bg-zinc-800/50 my-8" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">General Forums</h2>
              <p className="text-zinc-400">Classic forum structure for community discussions</p>
            </div>
            <div className="text-sm text-zinc-500">0 categories</div>
          </div>

          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400">General forums will be populated from the API</p>
            <p className="text-zinc-600 text-sm mt-2">API integration in progress...</p>
          </div>
        </section>
      </div>
    </div>
  );
}
