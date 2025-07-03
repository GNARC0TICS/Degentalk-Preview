import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { footerQuotes } from '@/config/quotes';
import { useAnimationConfig } from '@/hooks/useReducedMotion';
import { textFade, createTransition } from '@/lib/animations';

function RandomTagline({ className }: { className?: string }) {
  const [tagline, setTagline] = useState(footerQuotes[0]);
  const animConfig = useAnimationConfig();

  const handleTaglineHover = () => {
    if (animConfig.prefersReducedMotion) {
      // Simple immediate change for reduced motion users
      const newTagline = footerQuotes[Math.floor(Math.random() * footerQuotes.length)];
      setTagline(newTagline);
      return;
    }
    
    // Animated change for others
    const newTagline = footerQuotes[Math.floor(Math.random() * footerQuotes.length)];
    setTagline(newTagline);
  };

  return (
    <div
      className={`italic cursor-pointer select-none ${className}`}
      onMouseEnter={handleTaglineHover}
    >
      {animConfig.prefersReducedMotion ? (
        <p className="hover:text-emerald-400 transition-colors text-center md:text-right text-zinc-500">
          {tagline}
        </p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.p
            key={tagline}
            variants={textFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={createTransition('fast')}
            className="hover:text-emerald-400 transition-colors text-center md:text-right text-zinc-400"
          >
            {tagline}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}

export function Footer() {
  const animConfig = useAnimationConfig();
  
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const footerSections = [
    {
      title: 'Forums',
      links: [
        { name: 'About', id: 'platform-overview' },
        { name: 'Features', id: 'features' },
        { name: 'Coming Soon', id: 'hero' }
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Newsletter', id: 'newsletter-signup' },
        { name: 'Updates', id: 'newsletter-signup' },
        { name: 'Contact', id: 'newsletter-signup' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'FAQ', id: 'platform-overview' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Contact', href: '/contact' }
      ]
    }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-zinc-900/50 to-zinc-950 border-t border-zinc-800 py-8 sm:py-10 md:py-12 mt-auto overflow-hidden">
      {/* Subtle footer accent - only if heavy animations enabled */}
      {animConfig.enableHeavyAnimations && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/2 via-transparent to-indigo-500/2" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-blue-500/3 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
        </>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">

        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 lg:mb-10">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-xl font-extrabold text-white tracking-tight">
                Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup>
              </span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              The premier crypto-native forum and social platform for enthusiasts, traders, and
              developers. Where chaos meets community.
            </p>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href ? (
                      <a
                        href={link.href}
                        className="text-zinc-300 hover:text-emerald-400 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md px-1 py-1"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <button
                        onClick={() => link.id && scrollToSection(link.id)}
                        className="text-zinc-300 hover:text-emerald-400 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-md px-1 py-1"
                      >
                        {link.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-400">
          <div className="order-2 md:order-1">
            &copy; {new Date().getFullYear()} Degentalk. All rights reserved.
          </div>

          {/* Random Tagline Easter Egg */}
          <RandomTagline className="order-1 md:order-2 md:max-w-md" />
        </div>
      </div>
    </footer>
  );
}