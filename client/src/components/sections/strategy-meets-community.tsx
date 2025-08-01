import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { SectionBackground } from '@/components/ViewportBackground';

export function StrategyMeetsCommunity() {
  return (
    <SectionBackground variant="gradient" intensity={0.1} className="py-16 sm:py-20 md:py-24">
      <section className="relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
          
          {/* Section Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, -5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Megaphone className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Where Strategy Meets Community
              </h2>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-zinc-800/30 backdrop-blur-sm rounded-2xl border border-zinc-700/50 p-8 sm:p-10 md:p-12">
              {/* Glowing accent */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-transparent to-purple-500/10 opacity-50" />
              
              <p className="relative text-lg sm:text-xl md:text-2xl text-zinc-100 leading-relaxed font-medium text-center">
                Degentalk is the satirical casino floor of the internet—a high-octane 
                forum-meets-terminal for degens, traders, gamblers, and contrarians who 
                thrive on volatility and calculated chaos.
              </p>
              
              <motion.div 
                className="relative mt-8 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-emerald-400 text-2xl font-light">—</span>
                  <p className="text-base sm:text-lg md:text-xl text-emerald-400 font-bold italic">
                    "This isn't just a forum. This is the most addictive, gloriously unhinged 
                    hub the Web3 world has ever seen."
                  </p>
                  <span className="text-emerald-400 text-2xl font-light">—</span>
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-4 right-4 w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </motion.div>

          {/* Additional Features Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {[
              { emoji: "🎰", text: "Satirical Casino Floor" },
              { emoji: "📈", text: "High-Octane Trading" },
              { emoji: "🎭", text: "Calculated Chaos" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-2">{item.emoji}</div>
                <p className="text-zinc-300 font-semibold">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </SectionBackground>
  );
}