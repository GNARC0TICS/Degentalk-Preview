import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';
import type { InsertXpCloutSettings } from '@/types/compat/economy';

const XP_CLOUT_KEY = ['admin', 'xp-clout-settings'];

export function useXpCloutSettings() {
	return useQuery({
		queryKey: XP_CLOUT_KEY,
		queryFn: () => adminApi.get('/xp/clout-settings')
	});
}

export function useUpdateXpCloutSettings() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: Partial<InsertXpCloutSettings>) => adminApi.put('/xp/clout-settings', data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: XP_CLOUT_KEY });
		}
	});
}
