import React from 'react';
// Removed: import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Lock, Sparkles, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import FeatureGate from '@/components/ui/feature-gate';

interface ShopItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'dgt' | 'xp';
  imageSrc: string;
  category: string;
  featureId?: string;
  requiredLevel?: number;
  isPopular?: boolean;
  isNew?: boolean;
  onPurchase: (itemId: string) => void;
}

/**
 * ShopItem component
 * 
 * Displays a purchasable item in the shop, with XP/level requirements.
 * Uses FeatureGate to restrict purchase based on user level.
 */
const ShopItem: React.FC<ShopItemProps> = ({
  id,
  name,
  description,
  price,
  currency,
  imageSrc,
  category,
  featureId,
  requiredLevel = 1,
  isPopular = false,
  isNew = false,
  onPurchase,
}) => {
  const { user } = useAuth();
  const userLevel = user?.level || 0;
  const isLocked = userLevel < requiredLevel;
  
  // Currency display logic
  const CurrencyLabel = () => {
    return currency === 'dgt' ? (
      <span className="font-mono">DGT</span>
    ) : (
      <span className="font-mono">XP</span>
    );
  };
  
  // Calculate price color gradient based on value
  const getPriceColor = () => {
    if (currency === 'dgt') {
      return 'text-gradient-purple';
    }
    return price > 1000 ? 'text-gradient-gold' : 'text-gradient-blue';
  };

  return (
    <motion.div 
      whileHover={{ translateY: -5 }}
      className="relative flex flex-col h-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
    >
      {/* Top badges */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        {isNew && (
          <Badge className="bg-blue-600">NEW</Badge>
        )}
        {isPopular && (
          <Badge className="bg-amber-600">POPULAR</Badge>
        )}
        {isLocked && (
          <Badge
            variant="outline"
            className="bg-black/50 backdrop-blur-sm border-zinc-700"
          >
            <Lock className="h-3 w-3 mr-1 text-zinc-400" />
            Level {requiredLevel}
          </Badge>
        )}
      </div>
      
      {/* Item image */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-b from-black/20 to-black/60">
        <img
          src={imageSrc}
          alt={name}
          className={`absolute top-0 left-0 w-full h-full object-cover ${isLocked ? "filter grayscale opacity-70" : ""}`}
        />
      </div>
      
      {/* Item details */}
      <div className="p-4 flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg">{name}</h3>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
        
        <p className="text-sm text-zinc-400 mb-4">{description}</p>
        
        {/* Purchase section */}
        <div className="mt-auto flex items-center justify-between">
          <div className={`text-xl font-bold ${getPriceColor()}`}>
            {price} <CurrencyLabel />
          </div>
        
          <FeatureGate
            featureId={featureId || `shop_item_${id}`}
            fallback={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button variant="secondary" disabled size="sm">
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Level {requiredLevel}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reach level {requiredLevel} to unlock</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          >
            <Button 
              onClick={() => onPurchase(id)}
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
            >
              {currency === 'xp' ? (
                <Sparkles className="h-4 w-4 mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Purchase
            </Button>
          </FeatureGate>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopItem;
