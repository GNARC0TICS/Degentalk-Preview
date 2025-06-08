import React from 'react';
import { useRoute } from 'wouter';
import { SiteFooter } from '@/components/layout/site-footer';
import { AlertCircle } from 'lucide-react';
import { PrimaryZoneLayout } from '@/components/layout/PrimaryZoneLayout'; // Placeholder, assuming this component exists
import { getPrimaryZone, PrimaryZone } from '@/constants/primaryZones.tsx'; // Import getPrimaryZone and PrimaryZone type

export default function MissionControlPage() {
  const [match, params] = useRoute<{ slug: string }>('/mission-control');
  const slug = params?.slug || 'mission-control'; // Hardcode slug for this specific page

  // Get primary zone data from constants
  const zone: PrimaryZone | undefined = getPrimaryZone(slug);

  if (!match) {
    return <div>404 Not Found</div>;
  }

  // No loading state needed as data is from constants

  if (!zone) {
     return (
      <div className="min-h-screen bg-black text-white">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Zone Not Found</h2>
            <p className="text-zinc-400">The Mission Control zone doesn't exist or has been moved.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Assuming PrimaryZoneLayout takes the PrimaryZone data and handles rendering
  return (
    <PrimaryZoneLayout zone={zone}>
      {/* Content specific to Mission Control can go here if needed,
          or PrimaryZoneLayout can handle dynamic components based on zone.components */}
      {/* The PrimaryZoneLayout component should handle rendering the zone's specific content */}
    </PrimaryZoneLayout>
  );
}
