import { db } from '../../../core/db';
import { eventLogs } from '@schema/system/event_logs';
import { users } from '@schema/user/users';
import { eq, and, gte, lte, desc, inArray } from 'drizzle-orm';
import type { EventLogFilters, EventLogPagination } from '@db_types/system.types';
import type { InsertEventLog } from '@schema/system/event_logs';

/**
 * Service for managing event logs
 */
export class EventLogService {
	/**
	 * Create a new event log entry
	 */
	async createEventLog(data: InsertEventLog): Promise<{ id: string }> {
		const [result] = await db.insert(eventLogs).values(data).returning({ id: eventLogs.id });
		return result;
	}

	/**
	 * Get event logs for a specific user with pagination
	 */
	async getUserEventLogs(filters: EventLogFilters): Promise<EventLogPagination> {
		const { userId, eventType, startDate, endDate, limit = 10, offset = 0 } = filters;
		const page = Math.floor(offset / limit) + 1;

		// Build the where clause based on filters
		let whereClause = [];

		if (userId) {
			whereClause.push(eq(eventLogs.userId, userId));
		}

		if (eventType) {
			if (Array.isArray(eventType)) {
				whereClause.push(inArray(eventLogs.eventType, eventType));
			} else {
				whereClause.push(eq(eventLogs.eventType, eventType));
			}
		}

		if (startDate) {
			whereClause.push(gte(eventLogs.createdAt, startDate));
		}

		if (endDate) {
			whereClause.push(lte(eventLogs.createdAt, endDate));
		}

		// Get total count for pagination
		const totalItems = await db
			.select({ count: db.fn.count() })
			.from(eventLogs)
			.where(and(...whereClause))
			.then((result) => Number(result[0].count));

		const totalPages = Math.ceil(totalItems / limit);

		// Get the actual data with user info
		const items = await db
			.select({
				id: eventLogs.id,
				userId: eventLogs.userId,
				eventType: eventLogs.eventType,
				relatedId: eventLogs.relatedId,
				meta: eventLogs.meta,
				createdAt: eventLogs.createdAt,
				user: users
			})
			.from(eventLogs)
			.leftJoin(users, eq(eventLogs.userId, users.id))
			.where(and(...whereClause))
			.orderBy(desc(eventLogs.createdAt))
			.limit(limit)
			.offset(offset);

		return {
			page,
			pageSize: limit,
			totalItems,
			totalPages,
			items
		};
	}

	/**
	 * Get all event logs with pagination and filtering
	 */
	async getAllEventLogs(filters: EventLogFilters): Promise<EventLogPagination> {
		return this.getUserEventLogs(filters);
	}

	/**
	 * Get event log by ID
	 */
	async getEventLogById(id: string) {
		const result = await db
			.select({
				id: eventLogs.id,
				userId: eventLogs.userId,
				eventType: eventLogs.eventType,
				relatedId: eventLogs.relatedId,
				meta: eventLogs.meta,
				createdAt: eventLogs.createdAt,
				user: users
			})
			.from(eventLogs)
			.leftJoin(users, eq(eventLogs.userId, users.id))
			.where(eq(eventLogs.id, id))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Delete event log by ID
	 */
	async deleteEventLog(id: string): Promise<boolean> {
		const result = await db.delete(eventLogs).where(eq(eventLogs.id, id));
		return result.rowCount > 0;
	}
}

export const eventLogService = new EventLogService();
