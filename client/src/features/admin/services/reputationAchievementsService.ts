import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/lib/adminApi';
import type { AchievementId } from '@shared/types/ids';
import type { AchievementData } from '@/types/admin.types';

export const ACHIEVEMENTS_KEY = ['admin', 'reputation', 'achievements'];

export function useReputationAchievements() {
	return useQuery({
		queryKey: ACHIEVEMENTS_KEY,
		queryFn: () => adminApi.get('/reputation/achievements')
	});
}

export function useCreateAchievement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: AchievementData) => adminApi.post('/reputation/achievements', payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY })
	});
}

export function useUpdateAchievement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: AchievementId; payload: Partial<AchievementData> }) =>
			adminApi.put(`/reputation/achievements/${id}`, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY })
	});
}

export function useToggleAchievement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: AchievementId) => adminApi.post(`/reputation/achievements/${id}/toggle`, {}),
		onSuccess: () => qc.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY })
	});
}

export function useDeleteAchievement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: AchievementId) => adminApi.delete(`/reputation/achievements/${id}`),
		onSuccess: () => qc.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY })
	});
}
