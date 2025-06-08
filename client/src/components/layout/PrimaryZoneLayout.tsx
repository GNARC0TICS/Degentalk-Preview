import React from 'react';
import { SiteFooter } from '@/components/layout/site-footer';
import { PrimaryZone, componentMap } from '@/constants/primaryZones.tsx'; // Import PrimaryZone type and componentMap

interface PrimaryZoneLayoutProps {
  zone: PrimaryZone; // Use zone instead of forum for clarity with PrimaryZone type
  children?: React.ReactNode;
}

export const PrimaryZoneLayout: React.FC<PrimaryZoneLayoutProps> = ({ zone, children }) => {
  if (!zone) {
    return <div>Error: Zone data is missing.</div>;
  }

  // Dynamically render components based on the zone's configuration
  const renderDynamicComponents = () => {
    if (!zone.components || zone.components.length === 0) {
      return <p className="text-zinc-400">No specific components configured for this zone.</p>;
    }

    return (
      <div className="space-y-8"> {/* Add some spacing between dynamic components */}
        {zone.components.map((componentName, index) => {
          const Component = componentMap[componentName];
          if (Component) {
            // Pass zone data to the dynamically rendered component
            return <Component key={componentName} zone={zone} />;
          } else {
            // Handle case where component is not found in the map
            console.warn(`Component "${componentName}" not found in componentMap.`);
            return (
              <div key={componentName} className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
                Error: Component "{componentName}" not found.
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-black text-white zone-theme-${zone.colorTheme}`}> {/* Use zone-theme class */}
      <main className="container mx-auto px-4 py-8">
        {/* Placeholder for Zone Header - will be implemented later */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{zone.label}</h1> {/* Use zone.label */}
          <p className="text-zinc-400">{zone.description}</p>
        </div>

        {/* Render children if provided, otherwise render dynamically mounted components */}
        {children ? children : renderDynamicComponents()}
      </main>
      <SiteFooter />
    </div>
  );
};
