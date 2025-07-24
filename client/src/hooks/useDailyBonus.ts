import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/api-request';
import { useCanonicalAuth } from '@app/features/auth/useCanonicalAuth';
import { toast } from 'sonner';

interface DailyBonusResponse {
  awarded: boolean;
  xp: number;
  streak: number;
  message: string;
}

interface StreakResponse {
  streak: number;
}

export function useDailyBonus() {
  const { user, isAuthenticated } = useCanonicalAuth();
  const queryClient = useQueryClient();

  // Get current streak
  const { data: streakData, isLoading: streakLoading } = useQuery<StreakResponse>({
    queryKey: ['daily-bonus-streak', user?.id],
    queryFn: async () => {
      const response = await apiRequest<{ data: StreakResponse }>({
        url: '/api/xp/daily-bonus/streak',
        method: 'GET'
      });
      return response.data;
    },
    enabled: isAuthenticated
  });

  // Claim daily bonus mutation
  const claimMutation = useMutation<DailyBonusResponse>({
    mutationFn: async () => {
      const response = await apiRequest<{ data: DailyBonusResponse }>({
        url: '/api/xp/daily-bonus/claim',
        method: 'POST'
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.awarded) {
        toast.success(data.message, {
          description: `You earned ${data.xp} XP!`,
          icon: '🎉'
        });
        
        // Update user XP in cache
        queryClient.setQueryData(['user', user?.id], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            xp: (oldData.xp || 0) + data.xp
          };
        });
        
        // Update streak
        queryClient.setQueryData(['daily-bonus-streak', user?.id], { streak: data.streak });
      } else {
        toast.info(data.message, {
          icon: '⏰'
        });
      }
    },
    onError: (error: any) => {
      toast.error('Failed to claim daily bonus', {
        description: error.message || 'Please try again later'
      });
    }
  });

  return {
    streak: streakData?.streak || 0,
    streakLoading,
    claimDailyBonus: claimMutation.mutate,
    isClaimingBonus: claimMutation.isPending,
    bonusData: claimMutation.data
  };
}