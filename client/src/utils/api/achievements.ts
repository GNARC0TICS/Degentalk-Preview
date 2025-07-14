/**
 * Achievement API Client
 *
 * Handles all API communication related to achievements, user progress,
 * and achievement management.
 */

import { apiRequest } from '@/utils/api-request';
import type { AchievementId } from '@shared/types/ids';

export interface UserAchievement {
	id: AchievementId;
	achievementId: AchievementId;
	currentProgress: any;
	progressPercentage: string;
	isCompleted: boolean;
	completedAt?: string;
	achievement: {
		id: AchievementId;
		key: string;
		name: string;
		description: string;
		category: string;
		tier: string;
		iconUrl?: string;
		iconEmoji?: string;
		rewardXp: number;
		rewardDgt: number;
		rewardClout: number;
		isSecret: boolean;
		unlockMessage?: string;
	};
}

export interface Achievement {
	id: AchievementId;
	key: string;
	name: string;
	description: string;
	category: string;
	tier: string;
	iconUrl?: string;
	iconEmoji?: string;
	triggerType: string;
	triggerConfig: any;
	rewardXp: number;
	rewardDgt: number;
	rewardClout: number;
	isActive: boolean;
	isSecret: boolean;
	unlockMessage?: string;
	completionCount?: number;
	completionRate?: number;
	averageProgress?: number;
}

export interface AchievementStats {
	totalAchievements: number;
	activeAchievements: number;
	secretAchievements: number;
	totalCompletions: number;
	categoryBreakdown: Record<string, number>;
	tierBreakdown: Record<string, number>;
}

export interface AchievementFilters {
	category?: string;
	tier?: string;
	triggerType?: string;
	isActive?: boolean;
	isSecret?: boolean;
	search?: string;
	completed?: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export const achievementApi = {
	/**
	 * Get user's achievements with progress
	 */
	getUserAchievements: (userId: string, filters?: AchievementFilters) =>
		apiRequest<{ data: UserAchievement[] }>({
			url: `/api/achievements/user/${userId}`,
			params: filters
		}),

	/**
	 * Get all available achievements
	 */
	getAchievements: (filters?: AchievementFilters & { page?: number; limit?: number }) =>
		apiRequest<PaginatedResponse<Achievement>>({
			url: '/api/achievements',
			params: filters
		}),

	/**
	 * Get achievement statistics
	 */
	getAchievementStats: () =>
		apiRequest<{ data: AchievementStats }>({
			url: '/api/achievements/stats'
		}),

	/**
	 * Get specific achievement details
	 */
	getAchievementById: (id: AchievementId) =>
		apiRequest<{ data: Achievement }>({
			url: `/api/achievements/${id}`
		}),

	/**
	 * Get achievement completions (admin)
	 */
	getAchievementCompletions: (id: AchievementId, page = 1, limit = 50) =>
		apiRequest<PaginatedResponse<any>>({
			url: `/api/achievements/${id}/completions`,
			params: { page, limit }
		}),

	/**
	 * Create new achievement (admin)
	 */
	createAchievement: (achievementData: Partial<Achievement>) =>
		apiRequest<{ data: Achievement }>({
			url: '/api/achievements',
			method: 'POST',
			data: achievementData
		}),

	/**
	 * Update achievement (admin)
	 */
	updateAchievement: (id: AchievementId, achievementData: Partial<Achievement>) =>
		apiRequest<{ data: Achievement }>({
			url: `/api/achievements/${id}`,
			method: 'PUT',
			data: achievementData
		}),

	/**
	 * Delete achievement (admin)
	 */
	deleteAchievement: (id: AchievementId) =>
		apiRequest<{ success: boolean; message: string }>({
			url: `/api/achievements/${id}`,
			method: 'DELETE'
		}),

	/**
	 * Bulk update achievements (admin)
	 */
	bulkUpdateAchievements: (ids: AchievementId[], updates: Partial<Achievement>) =>
		apiRequest<{ data: Achievement[]; message: string }>({
			url: '/api/achievements/bulk',
			method: 'PUT',
			data: { ids, updates }
		}),

	/**
	 * Manually award achievement (admin)
	 */
	manuallyAwardAchievement: (id: AchievementId, userIds: string[], reason?: string) =>
		apiRequest<{ success: boolean; message: string }>({
			url: `/api/achievements/${id}/award`,
			method: 'POST',
			data: { userIds, reason }
		}),

	/**
	 * Get achievement templates
	 */
	getAchievementTemplates: (filters?: { category?: string; tags?: string }) =>
		apiRequest<{ data: any }>({
			url: '/api/achievements/templates',
			params: filters
		}),

	/**
	 * Create achievement from template (admin)
	 */
	createFromTemplate: (templateId: string, overrides?: Partial<Achievement>) =>
		apiRequest<{ data: Achievement; message: string }>({
			url: `/api/achievements/templates/${templateId}/create`,
			method: 'POST',
			data: overrides
		}),

	/**
	 * Emit achievement event (dev/testing)
	 */
	emitAchievementEvent: (eventType: string, userId: string, eventData: any) =>
		apiRequest<{ success: boolean; message: string }>({
			url: '/api/achievements/events/emit',
			method: 'POST',
			data: { eventType, userId, eventData }
		})
};
