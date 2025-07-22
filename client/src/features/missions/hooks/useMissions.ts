import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { useCanonicalAuth } from '@/features/auth/useCanonicalAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { Mission, MissionProgress } from '../types';
import {
  MissionStreakResponseSchema,
  MissionStatsResponseSchema,
  MissionsResponseSchema,
  type MissionStreak,
  type MissionStats,
  type MissionsResponse,
  validateApiResponse
} from '@/schemas';

export function useMissions() {
  const { user } = useCanonicalAuth();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  
  // Fetch user's active missions
  const { data, isLoading, error } = useQuery<MissionsResponse>({
    queryKey: ['missions', user?.id],
    queryFn: async () => {
      const response = await apiRequest<{ missions: MissionsResponse }>({
        url: '/api/missions/active',
        method: 'GET'
      });
      return validateApiResponse(
        MissionsResponseSchema,
        response.missions,
        'useMissions.active'
      );
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Fetch streaks
  const { data: streaks } = useQuery<MissionStreak[]>({
    queryKey: ['mission-streaks', user?.id],
    queryFn: async () => {
      const response = await apiRequest<{ streaks: MissionStreak[] }>({
        url: '/api/missions/streaks',
        method: 'GET'
      });
      return validateApiResponse(
        MissionStreakResponseSchema,
        response,
        'useMissions.streaks'
      ).streaks;
    },
    enabled: !!user,
  });
  
  // Fetch stats
  const { data: stats } = useQuery<MissionStats>({
    queryKey: ['mission-stats', user?.id],
    queryFn: async () => {
      const response = await apiRequest<{ stats: MissionStats }>({
        url: '/api/missions/stats',
        method: 'GET'
      });
      return validateApiResponse(
        MissionStatsResponseSchema,
        response,
        'useMissions.stats'
      ).stats;
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
                metrics: {
                  ...(mission.progress?.metrics || {}),
                  [update.requirementKey]: {
                    current: update.currentValue,
                    target: update.targetValue,
                    percentage: update.percentage
                  }
                },
                isComplete: update.isComplete || mission.progress?.isComplete || false,
                isClaimed: mission.progress?.isClaimed || false
              },
              isComplete: update.isComplete || mission.isComplete || false
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