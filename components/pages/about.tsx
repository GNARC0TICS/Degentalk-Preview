'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { SectionBackground } from '@/components/ViewportBackground';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';
import { useIntersectionAnimation } from '@/components/hooks/useIntersectionAnimation';
import { useReducedMotion } from '@/components/hooks/useReducedMotion';

// Memoize tape strips to prevent re-renders
const TapeStrips = memo(function TapeStrips() {
  return (
    <>
      <div className="absolute -top-4 left-12 w-24 h-8 bg-yellow-100/80 rotate-[-4deg] shadow-sm" 
           style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
      <div className="absolute -top-4 right-12 w-24 h-8 bg-yellow-100/80 rotate-[3deg] shadow-sm" 
           style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
    </>
  );
});

export function About() {
  const [show, setShow] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Fallback timer in case intersection observer doesn't trigger
    const fallbackTimer = setTimeout(() => {
      setShow(true);
    }, 3500);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            clearTimeout(fallbackTimer);
            setShow(true);
            observer.disconnect();
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '0px 0px -200px 0px'
      }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, []);

  return (
    <SectionBackground variant="gradient" intensity={0.1} className="min-h-screen py-20 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Back to Home */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            href="/"
            className="inline-flex items-center text-zinc-400 hover:text-zinc-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-mono text-sm">back</span>
          </Link>
        </motion.div>

        {/* Letter Container - Off-white paper with tape */}
        <motion.div
          className="relative paper-bg rounded-sm shadow-2xl overflow-visible force-animation"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            willChange: 'transform, opacity'
          }}
        >
          {/* Tape strips */}
          <TapeStrips />
          
          <div className="relative p-8 sm:p-12 md:p-16">
            {/* Header */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl sm:text-5xl font-serif text-gray-900 mb-2">
                About Degentalk
              </h1>
              <p className="text-gray-600 text-lg">
                A note from Goombas, Co-Founder & Strategic Chaos Officer
              </p>
            </motion.div>

            {/* The Letter */}
            <motion.div
              ref={contentRef}
              className="space-y-16 text-gray-700 leading-loose text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
            <div className="force-animation">
            <RoughNotationGroup show={show}>
              {/* This Ain't a Platform */}
              <div>
                <h2 className="text-3xl font-display uppercase tracking-wide text-emerald-950 mb-6">
                  <RoughNotation type="box" color="#10b981" padding={8} animationDelay={800} animationDuration={800}>
                    This Ain't a Platform. It's a Symptom.
                  </RoughNotation>
                </h2>
                <p className="mb-4 text-zinc-700">
                  Degentalk isn't your next web3 startup. It's not a DAO pretending to be decentralized. It's not another Discord where alpha goes to die.
                </p>
                <p className="mb-4 font-semibold text-zinc-900 text-xl">
                  It's what happens when <RoughNotation type="highlight" multiline color="#facc15" animationDelay={1400} animationDuration={600}>the internet's most unhinged financial minds</RoughNotation> demand a home.
                </p>
                <p className="mb-4">
                  We built this because every other platform got neutered. Sanitized interfaces. Soft mods. "Community guidelines." Years of watching brilliant degenerates get buried under waves of "gm" posts and pinned whitepapers no one reads.
                </p>
                <p className="mb-4">
                  I've been in the trenches — sketchy Telegrams groups like "1xLongKidneyCalls", backchannels where <RoughNotation type="highlight" multiline color="#facc15" animationDelay={2000} animationDuration={500}>real alpha leaks at 3am</RoughNotation>, forums where one wrong take gets you socially liquidated before the market even opens.
                </p>
                <p className="italic text-gray-900">
                  So we said f*** it. Let's build the last stop before the moon.
                </p>
              </div>

              {/* Add extra spacing before this section */}
              <div className="h-6 sm:h-8"></div>

              {/* What Degentalk Actually Is */}
              <div>
                <h2 className="text-3xl font-display uppercase tracking-wide text-emerald-950 mb-6">What Degentalk Actually Is</h2>
                <p className="mb-4 font-semibold">
                  <RoughNotation type="highlight" multiline color="#facc15" animationDelay={2800} animationDuration={600}>
                    A gamified combat zone where shitposting is a career path.
                  </RoughNotation>
                </p>
                <ul className="space-y-3 mb-6 list-disc list-inside pl-4 text-gray-800">
                  <li><RoughNotation type="highlight" multiline color="#facc15" animationDelay={3400} animationDuration={500}>Your XP is your credibility</RoughNotation></li>
                  <li><RoughNotation type="highlight" multiline color="#facc15" animationDelay={3900} animationDuration={500}>Your post history is your portfolio</RoughNotation></li>
                  <li><RoughNotation type="highlight" multiline color="#facc15" animationDelay={4400} animationDuration={500}>Your reputation score is your net worth</RoughNotation></li>
                  <li><RoughNotation type="highlight" multiline color="#facc15" animationDelay={4900} animationDuration={500}>Your last hot take is your résumé</RoughNotation></li>
                </ul>
                <p>
                  This isn't "community building." This is <RoughNotation type="underline" color="#1e40af" animationDelay={5400} animationDuration={600}>organized degeneracy</RoughNotation> — structured just enough to evolve, raw enough to matter.
                </p>
              </div>

              {/* Add extra spacing before this section */}
              <div className="h-6 sm:h-8"></div>

              {/* Why Everything Else Failed */}
              <div>
                <h2 className="text-3xl font-display uppercase tracking-wide text-emerald-950 mb-6">Why Everything Else Failed</h2>
                <div className="space-y-3 mb-6 bg-zinc-50 p-6 rounded-lg border border-zinc-200">
                  <p><span className="font-semibold"><RoughNotation type="crossed-off" color="#dc2626" animationDelay={6200} animationDuration={600}>Bitcointalk</RoughNotation> →</span> A museum that somehow still outperforms your favorite DeFi protocol</p>
                  <p><span className="font-semibold"><RoughNotation type="crossed-off" color="#dc2626" animationDelay={6700} animationDuration={600}>Telegram</RoughNotation> →</span> Scam roulette where admins vanish faster than liquidity</p>
                  <p><span className="font-semibold"><RoughNotation type="crossed-off" color="#dc2626" animationDelay={7200} animationDuration={600}>Discord</RoughNotation> →</span> Channel spam simulator where alpha gets lost between NFT memes</p>
                  <p><span className="font-semibold"><RoughNotation type="crossed-off" color="#dc2626" animationDelay={7700} animationDuration={600}>Reddit</RoughNotation> →</span> Mod jail with karma cops</p>
                  <p><span className="font-semibold"><RoughNotation type="crossed-off" color="#dc2626" animationDelay={8200} animationDuration={600}>Twitter</RoughNotation> →</span> Engagement farming w/ character limits.</p>
                </div>
                <p className="font-semibold text-emerald-950 text-xl">
                  Crypto didn't need another chat. It needed <RoughNotation type="highlight" multiline color="#facc15" animationDelay={8700} animationDuration={600}>a proving ground</RoughNotation>.
                </p>
              </div>


              <div className="h-8 sm:h-10"></div>

              {/* The Unwritten Rules */}
              <div>
                <h2 className="text-3xl font-display uppercase tracking-wide text-emerald-950 mb-6">
                  The Unwritten Rules <RoughNotation type="bracket" brackets={['left','right']} color="#dc2626" strokeWidth={2} padding={3}>Now&nbsp;Written</RoughNotation>
                </h2>
                <ol className="space-y-4 list-decimal list-inside pl-4 bg-zinc-50 p-6 rounded-lg border border-zinc-200">
                  <li><span className="font-semibold"><RoughNotation type="underline" color="#10b981" animationDelay={9500} animationDuration={600}>Reputation {'>'} Everything.</RoughNotation></span> <RoughNotation type="highlight" multiline color="#facc15" animationDelay={10100} animationDuration={500}>Your wallet can lie. Your post history can't.</RoughNotation></li>
                  <li><span className="font-semibold">Quality shitposting is an art form.</span> Master it or stay lurking.</li>
                  <li><span className="font-semibold">Say <RoughNotation type="underline" color="#dc2626" animationDelay={10600} animationDuration={600}>"gm" = instaban</RoughNotation>.</span> This ain't your wellness retreat.</li>
                  <li><span className="font-semibold">Alpha leaks through cracks.</span> <RoughNotation type="highlight" multiline color="#facc15" animationDelay={11200} animationDuration={500}>Stay alert or stay poor.</RoughNotation></li>
                  <li><span className="font-semibold">Be funny or be right.</span> <RoughNotation type="highlight" multiline color="#facc15" animationDelay={11700} animationDuration={500}>Preferably both. Never neither.</RoughNotation></li>
                  <li><span className="font-semibold">No seed phrases. No VC worship. No LARPing as Satoshi.</span></li>
                  <li><span className="font-semibold">Everyone's down bad.</span> Winners just hide it better.</li>
                </ol>
              </div>

              {/* Add extra spacing before this section */}
              <div className="h-6 sm:h-8"></div>

              {/* Who Belongs Here */}
              <div>
                <h2 className="text-3xl font-display uppercase tracking-wide text-emerald-950 mb-6">
                  Who Belongs Here
                </h2>
                <div className="space-y-3 mb-6">
                  <p><span className="font-semibold"><RoughNotation type="underline" color="#10b981" animationDelay={12500} animationDuration={500}>The Gamblers</RoughNotation></span> who calculate odds better than tokenomics</p>
                  <p><span className="font-semibold"><RoughNotation type="underline" color="#10b981" animationDelay={13000} animationDuration={500}>The Traders</RoughNotation></span> permanently fused to the 15-minute chart</p>
                  <p><span className="font-semibold"><RoughNotation type="underline" color="#10b981" animationDelay={13500} animationDuration={500}>The Forum Rats</RoughNotation></span> who remember when rep counts meant respect</p>
                  <p><span className="font-semibold"><RoughNotation type="underline" color="#10b981" animationDelay={14000} animationDuration={500}>The CT Refugees</RoughNotation></span> tired of threading for clout</p>
                  <p><span className="font-semibold"><RoughNotation type="underline" color="#10b981" animationDelay={14500} animationDuration={500}>The Survivors</RoughNotation></span> still here after every rug, bust, or "temporary pause"</p>
                </div>
                <p>
                  You don't need a whitelist. You don't need connections. You just need conviction and a healthy dose of market PTSD.
                </p>
              </div>

              {/* Add extra spacing before this section */}
              <div className="h-6 sm:h-8"></div>

              {/* The Roadmap */}
              <div>
                <h2 className="text-3xl font-display uppercase tracking-wide text-emerald-950 mb-6">
                  The Roadmap <RoughNotation type="bracket" brackets={['left','right']} color="#dc2626" strokeWidth={2} padding={3}>If We Don&apos;t Get Rugged First</RoughNotation>
                </h2>
                
                <div className="space-y-8">
                  <div className="bg-yellow-100 p-6 rounded-sm shadow-md relative transform rotate-1 will-change-transform" style={{ boxShadow: '4px 4px 10px rgba(0,0,0,0.1)' }}>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Now</h3>
                    <ul className="space-y-2 list-disc list-inside pl-4 text-gray-700">
                      <li><RoughNotation type="underline" color="#dc2626">XP-driven progression system</RoughNotation></li>
                      <li><RoughNotation type="underline" color="#dc2626">Reputation-gated forums</RoughNotation></li>
                      <li><RoughNotation type="underline" color="#dc2626">Tipping economy that actually works</RoughNotation></li>
                      <li><RoughNotation type="underline" color="#dc2626">Cosmetics that flex harder than your PFP</RoughNotation></li>
                    </ul>
                  </div>

                  <div className="bg-pink-100 p-6 rounded-sm shadow-md relative transform -rotate-1 will-change-transform" style={{ boxShadow: '4px 4px 10px rgba(0,0,0,0.1)' }}>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Soon™</h3>
                    <ul className="space-y-2 list-disc list-inside pl-4 text-gray-700">
                      <li>Class System: Gambler / Whale / Prophet / Influencer / Reformed Beggar</li>
                      <li>Flex Cases: Signature art, custom flairs, rain multipliers</li>
                      <li>Events: Jackpot threads, XP decay, leaderboard seasons</li>
                      <li>Mutations: Forums that evolve based on unhinged degeneracy levels</li>
                    </ul>
                  </div>

                  <div className="bg-blue-100 p-6 rounded-sm shadow-md relative transform rotate-2 will-change-transform" style={{ boxShadow: '4px 4px 10px rgba(0,0,0,0.1)' }}>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Eventually</h3>
                    <ul className="space-y-2 list-disc list-inside pl-4 text-gray-700">
                      <li>A DAO so cursed it might actually work</li>
                      <li>On-chain reputation <RoughNotation type="circle" color="#dc2626" animationDelay={15000} animationDuration={600}>if we survive that long</RoughNotation></li>
                      <li>Whatever chaos the community manifests next</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Add extra spacing before this section */}
              <div className="h-6 sm:h-8"></div>

              {/* Final Transmission */}
              <div>
                <h2 className="text-3xl font-display uppercase tracking-wide text-emerald-950 mb-6">Final Transmission</h2>
                <p className="mb-4">
                  We didn't launch to moon. <RoughNotation type="underline" color="#dc2626" animationDelay={15500} animationDuration={600}>We launched to last</RoughNotation>.
                </p>
                <p className="mb-4">
                  To be the forum people screenshot at 4am. The place where your not alone — Even after making some questionable financial decisions. The arena where being right matters less than being memorable.
                </p>
                {/* Pull Quote */}
                <div className="my-8 py-6 border-l-4 border-emerald-500 pl-6 bg-emerald-50/50">
                  <p className="text-xl font-semibold text-emerald-950 italic">
                    "Degentalk isn't perfect. But it's honest. And in a space full of exit scams masquerading as ecosystems, <RoughNotation type="highlight" multiline color="#facc15" animationDelay={16000} animationDuration={600}>that's rarer than profit</RoughNotation>."
                  </p>
                </div>
                <p className="font-bold text-gray-900">
                  Welcome to <RoughNotation type="box" color="#1e40af" padding={0} animationDelay={16500} animationDuration={800}>the last real forum on the internet</RoughNotation>.
                </p>
              </div>
            </RoughNotationGroup>
            </div>
            </motion.div>

            {/* Signature Section */}
            <motion.div
              className="mt-16 pt-8 border-t border-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div>
                <p className="text-xl font-bold text-gray-900">— Goombas</p>
                <p className="text-gray-600">Co-Founder & Chief Degen</p>
                <p className="text-gray-600">Strategic Ops Overlord</p>
                <p className="text-gray-600">Recovering Shitcoin Philosopher</p>
                <p className="text-gray-600 italic">Still Up 3% Lifetime (Before Tax)</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </SectionBackground>
  );
}