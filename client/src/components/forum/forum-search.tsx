import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

interface ForumSearchProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function ForumSearch({ 
  initialQuery = '', 
  placeholder = 'Search topics, posts, or users...', 
  className = '',
  onSearch
}: ForumSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [, navigate] = useLocation();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        navigate(`/forum/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };
  
  return (
    <Card className={`bg-zinc-900/70 border border-zinc-800 ${className}`}>
      <CardContent className="p-3">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="search"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-800 border-zinc-700 w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 