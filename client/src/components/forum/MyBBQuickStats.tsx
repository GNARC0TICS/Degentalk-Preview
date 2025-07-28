import React from 'react';
import { Users, MessageSquare, TrendingUp, Clock, Zap, Activity } from 'lucide-react';

interface MyBBQuickStatsProps {
  stats: {
    online?: number;
    postsToday?: number;
    hotTopics?: number;
    totalThreads?: number;
    totalPosts?: number;
  };
}

export function MyBBQuickStats({ stats }: MyBBQuickStatsProps) {
  return (
    <div className="mybb-forum-category mb-4">
      <div className="mybb-category-header mybb-category-green">
        <div className="mybb-category-title flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Quick Stats
        </div>
      </div>
      
      <div className="mybb-stats-content">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-500" />
              Users Online
            </span>
            <span className="font-bold text-emerald-400">{stats.online || 0}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-blue-500" />
              Posts Today
            </span>
            <span className="font-bold text-blue-400">{stats.postsToday || 0}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-orange-500" />
              Hot Topics
            </span>
            <span className="font-bold text-orange-400">{stats.hotTopics || 0}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-500" />
              Avg Response
            </span>
            <span className="font-bold text-purple-400">2.3m</span>
          </div>
          
          <div className="pt-2 mt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                Activity Level
              </span>
              <span className="font-bold text-yellow-400">Very High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}