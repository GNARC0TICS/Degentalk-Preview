import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@app/features/admin/lib/adminApi';
import type { UserId } from '@shared/types/ids';

export const REPUTATION_LOGS_KEY = ['admin', 'reputation', 'logs'];

export function useGrantReputation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: { userId: UserId; amount: number; reason: string }) =>
			adminApi.post('/reputation/grants', payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: REPUTATION_LOGS_KEY });
		}
	});
}

export function useReputationLogs(userId?: string, limit = 50) {
	return useQuery({
		queryKey: [...REPUTATION_LOGS_KEY, userId, limit],
		queryFn: () =>
			adminApi.get(`/reputation/logs${userId ? `?userId=${userId}&limit=${limit}` : `?limit=${limit}`}`)
	});
}
