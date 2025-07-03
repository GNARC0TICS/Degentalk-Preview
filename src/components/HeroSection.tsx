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
    <section className="relative overflow-hidden bg-transparent">
      

      {/* Dynamic glow orbs with animation */}
      {backgroundConfig.blurEffects && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px]"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      )}

      {/* Fixed height container - solving spacing issue */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-4rem)] relative">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >

          {/* Optimized headline container - responsive height */}
          <div className="min-h-[10rem] sm:min-h-[12rem] md:min-h-[14rem] lg:min-h-[16rem] xl:min-h-[18rem] flex items-center justify-center mb-6 sm:mb-8 md:mb-10">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentQuoteIndex}
                variants={textFade}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white text-center leading-tight px-2 sm:px-4 tracking-tight"
                style={{ 
                  textShadow: '0 8px 16px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), 0 0 20px rgba(16,185,129,0.08)'
                }}
              >
                {currentQuote.headline}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Animated subheader with stagger */}
          <div className="min-h-[4rem] sm:min-h-[5rem] flex items-center justify-center mb-8 sm:mb-10 md:mb-12">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${currentQuoteIndex}-sub`}
                className="text-lg md:text-xl lg:text-2xl text-white/85 max-w-2xl mx-auto font-medium text-center"
                style={{ 
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 12px rgba(16,185,129,0.12)'
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {currentQuote.subheader}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                size="lg"
                className="relative border border-zinc-800 bg-black/90 backdrop-blur-sm text-white hover:bg-zinc-900/90 hover:border-emerald-500/50 transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold group overflow-hidden shadow-lg hover:shadow-emerald-500/20 w-full sm:w-auto"
                onClick={scrollToNewsletter}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 via-emerald-600/10 to-emerald-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Users className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Join Waitlist</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Learn more link */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <button
              onClick={scrollToOverview}
              className="group relative flex items-center text-emerald-400 hover:text-emerald-300 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="text-base font-medium relative">
                Learn more about Degentalk
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-emerald-400 group-hover:w-full transition-all duration-300" />
              </span>
              <motion.div
                whileHover={{ x: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.div>
            </button>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}