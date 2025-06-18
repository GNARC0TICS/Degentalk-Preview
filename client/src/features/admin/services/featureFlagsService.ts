import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';

const FLAGS_KEY = ['admin', 'feature-flags'];

export function useFeatureFlags() {
	return useQuery({
		queryKey: FLAGS_KEY,
		queryFn: () => adminApi.get('/settings/feature-flags')
	});
}

export function useToggleFlag() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ key, enabled, rolloutPercentage }: { key: string; enabled: boolean; rolloutPercentage: number }) =>
			adminApi.put(`/settings/feature-flags/${key}`, { enabled, rolloutPercentage }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: FLAGS_KEY });
		}
	});
} 