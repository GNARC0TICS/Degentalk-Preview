import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';

interface BannerCardProps {
  title: string;
  description: string;
  icon?: string;
  image?: string;
  color: string;
  stats?: {
    users?: number;
    threads?: number;
    trending?: boolean;
  };
}

export function BannerCard({ title, description, icon, image, color, stats }: BannerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2"
    >
      <Card className={`
        relative overflow-hidden aspect-[16/9] 
        border border-zinc-800 hover:border-zinc-400
        transition-all duration-300 cursor-pointer group
      `}>
        {/* Background Image */}
        {image && (
          <div className="absolute inset-0">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent`} />
          </div>
        )}
        
        {/* If no image, use color background */}
        {!image && (
          <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
        )}
        
        <div className="relative z-10 flex flex-col justify-between h-full p-6">
          <div>
            {icon && <span className="text-4xl mb-3 block">{icon}</span>}
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{title}</h3>
            <p className="text-sm text-zinc-200 drop-shadow-md">{description}</p>
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