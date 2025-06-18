import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';

// Query keys
const SETTINGS_KEY = ['admin', 'settings'];
const FEATURE_FLAGS_KEY = ['admin', 'feature-flags'];

export function useSiteSettings(category?: string) {
	return useQuery({
		queryKey: [...SETTINGS_KEY, category ?? 'all'],
		queryFn: () => adminApi.get(`/settings${category ? `?group=${category}` : ''}`)
	});
}

export function useUpdateSetting() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ key, value }: { key: string; value: any }) =>
			adminApi.put(`/settings/${key}`, { value }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: SETTINGS_KEY });
		}
	});
}

export function useFeatureFlags() {
	return useQuery({
		queryKey: FEATURE_FLAGS_KEY,
		queryFn: () => adminApi.get('/settings/feature-flags')
	});
}

export function useToggleFeatureFlag() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
			adminApi.put(`/settings/feature-flags/${key}`, { enabled }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: FEATURE_FLAGS_KEY });
		}
	});
} 