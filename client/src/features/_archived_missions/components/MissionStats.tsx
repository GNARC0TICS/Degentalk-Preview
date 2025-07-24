import React from 'react';
import { Trophy, Target, Clock, Coins } from 'lucide-react';

interface MissionStatsProps {
  totalCompleted: number;
  totalXP: number;
  totalRewards: number;
  timeSpent?: number;
}

export const MissionStats: React.FC<MissionStatsProps> = ({
  totalCompleted,
  totalXP,
  totalRewards,
  timeSpent
}) => {
  const stats = [
    {
      icon: Trophy,
      label: 'Completed',
      value: totalCompleted.toLocaleString(),
      color: 'text-yellow-400'
    },
    {
      icon: Target,
      label: 'Total XP',
      value: totalXP.toLocaleString(),
      color: 'text-blue-400'
    },
    {
      icon: Coins,
      label: 'Rewards',
      value: totalRewards.toLocaleString(),
      color: 'text-emerald-400'
    }
  ];

  if (timeSpent !== undefined) {
    stats.push({
      icon: Clock,
      label: 'Time Spent',
      value: `${Math.floor(timeSpent / 60)}h ${timeSpent % 60}m`,
      color: 'text-purple-400'
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};