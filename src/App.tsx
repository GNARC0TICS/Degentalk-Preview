import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { PlatformOverview } from '@/components/PlatformOverview';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Footer } from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        
        <main>
          <div id="hero">
            <ErrorBoundary fallback={
              <div className="min-h-screen bg-cod-gray-950 flex items-center justify-center">
                <p className="text-white">Failed to load hero section</p>
              </div>
            }>
              <HeroSection />
            </ErrorBoundary>
          </div>
          
          <div id="platform-overview">
            <ErrorBoundary>
              <PlatformOverview />
            </ErrorBoundary>
          </div>
          
          <div id="newsletter-signup">
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
    </ErrorBoundary>
  );
}

export default App;