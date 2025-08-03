import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Loading placeholder that matches the ticker height
function TickerSkeleton() {
  return (
    <div className="bg-zinc-900/80 border-y border-zinc-800 h-10 relative overflow-hidden">
      <div className="absolute left-0 top-0 h-full flex items-center px-4 bg-zinc-900 z-20">
        <div className="w-4 h-4 bg-zinc-700 rounded animate-pulse" />
      </div>
      <div className="h-full ml-14 mr-4 flex items-center">
        <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
      </div>
    </div>
  );
}

// Dynamic import with optimized loading
const AnnouncementTicker = dynamic(
  () => import('./announcement-ticker').then(mod => ({ default: mod.AnnouncementTicker })),
  {
    loading: () => <TickerSkeleton />,
    ssr: true // Keep SSR for SEO but code-split the animations
  }
);

// Server Component wrapper
export function AnnouncementTickerWrapper() {
  return (
    <Suspense fallback={<TickerSkeleton />}>
      <AnnouncementTicker />
    </Suspense>
  );
}