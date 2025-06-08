import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Sparkles, 
  Coins, 
  TrendingUp,
  Zap
} from 'lucide-react';

interface ShopCardProps {
  className?: string;
  featuredItem?: {
    name: string;
    price: number;
    image?: string;
  };
}

/**
 * ShopCard - CTA card for the Degen Shop
 * Matches ForumZoneCard styling but acts as a static promotional card
 */
export function ShopCard({ className = '', featuredItem }: ShopCardProps) {
  const shopUrl = '/shop';
  
  return (
    <Link href={shopUrl}>
      <motion.div 
        className={`
          relative
          min-h-[200px] 
          p-6 
          rounded-xl 
          border-2
          bg-gradient-to-br from-emerald-900/20 to-cyan-900/10
          border-emerald-500/30
          backdrop-blur-sm
          overflow-hidden
          transition-all duration-300
          cursor-pointer group hover:shadow-xl
          ${className}
        `}
        whileHover={{ 
          scale: 1.02,
          y: -5,
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.6'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative z-10 h-full flex flex-col">
          {/* Header with icon and title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 p-3 rounded-lg bg-black/20 border border-zinc-700/50">
              <ShoppingCart className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-1 transition-colors group-hover:text-emerald-400">
                Degen Shop
              </h3>
              <div className="text-xs font-medium text-emerald-300 opacity-75">
                Spend DGT, Look Cool
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-zinc-400 mb-6 line-clamp-3 flex-grow">
            Upgrade your profile with exclusive frames, titles, badges, and boosts.
          </p>
          
          {/* Featured item or general stats */}
          {featuredItem ? (
            <div className="bg-black/20 rounded-lg p-3 mb-4 border border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Featured Item</p>
                  <p className="text-sm font-medium text-zinc-200">{featuredItem.name}</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Coins className="w-4 h-4" />
                  <span className="font-bold">{featuredItem.price}</span>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* CTA Stats */}
          <div className="flex items-center gap-6 text-xs text-zinc-500 mt-auto">
            <motion.div 
              className="flex items-center gap-1.5"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Cosmetics</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-4 h-4" />
              <span className="font-medium">Boosts</span>
            </motion.div>
          </div>
        </div>
        
        {/* Hover glow effect */}
        <motion.div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)`
          }}
        />
      </motion.div>
    </Link>
  );
}

export default ShopCard; 