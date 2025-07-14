import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@admin/lib/adminApi';
import type { InsertXpActionSetting } from '@/types/compat/economy';

const ACTIONS_KEY = ['admin', 'xp-actions'];

export function useXpActions() {
	return useQuery({
		queryKey: ACTIONS_KEY,
		queryFn: () => adminApi.get('/xp/actions')
	});
}

export function useUpdateXpAction() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			actionKey,
			payload
		}: {
			actionKey: string;
			payload: Partial<InsertXpActionSetting>;
		}) => adminApi.put(`/xp/actions/${actionKey}`, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ACTIONS_KEY });
		}
	});
}
