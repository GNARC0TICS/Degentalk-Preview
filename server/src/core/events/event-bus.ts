import { logger } from '@core/logger';
import { v4 as uuidv4 } from 'uuid';
import type { DomainEvent, EventHandler, EventMiddleware } from './types';

/**
 * Central event bus for domain communication
 * 
 * Usage:
 * ```typescript
 * // Emit an event
 * EventBus.emit({
 *   type: 'user.registered',
 *   payload: { userId: '123', email: 'user@example.com' },
 *   metadata: { timestamp: new Date(), correlationId: '...' }
 * });
 * 
 * // Listen to events
 * const unsubscribe = EventBus.on('user.registered', async (event) => {
 *   console.log('User registered:', event.payload);
 * });
 * ```
 */
export class EventBus {
  private static handlers = new Map<string, Set<EventHandler>>();
  private static middleware: EventMiddleware[] = [];
  private static isDebugMode = process.env.EVENT_BUS_DEBUG === 'true';
  
  /**
   * Emit an event to all registered handlers
   */
  static emit<T>(event: DomainEvent<T>): void {
    // Ensure event has required metadata
    const enrichedEvent: DomainEvent<T> = {
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: event.metadata?.timestamp || new Date(),
        correlationId: event.metadata?.correlationId || uuidv4(),
        version: event.metadata?.version || 1
      }
    };
    
    if (this.isDebugMode) {
      logger.debug('EVENT_BUS', `Emitting: ${enrichedEvent.type}`, {
        correlationId: enrichedEvent.metadata.correlationId,
        payload: enrichedEvent.payload
      });
    } else {
      logger.info('EVENT_BUS', `Emitting: ${enrichedEvent.type}`, {
        correlationId: enrichedEvent.metadata.correlationId,
        userId: enrichedEvent.metadata.userId
      });
    }
    
    // Run middleware
    this.middleware.forEach(mw => {
      try {
        mw(enrichedEvent);
      } catch (error) {
        logger.error('EVENT_BUS', 'Middleware error', { error, event: enrichedEvent.type });
      }
    });
    
    // Get handlers for this event type
    const handlers = this.handlers.get(enrichedEvent.type);
    if (!handlers || handlers.size === 0) {
      if (this.isDebugMode) {
        logger.warn('EVENT_BUS', `No handlers for event: ${enrichedEvent.type}`);
      }
      return;
    }
    
    // Execute handlers asynchronously
    handlers.forEach(handler => {
      // Wrap in Promise to handle both sync and async handlers
      Promise.resolve(handler(enrichedEvent)).catch(error => {
        logger.error('EVENT_BUS', `Handler error for ${enrichedEvent.type}`, {
          error,
          correlationId: enrichedEvent.metadata.correlationId,
          handler: handler.name || 'anonymous'
        });
      });
    });
  }
  
  /**
   * Subscribe to an event type
   * @returns Unsubscribe function
   */
  static on<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    const handlers = this.handlers.get(eventType)!;
    handlers.add(handler);
    
    if (this.isDebugMode) {
      logger.debug('EVENT_BUS', `Handler registered for: ${eventType}`, {
        handlerCount: handlers.size
      });
    }
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(eventType);
        }
      }
    };
  }
  
  /**
   * Subscribe to an event type (one-time only)
   */
  static once<T>(eventType: string, handler: EventHandler<T>): () => void {
    const wrappedHandler: EventHandler<T> = (event) => {
      unsubscribe();
      return handler(event);
    };
    const unsubscribe = this.on(eventType, wrappedHandler);
    return unsubscribe;
  }
  
  /**
   * Add middleware that runs for all events
   */
  static use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
  }
  
  /**
   * Remove all handlers and middleware (useful for testing)
   */
  static clear(): void {
    this.handlers.clear();
    this.middleware = [];
  }
  
  /**
   * Get handler count for an event type (useful for testing/debugging)
   */
  static getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0;
  }
  
  /**
   * Get all registered event types
   */
  static getEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Add metrics middleware in production
if (process.env.NODE_ENV === 'production') {
  EventBus.use((event) => {
    // Track event metrics
    const eventType = event.type.split('.')[0]; // Get domain from event type
    // TODO: Send to metrics service
  });
}