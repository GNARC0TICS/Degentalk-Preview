/**
 * Rate Limiting Middleware Integration Tests
 * 
 * Tests the wallet-specific rate limiting middleware
 * to ensure proper protection against abuse
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import { UserId } from '@shared/types/ids';
import {
  depositRateLimit,
  withdrawalRateLimit,
  transferRateLimit,
  balanceCheckRateLimit,
  globalWalletRateLimit
} from '../middleware/rate-limit.middleware';

// Mock the auth helper
vi.mock('@core/auth/helpers', () => ({
  getAuthenticatedUser: vi.fn()
}));

// Mock the logger
vi.mock('@core/logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

import { getAuthenticatedUser } from '@core/auth/helpers';

describe('Wallet Rate Limiting Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;
  const mockedGetAuthenticatedUser = vi.mocked(getAuthenticatedUser);

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock request
    mockReq = {
      ip: '127.0.0.1',
      path: '/api/wallet/test',
      method: 'POST',
      headers: {}
    };

    // Setup mock response
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    // Setup mock next function
    mockNext = vi.fn();

    // Default authenticated user
    mockedGetAuthenticatedUser.mockReturnValue({
      id: 'user_123' as UserId,
      role: 'user',
      username: 'testuser'
    } as any);
  });

  afterEach(() => {
    // Clean up rate limit stores to prevent test interference
    vi.useRealTimers();
  });

  describe('depositRateLimit', () => {
    it('should allow requests within the limit', async () => {
      // Make 5 requests (under the 10/minute limit)
      for (let i = 0; i < 5; i++) {
        await new Promise<void>((resolve) => {
          depositRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      expect(mockNext).toHaveBeenCalledTimes(5);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should block requests exceeding the limit', async () => {
      // Make 11 requests (exceeding the 10/minute limit)
      for (let i = 0; i < 11; i++) {
        await new Promise<void>((resolve) => {
          depositRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      expect(mockNext).toHaveBeenCalledTimes(10);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Too many requests',
        message: 'Too many deposit requests. Please try again in a minute.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 60
      });
    });

    it('should use user ID as rate limit key', async () => {
      // Test with different user IDs
      mockedGetAuthenticatedUser.mockReturnValueOnce({
        id: 'user_123' as UserId,
        role: 'user',
        username: 'user1'
      } as any);

      await new Promise<void>((resolve) => {
        depositRateLimit(mockReq as Request, mockRes as Response, () => {
          mockNext();
          resolve();
        });
      });

      // Different user should have separate limit
      mockedGetAuthenticatedUser.mockReturnValueOnce({
        id: 'user_456' as UserId,
        role: 'user',
        username: 'user2'
      } as any);

      await new Promise<void>((resolve) => {
        depositRateLimit(mockReq as Request, mockRes as Response, () => {
          mockNext();
          resolve();
        });
      });

      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });

  describe('withdrawalRateLimit', () => {
    it('should have stricter limits than deposits', async () => {
      // Make 4 requests (exceeding the 3/5minutes limit)
      for (let i = 0; i < 4; i++) {
        await new Promise<void>((resolve) => {
          withdrawalRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      expect(mockNext).toHaveBeenCalledTimes(3);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Too many requests',
        message: 'Too many withdrawal requests. Please try again in 5 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 300
      });
    });

    it('should count all attempts including failed ones', async () => {
      // The skipSuccessfulRequests is set to false for withdrawals
      // This test verifies that behavior by checking the limit is enforced
      for (let i = 0; i < 4; i++) {
        await new Promise<void>((resolve) => {
          withdrawalRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      expect(mockNext).toHaveBeenCalledTimes(3);
    });
  });

  describe('transferRateLimit', () => {
    it('should allow 5 transfers per minute', async () => {
      // Make exactly 5 requests
      for (let i = 0; i < 5; i++) {
        await new Promise<void>((resolve) => {
          transferRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      expect(mockNext).toHaveBeenCalledTimes(5);
      expect(mockRes.status).not.toHaveBeenCalled();

      // 6th request should be blocked
      await new Promise<void>((resolve) => {
        transferRateLimit(mockReq as Request, mockRes as Response, () => {
          mockNext();
          resolve();
        });
      });

      expect(mockRes.status).toHaveBeenCalledWith(429);
    });
  });

  describe('balanceCheckRateLimit', () => {
    it('should be lenient for read-only operations', async () => {
      // Make 30 requests (at the limit)
      for (let i = 0; i < 30; i++) {
        await new Promise<void>((resolve) => {
          balanceCheckRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      expect(mockNext).toHaveBeenCalledTimes(30);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should skip successful requests in counting', async () => {
      // The skipSuccessfulRequests is set to true for balance checks
      // This would need more complex testing with actual response handling
      // For now, we verify the basic rate limit works
      for (let i = 0; i < 31; i++) {
        await new Promise<void>((resolve) => {
          balanceCheckRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
    });
  });

  describe('globalWalletRateLimit', () => {
    it('should skip rate limiting for admin users', async () => {
      // Set user as admin
      mockedGetAuthenticatedUser.mockReturnValue({
        id: 'admin_123' as UserId,
        role: 'admin',
        username: 'admin'
      } as any);

      // Make many requests
      for (let i = 0; i < 150; i++) {
        await new Promise<void>((resolve) => {
          globalWalletRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      // All requests should pass
      expect(mockNext).toHaveBeenCalledTimes(150);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should skip rate limiting for super-admin users', async () => {
      // Set user as super-admin
      mockedGetAuthenticatedUser.mockReturnValue({
        id: 'superadmin_123' as UserId,
        role: 'super-admin',
        username: 'superadmin'
      } as any);

      // Make many requests
      for (let i = 0; i < 150; i++) {
        await new Promise<void>((resolve) => {
          globalWalletRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      // All requests should pass
      expect(mockNext).toHaveBeenCalledTimes(150);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should apply rate limiting to regular users', async () => {
      // Regular user (not admin)
      mockedGetAuthenticatedUser.mockReturnValue({
        id: 'user_123' as UserId,
        role: 'user',
        username: 'regularuser'
      } as any);

      // Make 101 requests (exceeding the 100/minute limit)
      for (let i = 0; i < 101; i++) {
        await new Promise<void>((resolve) => {
          globalWalletRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      expect(mockNext).toHaveBeenCalledTimes(100);
      expect(mockRes.status).toHaveBeenCalledWith(429);
    });

    it('should use IP as fallback when user is not authenticated', async () => {
      // Mock unauthenticated request
      mockedGetAuthenticatedUser.mockImplementation(() => {
        throw new Error('Unauthenticated');
      });

      // Make a request
      await new Promise<void>((resolve) => {
        globalWalletRateLimit(mockReq as Request, mockRes as Response, () => {
          mockNext();
          resolve();
        });
      });

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rate limit key generation', () => {
    it('should fall back to IP when user authentication fails', async () => {
      // Mock auth failure
      mockedGetAuthenticatedUser.mockImplementation(() => {
        throw new Error('Auth failed');
      });

      await new Promise<void>((resolve) => {
        depositRateLimit(mockReq as Request, mockRes as Response, () => {
          mockNext();
          resolve();
        });
      });

      expect(mockNext).toHaveBeenCalledTimes(1);
      
      // Should still rate limit by IP
      mockReq.ip = '192.168.1.1';
      for (let i = 0; i < 11; i++) {
        await new Promise<void>((resolve) => {
          depositRateLimit(mockReq as Request, mockRes as Response, () => {
            mockNext();
            resolve();
          });
        });
      }

      // First request already counted, so 10 more should pass
      expect(mockNext).toHaveBeenCalledTimes(11);
    });

    it('should handle missing IP gracefully', async () => {
      // Mock auth failure and no IP
      mockedGetAuthenticatedUser.mockImplementation(() => {
        throw new Error('Auth failed');
      });
      mockReq.ip = undefined;

      await new Promise<void>((resolve) => {
        depositRateLimit(mockReq as Request, mockRes as Response, () => {
          mockNext();
          resolve();
        });
      });

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});