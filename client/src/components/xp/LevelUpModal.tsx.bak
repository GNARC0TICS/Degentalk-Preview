import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, Star, Gift, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  title?: string;
  rewards?: {
    type: 'badge' | 'title' | 'feature' | 'dgt';
    name: string;
    description?: string;
    icon?: React.ReactNode;
  }[];
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  level,
  title = 'Forum Explorer',
  rewards = [],
}) => {
  // Trigger confetti when the modal opens
  useEffect(() => {
    if (isOpen) {
      launchConfetti();
    }
  }, [isOpen]);

  // Launch celebratory confetti
  const launchConfetti = () => {
    // Setup confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ['#FFC107', '#9C27B0', '#4CAF50', '#F44336'];

    // Fire off multiple bursts of confetti
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      // Confetti settings
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });
    }, 150);
  };

  // Default reward if none provided
  if (rewards.length === 0) {
    rewards = [
      {
        type: 'title',
        name: title,
        description: `You've earned the title "${title}"!`,
        icon: <Award className="h-5 w-5 text-yellow-400" />,
      }
    ];
    
    // Add DGT reward for significant levels
    if (level % 5 === 0) { // Every 5 levels
      rewards.push({
        type: 'dgt',
        name: `${level * 10} DGT`,
        description: 'Tokens have been added to your wallet!',
        icon: <Gift className="h-5 w-5 text-purple-400" />,
      });
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            // Close only if the background is clicked, not the modal itself
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative max-w-md w-full bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Header with glowing effect */}
            <div className="relative py-8 px-6 text-center border-b border-white/10 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-56 h-56 rounded-full bg-yellow-500/20 blur-3xl absolute -top-10 -right-10" />
                <div className="w-56 h-56 rounded-full bg-blue-500/20 blur-3xl absolute -bottom-10 -left-10" />
              </div>
              
              <div className="relative">
                {/* Level Badge */}
                <div className="mb-3 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-2xl shadow-lg">
                  {level}
                </div>
                
                <h2 className="text-3xl font-bold mb-1">Level Up!</h2>
                <p className="text-lg opacity-80 mb-1">
                  You've reached level {level}
                </p>
                <p className="text-sm text-gray-400">
                  {title && <span>New title: {title}</span>}
                </p>
              </div>
            </div>
            
            {/* Rewards section */}
            <div className="py-6 px-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                Rewards Unlocked
              </h3>
              
              <div className="space-y-4">
                {rewards.map((reward, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="mr-3 p-2 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10">
                      {reward.icon || <TrendingUp className="h-5 w-5 text-blue-400" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{reward.name}</h4>
                      {reward.description && (
                        <p className="text-xs text-gray-400">{reward.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={onClose}
                  className="px-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 border-0 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal; 