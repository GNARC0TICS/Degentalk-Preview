/**
 * Enhanced EventBus Integration Tests
 * 
 * Tests backward compatibility and new type-safe features.
 * Proves that existing code continues to work while new typed methods provide validation.
 * 
 * @author Agent 2 - EventBus Architecture Specialist
 */

import { EventBus } from '../event-bus';
import type { DomainEvent } from '../types';

// Mock the shared imports for testing
jest.mock('@shared/events/domain-event-catalog', () => ({
  DOMAIN_EVENT_CATALOG: {
    'test.event': {
      priority: 'HIGH',
      violations: 5,
      description: 'Test event for validation',
      payload: {
        parse: (data: any) => ({ userId: data.userId, message: data.message }),
        safeParse: (data: any) => ({ 
          success: true, 
          data: { userId: data.userId, message: data.message } 
        })
      },
      response: {
        parse: (data: any) => ({ success: data.success }),
        safeParse: (data: any) => ({ 
          success: true, 
          data: { success: data.success } 
        })
      }
    }
  },
  DomainEventName: {},
  DomainEventPayload: {},
  DomainEventResponse: {},
  validateEventPayload: jest.fn((eventName: string, payload: any) => payload),
  validateEventResponse: jest.fn((eventName: string, response: any) => response)
}));

