import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  hamburgerTopLine, 
  hamburgerMiddleLine, 
  hamburgerBottomLine,
  mobileMenuContainer,
  mobileMenuItem
} from '@/lib/animations';

// Ultra-optimized AnimatedHamburger component
interface AnimatedHamburgerProps {
  isOpen: boolean;
  className?: string;
}

function AnimatedHamburger({ isOpen, className }: AnimatedHamburgerProps) {
  const lineStyle = "w-6 h-0.5 bg-current origin-center";
  
  return (
    <div className={`w-6 h-6 flex flex-col justify-center items-center space-y-1 ${className}`}>
      <motion.div
        className={lineStyle}
        variants={hamburgerTopLine}
        animate={isOpen ? 'open' : 'closed'}
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className={lineStyle}
        variants={hamburgerMiddleLine}
        animate={isOpen ? 'open' : 'closed'}
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div
        className={lineStyle}
        variants={hamburgerBottomLine}
        animate={isOpen ? 'open' : 'closed'}
        style={{ willChange: 'transform, opacity' }}
      />
    </div>
  );
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
    setIsMobileMenuOpen(false);
  };

  // Memoize navigation to prevent re-renders
  const navigation = useMemo(() => [
    { name: 'Home', id: 'hero' },
    { name: 'About', id: 'platform-overview' },
    { name: 'Features', id: 'features' },
    { name: 'Newsletter', id: 'newsletter-signup' }
  ], []);

  return (
    <header className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50 shadow-md transition-all relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            className="flex items-center cursor-pointer text-left focus:outline-none md:focus:ring-2 md:focus:ring-emerald-400 rounded-md px-2 py-1"
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
                className="text-zinc-300 hover:text-emerald-400 transition-colors duration-200 focus:outline-none md:focus:ring-2 md:focus:ring-emerald-400 rounded-md px-3 py-2"
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
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md focus:outline-none"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              whileTap={{ scale: 0.95 }}
              style={{ willChange: 'transform' }}
            >
              <AnimatedHamburger isOpen={isMobileMenuOpen} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation - Ultra-optimized with AnimatePresence */}
        <AnimatePresence mode="wait">
          {isMobileMenuOpen && (
            <motion.div
              className="absolute top-full left-0 right-0 md:hidden bg-zinc-900 border-b border-zinc-800 shadow-xl z-40"
              id="mobile-navigation"
              role="navigation"
              aria-label="Mobile navigation menu"
              variants={mobileMenuContainer}
              initial="closed"
              animate="open"
              exit="closed"
              style={{ willChange: 'transform, opacity' }}
            >
              <motion.div 
                className="container mx-auto px-4 py-4 space-y-1"
                variants={mobileMenuContainer}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {navigation.map((item, index) => (
                  <motion.button
                    key={item.name}
                    className="block w-full text-left px-4 py-3 text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800/50 rounded-md transition-colors duration-200 min-h-[44px] focus:outline-none"
                    onClick={() => scrollToSection(item.id)}
                    aria-label={`Navigate to ${item.name} section`}
                    variants={mobileMenuItem}
                    style={{ willChange: 'transform, opacity' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <motion.div 
                  className="pt-2"
                  variants={mobileMenuItem}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border border-zinc-800 bg-black hover:bg-zinc-900 hover:border-zinc-700 text-white rounded-md"
                    onClick={() => scrollToSection('newsletter-signup')}
                  >
                    Join Waitlist
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}