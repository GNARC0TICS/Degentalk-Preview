import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Home', id: 'hero' },
    { name: 'About', id: 'platform-overview' },
    { name: 'Features', id: 'features' },
    { name: 'Newsletter', id: 'newsletter-signup' }
  ];

  return (
    <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50 shadow-md transition-all relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            className="flex items-center cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md px-2 py-1"
            onClick={() => {
              document.getElementById('hero')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
            aria-label="Degentalk - Go to homepage"
          >
            <span className="text-xl font-bold text-white">
              Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                className="text-zinc-300 hover:text-emerald-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md px-3 py-2"
                onClick={() => scrollToSection(item.id)}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              variant="outline"
              size="default"
              className="border border-zinc-800 bg-black hover:bg-zinc-900 hover:border-zinc-700 text-white rounded-md"
              onClick={() => scrollToSection('newsletter-signup')}
            >
              Join Waitlist
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Positioned absolutely to not affect layout */}
        {isMobileMenuOpen && (
          <div
            className="absolute top-full left-0 right-0 md:hidden bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 shadow-lg z-40"
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  className="block w-full text-left px-4 py-3 text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/50 rounded-md transition-colors duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  onClick={() => scrollToSection(item.id)}
                  aria-label={`Navigate to ${item.name} section`}
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border border-zinc-800 bg-black hover:bg-zinc-900 hover:border-zinc-700 text-white rounded-md"
                  onClick={() => scrollToSection('newsletter-signup')}
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}