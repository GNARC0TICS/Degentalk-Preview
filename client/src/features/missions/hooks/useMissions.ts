import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface MissionProgress {
  [key: string]: {
    current: number;
    target: number;
    percentage: number;
  };
}

interface Mission {
  id: string;
  template: {
    id: string;
    key: string;
    name: string;
    description: string;
    category: string;
    type: string;
    requirements: Record<string, any>;
    rewards: {
      xp?: number;
      dgt?: number;
      clout?: number;
      badge?: string;
      title?: string;
      avatar_frame?: string;
      items?: string[];
    };
    metadata?: {
      icon?: string;
      color?: string;
      priority?: 'low' | 'medium' | 'high';
    };
  };
  progress: MissionProgress & {
    isComplete?: boolean;
    isClaimed?: boolean;
  };
  periodType: 'daily' | 'weekly' | 'special' | 'vip';
  periodEnd: string;
}

interface MissionStreak {
  type: 'daily' | 'weekly';
  current: number;
  best: number;
  lastCompleted: string | null;
}

interface MissionStats {
  totalCompleted: number;
  totalXpEarned: number;
  totalDgtEarned: number;
  completionRate: number;
  favoriteCategory: string;
}

interface MissionsResponse {
  daily: Mission[];
  weekly: Mission[];
  special: Mission[];
  vip?: Mission[];
}

export function useMissions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  
  // Fetch user's active missions
  const { data, isLoading, error } = useQuery({
    queryKey: ['missions', user?.id],
    queryFn: async () => {
      const response = await apiRequest<{ missions: MissionsResponse }>('/api/missions/active');
      return response.missions;
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Fetch streaks
  const { data: streaks } = useQuery({
    queryKey: ['mission-streaks', user?.id],
    queryFn: async () => {
      const response = await apiRequest<{ streaks: MissionStreak[] }>('/api/missions/streaks');
      return response.streaks;
    },
    enabled: !!user,
  });
  
  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['mission-stats', user?.id],
    queryFn: async () => {
      const response = await apiRequest<{ stats: MissionStats }>('/api/missions/stats');
      return response.stats;
    },
    enabled: !!user,
  });
  
  // Subscribe to real-time mission updates
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribe('mission_progress', (event) => {
      // Update mission progress in cache
      queryClient.setQueryData(['missions', user.id], (old: MissionsResponse | undefined) => {
        if (!old) return old;
        
        const updateMissions = (missions: Mission[]) => 
          missions.map(mission => {
            const update = event.updates.find((u: any) => u.missionId === mission.id);
            if (!update) return mission;
            
            return {
              ...mission,
              progress: {
                ...mission.progress,
                [update.requirementKey]: {
                  current: update.currentValue,
                  target: update.targetValue,
                  percentage: update.percentage
                },
                isComplete: update.isComplete
              }
            };
          });
        
        return {
          daily: updateMissions(old.daily),
          weekly: updateMissions(old.weekly),
          special: updateMissions(old.special),
          vip: old.vip ? updateMissions(old.vip) : undefined
        };
      });
      
      // Show toast for completed missions
      const completed = event.updates.filter((u: any) => u.isComplete);
      if (completed.length > 0) {
        toast.success('Mission completed! 🎉', {
          description: 'Check your missions to claim rewards'
        });
      }
    });
    
    return unsubscribe;
  }, [user, subscribe, queryClient]);
  
  // Subscribe to mission resets
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribe('mission_reset', (event) => {
      // Invalidate queries to fetch new missions
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission-streaks'] });
      
      toast.info(`${event.resetType === 'daily' ? 'Daily' : 'Weekly'} missions reset!`, {
        description: 'New missions are available'
      });
    });
    
    return unsubscribe;
  }, [user, subscribe, queryClient]);
  
  return {
    missions: data || { daily: [], weekly: [], special: [], vip: [] },
    streaks: streaks || [],
    stats: stats || {
      totalCompleted: 0,
      totalXpEarned: 0,
      totalDgtEarned: 0,
      completionRate: 0,
      favoriteCategory: 'participation'
    },
    loading: isLoading,
    error
  };
}