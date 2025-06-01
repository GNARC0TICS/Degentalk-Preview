import React from 'react';
import { ZoneCard } from '@/components/forum/ZoneCard';

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
      <div className={`p-6 text-center text-zinc-500 bg-zinc-900/50 rounded-lg border border-zinc-800 ${className}`}>
        No primary zones found.
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white">Primary Zones</h2>
        <span className="text-sm text-zinc-400">Branded single-forum destinations</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {zones.map(zone => (
          <ZoneCard
            key={zone.id}
            id={zone.id}
            name={zone.name}
            slug={zone.slug}
            description={zone.description || ''}
            icon={zone.icon}
            colorTheme={zone.colorTheme}
            threadCount={zone.threadCount}
            postCount={zone.postCount}
            activeUsersCount={zone.activeUsersCount}
            lastActivityAt={zone.lastActivityAt}
            hasXpBoost={zone.hasXpBoost}
            boostMultiplier={zone.boostMultiplier}
            isEventActive={zone.isEventActive}
            eventData={zone.eventData}
          />
        ))}
      </div>
    </div>
  );
}

export default CanonicalZoneGrid; 