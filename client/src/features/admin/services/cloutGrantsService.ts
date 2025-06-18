import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';

export const CLOUT_LOGS_KEY = ['admin', 'clout', 'logs'];

export function useGrantClout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; amount: number; reason: string }) =>
      adminApi.post('/clout/grants', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLOUT_LOGS_KEY });
    }
  });
}

export function useCloutLogs(userId?: string, limit = 50) {
  return useQuery({
    queryKey: [...CLOUT_LOGS_KEY, userId, limit],
    queryFn: () =>
      adminApi.get(`/clout/logs${userId ? `?userId=${userId}&limit=${limit}` : `?limit=${limit}`}`)
  });
} 