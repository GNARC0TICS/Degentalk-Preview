import { adminApi } from '@app/features/admin/lib/adminApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ECONOMY_KEY = ['admin', 'economy-config'];

type EconomyConfigResponse = {
	config: Record<string, unknown>;
	hasOverrides: boolean;
};

export function useEconomyConfig() {
	return useQuery<EconomyConfigResponse>({
		queryKey: ECONOMY_KEY,
		queryFn: () => adminApi.get('/economy/config').then((res) => res.data)
	});
}

export function useUpdateEconomyConfig() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: Record<string, unknown>) =>
			adminApi.put('/economy/config', data).then((res) => res.data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ECONOMY_KEY });
		}
	});
}

export function useResetEconomyConfig() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => adminApi.delete('/economy/config').then((res) => res.data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ECONOMY_KEY });
		}
	});
}
