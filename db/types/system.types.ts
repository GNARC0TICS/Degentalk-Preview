import type { EventLog } from "../schema/system/event_logs";
import type { User } from "../schema/user/users";

export interface EventLogWithUser extends EventLog {
  user: User;
}

export interface EventLogFilters {
  userId?: string;
  eventType?: string | string[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface EventLogPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: EventLogWithUser[];
}

export const __ensureModule = true; 