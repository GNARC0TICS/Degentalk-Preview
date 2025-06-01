import React from 'react';
import { Link } from 'wouter';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ForumCategoryProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    threads: number;
    posts: number;
    lastThread?: {
      id: string;
      title: string;
      author: string;
      time: string;
    };
    slug?: string;
  };
  href?: string; // Optional custom href for the category
}

export function ForumCategoryCard({ category, href }: ForumCategoryProps) {
  // Use provided href or fallback to category slug or id
  const categoryLink = href || (category.slug ? `/forums/${category.slug}` : `/forum/category/${category.id}`);
  
  return (
    <Card className="bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Card Header with Icon */}
        <div className={`p-4 ${category.color}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{category.icon}</span>
              <h3 className="font-bold text-white">{category.name}</h3>
            </div>
            <Badge variant="outline" className="bg-black/20 border-white/10 text-white">
              {category.threads} threads
            </Badge>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="p-4">
          <p className="text-zinc-400 text-sm mb-4">{category.description}</p>
          
          {/* Stats row */}
          <div className="flex justify-between items-center text-xs text-zinc-500 mb-3">
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>{category.posts} posts</span>
            </div>
          </div>
          
          {/* Last thread if exists */}
          {category.lastThread && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-zinc-500">Latest thread</span>
                <span className="text-xs text-zinc-500">{category.lastThread.time}</span>
              </div>
              <Link href={`/threads/${category.lastThread.id}`} className="text-sm font-medium hover:text-emerald-400 transition-colors line-clamp-1">
                {category.lastThread.title}
              </Link>
              <div className="text-xs text-zinc-600 mt-1">
                by {category.lastThread.author}
              </div>
            </div>
          )}
          
          {/* View All Link */}
          <div className="mt-3 text-right">
            <Link href={categoryLink} className="inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300">
              View All Threads
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}