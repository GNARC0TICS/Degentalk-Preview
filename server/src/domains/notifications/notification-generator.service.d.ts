import type { EventLog } from '@schema';
/**
 * Generates a notification from an event log
 * @param eventLog The event log to generate a notification from
 */
export declare const generateNotificationFromEvent: (eventLog: EventLog) => Promise<{
    id: string;
} | null>;
