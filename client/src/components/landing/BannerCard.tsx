import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';

interface BannerCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  stats?: {
    users?: number;
    threads?: number;
    trending?: boolean;
  };
}

export function BannerCard({ title, description, icon, color, stats }: BannerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2"
    >
      <Card className={`
        relative overflow-hidden aspect-[9/4] p-6
        bg-gradient-to-br ${color}
        border border-zinc-800 hover:border-zinc-400
        transition-colors duration-300 cursor-pointer
      `}>
        <div className="flex flex-col justify-between h-full">
          <div>
            <span className="text-4xl mb-3 block">{icon}</span>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-300">{description}</p>
          </div>
          
          {stats && (
            <div className="flex gap-4 text-sm text-zinc-400">
              {stats.users && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{stats.users}</span>
                </div>
              )}
              {stats.threads && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{stats.threads}</span>
                </div>
              )}
              {stats.trending && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Trending</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}