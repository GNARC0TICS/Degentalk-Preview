import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Users, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
  {
    headline: "Where the risk is real and the advice is imaginary.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Post first. Cope later.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Built by winners. Maintained by the wreckage.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "The only forum where 'bad idea' is a compliment.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "We chart pain in real-time.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Alpha, anxiety, and the occasional enlightenment.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Proof-of-sanity not required.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "A support group for people who call their losses 'lessons.'",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "No roadmap. No mercy.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Join the conversation before the voices win.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "We eat pump and dumps for breakfast.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Dox your thoughts. Keep your wallet private.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "One rug away from greatness.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "This is not financial advice. It's worse.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "A forum for people banned from better forums.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "More insight than CT. Fewer scams than Discord.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Your subconscious made this site. We're just hosting it.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Built by gamblers pretending to be philosophers.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "The tab you check before blowing your last $20.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Welcome to the frontlines of financial chaos.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "If Reddit and 4chan had a DAO baby.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Lurk. Post. Ascend.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Bridging the gap between genius and gambling addiction.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "No GM's, Not another Web3 project. Keep your money.. You're gonna need it.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "The only forum where losing money makes you smarter.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Alpha is temporary. Reputations are forever.",
    subheader: "Post wisely. Or don't."
  },
  {
    headline: "We backtest trauma.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Mentally unwell. Financially overexposed.",
    subheader: "Join thousands of others doing just fine."
  },
  {
    headline: "You're early. But still down bad.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "Where your bags get sympathy… and screenshots.",
    subheader: "This is a safe space for unsafe bets."
  },
  {
    headline: "A forum for people who should log off… but won't.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "An experimental forum for financially curious masochists.",
    subheader: "We study losses so you don't have to."
  },
  {
    headline: "Technically legal. Morally bankrupt.",
    subheader: "Welcome to DegenTalk."
  },
  {
    headline: "Lurk harder. Think worse. Win more.",
    subheader: "Discover, Discuss, Degen."
  },
  {
    headline: "We're not addicted. We're informed.",
    subheader: "This is the last tab you close before bed."
  },
  {
    headline: "One good post away from greatness.",
    subheader: "And three bad ones from a ban."
  },
  {
    headline: "Sell your SOL, buy DGT 😈",
    subheader: "Discover, Discuss, Degen."
  }
];

export function HeroSection() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cod-gray-950 via-cod-gray-900 to-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-shift" />

      {/* Background image with enhanced overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url("/images/19FA32BC-BF64-4CE2-990E-BDB147C2A159.png")'
        }}
      />

      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMzBoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0ek0zMCAzNGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMlY2aDJ2NHptMCAzMGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6TTI0IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0yVjZoMnY0em0wIDMwaC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiIC8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
      </div>

      {/* Subtle background effects only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated headline */}
          <div className="h-[120px] md:h-[140px] lg:h-[168px] flex items-center justify-center mb-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.1)'
                }}
              >
                {quotes[currentQuoteIndex].headline}
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
              {quotes[currentQuoteIndex].subheader}
            </motion.p>
          </AnimatePresence>

          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                onClick={() => window.location.href = '/forum'}
              >
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-8 md:mt-12 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Link href="/forum">
              <motion.div
                className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors text-sm group"
                whileHover={{ x: 5 }}
              >
                <span>Browse our topics</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
