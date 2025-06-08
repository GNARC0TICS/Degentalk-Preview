import React from 'react';
import { Link } from 'wouter';
import { SiteFooter } from '@/components/layout/site-footer.tsx';
import { PrimaryZone, componentMap } from '@/constants/primaryZones.tsx';
import { ArrowLeft, Users, MessageSquare, Star, Zap } from 'lucide-react';

interface PrimaryZoneLayoutProps {
  zone: PrimaryZone;
  children?: React.ReactNode;
}

export const PrimaryZoneLayout: React.FC<PrimaryZoneLayoutProps> = ({ zone, children }) => {
  if (!zone) {
    return <div>Error: Zone data is missing.</div>;
  }

  // Dynamically render components based on the zone's configuration
  const renderDynamicComponents = () => {
    if (!zone.components || zone.components.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-4">No specific components configured for this zone.</p>
          <p className="text-zinc-600 text-sm">Dynamic components will be added soon.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {zone.components.map((componentName) => {
          const Component = componentMap[componentName];
          if (Component) {
            return <Component key={componentName} zone={zone} />;
          } else {
            console.warn(`Component "${componentName}" not found in componentMap.`);
            return (
              <div key={componentName} className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
                <p className="font-medium">Component Missing: {componentName}</p>
                <p className="text-sm opacity-75">This component is configured but not yet implemented.</p>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Zone Header with Gradient Background */}
      <div className={`relative ${zone.gradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Home
              </button>
            </Link>
            <span className="text-white/50">/</span>
            <Link href="/zones">
              <button className="text-white/70 hover:text-white transition-colors">
                Zones
              </button>
            </Link>
            <span className="text-white/50">/</span>
            <span className="text-white font-medium">{zone.label}</span>
          </div>

          {/* Zone Title & Description */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{zone.icon}</span>
                <div>
                  <h1 className="text-4xl font-bold text-white">{zone.label}</h1>
                  {zone.tagline && (
                    <p className="text-lg text-white/80 mt-1">{zone.tagline}</p>
                  )}
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-2xl">{zone.description}</p>
            </div>

            {/* Zone Stats */}
            <div className="flex flex-wrap lg:flex-col gap-4 lg:gap-3">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-3 min-w-[140px]">
                <div className="flex items-center gap-2 text-white/80 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Threads</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {zone.stats?.threadCount || 0}
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-3 min-w-[140px]">
                <div className="flex items-center gap-2 text-white/80 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Active Users</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {zone.stats?.activeUsersCount || 0}
                </div>
              </div>
              {zone.features?.xpBoost?.enabled && (
                <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-3 min-w-[140px]">
                  <div className="flex items-center gap-2 text-white/80 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">XP Boost</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {zone.features.xpBoost.multiplier}x
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zone Content */}
      <main className="container mx-auto px-4 py-8">
        {children ? children : renderDynamicComponents()}
      </main>

      <SiteFooter />
    </div>
  );
};
