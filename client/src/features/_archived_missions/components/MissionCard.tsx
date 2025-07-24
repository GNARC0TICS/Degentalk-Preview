import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@app/utils/utils';
import { Check, Clock, Coins, Trophy, Flame, Lock } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { useMissionActions } from '../hooks/useMissionActions';
import type { Mission } from '../types';

interface MissionCardProps {
  mission: Mission;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'special' | 'vip';
}

export const MissionCard: React.FC<MissionCardProps> = ({ 
  mission, 
  size = 'medium',
  variant = 'default' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { claimReward, loading } = useMissionActions();
  
  const isComplete = mission.isComplete || mission.progress?.isComplete || false;
  const isClaimed = mission.isClaimed || mission.progress?.isClaimed || false;
  
  const priorityColors = {
    high: 'bg-red-500/20 text-red-500 border-red-500/30',
    medium: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    low: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
  };
  
  const variantStyles = {
    default: 'border-border',
    special: 'border-purple-500/30 bg-purple-500/5',
    vip: 'border-yellow-500/30 bg-yellow-500/5'
  };
  
  const handleClaim = async () => {
    if (isComplete && !isClaimed) {
      await claimReward(mission.id);
    }
  };
  
  const getTimeEstimate = () => {
    // Estimate based on requirements
    const reqCount = Object.values(mission.template.requirements).reduce((sum: number, val: any) => 
      sum + (typeof val === 'number' ? val : 0), 0
    );
    return reqCount <= 3 ? '2-5 min' : reqCount <= 10 ? '10-15 min' : '30+ min';
  };
  
  const getProgress = () => {
    if (!mission.progress?.metrics) return 0;
    
    const requirements = Object.entries(mission.progress.metrics);
    const completed = requirements.filter(([_, p]) => p.current >= p.target).length;
    return requirements.length > 0 ? (completed / requirements.length) * 100 : 0;
  };

  return (
    <motion.div
      className={cn(
        "relative group",
        size === 'large' && 'col-span-2'
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect on hover */}
      <AnimatePresence>
        {isHovered && !isComplete && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-lg blur-xl opacity-30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              background: variant === 'vip' 
                ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                : variant === 'special'
                ? 'linear-gradient(135deg, #9333EA, #EC4899)'
                : 'linear-gradient(135deg, #00ff88, #00cc66)'
            }}
          />
        )}
      </AnimatePresence>
      
      <div className={cn(
        "relative overflow-hidden rounded-lg border bg-card transition-all duration-300",
        variantStyles[variant],
        isHovered && !isComplete && "border-primary/50 transform translate-x-0.5",
        isComplete && "opacity-60"
      )}>
        {/* Header */}
        <div className="flex items-start gap-3 p-4">
          {/* Checkbox */}
          <div className="relative flex-shrink-0">
            <motion.label 
              className="relative w-5 h-5 block cursor-pointer"
              whileTap={{ scale: 0.9 }}
            >
              <input
                type="checkbox"
                checked={isComplete}
                disabled
                className="sr-only"
              />
              <div className={cn(
                "absolute inset-0 rounded border-2 transition-all duration-300",
                isComplete 
                  ? "bg-primary border-primary shadow-glow-sm" 
                  : "bg-background border-muted-foreground/30 hover:border-primary/50"
              )}>
                {isComplete && (
                  <Check className="w-3 h-3 absolute inset-0 m-auto text-black" strokeWidth={3} />
                )}
              </div>
            </motion.label>
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Priority & Category */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0",
                  priorityColors[mission.template.metadata?.priority || 'medium']
                )}
              >
                {mission.template.metadata?.priority || 'medium'}
              </Badge>
              <Badge variant="secondary" className="text-[9px]">
                {mission.template.category}
              </Badge>
            </div>
            
            {/* Title */}
            <h3 className={cn(
              "font-semibold text-sm leading-tight",
              isComplete && "line-through text-muted-foreground"
            )}>
              {mission.template.name}
            </h3>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {mission.template.description}
            </p>
            
            {/* Progress */}
            {!isComplete && mission.progress?.metrics && (
              <div className="space-y-1.5">
                <Progress value={getProgress()} className="h-1.5" />
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  {Object.entries(mission.progress.metrics).map(([key, progress]) => (
                    <span key={key}>
                      {key.replace(/_/g, ' ')}: {progress.current}/{progress.target}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Rewards & Meta */}
            <div className="flex items-center gap-3 text-[11px]">
              {/* Rewards */}
              <div className="flex items-center gap-2">
                {mission.template.rewards.xp && (
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <Trophy className="w-3 h-3" />
                    {mission.template.rewards.xp} XP
                  </span>
                )}
                {mission.template.rewards.dgt && (
                  <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                    <Coins className="w-3 h-3" />
                    {mission.template.rewards.dgt} DGT
                  </span>
                )}
              </div>
              
              {/* Time estimate */}
              {!isComplete && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {getTimeEstimate()}
                </span>
              )}
              
              {/* Status */}
              {isComplete && (
                <span className="text-primary font-medium">
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Claim button */}
        {isComplete && !isClaimed && (
          <div className="px-4 pb-4">
            <Button
              size="sm"
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
              onClick={handleClaim}
              disabled={loading}
            >
              {loading ? 'Claiming...' : 'Claim Rewards!'}
            </Button>
          </div>
        )}
        
        {/* VIP/Special badge */}
        {variant !== 'default' && (
          <div className="absolute top-2 right-2">
            {variant === 'vip' && (
              <Badge className="bg-yellow-500 text-black text-[9px] font-bold">
                VIP
              </Badge>
            )}
            {variant === 'special' && (
              <Badge className="bg-purple-500 text-white text-[9px] font-bold">
                LIMITED
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};