import { adminApi } from '@/lib/adminApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ECONOMY_KEY = ['admin', 'economy-config'];

export function useEconomyConfig() {
	return useQuery({
		queryKey: ECONOMY_KEY,
		queryFn: () => adminApi.get('/economy/config')
	});
}

export function useUpdateEconomyConfig() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: any) => adminApi.put('/economy/config', data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ECONOMY_KEY });
		}
	});
}
