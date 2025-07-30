/**
 * EventBus Testing Utilities
 * 
 * Comprehensive testing utilities for event-driven architecture.
 * Provides mocking, validation, and assertion helpers for EventBus testing.
 * 
 * @author Agent 2 - EventBus Architecture Specialist
 * @priority MEDIUM - Enables reliable testing of event patterns
 */

import { EventEmitter } from 'events';
import { 
  DOMAIN_EVENT_CATALOG, 
  DomainEventName, 
  DomainEventPayload, 
  DomainEventResponse,
  validateEventPayload,
  validateEventResponse
} from '@shared/events/domain-event-catalog';
import type { DomainEvent } from '../types';

// Test event record
interface TestEventRecord {
  eventName: DomainEventName;
  payload: unknown;
  timestamp: number;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

// Mock response configuration
type MockResponseConfig<T extends DomainEventName> = {
  [K in T]: DomainEventResponse<K>;
};

/**
 * EventBus Mock for Testing
 * 
 * Drop-in replacement for EventBus in tests with enhanced debugging capabilities.
 */
export class EventBusMock extends EventEmitter {
  private emittedEvents: TestEventRecord[] = [];
  private requestedEvents: TestEventRecord[] = [];
  private mockResponses = new Map<DomainEventName, unknown>();
  private handlerCallbacks = new Map<DomainEventName, Function[]>();
  private eventLatencies = new Map<string, number>();

  constructor() {
    super();
    this.setMaxListeners(100); // Increase for testing
  }

  /**
   * Mock event emission with validation
   */
  async emit<T extends DomainEventName>(
    event: DomainEvent<DomainEventPayload<T>>
  ): Promise<void> {
    const eventName = event.type as T;
    
    try {
      // Validate payload against schema
      const validatedPayload = validateEventPayload(eventName, event.payload);
      
      // Record emission
      this.recordEvent('emit', eventName, validatedPayload, event.metadata);
      
      // Execute registered handlers
      const handlers = this.handlerCallbacks.get(eventName) || [];
      await Promise.all(handlers.map(handler => handler(validatedPayload)));
      
      // Emit to EventEmitter listeners
      super.emit(eventName, event);
      
    } catch (error) {
      throw new Error(`Event emission failed for ${eventName}: ${error}`);
    }
  }

  /**
   * Mock request-response pattern
   */
  async request<T extends DomainEventName>(
    eventName: T,
    payload: DomainEventPayload<T>,
    options?: { timeout?: number; correlationId?: string }
  ): Promise<DomainEventResponse<T>> {
    const startTime = Date.now();
    
    try {
      // Validate payload
      const validatedPayload = validateEventPayload(eventName, payload);
      
      // Record request
      this.recordEvent('request', eventName, validatedPayload, {
        correlationId: options?.correlationId,
        timeout: options?.timeout
      });
      
      // Get mock response
      const mockResponse = this.getMockResponse(eventName);
      
      // Validate response
      const validatedResponse = validateEventResponse(eventName, mockResponse);
      
      // Record latency
      const latency = Date.now() - startTime;
      this.eventLatencies.set(`${eventName}_${Date.now()}`, latency);
      
      return validatedResponse;
      
    } catch (error) {
      throw new Error(`Event request failed for ${eventName}: ${error}`);
    }
  }

  /**
   * Register mock handler
   */
  onEvent<T extends DomainEventName>(
    eventName: T,
    handler: (payload: DomainEventPayload<T>) => Promise<void> | void
  ): void {
    if (!this.handlerCallbacks.has(eventName)) {
      this.handlerCallbacks.set(eventName, []);
    }
    this.handlerCallbacks.get(eventName)!.push(handler);
  }

  /**
   * Set mock response for event
   */
  mockResponse<T extends DomainEventName>(
    eventName: T,
    response: DomainEventResponse<T>
  ): void {
    this.mockResponses.set(eventName, response);
  }

  /**
   * Set multiple mock responses
   */
  mockResponses<T extends DomainEventName>(
    responses: Partial<MockResponseConfig<T>>
  ): void {
    Object.entries(responses).forEach(([eventName, response]) => {
      this.mockResponses.set(eventName as DomainEventName, response);
    });
  }

  // ===== ASSERTION HELPERS =====
  
  /**
   * Assert event was emitted
   */
  expectEventEmitted(eventName: DomainEventName): boolean {
    return this.emittedEvents.some(event => event.eventName === eventName);
  }

