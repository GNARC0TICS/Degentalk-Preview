import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import { authenticateJWT } from '../authenticate-jwt';
import * as jwtUtils from '@domains/auth/utils/jwt.utils';
import { userService } from '@core/services/user.service';
import type { AuthenticatedRequest } from '../../types/auth.types';

// Mock dependencies
vi.mock('@domains/auth/utils/jwt.utils');
vi.mock('@core/services/user.service');
vi.mock('@core/logger', () => ({
	logger: {
		error: vi.fn(),
		debug: vi.fn()
	}
}));

describe('authenticateJWT middleware', () => {
	let mockReq: Partial<AuthenticatedRequest>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Setup request mock
		mockReq = {
			headers: {},
			isAuthenticated: vi.fn(() => false),
			user: undefined
		};

		// Setup response mock
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis()
		};

		// Setup next mock
		mockNext = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('JWT Authentication', () => {
		it('should authenticate valid JWT token', async () => {
			// Arrange
			const token = 'valid-jwt-token';
			const userId = 'user-123';
			const mockUser = {
				id: userId,
				username: 'testuser',
				email: 'test@example.com',
				role: 'user',
				xp: 100,
				level: 5,
				isActive: true,
				createdAt: new Date()
			};

			mockReq.headers!.authorization = `Bearer ${token}`;
			vi.mocked(jwtUtils.extractTokenFromHeader).mockReturnValue(token);
			vi.mocked(jwtUtils.verifyToken).mockReturnValue({ userId });
			vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

			// Act
			await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

			// Assert
			expect(jwtUtils.extractTokenFromHeader).toHaveBeenCalledWith('Bearer valid-jwt-token');
			expect(jwtUtils.verifyToken).toHaveBeenCalledWith(token);
			expect(userService.findById).toHaveBeenCalledWith(userId);
			expect(mockReq.user).toEqual(mockUser);
			expect(mockNext).toHaveBeenCalled();
			expect(mockRes.status).not.toHaveBeenCalled();
		});

		it('should reject invalid JWT token', async () => {
			// Arrange
			const token = 'invalid-jwt-token';
			mockReq.headers!.authorization = `Bearer ${token}`;
			vi.mocked(jwtUtils.extractTokenFromHeader).mockReturnValue(token);
			vi.mocked(jwtUtils.verifyToken).mockReturnValue(null);

			// Act
			await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

			// Assert
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid or expired token.' });
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should reject when user not found', async () => {
			// Arrange
			const token = 'valid-jwt-token';
			const userId = 'user-123';
			mockReq.headers!.authorization = `Bearer ${token}`;
			vi.mocked(jwtUtils.extractTokenFromHeader).mockReturnValue(token);
			vi.mocked(jwtUtils.verifyToken).mockReturnValue({ userId });
			vi.mocked(userService.findById).mockResolvedValue(null);

			// Act
			await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

			// Assert
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found.' });
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should reject inactive user', async () => {
			// Arrange
			const token = 'valid-jwt-token';
			const userId = 'user-123';
			const mockUser = {
				id: userId,
				isActive: false
			};

			mockReq.headers!.authorization = `Bearer ${token}`;
			vi.mocked(jwtUtils.extractTokenFromHeader).mockReturnValue(token);
			vi.mocked(jwtUtils.verifyToken).mockReturnValue({ userId });
			vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

			// Act
			await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

			// Assert
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Account is not active.' });
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe('Session Authentication Fallback', () => {
		it('should authenticate with session when no token provided', async () => {
			// Arrange
			const sessionUser = {
				id: 'user-123',
				username: 'sessionuser',
				email: 'session@example.com',
				role: 'user',
				xp: 200,
				level: 10,
				isActive: true,
				createdAt: new Date()
			};

			mockReq.isAuthenticated = vi.fn(() => true);
			mockReq.user = sessionUser;
			vi.mocked(jwtUtils.extractTokenFromHeader).mockReturnValue(null);

			// Act
			await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

			// Assert
			expect(mockReq.user).toEqual(sessionUser);
			expect(mockNext).toHaveBeenCalled();
			expect(mockRes.status).not.toHaveBeenCalled();
		});

		it('should handle session user with missing optional fields', async () => {
			// Arrange
			const sessionUser = {
				id: 'user-123',
				username: 'sessionuser',
				email: 'session@example.com',
				role: 'user'
				// Missing xp, level, etc.
			};

			mockReq.isAuthenticated = vi.fn(() => true);
			mockReq.user = sessionUser;
			vi.mocked(jwtUtils.extractTokenFromHeader).mockReturnValue(null);

			// Act
			await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

			// Assert
			expect(mockReq.user).toMatchObject({
				id: 'user-123',
				username: 'sessionuser',
				email: 'session@example.com',
				role: 'user',
				xp: 0,
				level: 1,
				isActive: true
			});
			expect(mockNext).toHaveBeenCalled();
		});
	});

	describe('No Authentication', () => {
		it('should reject when neither JWT nor session auth is present', async () => {
			// Arrange
			mockReq.isAuthenticated = vi.fn(() => false);
			vi.mocked(jwtUtils.extractTokenFromHeader).mockReturnValue(null);

			// Act
			await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

			// Assert
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ 
				error: 'Authentication required. Please provide a valid token or login.' 
			});
			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe('Error Handling', () => {
		it('should handle database errors gracefully', async () => {
			// Arrange
			const token = 'valid-jwt-token';
			const userId = 'user-123';
			const dbError = new Error('Database connection failed');

			mockReq.headers!.authorization = `Bearer ${token}`;
			vi.mocked(jwtUtils.extractTokenFromHeader).mockReturnValue(token);
			vi.mocked(jwtUtils.verifyToken).mockReturnValue({ userId });
			vi.mocked(userService.findById).mockRejectedValue(dbError);

			// Act
			await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

			// Assert
			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error.' });
			expect(mockNext).not.toHaveBeenCalled();
		});
	});
});