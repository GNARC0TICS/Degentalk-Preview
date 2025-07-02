import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MessagesSquare, 
  Bitcoin, 
  BarChart3, 
  ShoppingBag, 
  CloudDrizzle, 
  Crown, 
  TrendingUp, 
  Palette 
} from 'lucide-react';

const features = [
  {
    icon: MessagesSquare,
    title: 'Live Shoutbox',
    description: 'Real-time chaos where financial advice meets existential dread. Watch portfolios die in real-time!'
  },
  {
    icon: Bitcoin,
    title: 'DGT Token Economy',
    description: 'Tip your fellow degens, make it rain tokens, or lose it all trying. At least the blockchain remembers.'
  },
  {
    icon: ShoppingBag,
    title: 'Degenshop',
    description: 'Buy digital swag to flex your losses in style. Avatar frames, titles, and colors for peak cope.'
  },
  {
    icon: BarChart3,
    title: 'XP & Achievements',
    description: 'Level up through pain! Earn badges for creative losses and unlock titles that hurt just right.'
  },
  {
    icon: CloudDrizzle,
    title: 'Rain Events',
    description: 'When someone makes profit, they share the wealth. It\'s like charity, but with more leverage.'
  },
  {
    icon: Crown,
    title: 'Community Roles',
    description: 'Climb the ranks from "Hopeful Ape" to "Certified Degen." Each role unlocks new ways to lose money.'
  },
  {
    icon: Palette,
    title: 'Cosmetic Customization',
    description: 'Personalize your profile while your portfolio bleeds. Username colors, frames, and effects that pop!'
  },
  {
    icon: TrendingUp,
    title: 'Alpha Sharing',
    description: 'Share your hottest takes and watch others fade them. Sometimes wrong, never uncertain.'
  }
];

// Satirical taglines for the section header (randomized per visit)
const taglines = [
  'Where Paper Hands Come to Build Character',
  'Because "HODL" Deserved Its Own Website',
  'Home of Unsolicited Alpha and Inevitable Cope',
  'Chart Patterns, Memes, and Existential Regret',
  'Financial Advice You Definitely Shouldn\'t Take',
  'Bullish Opinions, Bearish Portfolios',
  'Welcome to the Group Chat Your Broker Warned You About',
  'Buy High, Sell Cope—Join the Conversation',
  'Liquidity Optional, Opinions Mandatory',
  'If It\'s on the Blockchain, It Must Be True'
];

export function PlatformOverview() {
  // Pick one tagline once per mount
  const randomTagline = useMemo(() => {
    return taglines[Math.floor(Math.random() * taglines.length)];
  }, []);
  return (
    <section 
      id="platform-overview" 
      className="py-20 relative overflow-hidden"
    >
      {/* Multi-layered background with subtle red accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900" />
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/3 via-transparent to-orange-500/2" />
      
      {/* Subtle glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-orange-500/3 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            {randomTagline}
          </h2>
          <p className="text-lg md:text-xl text-zinc-200 max-w-3xl mx-auto leading-relaxed font-medium">
            The only platform sophisticated enough to gamify your financial mistakes while making you look good doing it.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-zinc-800/50 backdrop-blur-sm rounded-lg p-6 border border-zinc-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:bg-zinc-700/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center mr-3 border border-zinc-600">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{feature.title}</h3>
              </div>
              <p className="text-zinc-200 text-sm leading-relaxed font-medium">
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
          <div className="bg-zinc-800/30 rounded-2xl p-8 border border-zinc-700">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              Where Strategy Meets Community
            </h3>
            <p className="text-zinc-200 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto font-medium">
              Where technical analysis meets emotional damage, and every trade tells a story. 
              Join thousands of traders turning market insights into community wisdom, one conversation at a time.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}