import React from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { SiteFooter } from '@/components/layout/site-footer';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { PrimaryZone } from '@/constants/primaryZones'; // Import PrimaryZone type
import { PrimaryZoneLayout } from '@/components/layout/PrimaryZoneLayout';

export default function ThePitPage() {
  const [match, params] = useRoute<{ slug: string }>('/the-pit');
  const slug = params?.slug || 'the-pit'; // Hardcode slug for this specific page

  // Fetch forum data based on slug
  const {
    data: forum,
    isLoading,
    isError,
    error
  } = useQuery<PrimaryZone>({ // Use PrimaryZone type
    queryKey: [`/api/forums/${slug}`], // Assuming this API endpoint works for primary zones
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!slug
  });

  if (!match) {
    return <div>404 Not Found</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Zone</h2>
            <p className="text-zinc-400">Could not load The Pit. Please try again later.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!forum) {
     return (
      <div className="min-h-screen bg-black text-white">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Zone Not Found</h2>
            <p className="text-zinc-400">The Pit zone doesn't exist or has been moved.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <PrimaryZoneLayout forum={forum}>
      {/* Content specific to The Pit can go here if needed */}
      <div>The Pit Specific Content Placeholder</div>
    </PrimaryZoneLayout>
  );
}
