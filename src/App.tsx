import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { PlatformOverview } from '@/components/PlatformOverview';
import { FAQ } from '@/components/FAQ';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Footer } from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ViewportBackground } from '@/components/ViewportBackground';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen text-foreground relative bg-black">
        {/* Global Viewport Background - fixed behind content */}
        <div className="fixed inset-0 -z-10">
          <ViewportBackground />
        </div>
        
        {/* Content layer */}
        <div className="relative z-10">
        {/* Skip Links for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md z-50 font-medium"
        >
          Skip to main content
        </a>
        <a 
          href="#newsletter-signup" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-white text-black px-4 py-2 rounded-md z-50 font-medium"
        >
          Skip to signup
        </a>
        
        <Header />
        
        <main id="main-content">
          <div id="hero">
            <ErrorBoundary fallback={
              <div className="min-h-screen bg-cod-gray-950 flex items-center justify-center">
                <p className="text-white">Failed to load hero section</p>
              </div>
            }>
              <HeroSection />
            </ErrorBoundary>
          </div>
          
          <div>
            <ErrorBoundary>
              <PlatformOverview />
            </ErrorBoundary>
          </div>
          
          <div>
            <ErrorBoundary>
              <FAQ />
            </ErrorBoundary>
          </div>
          
          <div>
            <ErrorBoundary>
              <NewsletterSignup />
            </ErrorBoundary>
          </div>
        </main>
        
        <div id="footer">
          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>
        </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;