  /**
   * Assert event was emitted with specific payload
   */
  expectEventEmittedWith<T extends DomainEventName>(
    eventName: T,
    expectedPayload: Partial<DomainEventPayload<T>>
  ): boolean {
    return this.emittedEvents.some(event => {
      if (event.eventName !== eventName) return false;
      
      return Object.entries(expectedPayload).every(([key, value]) => {
        const payload = event.payload as DomainEventPayload<T>;
        return payload[key as keyof DomainEventPayload<T>] === value;
      });
    });
  }

  /**
   * Assert event was requested
   */
  expectEventRequested(eventName: DomainEventName): boolean {
    return this.requestedEvents.some(event => event.eventName === eventName);
  }

  /**
   * Get event emission count
   */
  getEventEmissionCount(eventName?: DomainEventName): number {
    if (eventName) {
      return this.emittedEvents.filter(e => e.eventName === eventName).length;
    }
    return this.emittedEvents.length;
  }

  /**
   * Get all emitted events
   */
  getEmittedEvents(eventName?: DomainEventName): TestEventRecord[] {
    if (eventName) {
      return this.emittedEvents.filter(e => e.eventName === eventName);
    }
    return [...this.emittedEvents];
  }

  /**
   * Get all requested events
   */
  getRequestedEvents(eventName?: DomainEventName): TestEventRecord[] {
    if (eventName) {
      return this.requestedEvents.filter(e => e.eventName === eventName);
    }
    return [...this.requestedEvents];
  }

  /**
   * Get average event latency
   */
  getAverageEventLatency(eventName?: DomainEventName): number {
    const latencies = Array.from(this.eventLatencies.entries());
    
    if (eventName) {
      const filteredLatencies = latencies
        .filter(([key]) => key.startsWith(eventName))
        .map(([, latency]) => latency);
      
      return filteredLatencies.length > 0 
        ? filteredLatencies.reduce((sum, lat) => sum + lat, 0) / filteredLatencies.length
        : 0;
    }
    
    const values = Array.from(this.eventLatencies.values());
    return values.length > 0 
      ? values.reduce((sum, lat) => sum + lat, 0) / values.length
      : 0;
  }

  /**
   * Reset all recorded events and mocks
   */
  reset(): void {
    this.emittedEvents = [];
    this.requestedEvents = [];
    this.mockResponses.clear();
    this.handlerCallbacks.clear();
    this.eventLatencies.clear();
    this.removeAllListeners();
  }

  /**
   * Get test summary
   */
  getTestSummary(): {
    totalEmissions: number;
    totalRequests: number;
    uniqueEvents: string[];
    averageLatency: number;
    mockResponsesSet: number;
  } {
    const uniqueEvents = Array.from(new Set([
      ...this.emittedEvents.map(e => e.eventName),
      ...this.requestedEvents.map(e => e.eventName)
    ]));

    return {
      totalEmissions: this.emittedEvents.length,
      totalRequests: this.requestedEvents.length,
      uniqueEvents,
      averageLatency: this.getAverageEventLatency(),
      mockResponsesSet: this.mockResponses.size
    };
  }

  // ===== PRIVATE HELPERS =====

  private recordEvent(
    type: 'emit' | 'request',
    eventName: DomainEventName,
    payload: unknown,
    metadata?: Record<string, unknown>
  ): void {
    const record: TestEventRecord = {
      eventName,
      payload,
      timestamp: Date.now(),
      correlationId: metadata?.correlationId as string,
      metadata
    };

    if (type === 'emit') {
      this.emittedEvents.push(record);
    } else {
      this.requestedEvents.push(record);
    }
  }

  private getMockResponse<T extends DomainEventName>(
    eventName: T
  ): DomainEventResponse<T> {
    // Return configured mock response
    if (this.mockResponses.has(eventName)) {
      return this.mockResponses.get(eventName) as DomainEventResponse<T>;
    }

    // Generate default mock response based on event definition
    return this.generateDefaultResponse(eventName);
  }

  private generateDefaultResponse<T extends DomainEventName>(
    eventName: T
  ): DomainEventResponse<T> {
    const responseSchema = DOMAIN_EVENT_CATALOG[eventName].response;
    
    // If response is void, return undefined
    if (responseSchema === undefined || responseSchema._def?.typeName === 'ZodVoid') {
      return undefined as DomainEventResponse<T>;
    }

    // Generate mock data based on schema type
    if (responseSchema._def?.typeName === 'ZodObject') {
      const mockData: any = {};
      const shape = responseSchema._def.shape();
      
      Object.entries(shape).forEach(([key, schema]: [string, any]) => {
        mockData[key] = this.generateMockValue(schema);
      });
      
      return mockData as DomainEventResponse<T>;
    }

    // Fallback for other schema types
    return this.generateMockValue(responseSchema) as DomainEventResponse<T>;
  }

