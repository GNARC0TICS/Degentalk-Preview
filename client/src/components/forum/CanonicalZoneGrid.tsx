import React from 'react';
import { Link } from 'wouter';
import { ZoneCard } from '@/components/forum/ZoneCard';
import { motion } from 'framer-motion';
import { Activity, Zap, MessageCircle, Hash } from 'lucide-react';

export interface ZoneCardData {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  icon?: string | null;
  colorTheme?: string | null;
  threadCount?: number;
  postCount?: number;
  activeUsersCount?: number;
  lastActivityAt?: Date;
  hasXpBoost?: boolean;
  boostMultiplier?: number;
  isEventActive?: boolean;
  eventData?: {
    name: string;
    endsAt: Date;
  };
}

interface CanonicalZoneGridProps {
  zones: ZoneCardData[];
  className?: string;
}

/**
 * CanonicalZoneGrid - Grid of Primary Zone cards for homepage display
 * Renders special, branded cards for each canonical zone
 */
export function CanonicalZoneGrid({ zones, className = '' }: CanonicalZoneGridProps) {
  if (!zones || zones.length === 0) {
    return (
      <div className="text-center text-zinc-400 py-12">
        <p>No primary zones available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {zones.map((zone, index) => (
        <motion.div
          key={zone.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <ForumZoneCard zone={zone} isClickable />
        </motion.div>
      ))}
    </div>
  );
}

export function ForumZoneCard({ zone, isClickable = false }: { zone: ZoneCardData; isClickable?: boolean }) {
  const zoneUrl = `/forum/${zone.slug}`;
  
  const cardContent = (
    <motion.div 
      className={`
        zone-card zone-theme-${zone.colorTheme}
        relative
        min-h-[180px] 
        p-6 
        rounded-xl 
        border 
        backdrop-blur-sm
        overflow-hidden
        ${isClickable ? 'cursor-pointer group' : ''}
        ${zone.hasXpBoost ? 'ring-2 ring-emerald-500/30' : ''}
      `}
      whileHover={isClickable ? { 
        scale: 1.03,
        rotateY: 5,
        rotateX: -5,
        transition: { duration: 0.3 }
      } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Background pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Activity pulse indicator */}
      {zone.activeUsersCount && zone.activeUsersCount > 0 && (
        <div className="absolute top-4 right-4">
          <motion.div
            className="flex items-center gap-1 text-xs"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">{zone.activeUsersCount} active</span>
          </motion.div>
        </div>
      )}
      
      {/* XP Boost indicator */}
      {zone.hasXpBoost && (
        <div className="absolute top-4 left-4">
          <motion.div 
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">
              {zone.boostMultiplier}x XP
            </span>
          </motion.div>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
            <span className="text-2xl" role="img" aria-label={`${zone.name} icon`}>
              {zone.icon}
            </span>
            {zone.name}
          </h3>
        </div>
        
        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{zone.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.1 }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{zone.threadCount} threads</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.1 }}
          >
            <Hash className="w-4 h-4" />
            <span>{zone.postCount} posts</span>
          </motion.div>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, var(--zone-glow-color, rgba(16, 185, 129, 0.1)) 0%, transparent 70%)`
        }}
      />
    </motion.div>
  );

  if (isClickable) {
    return (
      <Link href={zoneUrl}>
        <a className="block">{cardContent}</a>
      </Link>
    );
  }

  return cardContent;
}

export default CanonicalZoneGrid; 