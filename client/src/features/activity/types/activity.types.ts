import type { UserId } from '@shared/types/ids';

export interface EventLog {
	id: string;
	userId: UserId;
	userName?: string;
	eventType: string;
	eventData: Record<string, any>;
	createdAt: string;
	metadata?: Record<string, any>;
	meta?: Record<string, any>;
	username?: string;
	// User relation for joined queries
	user?: {
		id: UserId;
		username: string;
		avatarUrl?: string;
	};
}

export interface EventLogFilters {
	eventType?: string | string[];
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
	userId?: UserId;
	structureId?: string;
}

export interface EventLogPagination {
	data: EventLog[];
	items?: EventLog[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalItems?: number;
		pages: number;
		totalPages: number; // Make required for consistency
	};
}