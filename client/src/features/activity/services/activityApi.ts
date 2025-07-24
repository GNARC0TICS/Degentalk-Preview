import { apiRequest } from '@app/utils/queryClient';
import type { UserId } from '@shared/types/ids';
import type {
	EventLog,
	EventLogFilters,
	EventLogPagination
} from '@app/features/activity/types/activity.types';

// Re-export types for components
export type { EventLog, EventLogFilters, EventLogPagination };

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
	): Promise<EventLogPagination> {
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

		return apiRequest<EventLogPagination>({
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
	): Promise<EventLogPagination> {
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

		return apiRequest<EventLogPagination>({
			url: `/activity/event-logs/user/${userId}`,
			method: 'GET',
			params: Object.fromEntries(queryParams)
		});
	},

	/**
	 * Get all event logs (admin only)
	 */
	async getAllEventLogs(filters?: EventLogFilters): Promise<EventLogPagination> {
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

		return apiRequest<EventLogPagination>({
			url: '/activity/event-logs',
			method: 'GET',
			params: Object.fromEntries(queryParams)
		});
	},

	/**
	 * Get event log by ID (admin only)
	 */
	async getEventLogById(id: string): Promise<EventLog> {
		return apiRequest<EventLog>({
			url: `/activity/event-logs/${id}`,
			method: 'GET'
		});
	},

	/**
	 * Delete event log by ID (admin only)
	 */
	async deleteEventLog(id: string): Promise<void> {
		return apiRequest<void>({
			url: `/activity/event-logs/${id}`,
			method: 'DELETE'
		});
	}
};
