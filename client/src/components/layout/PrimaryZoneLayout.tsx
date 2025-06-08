import React from 'react';
import { SiteFooter } from '@/components/layout/site-footer';
import { PrimaryZone } from '@/constants/primaryZones'; // Import PrimaryZone type

interface PrimaryZoneLayoutProps {
  forum: PrimaryZone; // Use PrimaryZone type
  children?: React.ReactNode;
}

export const PrimaryZoneLayout: React.FC<PrimaryZoneLayoutProps> = ({ forum, children }) => {
  if (!forum) {
    return <div>Error: Forum data is missing.</div>;
  }

  return (
    <div className={`min-h-screen bg-black text-white forum-theme-${forum.colorTheme}`}>
      <main className="container mx-auto px-4 py-8">
        {/* Placeholder for Zone Header - will be implemented later */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{forum.name}</h1>
          <p className="text-zinc-400">{forum.description}</p>
        </div>

        {/* Render children or dynamically mounted components */}
        {children ? children : (
          <div>
            {/* Placeholder for dynamic components based on forum.components */}
            <p>Dynamic components for {forum.name} will be rendered here.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};
