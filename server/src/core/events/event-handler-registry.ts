/**
 * EventBus Handler Registration System
 * 
 * Provides type-safe event handler registration and domain-level event management.
 * Integrates with existing EventBus to enable cross-domain communication.
 * 
 * @author Agent 2 - EventBus Architecture Specialist
 * @priority HIGH - Enables domain decoupling
 */

import { EventBus } from './event-bus';
import { 
  DOMAIN_EVENT_CATALOG, 
  DomainEventName, 
  DomainEventPayload, 
  DomainEventResponse,
  validateEventPayload,
  validateEventResponse
} from '@shared/events/domain-event-catalog';
import { logger } from '@core/logger';

// Handler function type
export type EventHandler<T extends DomainEventName> = (
  payload: DomainEventPayload<T>
) => Promise<DomainEventResponse<T>> | DomainEventResponse<T>;

// Domain handler collection type
export type DomainHandlers = {
  [K in DomainEventName]?: EventHandler<K>;
};

// Handler metadata for monitoring
interface HandlerMetadata {
  domain: string;
  registeredAt: Date;
  callCount: number;
  lastCalled?: Date;
  averageLatency: number;
  errorCount: number;
}

/**
 * EventHandlerRegistry
 * 
 * Manages registration and execution of typed event handlers.
 * Provides validation, monitoring, and error handling.
 */
