/**
 * Event Notification Listener
 *
 * This module listens for events from the event logger and generates notifications.
 * Enhanced with type safety while maintaining backward compatibility.
 */
import { EventEmitter } from 'events';
import { generateNotificationFromEvent } from './notification-generator.service';
import { logger } from '@core/logger';
import { z } from 'zod';
// Domain event schemas for type safety
export const DomainEvents = {
    // Existing notification events (maintain compatibility)
    'event_log_created': z.object({
        id: z.string(),
        type: z.string(),
        data: z.record(z.unknown()),
        timestamp: z.date().optional()
    }),
    // Admin events (for fixing the 40+ admin imports)
    'admin.user.banned': z.object({
        userId: z.string(),
        adminId: z.string(),
        reason: z.string(),
        duration: z.number().optional()
    }),
    // XP events (for fixing the 6+ xp service imports)
    'xp.award': z.object({
        userId: z.string(),
        amount: z.number(),
        reason: z.string(),
        metadata: z.record(z.unknown()).optional()
    }),
    // Admin monitoring events (for fixing admin middleware imports)
    'admin.route.error': z.object({
        domain: z.enum(['users', 'forum', 'admin', 'wallet', 'collectibles', 'gamification', 'themes', 'shoutbox', 'advertising', 'xp']),
        error: z.union([
            z.string(),
            z.object({
                message: z.string(),
                stack: z.string().optional(),
                name: z.string(),
                code: z.string().optional()
            })
        ]),
        timestamp: z.date(),
        userId: z.string().nullable(),
        correlationId: z.string().uuid(),
        path: z.string(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'])
    }),
    // Admin error events (for fixing admin error imports)
    'admin.error.occurred': z.object({
        domain: z.enum(['users', 'forum', 'admin', 'wallet', 'collectibles', 'gamification', 'themes', 'shoutbox', 'advertising', 'xp']),
        error: z.object({
            message: z.string(),
            name: z.string(),
            code: z.string().optional()
        }),
        timestamp: z.date()
    })
};
// Performance metrics and circuit breaker
const eventMetrics = {
    emitted: 0,
    handled: 0,
    failed: 0,
    avgHandleTime: 0,
    startTime: Date.now()
};
const CIRCUIT_BREAKER_CONFIG = {
    MAX_EVENTS_PER_SECOND: 1000,
    MAX_FAILURES_PER_MINUTE: 100,
    CIRCUIT_OPEN_DURATION_MS: 30000
};
let eventRateCounter = 0;
let failureCounter = 0;
let circuitOpen = false;
let circuitOpenTime = 0;
// Reset counters every second
setInterval(() => { eventRateCounter = 0; }, 1000);
setInterval(() => { failureCounter = 0; }, 60000);
// Enhanced EventEmitter class with type safety
class TypedEventEmitter extends EventEmitter {
    emit(event, payload, ...args) {
        // Circuit breaker check
        if (circuitOpen) {
            if (Date.now() - circuitOpenTime > CIRCUIT_BREAKER_CONFIG.CIRCUIT_OPEN_DURATION_MS) {
                circuitOpen = false;
                logger.info('EVENT_EMITTER', 'Circuit breaker closed, resuming events');
            }
            else {
                logger.warn('EVENT_EMITTER', 'Circuit breaker open, dropping event', { event });
                return false;
            }
        }
        // Rate limiting
        if (++eventRateCounter > CIRCUIT_BREAKER_CONFIG.MAX_EVENTS_PER_SECOND) {
            logger.error('EVENT_EMITTER', 'Event rate limit exceeded', {
                event,
                ratePerSecond: eventRateCounter
            });
            return false;
        }
        // Metrics tracking
        eventMetrics.emitted++;
        // Validate known domain events
        if (typeof event === 'string' && event in DomainEvents && payload !== undefined) {
            try {
                const schema = DomainEvents[event];
                const validated = schema.parse(payload);
                return super.emit(event, validated);
            }
            catch (error) {
                eventMetrics.failed++;
                failureCounter++;
                // Circuit breaker trip check
                if (failureCounter > CIRCUIT_BREAKER_CONFIG.MAX_FAILURES_PER_MINUTE) {
                    circuitOpen = true;
                    circuitOpenTime = Date.now();
                    logger.error('EVENT_EMITTER', 'Circuit breaker opened due to failures', {
                        failures: failureCounter
                    });
                }
                logger.error('EVENT_EMITTER', `Validation failed for ${event}`, { error, payload });
                return false; // Strict: don't emit invalid events
            }
        }
        // Pass through for existing usage patterns (temporary compatibility)
        return super.emit(event, payload, ...args);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
}
// Create enhanced event emitter (maintains same export name)
export const eventEmitter = new TypedEventEmitter();
// Event name constants
export const EVENT_LOG_CREATED = 'event_log_created';
/**
 * Initialize the event notification listener
 * This should be called when the server starts
 */
export function initEventNotificationListener() {
    // Listen for new event logs
    eventEmitter.on(EVENT_LOG_CREATED, async (eventLog) => {
        try {
            // Generate notification from event
            const notification = await generateNotificationFromEvent(eventLog);
            if (notification) {
                logger.info('NOTIFICATIONS', `Created notification ${notification.id} from event ${eventLog.id}`);
            }
        }
        catch (error) {
            logger.error('NOTIFICATIONS', 'Error generating notification from event', error);
        }
    });
    logger.info('NOTIFICATIONS', 'Event notification listener initialized');
}
/**
 * Emit an event log created event
 * This should be called whenever a new event log is created
 */
export function emitEventLogCreated(eventLog) {
    eventEmitter.emit(EVENT_LOG_CREATED, eventLog);
}
/**
 * Get event performance metrics
 */
export function getEventMetrics() {
    const uptime = Date.now() - eventMetrics.startTime;
    return {
        ...eventMetrics,
        uptime,
        eventsPerSecond: eventMetrics.emitted / (uptime / 1000),
        failureRate: eventMetrics.failed / eventMetrics.emitted || 0,
        circuitBreakerStatus: circuitOpen ? 'OPEN' : 'CLOSED'
    };
}
