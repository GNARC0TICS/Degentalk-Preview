import React from 'react';
import { Link } from 'wouter';
import { ZoneCard } from './ZoneCard.tsx'; // Relative path with extension
import { ShopCard } from './ShopCard.tsx'; // Relative path with extension
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  MessageCircle, 
  Hash, 
  Flame, 
  Target, 
  Archive, 
  Dices, 
  FileText, 
  Folder,
  Lock,
  ShieldCheck,
  Loader2,
  BarChart2,
  Users as UsersIcon,
  Flame as FlameIcon,
  Zap as ZapIcon,
  Coins as CoinsIcon
} from 'lucide-react';
import { getZonePath } from '../../utils/forum-routing-helper.ts'; // Relative path with extension
import { getPrimaryZone, primaryZonesArray, PrimaryZone } from '@/constants/primaryZones.tsx'; // Added import
import { useZoneMetrics } from '@/features/forum/hooks/useZoneMetrics';

// Zone theme configuration matching primaryZones colorTheme values
const ZONE_THEMES = {
  'pit': { 
    icon: Flame, 
    color: 'text-red-400', 
    bgColor: 'bg-gradient-to-br from-red-900/20 to-red-800/10',
    borderColor: 'border-red-500/30',
    glowColor: 'rgba(239, 68, 68, 0.15)',
    accentColor: 'text-red-300',
    label: 'The Pit'
  },
  'mission': { 
    icon: Target, 
    color: 'text-green-400',
    bgColor: 'bg-gradient-to-br from-green-900/20 to-green-800/10',
    borderColor: 'border-green-500/30',
    glowColor: 'rgba(34,197,94,0.15)',
    accentColor: 'text-green-300',
    label: 'Mission Control'
  },
  'briefing': { 
    icon: FileText, 
    color: 'text-gray-400',
    bgColor: 'bg-gradient-to-br from-gray-900/20 to-gray-800/10',
    borderColor: 'border-gray-500/30',
    glowColor: 'rgba(107, 114, 128, 0.15)',
    accentColor: 'text-gray-300',
    label: 'Briefing Room'
  },
  'archive': { 
    icon: Archive, 
    color: 'text-gray-400', 
    bgColor: 'bg-gradient-to-br from-gray-900/20 to-gray-800/10',
    borderColor: 'border-gray-500/30',
    glowColor: 'rgba(107, 114, 128, 0.15)',
    accentColor: 'text-gray-300',
    label: 'Archive'
  },
  'vault': {
    icon: ShieldCheck, 
    color: 'text-amber-400', 
    bgColor: 'bg-gradient-to-br from-yellow-900/30 to-amber-700/20',
    borderColor: 'border-amber-600/40',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    accentColor: 'text-yellow-200',
    label: 'The Vault'
  },
  'shop': {
    icon: Dices,
    color: 'text-purple-400',
    bgColor: 'bg-gradient-to-br from-purple-900/30 to-purple-700/20',
    borderColor: 'border-purple-600/40',
    glowColor: 'rgba(168,85,247,0.18)',
    accentColor: 'text-purple-200',
    label: 'Degen Shop'
  }
} as const;

export interface ZoneCardData {
  // Explicitly listing properties that would be inherited from ForumEntityBase
  // to ensure they are recognized, especially if module resolution for ForumEntityBase is problematic.
  id: number | string; // Allow both number and string for compatibility
  name: string;
  slug: string;
  description?: string;
  isZone?: boolean; 
  canonical?: boolean; 
  forum_type?: 'primary' | 'general' | 'merged' | 'deprecated';
  parentId?: number | null;
  parentSlug?: string;
  parentName?: string;
  icon?: string;
  colorTheme?: string;
  threadCount?: number;
  postCount?: number;
  canHaveThreads?: boolean;
  position?: number;

