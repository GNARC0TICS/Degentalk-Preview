/**
 * Event Notification Listener
 *
 * This module listens for events from the event logger and generates notifications.
 */
import { EventEmitter } from 'events';
import type { EventLog } from '@schema';
export declare const eventEmitter: EventEmitter<[never]>;
export declare const EVENT_LOG_CREATED = "event_log_created";
/**
 * Initialize the event notification listener
 * This should be called when the server starts
 */
export declare function initEventNotificationListener(): void;
/**
 * Emit an event log created event
 * This should be called whenever a new event log is created
 */
export declare function emitEventLogCreated(eventLog: EventLog): void;
