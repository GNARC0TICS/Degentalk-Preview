import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';

export const ACHIEVEMENTS_KEY = ['admin', 'clout', 'achievements'];

export function useCloutAchievements() {
  return useQuery({
    queryKey: ACHIEVEMENTS_KEY,
    queryFn: () => adminApi.get('/clout/achievements')
  });
}

export function useCreateAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => adminApi.post('/clout/achievements', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY })
  });
}

export function useUpdateAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => adminApi.put(`/clout/achievements/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY })
  });
}

export function useToggleAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.post(`/clout/achievements/${id}/toggle`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY })
  });
}

export function useDeleteAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.delete(`/clout/achievements/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACHIEVEMENTS_KEY })
  });
} 