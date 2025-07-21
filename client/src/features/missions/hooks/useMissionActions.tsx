import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ClaimRewardResponse {
  success: boolean;
  rewards: {
    xp?: number;
    dgt?: number;
    clout?: number;
    badge?: string;
    title?: string;
    items?: string[];
  };
  newTotals: {
    xp: number;
    dgt: number;
    level: number;
  };
}

export function useMissionActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Claim mission rewards
  const claimRewardMutation = useMutation({
    mutationFn: async (missionId: string) => {
      return apiRequest<ClaimRewardResponse>(`/api/missions/${missionId}/claim`, {
        method: 'POST'
      });
    },
    onSuccess: (data, missionId) => {
      // Update mission in cache
      queryClient.setQueryData(['missions', user?.id], (old: any) => {
        if (!old) return old;
        
        const updateMissions = (missions: any[]) =>
          missions.map(m => 
            m.id === missionId 
              ? { ...m, progress: { ...m.progress, isClaimed: true } }
              : m
          );
        
        return {
          ...old,
          daily: updateMissions(old.daily),
          weekly: updateMissions(old.weekly),
          special: updateMissions(old.special),
          vip: old.vip ? updateMissions(old.vip) : undefined
        };
      });
      
      // Update user stats
      queryClient.invalidateQueries({ queryKey: ['mission-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      // Show reward notification
      showRewardNotification(data.rewards);
    },
    onError: (error: any) => {
      toast.error('Failed to claim rewards', {
        description: error.message || 'Please try again'
      });
    }
  });
  
  // Update mission progress (for manual tracking)
  const updateProgressMutation = useMutation({
    mutationFn: async ({ missionId, progress }: { 
      missionId: string; 
      progress: Record<string, any> 
    }) => {
      return apiRequest(`/api/missions/${missionId}/progress`, {
        method: 'PATCH',
        body: progress
      });
    },
    onSuccess: (_, variables) => {
      // Update cache optimistically handled by WebSocket
      queryClient.invalidateQueries({ queryKey: ['missions', user?.id] });
    }
  });
  
  // Track action for mission progress
  const trackActionMutation = useMutation({
    mutationFn: async (action: {
      type: string;
      metadata?: Record<string, any>;
    }) => {
      return apiRequest('/api/missions/track', {
        method: 'POST',
        body: action
      });
    }
  });
  
  return {
    claimReward: claimRewardMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    trackAction: trackActionMutation.mutate,
    loading: claimRewardMutation.isPending || updateProgressMutation.isPending
  };
}

// Beautiful reward notification
function showRewardNotification(rewards: ClaimRewardResponse['rewards']) {
  const rewardElements = [];
  
  if (rewards.xp) {
    rewardElements.push(
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏆</span>
        <span className="font-bold text-primary">+{rewards.xp} XP</span>
      </div>
    );
  }
  
  if (rewards.dgt) {
    rewardElements.push(
      <div className="flex items-center gap-2">
        <span className="text-2xl">💎</span>
        <span className="font-bold text-yellow-500">+{rewards.dgt} DGT</span>
      </div>
    );
  }
  
  if (rewards.badge) {
    rewardElements.push(
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏅</span>
        <span className="font-bold text-purple-500">{rewards.badge}</span>
      </div>
    );
  }
  
  if (rewards.title) {
    rewardElements.push(
      <div className="flex items-center gap-2">
        <span className="text-2xl">👑</span>
        <span className="font-bold text-orange-500">{rewards.title}</span>
      </div>
    );
  }
  
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="bg-background border border-primary/30 rounded-lg p-4 shadow-2xl shadow-primary/20"
    >
      <h3 className="text-lg font-bold mb-3 text-center">Mission Complete! 🎉</h3>
      <div className="space-y-2">
        {rewardElements}
      </div>
    </motion.div>
  ), {
    duration: 5000,
    position: 'top-center'
  });
}