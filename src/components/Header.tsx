import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50 shadow-md transition-all">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            className="flex items-center cursor-pointer text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
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
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <motion.button
                key={item.name}
                className="text-cod-gray-300 hover:text-emerald-400 transition-colors duration-200"
                onClick={() => scrollToSection(item.id)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {item.name}
              </motion.button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              variant="outline"
              size="default"
              className="border border-zinc-800 bg-black hover:bg-zinc-900 hover:border-zinc-700 text-white rounded-md"
              onClick={() => scrollToSection('newsletter-signup')}
            >
              Join Waitlist
            </Button>
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-cod-gray-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="py-4 space-y-4 border-t border-cod-gray-800">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  className="block w-full text-left px-4 py-2 text-cod-gray-300 hover:text-emerald-400 hover:bg-cod-gray-800/50 rounded-md transition-colors duration-200 min-h-[44px]"
                  onClick={() => scrollToSection(item.id)}
                  aria-label={`Navigate to ${item.name} section`}
                >
                  {item.name}
                </button>
              ))}
              <div className="px-4 pt-2">
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
          </motion.div>
        )}
      </div>
    </header>
  );
}