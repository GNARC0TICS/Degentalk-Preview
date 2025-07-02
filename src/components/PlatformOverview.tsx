import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Coins, 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  TrendingUp, 
  Globe 
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Satirical Forums',
    description: 'Crypto discussions with legendary wit and questionable financial advice.'
  },
  {
    icon: Coins,
    title: 'DGT Token Economy',
    description: 'Earn and spend DGT tokens for premium features, tips, and digital goods.'
  },
  {
    icon: Trophy,
    title: 'XP & Leveling',
    description: 'Gamified progression system with achievements, levels, and bragging rights.'
  },
  {
    icon: Users,
    title: 'Global Community',
    description: 'Connect with crypto degens, traders, and philosophers worldwide.'
  },
  {
    icon: Zap,
    title: 'Real-time Features',
    description: 'Live shoutbox, instant notifications, and lightning-fast interactions.'
  },
  {
    icon: Shield,
    title: 'Secure Wallets',
    description: 'Integrated crypto wallets with multi-token support and secure transactions.'
  },
  {
    icon: TrendingUp,
    title: 'Market Intelligence',
    description: 'Alpha insights, market discussions, and crowd-sourced analysis.'
  },
  {
    icon: Globe,
    title: 'Digital Marketplace',
    description: 'Shop for exclusive digital goods, avatar frames, and community perks.'
  }
];

export function PlatformOverview() {
  return (
    <section 
      id="platform-overview" 
      className="py-20 bg-gradient-to-b from-black to-zinc-900"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            More Than Just Another{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Crypto Forum
            </span>
          </h2>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Degentalk combines the chaos of crypto culture with sophisticated community features, 
            creating a platform where financial degeneracy meets intellectual discourse.
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
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">
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
          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl p-8 border border-emerald-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Built by Degens, for Degens
            </h3>
            <p className="text-zinc-300 text-lg leading-relaxed max-w-4xl mx-auto">
              We're creating the most entertaining, feature-rich crypto community platform 
              on the internet. Where serious trading meets satirical commentary, and where 
              every loss is a learning experience worth sharing.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}