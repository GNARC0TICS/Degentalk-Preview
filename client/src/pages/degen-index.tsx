import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loader";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Users, TrendingUp } from "lucide-react";
import { UserCard } from "@/components/users/UserCard";
import { UserFilters } from "@/components/users/UserFilters";
import { motion } from 'framer-motion';

export interface DegenUser {
  id: number;
  username: string;
  avatarUrl?: string | null;
  xp: number;
  clout: number;
  postCount: number;
  joinDate: string;
  lastActive: string;
  isOnline: boolean;
  badges: string[];
}

export default function DegenIndexPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'username' as 'username' | 'xp' | 'clout' | 'joinDate' | 'lastActive',
    sortOrder: 'asc' as 'asc' | 'desc',
    onlineOnly: false,
    minXP: 0,
  });

  // Mock data - replace with actual API call
  const { data: users, isLoading, isError, error, refetch } = useQuery<DegenUser[]>({
    queryKey: ["degens", searchTerm, filters],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      const mockUsers: DegenUser[] = [
        {
          id: 1,
          username: 'CryptoKing',
          avatarUrl: 'https://avatar.vercel.sh/cryptoking',
          xp: 15000,
          clout: 250,
          postCount: 1247,
          joinDate: '2023-01-15',
          lastActive: '2 minutes ago',
          isOnline: true,
          badges: ['Veteran', 'Whale']
        },
        {
          id: 2,
          username: 'DiamondHands',
          avatarUrl: 'https://avatar.vercel.sh/diamondhands',
          xp: 12500,
          clout: 180,
          postCount: 892,
          joinDate: '2023-03-22',
          lastActive: '1 hour ago',
          isOnline: false,
          badges: ['HODLer']
        },
        {
          id: 3,
          username: 'WhaleWatcher',
          avatarUrl: 'https://avatar.vercel.sh/whalewatcher',
          xp: 11000,
          clout: 150,
          postCount: 567,
          joinDate: '2023-02-10',
          lastActive: '5 minutes ago',
          isOnline: true,
          badges: ['Analyst', 'Contributor']
        },
        {
          id: 4,
          username: 'NFTGuru',
          avatarUrl: 'https://avatar.vercel.sh/nftguru',
          xp: 9500,
          clout: 120,
          postCount: 334,
          joinDate: '2023-04-05',
          lastActive: '3 hours ago',
          isOnline: false,
          badges: ['Artist']
        },
        {
          id: 5,
          username: 'ShillMaster',
          avatarUrl: 'https://avatar.vercel.sh/shillmaster',
          xp: 8000,
          clout: 90,
          postCount: 445,
          joinDate: '2023-05-18',
          lastActive: '1 day ago',
          isOnline: false,
          badges: ['Promoter']
        },
        {
          id: 6,
          username: 'PaperHands',
          avatarUrl: 'https://avatar.vercel.sh/paperhands',
          xp: 500,
          clout: 10,
          postCount: 23,
          joinDate: '2024-01-20',
          lastActive: '2 weeks ago',
          isOnline: false,
          badges: []
        },
        {
          id: 7,
          username: 'LaserEyes',
          xp: 7500,
          clout: 110,
          postCount: 678,
          joinDate: '2023-06-12',
          lastActive: '30 minutes ago',
          isOnline: true,
          badges: ['Visionary']
        },
        {
          id: 8,
          username: 'ToTheMoon',
          xp: 6800,
          clout: 105,
          postCount: 234,
          joinDate: '2023-07-30',
          lastActive: '4 hours ago',
          isOnline: false,
          badges: ['Optimist']
        }
      ];

      // Apply search filter
      let filteredUsers = mockUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply filters
      if (filters.onlineOnly) {
        filteredUsers = filteredUsers.filter(user => user.isOnline);
      }

      if (filters.minXP > 0) {
        filteredUsers = filteredUsers.filter(user => user.xp >= filters.minXP);
      }

      // Apply sorting
      filteredUsers.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (filters.sortBy) {
          case 'xp':
            aVal = a.xp;
            bVal = b.xp;
            break;
          case 'clout':
            aVal = a.clout;
            bVal = b.clout;
            break;
          case 'joinDate':
            aVal = new Date(a.joinDate);
            bVal = new Date(b.joinDate);
            break;
          case 'lastActive':
            // This would need proper date parsing in real implementation
            aVal = a.lastActive;
            bVal = b.lastActive;
            break;
          default:
            aVal = a.username.toLowerCase();
            bVal = b.username.toLowerCase();
        }

        if (filters.sortOrder === 'desc') {
          return aVal < bVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });

      return filteredUsers;
    }
  });

  const onlineUsers = users?.filter(user => user.isOnline).length || 0;
  const totalUsers = users?.length || 0;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <LoadingSpinner size="xl" color="emerald" />
          <p className="text-zinc-400">Loading Degen Index...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center min-h-[400px] items-center">
          <ErrorDisplay 
            title="Degen Index Unavailable" 
            message="Could not load user directory at this time." 
            error={error}
            onRetry={refetch} 
            variant="card"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-4 text-white flex items-center">
          <Users className="mr-3 h-8 w-8 text-emerald-400" />
          Degen Index
        </h1>
        <p className="text-zinc-400 mb-6">
          Browse and discover all members of the DegenTalk community
        </p>
        
        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-medium">{onlineUsers} online</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <TrendingUp className="w-4 h-4" />
            <span>{totalUsers} total degens</span>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-zinc-900/70 border border-zinc-800">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search degens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
            
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-zinc-700"
              >
                <UserFilters filters={filters} onFiltersChange={setFilters} />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {users?.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <UserCard user={user} />
          </motion.div>
        ))}
      </motion.div>

      {/* No Results */}
      {users?.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Users className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
          <h3 className="text-xl font-medium text-zinc-400 mb-2">No degens found</h3>
          <p className="text-zinc-500">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  );
} 