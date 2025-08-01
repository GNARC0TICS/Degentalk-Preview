import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SectionBackground } from '@/components/ViewportBackground';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RoughNotation, RoughNotationGroup } from 'react-rough-notation';

export function About() {
  const [show, setShow] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fallback timer in case intersection observer doesn't trigger
    const fallbackTimer = setTimeout(() => {
      setShow(true);
    }, 2000);

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
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
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
    <SectionBackground variant="gradient" intensity={0.1} className="min-h-screen py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Back to Home */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            to="/"
            className="inline-flex items-center text-zinc-400 hover:text-zinc-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-mono text-sm">back</span>
          </Link>
        </motion.div>

        {/* Letter Container - Off-white paper with tape */}
        <motion.div
          className="relative bg-[#f8f6f3] rounded-sm shadow-2xl overflow-visible force-animation"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Tape strips */}
          <div className="absolute -top-4 left-12 w-24 h-8 bg-yellow-100/80 rotate-[-4deg] shadow-sm" 
               style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
          <div className="absolute -top-4 right-12 w-24 h-8 bg-yellow-100/80 rotate-[3deg] shadow-sm" 
               style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
          
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
              className="space-y-8 text-gray-700 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
            <div className="force-animation">
            <RoughNotationGroup show={show}>
              {/* This Ain't a Platform */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  <RoughNotation type="box" color="#1e40af" padding={8} animationDelay={100} animationDuration={600}>
                    This Ain't a Platform. It's a Symptom.
                  </RoughNotation>
                </h2>
                <p className="mb-4">
                  Degentalk isn't your next web3 startup. It's not a DAO pretending to be decentralized. It's not another Discord where alpha goes to die.
                </p>
                <p className="mb-4 font-semibold">
                  It's what happens when the internet's most unhinged financial minds demand a home.
                </p>
                <p className="mb-4">
                  We built this because every other platform got neutered. Sanitized interfaces. Soft mods. "Community guidelines." Years of watching brilliant degenerates get buried under waves of "gm" posts and pinned whitepapers no one reads.
                </p>
                <p className="mb-4">
                  I've been in the trenches — sketchy Telegrams groups like "1xLongKidneyCalls", backchannels where real alpha leaks at 3am, forums where one wrong take gets you socially liquidated before the market even opens.
                </p>
                <p className="font-bold text-gray-900">
                  So we said f*** it. Let's build the last stop to the moon.
                </p>
              </div>

              {/* What Degentalk Actually Is */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Degentalk Actually Is</h2>
                <p className="mb-4 font-semibold">
                  <RoughNotation type="highlight" color="#fef3c7" animationDelay={700} animationDuration={400}>
                    A gamified combat zone where shitposting is a career path.
                  </RoughNotation>
                </p>
                <ul className="space-y-2 mb-4 list-disc list-inside pl-4">
                  <li><RoughNotation type="highlight" color="#fef3c7" animationDelay={900} animationDuration={300}>Your XP is your credibility</RoughNotation></li>
                  <li><RoughNotation type="highlight" color="#fef3c7" animationDelay={1100} animationDuration={300}>Your post history is your portfolio</RoughNotation></li>
                  <li><RoughNotation type="highlight" color="#fef3c7" animationDelay={1300} animationDuration={300}>Your reputation score is your net worth</RoughNotation></li>
                  <li><RoughNotation type="highlight" color="#fef3c7" animationDelay={1500} animationDuration={300}>Your last hot take is your résumé</RoughNotation></li>
                </ul>
                <p>
                  This isn't "community building." This is <RoughNotation type="underline" color="#1e40af" animationDelay={1700} animationDuration={400}>organized degeneracy</RoughNotation> — structured just enough to evolve, raw enough to matter.
                </p>
              </div>

              {/* Why Everything Else Failed */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Everything Else Failed</h2>
                <div className="space-y-2 mb-4">
                  <p><span className="font-semibold">Bitcointalk →</span> A museum that somehow still outperforms your favorite DeFi protocol</p>
                  <p><span className="font-semibold">Telegram →</span> Scam roulette where admins vanish faster than liquidity</p>
                  <p><span className="font-semibold">Discord →</span> Channel spam simulator where alpha gets lost between NFT memes</p>
                  <p><span className="font-semibold">Reddit →</span> Mod jail with karma cops</p>
                  <p><span className="font-semibold">Twitter →</span> Engagement farming w/ character limits.</p>
                </div>
                <p className="font-semibold text-gray-900">
                  Crypto didn't need another chat. It needed a proving ground.
                </p>
              </div>

              {/* The Unwritten Rules */}
              <div>
                <div className="inline-block mb-6 relative">
                  <div className="absolute inset-0 bg-gray-200 rotate-[-1deg] rounded"></div>
                  <h2 className="relative text-2xl font-bold text-gray-900 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded">
                    The Unwritten Rules (Now Written)
                  </h2>
                </div>
                <ol className="space-y-2 list-decimal list-inside pl-4">
                  <li><span className="font-semibold"><RoughNotation type="underline" color="#dc2626" animationDelay={1900} animationDuration={400}>Reputation {'>'} Everything.</RoughNotation></span> Your wallet can lie. Your post history can't.</li>
                  <li><span className="font-semibold">Quality shitposting is an art form.</span> Master it or stay lurking.</li>
                  <li><span className="font-semibold">Say <RoughNotation type="underline" color="#dc2626" animationDelay={2100} animationDuration={400}>"gm" = instaban</RoughNotation>.</span> This ain't your wellness retreat.</li>
                  <li><span className="font-semibold">Alpha leaks through cracks.</span> Stay alert or stay poor.</li>
                  <li><span className="font-semibold">Be funny or be right.</span> Preferably both. Never neither.</li>
                  <li><span className="font-semibold">No seed phrases. No VC worship. No LARPing as Satoshi.</span></li>
                  <li><span className="font-semibold">Everyone's down bad.</span> Winners just hide it better.</li>
                </ol>
              </div>

              {/* Who Belongs Here */}
              <div>
                <div className="inline-block mb-6 relative">
                  <div className="absolute inset-0 bg-gray-200 rotate-[1deg] rounded"></div>
                  <h2 className="relative text-2xl font-bold text-gray-900 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded">
                    Who Belongs Here
                  </h2>
                </div>
                <div className="space-y-1 mb-4">
                  <p><span className="font-semibold">The Gamblers</span> who calculate odds better than tokenomics</p>
                  <p><span className="font-semibold">The Traders</span> permanently fused to the 15-minute chart</p>
                  <p><span className="font-semibold">The Forum Rats</span> who remember when rep counts meant respect</p>
                  <p><span className="font-semibold">The CT Refugees</span> tired of threading for clout</p>
                  <p><span className="font-semibold">The Survivors</span> still here after every rug, bust, or "temporary pause"</p>
                </div>
                <p>
                  You don't need a whitelist. You don't need connections. You just need conviction and a healthy dose of market PTSD.
                </p>
              </div>

              {/* The Roadmap */}
              <div>
                <div className="inline-block mb-6 relative">
                  <div className="absolute inset-0 bg-gray-200 rotate-[-0.5deg] rounded"></div>
                  <h2 className="relative text-2xl font-bold text-gray-900 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded">
                    The Roadmap (If We Don't Get Rugged First)
                  </h2>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">NOW</h3>
                  <ul className="space-y-1 list-disc list-inside pl-4">
                    <li>XP-driven progression system</li>
                    <li>Reputation-gated forums</li>
                    <li>Tipping economy that actually works</li>
                    <li>Cosmetics that flex harder than your PFP</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">SOON™</h3>
                  <ul className="space-y-1 list-disc list-inside pl-4">
                    <li>Class System: Gambler / Whale / Prophet / Influencer / Reformed Beggar</li>
                    <li>Flex Cases: Signature art, custom flairs, rain multipliers</li>
                    <li>Events: Jackpot threads, XP decay, leaderboard seasons</li>
                    <li>Mutations: Forums that evolve based on unhinged degeneracy levels</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">EVENTUALLY</h3>
                  <ul className="space-y-1 list-disc list-inside pl-4">
                    <li>A DAO so cursed it might actually work</li>
                    <li>On-chain reputation (if we survive that long)</li>
                    <li>Whatever chaos the community manifests next</li>
                  </ul>
                </div>
              </div>

              {/* Final Transmission */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Final Transmission</h2>
                <p className="mb-4">
                  We didn't launch to moon. <RoughNotation type="underline" color="#dc2626" animationDelay={2300} animationDuration={400}>We launched to last</RoughNotation>.
                </p>
                <p className="mb-4">
                  To be the forum people screenshot at 4am. The place where your not alone — Even after making some questionable financial decisions. The arena where being right matters less than being memorable.
                </p>
                <p className="mb-4">
                  Degentalk isn't perfect. But it's honest.
                </p>
                <p className="mb-4">
                  And in a space full of exit scams masquerading as ecosystems, that's rarer than profit.
                </p>
                <p className="font-bold text-gray-900">
                  Welcome to <RoughNotation type="box" color="#1e40af" padding={6} animationDelay={2500} animationDuration={600}>the last real forum on the internet</RoughNotation>.
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