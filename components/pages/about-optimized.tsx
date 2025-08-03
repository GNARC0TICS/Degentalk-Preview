// Performance wrapper for the About page that preserves all styling
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading placeholder that matches the page style
function AboutLoading() {
  return (
    <div className="min-h-screen py-20 sm:py-24 md:py-32 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-12 h-6 w-32 bg-zinc-800 rounded animate-pulse" />
        <div className="relative bg-[#f5f2ed] rounded-sm shadow-2xl p-8 sm:p-12 md:p-16">
          <div className="space-y-8">
            <div className="h-12 bg-zinc-200 rounded w-3/4 animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-zinc-300 rounded w-full animate-pulse" />
              <div className="h-4 bg-zinc-300 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-zinc-300 rounded w-4/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic import of the About component for code splitting
const About = dynamic(
  () => import('./about').then(mod => ({ default: mod.About })),
  {
    loading: () => <AboutLoading />,
    ssr: true // Keep SSR for SEO
  }
);

export function AboutOptimized() {
  return (
    <Suspense fallback={<AboutLoading />}>
      <About />
    </Suspense>
  );
}