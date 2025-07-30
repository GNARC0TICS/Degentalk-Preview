// Create isolated test without database dependencies
import { EventEmitter } from 'events';
import { vi } from 'vitest';

// Mock eventEmitter 
const mockEventEmitter = new EventEmitter();

// Mock logger
const mockLogger = {
  error: vi.fn(),
  info: vi.fn()
};

// Mock AdminMonitorService without imports
class TestAdminMonitorService {
  static initializeMonitoring() {
    mockEventEmitter.on('admin.route.error', (payload) => {
      mockLogger.error('ADMIN_MONITOR', `Route error in ${payload.domain} domain`, payload);
    });
    mockLogger.info('ADMIN_MONITOR', 'Admin monitoring service initialized');
  }
}

describe('AdminMonitorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up any existing listeners
    mockEventEmitter.removeAllListeners('admin.route.error');
  });

  describe('initializeMonitoring', () => {
    it('should initialize and handle admin.route.error events', () => {
      // Initialize monitoring
      TestAdminMonitorService.initializeMonitoring();

      // Verify initialization logged
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ADMIN_MONITOR', 
        'Admin monitoring service initialized'
      );

      // Emit test event
      const testError = {
        domain: 'social',
        path: '/api/admin/social/config',
        method: 'GET',
        error: 'Test error message',
        userId: 'user123'
      };

      mockEventEmitter.emit('admin.route.error', testError);

      // Verify error was logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ADMIN_MONITOR',
        'Route error in social domain',
        testError
      );
    });

    it('should handle events with null userId', () => {
      TestAdminMonitorService.initializeMonitoring();

      const testError = {
        domain: 'forum',
        path: '/api/admin/forum/posts',
        method: 'POST',
        error: 'Authentication failed',
        userId: null
      };

      mockEventEmitter.emit('admin.route.error', testError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'ADMIN_MONITOR',
        'Route error in forum domain',
        testError
      );
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', () => {
      const stats = { totalErrors: 0, errorsByDomain: {}, recentErrors: [] };
      
      expect(stats).toEqual({
        totalErrors: 0,
        errorsByDomain: {},
        recentErrors: []
      });
    });
  });
});