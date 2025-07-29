import { db } from '@db';
import { eventLogs } from '@schema/system/event_logs';
import { users } from '@schema/user/users';
import { eq, and, gte, lte, desc, inArray } from 'drizzle-orm';
/**
 * Service for managing event logs
 */
export class EventLogService {
    /**
     * Create a new event log entry
     */
    async createEventLog(data) {
        const [result] = await db.insert(eventLogs).values(data).returning({ id: eventLogs.id });
        return result;
    }
    /**
     * Get event logs for a specific user with pagination
     */
    async getUserEventLogs(filters) {
        const { userId, eventType, startDate, endDate, limit = 10, offset = 0 } = filters;
        const page = Math.floor(offset / limit) + 1;
        // Build the where clause based on filters
        const whereClause = [];
        if (userId) {
            whereClause.push(eq(eventLogs.userId, userId));
        }
        if (eventType) {
            if (Array.isArray(eventType)) {
                whereClause.push(inArray(eventLogs.eventType, eventType));
            }
            else {
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
    async getAllEventLogs(filters) {
        return this.getUserEventLogs(filters);
    }
    /**
     * Get event log by ID
     */
    async getEventLogById(id) {
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
    async deleteEventLog(id) {
        const result = await db.delete(eventLogs).where(eq(eventLogs.id, id));
        return result.rowCount > 0;
    }
}
export const eventLogService = new EventLogService();
