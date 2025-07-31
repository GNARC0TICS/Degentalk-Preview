import type { EventLogFilters, EventLogPagination } from '@shared/types';
import type { InsertEventLog } from '@schema/system/event_logs';
/**
 * Service for managing event logs
 */
export declare class EventLogService {
    /**
     * Create a new event log entry
     */
    createEventLog(data: InsertEventLog): Promise<{
        id: string;
    }>;
    /**
     * Get event logs for a specific user with pagination
     */
    getUserEventLogs(filters: EventLogFilters): Promise<EventLogPagination>;
    /**
     * Get all event logs with pagination and filtering
     */
    getAllEventLogs(filters: EventLogFilters): Promise<EventLogPagination>;
    /**
     * Get event log by ID
     */
    getEventLogById(id: string): Promise<any>;
    /**
     * Delete event log by ID
     */
    deleteEventLog(id: string): Promise<boolean>;
}
export declare const eventLogService: EventLogService;
