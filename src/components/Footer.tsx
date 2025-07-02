import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { footerQuotes } from '@/config/quotes';

function RandomTagline({ className }: { className?: string }) {
  const [currentQuote, setCurrentQuote] = useState(footerQuotes[0]);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * footerQuotes.length);
    setCurrentQuote(footerQuotes[randomIndex]);
  };

  return (
    <motion.div
      className={`text-center cursor-pointer select-none ${className}`}
      onMouseEnter={getRandomQuote}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <p className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors duration-200">
        {currentQuote}
      </p>
      <p className="text-xs text-zinc-600 mt-1">
        (hover for more wisdom)
      </p>
    </motion.div>
  );
}

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const footerSections = [
    {
      title: 'Platform',
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
        { name: 'Support', id: 'newsletter-signup' },
        { name: 'Terms', id: 'footer' }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-zinc-900/50 to-zinc-950 border-t border-zinc-800 py-8 mt-auto">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 animate-gradient-shift" />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <motion.div
              className="flex items-center mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xl font-bold text-white">
                Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup>
              </span>
            </motion.div>
            <motion.p
              className="text-zinc-400 text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              The future of crypto forums. Where the risk is real and the advice is imaginary.
            </motion.p>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (sectionIndex + 1), duration: 0.6 }}
            >
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-zinc-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <motion.div
            className="order-2 md:order-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            &copy; {new Date().getFullYear()} Degentalk. All rights reserved.
          </motion.div>

          {/* Random Tagline Easter Egg */}
          <RandomTagline className="order-1 md:order-2 md:max-w-md" />
        </div>
      </div>
    </footer>
  );
}