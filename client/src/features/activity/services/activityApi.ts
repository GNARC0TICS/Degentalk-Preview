import { apiRequest } from '@/lib/api-request';
import type { UserId } from '@shared/types/ids';

export interface EventLog {
	id: string;
	userId: UserId;
	eventType: string;
	relatedId?: string;
	meta: Record<string, unknown>;
	createdAt: string;
	user: {
		id: UserId;
		username: string;
		displayName: string;
		avatarUrl?: string;
	};
}

export interface EventLogFilters {
	eventType?: string | string[];
	startDate?: string;
	endDate?: string;
	limit?: number;
	page?: number;
}

export interface EventLogPagination {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	items: EventLog[];
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

/**
 * API service for event logs
 */
export const activityApi = {
	/**
	 * Get event logs for the current user
	 */
	async getCurrentUserEventLogs(
		userId: UserId,
		filters?: EventLogFilters
	): Promise<ApiResponse<EventLogPagination>> {
		const queryParams = new URLSearchParams();

		if (filters?.eventType) {
			if (Array.isArray(filters.eventType)) {
				filters.eventType.forEach((type) => queryParams.append('eventType', type));
			} else {
				queryParams.append('eventType', filters.eventType);
			}
		}

		if (filters?.startDate) {
			queryParams.append('startDate', filters.startDate);
		}

		if (filters?.endDate) {
			queryParams.append('endDate', filters.endDate);
		}

		if (filters?.limit) {
			queryParams.append('limit', filters.limit.toString());
		}

		if (filters?.page) {
			const offset = (filters.page - 1) * (filters.limit || 10);
			queryParams.append('offset', offset.toString());
		}

		const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

		return apiRequest<ApiResponse<EventLogPagination>>({
			url: `/activity/event-logs/user/${userId}`,
			method: 'GET',
			params: Object.fromEntries(queryParams)
		});
	},

	/**
	 * Get event logs for a specific user (admin only)
	 */
	async getUserEventLogs(
		userId: UserId,
		filters?: EventLogFilters
	): Promise<ApiResponse<EventLogPagination>> {
		const queryParams = new URLSearchParams();

		if (filters?.eventType) {
			if (Array.isArray(filters.eventType)) {
				filters.eventType.forEach((type) => queryParams.append('eventType', type));
			} else {
				queryParams.append('eventType', filters.eventType);
			}
		}

		if (filters?.startDate) {
			queryParams.append('startDate', filters.startDate);
		}

		if (filters?.endDate) {
			queryParams.append('endDate', filters.endDate);
		}

		if (filters?.limit) {
			queryParams.append('limit', filters.limit.toString());
		}

		if (filters?.page) {
			const offset = (filters.page - 1) * (filters.limit || 10);
			queryParams.append('offset', offset.toString());
		}

		const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

		return apiRequest<ApiResponse<EventLogPagination>>({
			url: `/activity/event-logs/user/${userId}`,
			method: 'GET',
			params: Object.fromEntries(queryParams)
		});
	},

	/**
	 * Get all event logs (admin only)
	 */
	async getAllEventLogs(filters?: EventLogFilters): Promise<ApiResponse<EventLogPagination>> {
		const queryParams = new URLSearchParams();

		if (filters?.eventType) {
			if (Array.isArray(filters.eventType)) {
				filters.eventType.forEach((type) => queryParams.append('eventType', type));
			} else {
				queryParams.append('eventType', filters.eventType);
			}
		}

		if (filters?.startDate) {
			queryParams.append('startDate', filters.startDate);
		}

		if (filters?.endDate) {
			queryParams.append('endDate', filters.endDate);
		}

		if (filters?.limit) {
			queryParams.append('limit', filters.limit.toString());
		}

		if (filters?.page) {
			const offset = (filters.page - 1) * (filters.limit || 10);
			queryParams.append('offset', offset.toString());
		}

		const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

		return apiRequest<ApiResponse<EventLogPagination>>({
			url: '/activity/event-logs',
			method: 'GET',
			params: Object.fromEntries(queryParams)
		});
	},

	/**
	 * Get event log by ID (admin only)
	 */
	async getEventLogById(id: string): Promise<ApiResponse<EventLog>> {
		return apiRequest<ApiResponse<EventLog>>({
			url: `/activity/event-logs/${id}`,
			method: 'GET'
		});
	},

	/**
	 * Delete event log by ID (admin only)
	 */
	async deleteEventLog(id: string): Promise<ApiResponse<void>> {
		return apiRequest<ApiResponse<void>>({
			url: `/activity/event-logs/${id}`,
			method: 'DELETE'
		});
	}
};
