/**
 * Event Notification Listener
 * 
 * This module listens for events from the event logger and generates notifications.
 */
import { EventEmitter } from 'events';
import { generateNotificationFromEvent } from './notification-generator.service';
import { logger } from '@server/src/core/logger';
import type { EventLog } from '@schema';

// Create a global event emitter for event logs
export const eventEmitter = new EventEmitter();

// Event name constants
export const EVENT_LOG_CREATED = 'event_log_created';

/**
 * Initialize the event notification listener
 * This should be called when the server starts
 */
export function initEventNotificationListener() {
  // Listen for new event logs
  eventEmitter.on(EVENT_LOG_CREATED, async (eventLog: EventLog) => {
    try {
      // Generate notification from event
      const notification = await generateNotificationFromEvent(eventLog);
      
      if (notification) {
        logger.info('NOTIFICATIONS', `Created notification ${notification.id} from event ${eventLog.id}`);
      }
    } catch (error) {
      logger.error('NOTIFICATIONS', 'Error generating notification from event', error);
    }
  });

  logger.info('NOTIFICATIONS', 'Event notification listener initialized');
}

/**
 * Emit an event log created event
 * This should be called whenever a new event log is created
 */
export function emitEventLogCreated(eventLog: EventLog) {
  eventEmitter.emit(EVENT_LOG_CREATED, eventLog);
} 