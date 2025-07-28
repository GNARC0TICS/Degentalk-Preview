import React from 'react';
import { Users, MessageSquare, TrendingUp, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ModernQuickStatsProps {
  stats: {
    online?: number;
    postsToday?: number;
    hotTopics?: number;
    avgResponseTime?: string;
  };
}

export function ModernQuickStats({ stats }: ModernQuickStatsProps) {
  const statItems = [
    {
      icon: Users,
      label: 'Online Now',
      value: stats.online || 0,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      icon: MessageSquare,
      label: 'Posts Today',
      value: stats.postsToday || 0,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: TrendingUp,
      label: 'Hot Topics',
      value: stats.hotTopics || 0,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: stats.avgResponseTime || '2.3m',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <Card className="bg-zinc-900/70 border border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-xs text-zinc-400">{stat.label}</span>
              </div>
              <span className={`text-sm font-semibold ${stat.color}`}>
                {stat.value}
              </span>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}