/**
 * Achievement Hooks
 *
 * React Query hooks for achievement data management and caching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementApi, type AchievementFilters, type Achievement } from '@/lib/api/achievements';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import type { ApiErrorData } from '@/types/core.types';

/**
 * Get user's achievements with progress
 */
export function useUserAchievements(filters?: AchievementFilters) {
	const { user } = useAuth();

	return useQuery({
		queryKey: ['achievements', 'user', user?.id, filters],
		queryFn: () => (user ? achievementApi.getUserAchievements(user.id, filters) : null),
		enabled: !!user,
		staleTime: 5 * 60 * 1000, // 5 minutes
		select: (data) => data?.data || []
	});
}

/**
 * Get all available achievements
 */
export function useAchievements(filters?: AchievementFilters & { page?: number; limit?: number }) {
	return useQuery({
		queryKey: ['achievements', 'all', filters],
		queryFn: () => achievementApi.getAchievements(filters),
		staleTime: 10 * 60 * 1000, // 10 minutes
		select: (data) => data || { data: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } }
	});
}

/**
 * Get achievement statistics
 */
export function useAchievementStats() {
	return useQuery({
		queryKey: ['achievements', 'stats'],
		queryFn: () => achievementApi.getAchievementStats(),
		staleTime: 15 * 60 * 1000, // 15 minutes
		select: (data) => data?.data
	});
}

/**
 * Get specific achievement details
 */
export function useAchievement(id: number) {
	return useQuery({
		queryKey: ['achievements', 'detail', id],
		queryFn: () => achievementApi.getAchievementById(id),
		enabled: !!id,
		staleTime: 10 * 60 * 1000,
		select: (data) => data?.data
	});
}

/**
 * Get achievement completions (admin)
 */
export function useAchievementCompletions(id: number, page = 1, limit = 50) {
	return useQuery({
		queryKey: ['achievements', 'completions', id, page, limit],
		queryFn: () => achievementApi.getAchievementCompletions(id, page, limit),
		enabled: !!id,
		staleTime: 5 * 60 * 1000
	});
}

/**
 * Get achievement templates
 */
export function useAchievementTemplates(filters?: { category?: string; tags?: string }) {
	return useQuery({
		queryKey: ['achievements', 'templates', filters],
		queryFn: () => achievementApi.getAchievementTemplates(filters),
		staleTime: 30 * 60 * 1000, // 30 minutes - templates don't change often
		select: (data) => data?.data
	});
}

/**
 * Create achievement mutation (admin)
 */
export function useCreateAchievement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (achievementData: Partial<Achievement>) =>
			achievementApi.createAchievement(achievementData),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['achievements'] });
			toast.success(`Achievement "${data.data.name}" created successfully!`);
		},
		onError: (error: ApiErrorData) => {
			toast.error(`Failed to create achievement: ${error.message}`);
		}
	});
}

/**
 * Update achievement mutation (admin)
 */
export function useUpdateAchievement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Partial<Achievement> }) =>
			achievementApi.updateAchievement(id, data),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['achievements'] });
			queryClient.invalidateQueries({ queryKey: ['achievements', 'detail', variables.id] });
			toast.success(`Achievement "${data.data.name}" updated successfully!`);
		},
		onError: (error: ApiErrorData) => {
			toast.error(`Failed to update achievement: ${error.message}`);
		}
	});
}

/**
 * Delete achievement mutation (admin)
 */
export function useDeleteAchievement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => achievementApi.deleteAchievement(id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['achievements'] });
			toast.success(data.message);
		},
		onError: (error: ApiErrorData) => {
			toast.error(`Failed to delete achievement: ${error.message}`);
		}
	});
}

/**
 * Bulk update achievements mutation (admin)
 */
export function useBulkUpdateAchievements() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ ids, updates }: { ids: number[]; updates: Partial<Achievement> }) =>
			achievementApi.bulkUpdateAchievements(ids, updates),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['achievements'] });
			toast.success(data.message);
		},
		onError: (error: ApiErrorData) => {
			toast.error(`Failed to bulk update achievements: ${error.message}`);
		}
	});
}

/**
 * Manually award achievement mutation (admin)
 */
export function useManuallyAwardAchievement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, userIds, reason }: { id: number; userIds: string[]; reason?: string }) =>
			achievementApi.manuallyAwardAchievement(id, userIds, reason),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['achievements'] });
			toast.success(data.message);
		},
		onError: (error: ApiErrorData) => {
			toast.error(`Failed to award achievement: ${error.message}`);
		}
	});
}

/**
 * Create achievement from template mutation (admin)
 */
export function useCreateFromTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			templateId,
			overrides
		}: {
			templateId: string;
			overrides?: Partial<Achievement>;
		}) => achievementApi.createFromTemplate(templateId, overrides),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['achievements'] });
			toast.success(data.message);
		},
		onError: (error: ApiErrorData) => {
			toast.error(`Failed to create achievement from template: ${error.message}`);
		}
	});
}

/**
 * Emit achievement event mutation (dev/testing)
 */
export function useEmitAchievementEvent() {
	return useMutation({
		mutationFn: ({
			eventType,
			userId,
			eventData
		}: {
			eventType: string;
			userId: string;
			eventData: Record<string, unknown>;
		}) => achievementApi.emitAchievementEvent(eventType, userId, eventData),
		onSuccess: (data) => {
			toast.success(data.message);
		},
		onError: (error: ApiErrorData) => {
			toast.error(`Failed to emit event: ${error.message}`);
		}
	});
}