export class EventHandlerRegistry {
  private handlers = new Map<DomainEventName, Set<EventHandler<any>>>();
  private handlerMetadata = new Map<string, HandlerMetadata>();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventBusListeners();
  }

  /**
   * Register a typed event handler
   */
  register<T extends DomainEventName>(
    eventName: T,
    handler: EventHandler<T>,
    metadata?: { domain?: string; description?: string }
  ): void {
    // Initialize handler set for event
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }

    // Add handler to set
    this.handlers.get(eventName)!.add(handler);

    // Track handler metadata
    const handlerKey = `${eventName}:${metadata?.domain || 'unknown'}`;
    this.handlerMetadata.set(handlerKey, {
      domain: metadata?.domain || 'unknown',
      registeredAt: new Date(),
      callCount: 0,
      averageLatency: 0,
      errorCount: 0
    });

    logger.info('EventRegistry', `Handler registered: ${eventName}`, {
      domain: metadata?.domain,
      totalHandlers: this.handlers.get(eventName)!.size,
      description: metadata?.description
    });
  }

  /**
   * Register multiple handlers for a domain
   */
  registerDomain(domain: string, handlers: DomainHandlers): void {
    logger.info('EventRegistry', `Registering domain handlers: ${domain}`, {
      eventCount: Object.keys(handlers).length
    });

    Object.entries(handlers).forEach(([eventName, handler]) => {
      if (handler) {
        this.register(
          eventName as DomainEventName, 
          handler,
          { domain, description: `${domain} domain handler` }
        );
      }
    });
  }

  /**
   * Unregister handler
   */
  unregister<T extends DomainEventName>(
    eventName: T,
    handler: EventHandler<T>
  ): boolean {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const removed = handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventName);
      }
      return removed;
    }
    return false;
  }

  /**
   * Get registered handlers for an event
   */
  getHandlers<T extends DomainEventName>(eventName: T): Set<EventHandler<T>> {
    return this.handlers.get(eventName) || new Set();
  }

  /**
   * Get handler statistics
   */
  getHandlerStats(domain?: string): HandlerMetadata[] {
    const stats = Array.from(this.handlerMetadata.entries()).map(([key, metadata]) => ({
      ...metadata,
      handlerKey: key
    }));

    if (domain) {
      return stats.filter(stat => stat.domain === domain);
    }

    return stats;
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents(): DomainEventName[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if event has handlers
   */
  hasHandlers(eventName: DomainEventName): boolean {
    const handlers = this.handlers.get(eventName);
    return handlers ? handlers.size > 0 : false;
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
    this.handlerMetadata.clear();
    logger.info('EventRegistry', 'All handlers cleared');
  }

  /**
   * Setup EventBus listeners for registered events
   */
  private setupEventBusListeners(): void {
    // Listen to all possible events
    Object.keys(DOMAIN_EVENT_CATALOG).forEach(eventName => {
      this.eventBus.on(eventName, async (event) => {
        await this.handleEvent(eventName as DomainEventName, event);
      });
    });
  }

  /**
   * Handle incoming event with validation and error handling
   */
  private async handleEvent<T extends DomainEventName>(
    eventName: T,
    event: any
  ): Promise<void> {
    const handlers = this.handlers.get(eventName);
    if (!handlers || handlers.size === 0) {
      logger.debug('EventRegistry', `No handlers for event: ${eventName}`);
      return;
    }

    try {
      // Validate event payload
      const validatedPayload = validateEventPayload(eventName, event.payload || event);

      // Execute all handlers concurrently
      const handlerPromises = Array.from(handlers).map(async (handler) => {
        const startTime = process.hrtime.bigint();
        const handlerKey = `${eventName}:${this.getHandlerDomain(handler)}`;

        try {
          // Execute handler
          const result = await handler(validatedPayload);

          // Validate response if expected
          if (DOMAIN_EVENT_CATALOG[eventName].response !== undefined) {
            validateEventResponse(eventName, result);
          }

          // Update metrics
          this.updateHandlerMetrics(handlerKey, startTime, false);

          return result;

        } catch (error) {
          // Update error metrics
          this.updateHandlerMetrics(handlerKey, startTime, true);

          logger.error('EventRegistry', `Handler error for ${eventName}`, {
            error: error instanceof Error ? error.message : String(error),
            handlerKey,
            payload: validatedPayload
          });

          // Don't throw - let other handlers continue
          return null;
        }
      });

      await Promise.allSettled(handlerPromises);

    } catch (error) {
      logger.error('EventRegistry', `Event validation error for ${eventName}`, {
        error: error instanceof Error ? error.message : String(error),
        event
      });
    }
  }

  /**
   * Update handler performance metrics
   */
  private updateHandlerMetrics(
    handlerKey: string,
    startTime: bigint,
    isError: boolean
  ): void {
    const metadata = this.handlerMetadata.get(handlerKey);
    if (!metadata) return;

    const duration = Number(process.hrtime.bigint() - startTime) / 1e6; // Convert to ms

    // Update metrics
    metadata.callCount++;
    metadata.lastCalled = new Date();
    metadata.averageLatency = (
      (metadata.averageLatency * (metadata.callCount - 1) + duration) / 
      metadata.callCount
    );

    if (isError) {
      metadata.errorCount++;
    }
  }

  /**
   * Get domain for handler (best effort)
   */
  private getHandlerDomain(handler: EventHandler<any>): string {
    // Try to extract domain from handler name or metadata
    const handlerName = handler.name || 'anonymous';
    
    // Look for domain in function name
    for (const [key, metadata] of this.handlerMetadata.entries()) {
      if (key.includes(handlerName)) {
        return metadata.domain;
      }
    }

    return 'unknown';
  }
}

/**
 * Request-Response Event Helper
 * 
 * Provides typed request-response pattern for events that return data.
 */
export class EventRequester {
  constructor(private eventBus: EventBus) {}

  /**
   * Make a typed request and wait for response
   */
  async request<T extends DomainEventName>(
    eventName: T,
    payload: DomainEventPayload<T>,
    options?: {
      timeout?: number;
      correlationId?: string;
    }
  ): Promise<DomainEventResponse<T>> {
    const timeout = options?.timeout || 5000;
    const correlationId = options?.correlationId || this.generateCorrelationId();

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error(`Event ${eventName} request timed out after ${timeout}ms`));
      }, timeout);

      // Listen for response
      const responseEvent = `${eventName}.response.${correlationId}`;
      
      this.eventBus.once(responseEvent, (response) => {
        clearTimeout(timeoutHandle);
        
        try {
          const validatedResponse = validateEventResponse(eventName, response);
          resolve(validatedResponse);
        } catch (error) {
          reject(new Error(`Invalid response for ${eventName}: ${error}`));
        }
      });

      // Send request with correlation ID
      const requestPayload = {
        ...payload,
        correlationId,
        timestamp: Date.now()
      };

      this.eventBus.emit({
        type: eventName,
        payload: requestPayload,
        metadata: {
          correlationId,
          timestamp: new Date(),
          version: 1
        }
      });
    });
  }

  /**
   * Generate unique correlation ID
   */
  private generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instances for easy access
export let eventRegistry: EventHandlerRegistry;
export let eventRequester: EventRequester;

/**
 * Initialize event system
 */
export function initializeEventSystem(eventBus: EventBus): void {
  eventRegistry = new EventHandlerRegistry(eventBus);
  eventRequester = new EventRequester(eventBus);
  
  logger.info('EventRegistry', 'Event system initialized', {
    availableEvents: Object.keys(DOMAIN_EVENT_CATALOG).length,
    catalogVersion: '1.0.0'
  });
}

// Export for domain registration
export { DOMAIN_EVENT_CATALOG, DomainEventName, DomainEventPayload, DomainEventResponse };