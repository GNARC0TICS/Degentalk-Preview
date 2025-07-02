import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { useAnimationConfig } from '@/hooks/useReducedMotion';
import { 
  textFade, 
  lazyFadeIn, 
  hoverScale, 
  hoverSlide,
  createTransition,
  createBackgroundConfig 
} from '@/lib/animations';

// Use full quote list from config but optimize with memoization
import { heroQuotes } from '@/config/quotes';

// Fisher-Yates shuffle for randomization
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
  const animConfig = useAnimationConfig();
  const backgroundConfig = createBackgroundConfig(animConfig.enableHeavyAnimations);
  
  // Memoized shuffled quotes for performance
  const shuffledQuotes = useMemo(() => shuffleArray(heroQuotes), []);

  // Restore 30-second interval as requested
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % shuffledQuotes.length);
    }, 30000); // Back to 30 seconds
    return () => clearInterval(interval);
  }, [shuffledQuotes.length]);

  const currentQuote = shuffledQuotes[currentQuoteIndex];

  const scrollToNewsletter = () => {
    document.getElementById('newsletter-signup')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const scrollToOverview = () => {
    document.getElementById('platform-overview')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      
      {/* Optimized background system */}
      {backgroundConfig.gradientAnimation && (
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/4 via-purple-500/2 to-cyan-500/4" />
      )}
      
      {/* Simplified pattern overlay */}
      {backgroundConfig.patternOverlay && (
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
      )}

      {/* Minimal glow effects */}
      {backgroundConfig.blurEffects && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-500/3 rounded-full blur-3xl" />
        </div>
      )}

      {/* Fixed height container - solving spacing issue */}
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-4rem)] relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          {...(animConfig.prefersReducedMotion ? {} : lazyFadeIn)}
        >

          {/* Optimized headline container - responsive height */}
          <div className="min-h-[8rem] md:min-h-[10rem] lg:min-h-[12rem] flex items-center justify-center mb-8">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentQuoteIndex}
                variants={textFade}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={createTransition('normal')}
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white text-center leading-tight px-4"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              >
                {currentQuote.headline}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Simplified subheader */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-white/90 mb-12 font-medium"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            {...(animConfig.prefersReducedMotion ? {} : {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: createTransition('normal', 0.2)
            })}
          >
            {currentQuote.subheader}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            {...(animConfig.prefersReducedMotion ? {} : {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: createTransition('normal', 0.4)
            })}
          >
            <motion.div 
              {...(animConfig.prefersReducedMotion ? {} : { whileHover: hoverScale, whileTap: { scale: 0.98 } })}
            >
              <Button
                size="lg"
                className="border border-zinc-800 bg-black text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 px-8 py-4 text-lg font-semibold"
                onClick={scrollToNewsletter}
              >
                <Users className="w-5 h-5 mr-2" />
                Join Waitlist
              </Button>
            </motion.div>
          </motion.div>

          {/* Learn more link */}
          <motion.div
            className="flex justify-center"
            {...(animConfig.prefersReducedMotion ? {} : {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: createTransition('normal', 0.6)
            })}
          >
            <button
              onClick={scrollToOverview}
              className="group flex items-center text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
            >
              <span className="text-base">Learn more about Degentalk</span>
              <motion.div
                {...(animConfig.prefersReducedMotion ? {} : { whileHover: hoverSlide })}
              >
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.div>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Minimal bottom blend */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-transparent to-black pointer-events-none" />
    </section>
  );
}