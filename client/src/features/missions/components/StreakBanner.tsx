import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';

interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  lastClaimDate?: string;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({
  currentStreak,
  longestStreak,
  lastClaimDate
}) => {
  const streakActive = currentStreak > 0;
  
  return (
    <div className={`rounded-lg p-4 ${streakActive ? 'bg-orange-900/20 border border-orange-700' : 'bg-zinc-900/50 border border-zinc-700'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${streakActive ? 'bg-orange-600' : 'bg-zinc-700'}`}>
            <Flame className={`w-6 h-6 ${streakActive ? 'text-white' : 'text-zinc-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {currentStreak} Day Streak
            </h3>
            <p className="text-sm text-zinc-400">
              Keep your streak alive!
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 text-zinc-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Longest: {longestStreak} days</span>
          </div>
          {lastClaimDate && (
            <p className="text-xs text-zinc-500 mt-1">
              Last claim: {new Date(lastClaimDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};