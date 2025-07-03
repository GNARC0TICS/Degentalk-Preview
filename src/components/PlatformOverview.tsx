import { useMemo, useState, useEffect } from 'react';
import { SectionBackground } from '@/components/ViewportBackground';
import { motion } from 'framer-motion';
import { 
  MessagesSquare, 
  Bitcoin, 
  BarChart3, 
  ShoppingBag, 
  CloudDrizzle, 
  Crown, 
  TrendingUp, 
  Palette,
  Megaphone
} from 'lucide-react';

const features = [
  {
    icon: MessagesSquare,
    title: 'Live Shoutbox',
    description: 'Real-time chaos with Live chat and tipping features!',
    hoverColor: 'group-hover:text-cyan-400'
  },
  {
    icon: Bitcoin,
    title: 'DGT Token Economy',
    description: 'Tip your fellow degens, make it rain tokens, or lose it all trying. At least the blockchain remembers.',
    hoverColor: 'group-hover:text-orange-400'
  },
  {
    icon: ShoppingBag,
    title: 'Degenshop',
    description: 'Buy digital cosmetics to wear your name in style. Avatar frames, titles, and colors for personalized flex.',
    hoverColor: 'group-hover:text-purple-400'
  },
  {
    icon: BarChart3,
    title: 'XP & Achievements',
    description: 'Level up through engagement! Earn badges, tokens and titles for creative posts and unlock flair that hurts just right.',
    hoverColor: 'group-hover:text-green-400'
  },
  {
    icon: CloudDrizzle,
    title: 'Rain Events',
    description: 'When someone makes profit, they share the wealth. It\'s like charity, but with more leverage.',
    hoverColor: 'group-hover:text-blue-400'
  },
  {
    icon: Crown,
    title: 'Community Roles',
    description: 'Climb the ranks from "Newcomer" to "Certified Degen." Each role unlocks new ways to engage with the community.',
    hoverColor: 'group-hover:text-yellow-400'
  },
  {
    icon: Palette,
    title: 'Cosmetic Customization',
    description: 'Personalize your profile while you mold your reputation within the community. Username colors, frames, and effects that pop!',
    hoverColor: 'group-hover:text-pink-400'
  },
  {
    icon: TrendingUp,
    title: 'Trending Discussions',
    description: 'Share your hottest takes and watch others fade them. Sometimes wrong, never uncertain.',
    hoverColor: 'group-hover:text-red-400'
  }
];

// Satirical taglines for the section header (randomized per visit)
const taglines = [
  'For Players Who Love To Bet On Everything',
  'Because "Down Bad" Deserved Its Own Website',
  'Home of Unsolicited Alpha and Inevitable Hope',
  'Chart Patterns, Memes, and Existential Regret',
  'A cultural safehouse for high-functioning degenerates',
  'Were the lovechild of /biz/, SomethingAwful and a Telegram alpha group.',
  'Financial Advice You Definitely Shouldn\'t Take',
  'Bullish Opinions, Bearish Portfolios, and the occasional meme',
  'Welcome to the Group Chat Your Therapist Warned You About',
  'Buy High, Sell Cope—Join the Conversation',
  'Liquidity Optional, Opinions Mandatory',
  'No, you can\'t buy a house with this',
  'This isn\'t for everyone. It\'s for us.',
  'Where Strategy Meets Community',
  'Where Technical Analysis Meets Emotional Damage',
  'Where Every Bet Tells a Story'
];

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  
  return count;
}

export function PlatformOverview() {
  // Pick one tagline once per mount
  const randomTagline = useMemo(() => {
    return taglines[Math.floor(Math.random() * taglines.length)];
  }, []);
  return (
    <SectionBackground variant="fade-down" intensity={0.6} className="py-16 sm:py-20 md:py-24">
      <section 
        id="platform-overview" 
        className="relative"
      >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight px-2">
            {randomTagline}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-semibold px-2">
            We decided to bring forums to the blockchain.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group bg-zinc-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-zinc-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:bg-zinc-700/50 hover:shadow-lg hover:shadow-emerald-500/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center mr-3 border border-zinc-600 group-hover:border-emerald-500/30 transition-colors duration-300">
                  <feature.icon className={`w-5 h-5 text-white ${feature.hoverColor} transition-colors duration-300`} />
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">{feature.title}</h3>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-zinc-800/30 rounded-2xl p-8 border border-zinc-700 hover:border-emerald-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Where Strategy Meets Community
              </h3>
              <Megaphone className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
            </div>
            <p className="text-zinc-300 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto font-semibold italic">
              "Degentalk is the satirical casino floor of the internet—a high-octane forum-meets-terminal for degens, traders, gamblers, and contrarians who thrive on volatility and calculated chaos.
This isn’t just a forum. This is the most addictive, gloriously unhinged hub the Web3 world has ever seen."

            </p>
          </div>
        </motion.div>

        {/* Social Proof Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <SocialProofCounters />
        </motion.div>

        {/* Visual Divider */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="absolute w-2 h-2 bg-emerald-400 rounded-full -mt-1 animate-pulse" />
        </motion.div>
        </div>
      </section>
    </SectionBackground>
  );
}

// Social Proof Counters Component
function SocialProofCounters() {
  const [inView, setInView] = useState(false);
  const degenCount = useAnimatedCounter(inView ? 2847 : 0, 2500);
  const lossCount = useAnimatedCounter(inView ? 1337 : 0, 2000);
  const hopeCount = useAnimatedCounter(inView ? 420 : 0, 1500);

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
    >
      <h3 className="text-lg md:text-xl font-bold text-white mb-8">
        Join <span className="text-emerald-400">{degenCount.toLocaleString()}</span> degens already losing money responsibly
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mb-2">
            ${lossCount.toLocaleString()}K
          </div>
          <p className="text-sm text-zinc-400">Lost with style</p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mb-2">
            {hopeCount}
          </div>
          <p className="text-sm text-zinc-400">Dreams crushed daily</p>
        </div>
        
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mb-2">
            24/7
          </div>
          <p className="text-sm text-zinc-400">Chaos & regret</p>
        </div>
      </div>
      
      <p className="text-xs text-zinc-500 mt-6 italic">
        *Results not typical. Your portfolio may vary. Side effects include FOMO and existential dread.
      </p>
    </motion.div>
  );
}