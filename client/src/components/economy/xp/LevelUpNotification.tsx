import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

type LevelUpNotificationProps = {
  level: number;
  isVisible: boolean;
  onClose: () => void;
  rewards?: {
    title?: string;
    badge?: {
      name: string;
      imageUrl: string;
    };
    dgt?: number;
  };
  className?: string;
};

/**
 * Component that displays a level up notification with animations
 */
export function LevelUpNotification({
  level,
  isVisible,
  onClose,
  rewards,
  className,
}: LevelUpNotificationProps) {
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Handle dismiss button click
  const handleDismiss = () => {
    setDismissed(true);
    // Delay actual closing to allow animation to complete
    setTimeout(() => {
      onClose();
      setDismissed(false);
    }, 500);
  };

  // Determine background gradient color based on level
  const getBackgroundGradient = () => {
    if (level < 10) return "from-emerald-500/20 to-emerald-700/5";
    if (level < 25) return "from-cyan-500/20 to-cyan-700/5";
    if (level < 50) return "from-purple-500/20 to-purple-700/5";
    return "from-amber-500/20 to-amber-700/5";
  };

  // Determine level text color based on level
  const getLevelTextColor = () => {
    if (level < 10) return "text-emerald-400";
    if (level < 25) return "text-cyan-400";
    if (level < 50) return "text-purple-400";
    return "text-amber-400";
  };

  // Get level title
  const getLevelTitle = (level: number): string => {
    if (level < 5) return "Newcomer";
    if (level < 10) return "Explorer";
    if (level < 15) return "Regular";
    if (level < 25) return "Forum Enjoyer";
    if (level < 40) return "Forum Veteran";
    if (level < 60) return "Forum Expert";
    if (level < 80) return "Forum Master";
    return "Forum Legend";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "fixed bottom-6 right-6 z-50 max-w-md w-full shadow-xl rounded-lg overflow-hidden",
            dismissed && "pointer-events-none",
            className
          )}
        >
          <div
            className={cn(
              "relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg overflow-hidden",
              "animate-pulse-glow"
            )}
          >
            {/* Background Glow */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-20",
                getBackgroundGradient()
              )}
            ></div>

            {/* Particles Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="particle-container">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn(
                      "absolute w-1 h-1 rounded-full bg-current opacity-70",
                      getLevelTextColor()
                    )}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -100 - Math.random() * 100],
                      x: [0, (Math.random() - 0.5) * 50],
                      opacity: [0.7, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      delay: Math.random() * 2,
                    }}
                  ></motion.div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <ChevronUp
                    className={cn("h-6 w-6", getLevelTextColor())}
                  />
                  <h3 className="text-xl font-bold text-white">Level Up!</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className={cn(
                    "flex items-center justify-center w-16 h-16 rounded-full bg-black/40 border-2",
                    level < 10
                      ? "border-emerald-500"
                      : level < 25
                      ? "border-cyan-500"
                      : level < 50
                      ? "border-purple-500"
                      : "border-amber-500"
                  )}
                >
                  <span
                    className={cn("text-2xl font-bold", getLevelTextColor())}
                  >
                    {level}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">You reached</p>
                  <h4 className="text-xl font-bold text-white">
                    Level {level}
                  </h4>
                  <p className="text-sm text-zinc-300">
                    {getLevelTitle(level)}
                  </p>
                </div>
              </div>

              {/* Rewards Section */}
              {rewards && (
                <div className="mt-4 pt-4 border-t border-zinc-700">
                  <h4 className="flex items-center text-sm font-medium text-zinc-300 mb-3">
                    <Trophy className="h-4 w-4 mr-1.5" />
                    Level Rewards
                  </h4>

                  <div className="space-y-3">
                    {rewards.title && (
                      <div className="flex items-center gap-3 p-2 rounded-md bg-zinc-800/50">
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">New Title</p>
                          <p className="text-sm font-medium">{rewards.title}</p>
                        </div>
                      </div>
                    )}

                    {rewards.badge && (
                      <div className="flex items-center gap-3 p-2 rounded-md bg-zinc-800/50">
                        <div className="h-8 w-8 rounded-md flex items-center justify-center overflow-hidden">
                          <img
                            src={rewards.badge.imageUrl}
                            alt={rewards.badge.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">New Badge</p>
                          <p className="text-sm font-medium">
                            {rewards.badge.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {rewards.dgt && (
                      <div className="flex items-center gap-3 p-2 rounded-md bg-zinc-800/50">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <span className="text-xs font-bold">DGT</span>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">DGT Reward</p>
                          <p className="text-sm font-medium">
                            {rewards.dgt} DGT Tokens
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                variant="default"
                className={cn(
                  "w-full mt-4",
                  level < 10
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : level < 25
                    ? "bg-cyan-600 hover:bg-cyan-700"
                    : level < 50
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-amber-600 hover:bg-amber-700"
                )}
                onClick={handleDismiss}
              >
                Continue
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 