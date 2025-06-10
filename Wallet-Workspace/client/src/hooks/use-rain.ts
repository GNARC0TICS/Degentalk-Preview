import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface RainParams {
  amount: number;
  userCount?: number;
  roomId?: number;
  currency?: string;
}

interface RainResponse {
  success: boolean;
  transactionId: number;
  recipients: Array<{
    id: number;
    username: string;
  }>;
  message: string;
}

interface RecentRainResponse {
  events: Array<{
    id: number;
    fromUserId: number;
    fromUsername: string;
    amount: number;
    currency: string;
    recipientCount: number;
    roomId?: number;
    roomName?: string;
    createdAt: string;
  }>;
  total: number;
}

export function useRain() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Send rain mutation
  const sendRainMutation = useMutation({
    mutationFn: async (params: RainParams) => {
      try {
        return await apiRequest<RainResponse>({
          url: '/api/engagement/rain',
          method: 'POST',
          data: {
            amount: params.amount,
            userCount: params.userCount || 10,
            roomId: params.roomId,
            currency: params.currency || 'DGT'
          }
        });
      } catch (error) {
        console.error('Error sending rain:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/engagement/rain/recent'] });
      
      const recipientCount = data?.recipients?.length || 0;
      
      toast({
        variant: "success",
        title: "Rain Sent",
        description: `Your rain was sent successfully to ${recipientCount} users!`
      });
    },
    onError: (error: any) => {
      toast({
        variant: "error",
        title: "Error Sending Rain",
        description: error?.message || "Failed to send rain. Please try again."
      });
    }
  });

  // Get recent rain events query
  const recentRainQuery = useQuery({
    queryKey: ['/api/engagement/rain/recent'],
    queryFn: async () => {
      try {
        return await apiRequest<RecentRainResponse>({
          url: '/api/engagement/rain/recent',
          params: { limit: '10' }
        });
      } catch (error) {
        console.error('Error fetching recent rain events:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    // Data
    recentRain: recentRainQuery.data?.events || [],
    rainCount: recentRainQuery.data?.total || 0,
    
    // Status
    isLoadingRecentRain: recentRainQuery.isLoading,
    isSendingRain: sendRainMutation.isPending,
    
    // Error states
    recentRainError: recentRainQuery.error,
    sendRainError: sendRainMutation.error,
    
    // Methods
    sendRain: sendRainMutation.mutate,
    refreshRecentRain: () => queryClient.invalidateQueries({ queryKey: ['/api/engagement/rain/recent'] })
  };
} 