  // Own properties of ZoneCardData
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

// Extended card data type to support different card types
export interface CardData extends ZoneCardData {
  type?: 'zone' | 'shop' | 'static';
  isStatic?: boolean;
}

// Shop card specific data
export interface ShopCardData {
  id: string | number;
  type: 'shop';
  isStatic: true;
  featuredItem?: {
    name: string;
    price: number;
    image?: string;
  };
}

export type GridCardData = CardData | ShopCardData;

interface CanonicalZoneGridProps {
  zoneIds: string[]; // Changed from zones: ZoneCardData[]
  className?: string;
  includeShopCard?: boolean;
  shopCardData?: ShopCardData['featuredItem'];
}

/**
 * CanonicalZoneGrid - Grid of Primary Zone cards and optional special cards for homepage display
 * Renders special, branded cards for each canonical zone plus optional promotional cards
 */
export function CanonicalZoneGrid({ 
  zoneIds, // Changed from zones
  className = '', 
  includeShopCard = true,
  shopCardData 
}: CanonicalZoneGridProps) {
  if (!zoneIds || zoneIds.length === 0) {
    return (
      <div className="text-center text-zinc-400 py-12">
        <p>No zones available</p>
      </div>
    );
  }

  // Retrieve zone data from the registry
  const resolvedZones = zoneIds.map(id => getPrimaryZone(id)).filter(Boolean) as PrimaryZone[];

  // Separate and sort zones (using PrimaryZone properties)
  const primaryDisplayZones = resolvedZones
    .sort((a, b) => a.displayPriority - b.displayPriority);
  
  const displayableZones: PrimaryZone[] = [...primaryDisplayZones];

  // Prepare grid data with zones + optional shop card
  const gridData: GridCardData[] = [
    // Map PrimaryZone to ZoneCardData compatible structure
    ...displayableZones.map(zone => {
      const cardZoneData: ZoneCardData = {
        id: zone.id, // Keep as string to match PrimaryZone.id
        name: zone.label, // PrimaryZone uses 'label' not 'name'
        slug: zone.slug,
        description: zone.description,
        icon: typeof zone.icon === 'string' ? zone.icon : undefined,
        colorTheme: zone.colorTheme,
        forum_type: 'primary',
        position: zone.displayPriority,
        threadCount: zone.stats?.threadCount || 0,
        postCount: zone.stats?.postCount || 0,
        activeUsersCount: zone.stats?.activeUsersCount || 0,
        hasXpBoost: zone.features?.xpBoost?.enabled || false,
        boostMultiplier: zone.features?.xpBoost?.multiplier || 1,
        isEventActive: zone.features?.events?.isActive || false,
        eventData: zone.features?.events?.isActive ? {
          name: zone.features.events.name || 'Event',
          endsAt: zone.features.events.endsAt || new Date()
        } : undefined,
      };
      return { ...cardZoneData, type: 'zone' as const, isStatic: false };
    }),
    ...(includeShopCard ? [{
      id: 'shop-card',
      type: 'shop',
      isStatic: true,
      featuredItem: shopCardData
    } as ShopCardData] : [])
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {gridData.map((cardData, index) => (
        <motion.div
          key={cardData.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          {cardData.type === 'shop' ? (
            <ShopCard 
              featuredItem={(cardData as ShopCardData).featuredItem} 
            />
          ) : (
            <ForumZoneCard zoneId={cardData.id as string} isClickable /> 
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function ForumZoneCard({ zoneId, isClickable = false }: { zoneId: string; isClickable?: boolean }) {
  const zone = getPrimaryZone(zoneId);
  const [showStats, setShowStats] = React.useState(false);
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useZoneMetrics(zone?.slug || '');

  if (!zone) {
    // Handle case where zone is not found, though this shouldn't happen if zoneIds are valid
    return <div className="p-4 bg-red-900/50 border-red-700/50 rounded-xl text-white">Error: Zone '{zoneId}' not found.</div>;
  }

  // Use getZonePath directly with PrimaryZone object
  const zoneUrl = getZonePath(zone);
  
  // Get theme configuration
  const theme = zone.colorTheme as keyof typeof ZONE_THEMES;
  const themeConfig = ZONE_THEMES[theme] || null;
  
  // Extract stats and features safely
  const threadCount = zone.stats?.threadCount || 0;
  const postCount = zone.stats?.postCount || 0;
  const activeUsersCount = zone.stats?.activeUsersCount || 0;
  const hasXpBoost = zone.features?.xpBoost?.enabled || false;
  const boostMultiplier = zone.features?.xpBoost?.multiplier || 1;
  const isEventActive = zone.features?.events?.isActive || false;
  
  // Render icon based on theme or fallback to emoji
  const renderZoneIcon = () => {
    // If we have a theme configuration, use the themed icon
    if (themeConfig) {
      const IconComponent = themeConfig.icon;
      return <IconComponent className={`w-8 h-8 ${themeConfig.color}`} />;
    }
    
    // Fallback to emoji icon if available
    if (zone.icon && typeof zone.icon === 'string' && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(zone.icon)) {
      return <span className="text-3xl" role="img" aria-label={`${zone.label} icon`}>{zone.icon}</span>;
    }
    
    // Default folder icon
    return <Folder className="w-8 h-8 text-zinc-400" />;
  };
  
  const cardContent = (
    <motion.div 
      className={`
        relative
        min-h-[200px] 
        p-6 
        rounded-xl 
        border-2
        backdrop-blur-sm
        overflow-hidden
        transition-all duration-300
        ${themeConfig ? `${themeConfig.bgColor} ${themeConfig.borderColor}` : 'bg-zinc-900/50 border-zinc-700/50'}
        ${isClickable ? 'cursor-pointer group hover:shadow-xl' : ''}
      `}
      whileHover={isClickable ? { 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.3 }
      } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
    >
      {/* Background pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Activity pulse indicator */}
      {activeUsersCount > 0 && (
        <div className="absolute top-4 right-4">
          <motion.div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">{activeUsersCount}</span>
          </motion.div>
        </div>
      )}
      
      {/* Event indicator */}
      {isEventActive && (
        <div className="absolute bottom-4 right-4">
          <motion.div 
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-xs text-purple-400 font-medium">Event Active</span>
          </motion.div>
        </div>
      )}
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header with icon and title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 p-3 rounded-lg bg-black/20 border border-zinc-700/50">
            {renderZoneIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-xl font-bold mb-1 transition-colors group-hover:${themeConfig?.color || 'text-emerald-400'}`}>
              {zone.label}
            </h3>
            {themeConfig && (
              <div className={`text-xs font-medium ${themeConfig.accentColor} opacity-75`}>
                {themeConfig.label}
              </div>
            )}
            {zone.tagline && (
              <div className="text-xs text-zinc-500 mt-1">
                {zone.tagline}
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-zinc-400 mb-6 line-clamp-3 flex-grow">{zone.description}</p>
        
        {/* Unified stats row at bottom */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 mt-auto pt-2 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5 min-w-[70px] justify-center">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">{threadCount}</span>
            <span className="text-zinc-600">threads</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-[70px] justify-center">
            <Hash className="w-4 h-4" />
            <span className="font-medium">{postCount}</span>
            <span className="text-zinc-600">posts</span>
          </div>
          {/* XP Boost badge now in stats row */}
          {hasXpBoost && (
            <div className="flex items-center gap-1.5 min-w-[70px] justify-center">
              <ZapIcon className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-emerald-400">{boostMultiplier}x XP</span>
            </div>
          )}
          {/* Live metrics toggle */}
          <button
            className="ml-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            onClick={e => { e.stopPropagation(); setShowStats(s => !s); }}
            tabIndex={0}
            aria-label="Show zone stats"
            type="button"
          >
            <BarChart2 className="w-4 h-4" />
            Stats
          </button>
        </div>
        {/* Expandable metrics panel with error boundary and null checks */}
        {showStats && (
          <div className="mt-4 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 space-y-2">
            {metricsLoading ? (
              <div className="flex items-center gap-2 text-zinc-400"><Loader2 className="animate-spin w-4 h-4" /> Loading zone stats...</div>
            ) : metricsError ? (
              <div className="text-red-400">Failed to load zone stats</div>
            ) : metrics && typeof metrics === 'object' ? (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <ZapIcon className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">XP:</span>
                  <span>{metrics.totalXp?.toLocaleString?.() ?? 0}</span>
                  <CoinsIcon className="w-4 h-4 text-yellow-400 ml-4" />
                  <span className="font-semibold">DGT:</span>
                  <span>{metrics.totalDgt?.toLocaleString?.() ?? 0}</span>
                  <UsersIcon className="w-4 h-4 text-blue-400 ml-4" />
                  <span className="font-semibold">Active:</span>
                  <span>{metrics.activeUsers ?? 0}</span>
                </div>
                <div className="mt-2">
                  <div className="font-semibold text-zinc-300 mb-1 flex items-center gap-1"><FlameIcon className="w-4 h-4 text-orange-400" /> Hot Threads</div>
                  {Array.isArray(metrics.hotThreads) && metrics.hotThreads.length === 0 ? (
                    <div className="text-zinc-500">No hot threads</div>
                  ) : (
                    <ul className="space-y-1">
                      {Array.isArray(metrics.hotThreads) && metrics.hotThreads.map(ht => (
                        <li key={ht.id} className="flex items-center gap-2">
                          <span className="truncate font-medium text-zinc-100">{ht.title}</span>
                          <span className="text-zinc-400 ml-auto">{ht.replies} replies</span>
                          <span className="text-zinc-400">{ht.views} views</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Hover glow effect */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
        style={{
          background: themeConfig 
            ? `radial-gradient(circle at 50% 50%, ${themeConfig.glowColor} 0%, transparent 70%)`
            : `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)`
        }}
      />
    </motion.div>
  );

  if (isClickable) {
    return (
      <Link href={zoneUrl}>
        <div className="block h-full">{cardContent}</div>
      </Link>
    );
  }

  return cardContent;
}

export default CanonicalZoneGrid;
