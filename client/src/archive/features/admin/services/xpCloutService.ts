import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/lib/adminApi';
import type { XpConfig } from '@shared/types';

const XP_REPUTATION_KEY = ['admin', 'xp-reputation-settings'];

export function useXpReputationSettings() {
	return useQuery({
		queryKey: XP_REPUTATION_KEY,
		queryFn: () => adminApi.get('/xp/reputation-settings')
	});
}

export function useUpdateXpReputationSettings() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: Partial<XpConfig>) => adminApi.put('/xp/reputation-settings', data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: XP_REPUTATION_KEY });
		}
	});
}