describe('Enhanced EventBus Integration Tests', () => {
  beforeEach(() => {
    EventBus.clear();
    jest.clearAllMocks();
  });

  describe('Backward Compatibility', () => {
    it('should maintain existing emit() functionality', async () => {
      const handler = jest.fn();
      
      // Register handler using existing method
      EventBus.on('user.registered', handler);
      
      // Emit using existing method
      EventBus.emit({
        type: 'user.registered',
        payload: { userId: '123', email: 'test@example.com' },
        metadata: { timestamp: new Date() }
      });
      
      // Verify handler was called
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user.registered',
          payload: { userId: '123', email: 'test@example.com' }
        })
      );
    });

    it('should maintain existing on() functionality', () => {
      const handler = jest.fn();
      
      const unsubscribe = EventBus.on('test.event', handler);
      
      // Should return unsubscribe function
      expect(typeof unsubscribe).toBe('function');
      
      // Handler should be registered
      expect(EventBus.getHandlerCount('test.event')).toBe(1);
      
      // Unsubscribe should work
      unsubscribe();
      expect(EventBus.getHandlerCount('test.event')).toBe(0);
    });

    it('should maintain existing middleware functionality', () => {
      const middlewareSpy = jest.fn();
      
      EventBus.use(middlewareSpy);
      
      EventBus.emit({
        type: 'test.event',
        payload: { test: true },
        metadata: { timestamp: new Date() }
      });
      
      expect(middlewareSpy).toHaveBeenCalledTimes(1);
    });

    it('should maintain existing once() functionality', () => {
      const handler = jest.fn();
      
      EventBus.once('test.event', handler);
      
      // First emit should trigger handler
      EventBus.emit({
        type: 'test.event',
        payload: { test: 1 },
        metadata: { timestamp: new Date() }
      });
      
      // Second emit should not trigger handler
      EventBus.emit({
        type: 'test.event',
        payload: { test: 2 },
        metadata: { timestamp: new Date() }
      });
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('New Type-Safe Methods', () => {
    it('should validate payload in emitTyped()', () => {
      const mockValidate = require('@shared/events/domain-event-catalog').validateEventPayload;
      
      EventBus.emitTyped('test.event', { userId: '123', message: 'hello' });
      
      expect(mockValidate).toHaveBeenCalledWith('test.event', { userId: '123', message: 'hello' });
    });

    it('should throw validation error for invalid payload', () => {
      const mockValidate = require('@shared/events/domain-event-catalog').validateEventPayload;
      mockValidate.mockImplementationOnce(() => {
        throw new Error('Invalid payload');
      });
      
      expect(() => {
        EventBus.emitTyped('test.event', { invalid: true });
      }).toThrow('Event validation failed for test.event: Error: Invalid payload');
    });

    it('should validate handler responses in onTyped()', async () => {
      const mockValidateResponse = require('@shared/events/domain-event-catalog').validateEventResponse;
      
      const handler = jest.fn().mockResolvedValue({ success: true });
      
      EventBus.onTyped('test.event', handler);
      
      EventBus.emit({
        type: 'test.event',
        payload: { userId: '123', message: 'hello' },
        metadata: { timestamp: new Date() }
      });
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockValidateResponse).toHaveBeenCalledWith('test.event', { success: true });
    });

    it('should provide event catalog information', () => {
      const info = EventBus.getEventInfo('test.event');
      
      expect(info).toEqual({
        priority: 'HIGH',
        violations: 5,
        description: 'Test event for validation',
        hasResponse: true
      });
    });

    it('should validate payloads without emitting', () => {
      const result = EventBus.validatePayload('test.event', { userId: '123', message: 'hello' });
      
      expect(result).toEqual({ valid: true, errors: [] });
    });

    it('should return validation errors for invalid payloads', () => {
      const mockValidate = require('@shared/events/domain-event-catalog').validateEventPayload;
      mockValidate.mockImplementationOnce(() => {
        const error = new Error('Validation failed');
        error.errors = [{ message: 'userId is required' }, { message: 'message is required' }];
        throw error;
      });
      
      const result = EventBus.validatePayload('test.event', {});
      
      expect(result).toEqual({
        valid: false,
        errors: ['userId is required', 'message is required']
      });
    });

    it('should list available typed events', () => {
      const events = EventBus.getAvailableTypedEvents();
      
      expect(events).toContain('test.event');
    });
  });

  describe('Compatibility Between Old and New Methods', () => {
    it('should allow typed emit with untyped handler', () => {
      const handler = jest.fn();
      
      // Register with old method
      EventBus.on('test.event', handler);
      
      // Emit with new method
      EventBus.emitTyped('test.event', { userId: '123', message: 'hello' });
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test.event',
          payload: { userId: '123', message: 'hello' }
        })
      );
    });

    it('should allow untyped emit with typed handler', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });
      
      // Register with new method
      EventBus.onTyped('test.event', handler);
      
      // Emit with old method
      EventBus.emit({
        type: 'test.event',
        payload: { userId: '123', message: 'hello' },
        metadata: { timestamp: new Date() }
      });
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(handler).toHaveBeenCalledWith({ userId: '123', message: 'hello' });
    });
  });

  describe('Error Handling', () => {
    it('should handle handler errors gracefully in onTyped', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Handler failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      EventBus.onTyped('test.event', handler);
      
      EventBus.emit({
        type: 'test.event',
        payload: { userId: '123', message: 'hello' },
        metadata: { timestamp: new Date() }
      });
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(handler).toHaveBeenCalled();
      // Error should be logged but not thrown
      
      consoleSpy.mockRestore();
    });

    it('should handle payload validation errors in handler', async () => {
      const mockValidate = require('@shared/events/domain-event-catalog').validateEventPayload;
      mockValidate.mockImplementationOnce(() => {
        throw new Error('Invalid payload structure');
      });
      
      const handler = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      EventBus.onTyped('test.event', handler);
      
      EventBus.emit({
        type: 'test.event',
        payload: { invalid: true },
        metadata: { timestamp: new Date() }
      });
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Handler should not be called due to validation failure
      expect(handler).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance Impact Assessment', () => {
    it('should not significantly impact untyped event performance', () => {
      const iterations = 1000;
      const handler = jest.fn();
      
      EventBus.on('perf.test', handler);
      
      const start = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        EventBus.emit({
          type: 'perf.test',
          payload: { iteration: i },
          metadata: { timestamp: new Date() }
        });
      }
      
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e6; // Convert to ms
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(100); // 100ms for 1000 events
      expect(handler).toHaveBeenCalledTimes(iterations);
    });

    it('should validate typed events within acceptable time', () => {
      const iterations = 100;
      const handler = jest.fn();
      
      EventBus.onTyped('test.event', handler);
      
      const start = process.hrtime.bigint();
      
      for (let i = 0; i < iterations; i++) {
        EventBus.emitTyped('test.event', { userId: `user-${i}`, message: `message-${i}` });
      }
      
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e6; // Convert to ms
      
      // Typed validation should add minimal overhead
      expect(duration).toBeLessThan(50); // 50ms for 100 validated events
    });
  });
});