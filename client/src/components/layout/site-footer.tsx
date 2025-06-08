import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';
import { uiConfig } from '@/config/ui.config';

export function SiteFooter() {
  const [tagline, setTagline] = useState(uiConfig.footerQuotes[0]);
  const [isGlitching, setIsGlitching] = useState(false);
  const [onlineCount, setOnlineCount] = useState(237);

  // Simulate changing online user count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 7) - 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTaglineHover = () => {
    setIsGlitching(true);
    setTimeout(() => {
      const newTagline = uiConfig.footerQuotes[Math.floor(Math.random() * uiConfig.footerQuotes.length)];
      setTagline(newTagline);
      setIsGlitching(false);
    }, 300);
  };

  return (
    <footer className="bg-gradient-to-b from-zinc-900/50 to-cod-gray-950 border-t border-zinc-800 py-8 mt-auto">
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 animate-gradient-shift" />

      <div className="container mx-auto px-4">
        {/* Live stats section */}
        <motion.div
          className="flex justify-center gap-8 mb-8 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-medium">{onlineCount} degens online</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <MessageSquare className="w-4 h-4" />
            <span>42,069 posts today</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <motion.h3
              className="text-lg font-bold mb-4 text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Degentalk<span style={{ fontSize: '0.65em', verticalAlign: 'super', marginLeft: '1px' }}>™</span>
            </motion.h3>
            <p className="text-zinc-400 text-sm">
              The premier crypto-native forum and social platform for enthusiasts, traders, and developers.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-zinc-300">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {['Home', 'Forum', 'Shop', 'Leaderboard'].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}>
                    <motion.span
                      className="text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer inline-block"
                      whileHover={{ x: 5 }}
                    >
                      {item}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-zinc-300">Resources</h4>
            <ul className="space-y-2 text-sm">
              {[
                'Documentation',
                'API References',
                'Token Economics',
                'Platform FAQ'
              ].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <motion.a
                    href="#"
                    className="text-zinc-400 hover:text-emerald-400 transition-colors inline-block"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-zinc-300">Legal</h4>
            <ul className="space-y-2 text-sm">
              {[
                'Privacy Policy',
                'Terms of Service',
                'Cookie Policy',
                'Disclaimer'
              ].map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <motion.a
                    href="#"
                    className="text-zinc-400 hover:text-emerald-400 transition-colors inline-block"
                    whileHover={{ x: 5 }}
                  >
                    {item}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <motion.div
            className="order-2 md:order-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            &copy; {new Date().getFullYear()} Degentalk<span style={{ fontSize: '0.65em', verticalAlign: 'super', marginLeft: '1px' }}>™</span>. All rights reserved.
          </motion.div>

          <motion.div
            className="order-1 md:order-2 mb-4 md:mb-0 italic cursor-pointer select-none"
            onHoverStart={handleTaglineHover}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={tagline}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${isGlitching ? 'animate-glitch' : ''} hover:text-emerald-400 transition-colors`}
              >
                {tagline}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}