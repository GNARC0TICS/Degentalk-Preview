import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { heroQuotes, type HeroQuote } from '@/config/quotes';
import { useReducedMotion, getAnimationConfig } from '@/hooks/useReducedMotion';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function HeroSection() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [shuffledQuotes, setShuffledQuotes] = useState<HeroQuote[]>(() =>
    shuffleArray(heroQuotes)
  );
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Shuffle once per mount/session
    setShuffledQuotes(shuffleArray(heroQuotes));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % shuffledQuotes.length);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [shuffledQuotes.length]);

  const currentQuote: HeroQuote = shuffledQuotes[currentQuoteIndex];

  const scrollToNewsletter = () => {
    document.getElementById('newsletter-signup')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black min-h-screen flex items-center"
      suppressHydrationWarning
    >
      {/* Animated gradient background with enhanced colors */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/6 via-purple-500/4 to-cyan-500/6 animate-gradient-shift" style={{backgroundSize: '400% 400%'}} />
      <div className="absolute inset-0 bg-gradient-to-bl from-rose-500/2 via-transparent to-amber-500/2" />

      {/* Background pattern with enhanced overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(34, 211, 238, 0.08) 0%, transparent 50%),
                           linear-gradient(45deg, rgba(16, 185, 129, 0.03) 25%, transparent 25%, transparent 75%, rgba(34, 211, 238, 0.03) 75%)`
        }}
      />

      {/* Layered background system */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMzBoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0ek0zMCAzNGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMlY2aDJ2NHptMCAzMGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6TTI0IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0yVjZoMnY0em0wIDMwaC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiIC8+PC9nPjwvZz48L3N2Zz4=')] opacity-25" />
      </div>

      {/* Subtle glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-28 lg:py-36 relative z-10">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          {...(getAnimationConfig(prefersReducedMotion) || {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8 }
          })}
        >

          {/* Animated headline */}
          <div className="h-[120px] md:h-[140px] lg:h-[168px] flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center leading-tight"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.1)'
                }}
              >
                {currentQuote.headline}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Animated subheader */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`subheader-${currentQuoteIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-white mb-8 md:mb-10 flex items-center gap-2 justify-center font-semibold"
              style={{ textShadow: '0 0 8px rgba(255,255,255,0.1)' }}
            >
              {currentQuote.subheader}
            </motion.p>
          </AnimatePresence>

          <motion.div
            className="flex flex-wrap gap-4 justify-center mt-8 md:mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="border border-zinc-800 bg-black text-white hover:bg-zinc-900 hover:border-zinc-700 transition-colors duration-200 px-6 py-3 text-base"
                onClick={scrollToNewsletter}
              >
                <Users className="w-4 h-4 mr-2" />
                Join Waitlist
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 md:mt-12 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <button
              onClick={() => {
                document.getElementById('platform-overview')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              <motion.div
                className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors text-sm group"
                whileHover={{ x: 5 }}
              >
                <span>Learn more about Degentalk</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient to blend into next section */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-28 bg-gradient-to-b from-transparent to-black" />
    </section>
  );
}