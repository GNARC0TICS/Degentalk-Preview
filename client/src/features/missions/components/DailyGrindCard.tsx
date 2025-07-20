import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Tag, AlertCircle, Trophy } from 'lucide-react';
import { useMissionActions } from '../hooks/useMissionActions.tsx';
import type { Mission } from '../types.ts';

interface DailyGrindCardProps {
  missions: Mission[];
  className?: string;
}

export const DailyGrindCard: React.FC<DailyGrindCardProps> = ({ 
  missions, 
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'overdue' | 'completed'>('active');
  const { updateProgress, claimReward, loading } = useMissionActions();
  const [localMissions, setLocalMissions] = useState(missions);
  
  // Calculate stats
  const activeMissions = localMissions.filter(m => !m.progress?.isComplete);
  const completedMissions = localMissions.filter(m => m.progress?.isComplete);
  const totalXP = completedMissions.reduce((sum, m) => 
    sum + (m.template.rewards.xp || 0), 0
  );
  
  const handleToggle = async (missionId: string) => {
    const mission = localMissions.find(m => m.id === missionId);
    if (!mission) return;
    
    // Optimistic update
    setLocalMissions(prev => prev.map(m => 
      m.id === missionId 
        ? { ...m, progress: { ...m.progress!, isComplete: !m.progress?.isComplete } }
        : m
    ));
    
    // Actual update
    if (!mission.progress?.isComplete) {
      // Mark as complete
      await updateProgress(missionId, { completed: true });
    }
  };
  
  const filteredMissions = activeTab === 'active' 
    ? activeMissions 
    : activeTab === 'completed' 
    ? completedMissions 
    : [];

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* Glow effects */}
      <div className="absolute inset-0 -z-20 overflow-hidden rounded-[1.25rem] opacity-30">
        <div className="absolute inset-0 blur-[4em]">
          <div className="absolute inset-[-50%] animate-spin-slow bg-gradient-to-r from-primary via-transparent to-primary/60" />
        </div>
      </div>
      <div className="absolute inset-[-4px] -z-10 overflow-hidden rounded-[1.25rem] opacity-30">
        <div className="absolute inset-0 blur-[1em]">
          <div className="absolute inset-[-50%] animate-spin-slow bg-gradient-to-r from-primary via-transparent to-primary" />
        </div>
      </div>
      
      {/* Card border */}
      <div className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800" />
      
      {/* Card content */}
      <div className="relative rounded-[1.125rem] bg-gradient-to-b from-zinc-950 to-black border border-zinc-900 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b-2 border-zinc-800 shadow-lg">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            {/* Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-black text-lg text-black shadow-glow">
              DT
            </div>
            
            {/* Title */}
            <div className="flex-1">
              <h2 className="text-lg font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Daily Grind
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                Get your bags, anon
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-base font-bold text-primary shadow-glow-text">
                  {activeMissions.length}
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">
                  Tasks
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-primary shadow-glow-text">
                  {totalXP}
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">
                  XP
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 px-4 bg-black/30">
            {(['active', 'overdue', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-4 py-3 text-[13px] font-medium transition-all duration-300",
                  "border-b-[3px] hover:bg-white/[0.02]",
                  activeTab === tab 
                    ? "text-white border-primary bg-primary/5" 
                    : "text-zinc-500 border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  {tab === 'active' && <Tag className="w-4 h-4" />}
                  {tab === 'overdue' && <AlertCircle className="w-4 h-4" />}
                  {tab === 'completed' && <Trophy className="w-4 h-4" />}
                  <span className="capitalize">{tab === 'active' ? "Today's Quests" : tab}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-track-zinc-950 scrollbar-thumb-zinc-800">
            <AnimatePresence mode="popLayout">
              {filteredMissions.map((mission, index) => (
                <MissionTask 
                  key={mission.id} 
                  mission={mission} 
                  onToggle={handleToggle}
                  delay={index * 0.05}
                />
              ))}
            </AnimatePresence>
            
            {filteredMissions.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <p className="text-sm">No {activeTab} missions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MissionTaskProps {
  mission: Mission;
  onToggle: (missionId: string) => void;
  delay?: number;
}

const MissionTask: React.FC<MissionTaskProps> = ({ mission, onToggle, delay = 0 }) => {
  const isComplete = mission.progress?.isComplete || false;
  const priority = mission.template.metadata?.priority || 'medium';
  
  const priorityStyles = {
    high: 'bg-red-500/20 text-red-500 border-red-500/30',
    medium: 'bg-orange-500/20 text-orange-500 border-orange-500/30', 
    low: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, delay }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer",
        "bg-white/[0.02] border-zinc-800 hover:bg-white/[0.04] hover:border-zinc-700 hover:translate-x-0.5",
        isComplete && "opacity-40"
      )}
      onClick={() => onToggle(mission.id)}
    >
      {/* Checkbox */}
      <div className="relative w-5 h-5 flex-shrink-0 mt-0.5">
        <motion.div
          className={cn(
            "absolute inset-0 rounded border-2 transition-all duration-300",
            isComplete 
              ? "bg-primary border-primary shadow-glow" 
              : "bg-zinc-950 border-zinc-700 hover:border-primary/50"
          )}
          whileTap={{ scale: 0.9 }}
        >
          {isComplete && (
            <Check className="w-3 h-3 absolute inset-0 m-auto text-black" strokeWidth={3} />
          )}
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-1">
        {/* Priority badge */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-1.5 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider",
            priorityStyles[priority]
          )}>
            {priority}
          </span>
        </div>
        
        {/* Title */}
        <p className={cn(
          "text-[13px] font-semibold leading-tight text-white",
          isComplete && "line-through text-zinc-500"
        )}>
          {mission.template.name}
        </p>
        
        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px]">
          {mission.template.rewards.xp && (
            <span className="flex items-center gap-1 text-primary font-semibold">
              🪙 {mission.template.rewards.xp} XP
            </span>
          )}
          {!isComplete && (
            <span className="text-zinc-500">
              ⏱️ {getTimeEstimate(mission)}
            </span>
          )}
          {isComplete && (
            <span className="text-zinc-500">
              ✅ Completed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function getTimeEstimate(mission: Mission): string {
  const reqCount = Object.values(mission.template.requirements).reduce((sum: number, val: any) => 
    sum + (typeof val === 'number' ? val : 0), 0
  );
  return reqCount <= 3 ? '2 min' : reqCount <= 10 ? '5 min' : '15 min';
}