'use client';

import { motion } from 'framer-motion';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useRoughRefresh } from '@/components/hooks/useRoughRefresh';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';
import { useIntersectionAnimation } from '@/components/hooks/useIntersectionAnimation';

// Only the interactive parts that require client-side JS
export function AboutInteractive() {
  const router = useRouter();
  const roughShow = useRoughRefresh();
  const prefersReducedMotion = useReducedMotion();
  const { ref: founderRef, isInView: founderVisible } = useIntersectionAnimation();
  const { ref: featuresRef, isInView: featuresVisible } = useIntersectionAnimation();

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      {/* Back Button - Interactive */}
      <motion.button
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        whileHover={!prefersReducedMotion ? { x: -4 } : {}}
        whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Degentalk</span>
      </motion.button>

      {/* Interactive Founders Section with Rough Notation */}
      <section className="mb-16" ref={founderRef}>
        <h2 className="text-3xl font-bold mb-8 text-white">The Founders</h2>
        
        <RoughNotationGroup show={roughShow && founderVisible}>
          <div className="space-y-12">
            {/* Goombas Card */}
            <motion.div 
              className="relative bg-zinc-900 rounded-3xl p-8 border border-zinc-800 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={founderVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute -top-4 left-4 sm:left-12 w-16 sm:w-24 h-8 bg-yellow-100/80 rotate-[-4deg] shadow-sm" />
              <div className="absolute -top-4 right-4 sm:right-12 w-16 sm:w-24 h-8 bg-yellow-100/80 rotate-[3deg] shadow-sm" />
              
              <h3 className="text-2xl font-bold mb-4 text-white">
                <RoughNotation type="underline" color="#10b981" strokeWidth={2} padding={2} multiline>
                  Goombas
                </RoughNotation>
              </h3>
              <p className="text-lg text-zinc-400 mb-2">Co-Founder & Strategic Chaos Officer</p>
              <p className="text-zinc-300 leading-relaxed">
                Master of <RoughNotation type="highlight" color="#10b98133" padding={3} multiline>calculated disorder</RoughNotation>, 
                Goombas brings years of experience in crypto markets and community building.
              </p>
            </motion.div>

            {/* Gnarcotic Card */}
            <motion.div 
              className="relative bg-zinc-900 rounded-3xl p-8 border border-zinc-800 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={founderVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute -top-4 left-4 sm:left-12 w-16 sm:w-24 h-8 bg-cyan-100/80 rotate-[2deg] shadow-sm" />
              
              <h3 className="text-2xl font-bold mb-4 text-white">
                <RoughNotation type="circle" color="#06b6d4" strokeWidth={2} padding={8} multiline>
                  Gnarcotic
                </RoughNotation>
              </h3>
              <p className="text-lg text-zinc-400 mb-2">Co-Founder & Chief Technical Alchemist</p>
              <p className="text-zinc-300 leading-relaxed">
                Transforming <RoughNotation type="box" color="#06b6d4" strokeWidth={1} padding={3} multiline>degen dreams into digital reality</RoughNotation>, 
                one line of code at a time.
              </p>
            </motion.div>
          </div>
        </RoughNotationGroup>
      </section>

      {/* Features Preview with Animations */}
      <section className="mb-16" ref={featuresRef}>
        <h2 className="text-3xl font-bold mb-8 text-white">What Makes Us Different</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: '🎰 Gamified Everything', desc: 'XP, levels, and rewards that actually matter' },
            { title: '💎 $DGT Economy', desc: 'Our native token powers the entire ecosystem' },
            { title: '🚀 Lightning Fast', desc: 'Built for degens who move at market speed' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-emerald-500/50 transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={featuresVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={!prefersReducedMotion ? { y: -4 } : {}}
            >
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-zinc-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <p className="text-2xl font-bold mb-6 text-white">
          Ready to join the 
          <RoughNotation type="highlight" color="#10b98144" show={roughShow} padding={4} multiline>
            {' '}chaos{' '}
          </RoughNotation>
          ?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-full hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-shadow"
          >
            Join Degentalk
          </Link>
          <Link
            href="/forums"
            className="inline-flex items-center justify-center px-8 py-3 border border-zinc-700 text-white font-medium rounded-full hover:bg-zinc-800 transition-colors"
          >
            Explore Forums
          </Link>
        </div>
      </motion.section>
    </div>
  );
}