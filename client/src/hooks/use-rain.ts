import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/api-request';
import { useToast } from '@app/hooks/use-toast';
import type { RoomId, ActionId, UserId } from '@shared/types/ids';
import { logger } from '@app/lib/logger";

export interface RainParams {
	amount: number;
	userCount?: number;
	eligibleUserCount?: number;
	roomId?: RoomId;
	currency?: string;
	message?: string; // Optional message with rain
}

interface RainResponse {
	success: boolean;
	transactionId: ActionId;
	recipients: Array<{
		id: UserId;
		username: string;
	}>;
	message: string;
}

interface RecentRainResponse {
	events: Array<{
		id: ActionId;
		fromUserId: UserId;
		fromUsername: string;
		amount: number;
		currency: string;
		recipientCount: number;
		roomId?: RoomId;
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
						userCount: params.eligibleUserCount ?? params.userCount ?? 10,
						roomId: params.roomId,
						currency: params.currency || 'DGT'
					}
				});
			} catch (error) {
				logger.error('useRain', 'Error sending rain:', error);
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
				variant: 'default',
				title: 'Rain Sent',
				description: `Your rain was sent successfully to ${recipientCount} users!`
			});
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Error Sending Rain',
				description: error?.message || 'Failed to send rain. Please try again.'
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
					method: 'GET',
					params: { limit: '10' }
				});
			} catch (error) {
				logger.error('useRain', 'Error fetching recent rain events:', error);
				throw error;
			}
		},
		staleTime: 60 * 1000 // 1 minute
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
		refreshRecentRain: () =>
			queryClient.invalidateQueries({ queryKey: ['/api/engagement/rain/recent'] })
	};
}