  private generateMockValue(schema: any): unknown {
    const typeName = schema._def?.typeName;
    
    switch (typeName) {
      case 'ZodString':
        return 'mock-string';
      case 'ZodNumber':
        return 123;
      case 'ZodBoolean':
        return true;
      case 'ZodArray':
        return [];
      case 'ZodDate':
        return new Date();
      case 'ZodLiteral':
        return schema._def.value;
      case 'ZodEnum':
        return schema._def.values[0];
      default:
        return null;
    }
  }
}

/**
 * Event Test Helpers
 */
export class EventTestHelpers {
  /**
   * Create test event payload
   */
  static createTestPayload<T extends DomainEventName>(
    eventName: T,
    overrides?: Partial<DomainEventPayload<T>>
  ): DomainEventPayload<T> {
    const basePayload = this.generateBasePayload(eventName);
    return { ...basePayload, ...overrides } as DomainEventPayload<T>;
  }

  /**
   * Validate event payload structure
   */
  static validatePayloadStructure<T extends DomainEventName>(
    eventName: T,
    payload: unknown
  ): { valid: boolean; errors: string[] } {
    try {
      validateEventPayload(eventName, payload);
      return { valid: true, errors: [] };
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => e.message) || [error.message];
      return { valid: false, errors };
    }
  }

  /**
   * Generate base payload for event
   */
  private static generateBasePayload(eventName: DomainEventName): any {
    // Generate minimal valid payload for testing
    const schema = DOMAIN_EVENT_CATALOG[eventName].payload;
    const mockData: any = {};
    
    if (schema._def?.typeName === 'ZodObject') {
      const shape = schema._def.shape();
      
      Object.entries(shape).forEach(([key, fieldSchema]: [string, any]) => {
        if (!fieldSchema.isOptional?.()) {
          mockData[key] = this.generateMockValue(fieldSchema);
        }
      });
    }
    
    return mockData;
  }

  private static generateMockValue(schema: any): unknown {
    const typeName = schema._def?.typeName;
    
    switch (typeName) {
      case 'ZodString':
        if (schema._def.checks?.some((c: any) => c.kind === 'uuid')) {
          return '123e4567-e89b-12d3-a456-426614174000';
        }
        return 'test-string';
      case 'ZodNumber':
        return schema._def.checks?.some((c: any) => c.kind === 'min' && c.value > 0) ? 1 : 0;
      case 'ZodBoolean':
        return false;
      case 'ZodArray':
        return [];
      case 'ZodDate':
        return new Date();
      case 'ZodLiteral':
        return schema._def.value;
      case 'ZodEnum':
        return schema._def.values[0];
      case 'ZodBranded':
        return this.generateMockValue(schema._def.type);
      default:
        return 'mock-value';
    }
  }
}

/**
 * Jest Custom Matchers
 */
export const eventMatchers = {
  toHaveEmittedEvent(eventBusMock: EventBusMock, eventName: DomainEventName) {
    const pass = eventBusMock.expectEventEmitted(eventName);
    return {
      pass,
      message: () => pass 
        ? `Expected event ${eventName} not to have been emitted`
        : `Expected event ${eventName} to have been emitted`
    };
  },

  toHaveEmittedEventWith<T extends DomainEventName>(
    eventBusMock: EventBusMock, 
    eventName: T, 
    payload: Partial<DomainEventPayload<T>>
  ) {
    const pass = eventBusMock.expectEventEmittedWith(eventName, payload);
    return {
      pass,
      message: () => pass
        ? `Expected event ${eventName} not to have been emitted with payload`
        : `Expected event ${eventName} to have been emitted with payload`
    };
  },

  toHaveRequestedEvent(eventBusMock: EventBusMock, eventName: DomainEventName) {
    const pass = eventBusMock.expectEventRequested(eventName);
    return {
      pass,
      message: () => pass
        ? `Expected event ${eventName} not to have been requested`
        : `Expected event ${eventName} to have been requested`
    };
  }
};

/**
 * Test Utilities Export
 */
export const EventTestUtils = {
  EventBusMock,
  EventTestHelpers,
  eventMatchers
};

export default EventTestUtils;