import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@utils/api-request';
import { useToast } from '@/hooks/use-toast';
import type { TipId, UserId } from '@shared/types/ids';

export interface TipParams {
	toUserId: UserId;
	amount: number;
	reason?: string;
	source?: string;
}

interface TipResponse {
	success: boolean;
	tipId: TipId;
	message: string;
}

interface TipHistoryResponse {
	tips: Array<{
		id: TipId;
		fromUserId: UserId;
		toUserId: UserId;
		amount: number;
		currency: string;
		source: string;
		contextId?: string;
		message?: string;
		status: string;
		createdAt: string;
	}>;
	total: number;
}

export function useTip() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	// Send tip mutation
	const sendTipMutation = useMutation({
		mutationFn: async (params: TipParams) => {
			try {
				return await apiRequest<TipResponse>({
					url: '/api/engagement/tip',
					method: 'POST',
					data: {
						toUserId: params.toUserId,
						amount: params.amount,
						reason: params.reason,
						source: params.source || 'forum'
					}
				});
			} catch (error) {
				console.error('Error sending tip:', error);
				throw error;
			}
		},
		onSuccess: () => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
			queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
			queryClient.invalidateQueries({ queryKey: ['/api/engagement/tip/history'] });

			toast({
				variant: 'default',
				title: 'Tip Sent',
				description: 'Your tip was sent successfully!'
			});
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Error Sending Tip',
				description: error?.message || 'Failed to send tip. Please try again.'
			});
		}
	});

	// Get tip history query
	const tipHistoryQuery = useQuery({
		queryKey: ['/api/engagement/tip/history'],
		queryFn: async () => {
			try {
				return await apiRequest<TipHistoryResponse>({
					url: '/api/engagement/tip/history'
				});
			} catch (error) {
				console.error('Error fetching tip history:', error);
				throw error;
			}
		},
		staleTime: 60 * 1000 // 1 minute
	});

	return {
		// Data
		tipHistory: tipHistoryQuery.data?.tips || [],
		tipCount: tipHistoryQuery.data?.total || 0,

		// Status
		isLoadingTipHistory: tipHistoryQuery.isLoading,
		isSendingTip: sendTipMutation.isPending,

		// Error states
		tipHistoryError: tipHistoryQuery.error,
		sendTipError: sendTipMutation.error,

		// Methods
		sendTip: sendTipMutation.mutate,
		refreshTipHistory: () =>
			queryClient.invalidateQueries({ queryKey: ['/api/engagement/tip/history'] })
	};
}
