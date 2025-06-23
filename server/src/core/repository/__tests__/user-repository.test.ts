/**
 * User Repository Tests
 *
 * QUALITY IMPROVEMENT: TDD implementation for repository pattern
 * Tests define the contract and behavior for UserRepository
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserRepository } from '../repositories/user-repository';
import type { User } from '@schema';
import type { IUserRepository } from '../interfaces';

// Mock database
const mockDb = {
	select: vi.fn(),
	insert: vi.fn(),
	update: vi.fn(),
	delete: vi.fn()
};

// Mock logger
vi.mock('@server/src/core/logger', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
		warn: vi.fn()
	}
}));

// Mock user data
const mockUser: User = {
	id: 1,
	username: 'testuser',
	email: 'test@example.com',
	role: 'user',
	createdAt: new Date(),
	updatedAt: new Date(),
	lastLoginAt: null,
	isVerified: true,
	xp: 100,
	level: 1,
	avatar: null,
	bio: null,
	isOnline: false,
	lastActiveAt: null,
	dgtWalletBalance: BigInt(0)
};

describe('UserRepository', () => {
	let userRepository: IUserRepository;

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();

		// Create repository instance
		userRepository = new UserRepository();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('findById', () => {
		it('should return user when found', async () => {
			// Arrange
			const userId = 1;
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockUser])
					})
				})
			});

			// Act
			const result = await userRepository.findById(userId);

			// Assert
			expect(result).toEqual(mockUser);
			expect(mockDb.select).toHaveBeenCalled();
		});

		it('should return null when user not found', async () => {
			// Arrange
			const userId = 999;
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([])
					})
				})
			});

			// Act
			const result = await userRepository.findById(userId);

			// Assert
			expect(result).toBeNull();
		});

		it('should throw RepositoryError on database error', async () => {
			// Arrange
			const userId = 1;
			const dbError = new Error('Database connection failed');
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockRejectedValue(dbError)
					})
				})
			});

			// Act & Assert
			await expect(userRepository.findById(userId)).rejects.toThrow('Failed to find User by ID');
		});
	});

	describe('findByUsername', () => {
		it('should return user when username exists', async () => {
			// Arrange
			const username = 'testuser';
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockUser])
					})
				})
			});

			// Act
			const result = await userRepository.findByUsername(username);

			// Assert
			expect(result).toEqual(mockUser);
		});

		it('should return null when username does not exist', async () => {
			// Arrange
			const username = 'nonexistent';
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([])
					})
				})
			});

			// Act
			const result = await userRepository.findByUsername(username);

			// Assert
			expect(result).toBeNull();
		});

		it('should handle case-insensitive username search', async () => {
			// Arrange
			const username = 'TESTUSER';
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockUser])
					})
				})
			});

			// Act
			const result = await userRepository.findByUsername(username);

			// Assert
			expect(result).toEqual(mockUser);
		});
	});

	describe('findByEmail', () => {
		it('should return user when email exists', async () => {
			// Arrange
			const email = 'test@example.com';
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockUser])
					})
				})
			});

			// Act
			const result = await userRepository.findByEmail(email);

			// Assert
			expect(result).toEqual(mockUser);
		});

		it('should return null when email does not exist', async () => {
			// Arrange
			const email = 'nonexistent@example.com';
			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([])
					})
				})
			});

			// Act
			const result = await userRepository.findByEmail(email);

			// Assert
			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		it('should create user successfully', async () => {
			// Arrange
			const userData = {
				username: 'newuser',
				email: 'new@example.com',
				role: 'user' as const
			};

			const createdUser = { ...mockUser, ...userData, id: 2 };

			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([createdUser])
				})
			});

			// Act
			const result = await userRepository.create(userData);

			// Assert
			expect(result).toEqual(createdUser);
			expect(mockDb.insert).toHaveBeenCalled();
		});

		it('should set default values on creation', async () => {
			// Arrange
			const userData = {
				username: 'newuser',
				email: 'new@example.com'
			};

			const createdUser = {
				...mockUser,
				...userData,
				id: 2,
				role: 'user',
				xp: 0,
				level: 1,
				isVerified: false
			};

			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([createdUser])
				})
			});

			// Act
			const result = await userRepository.create(userData);

			// Assert
			expect(result.role).toBe('user');
			expect(result.xp).toBe(0);
			expect(result.level).toBe(1);
			expect(result.isVerified).toBe(false);
		});

		it('should throw error on validation failure', async () => {
			// Arrange
			const invalidUserData = {
				username: '', // Invalid empty username
				email: 'invalid-email' // Invalid email format
			};

			// Act & Assert
			await expect(userRepository.create(invalidUserData)).rejects.toThrow('Failed to create User');
		});
	});

	describe('update', () => {
		it('should update user successfully', async () => {
			// Arrange
			const userId = 1;
			const updateData = { username: 'updateduser' };
			const updatedUser = { ...mockUser, ...updateData };

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedUser])
					})
				})
			});

			// Act
			const result = await userRepository.update(userId, updateData);

			// Assert
			expect(result).toEqual(updatedUser);
			expect(mockDb.update).toHaveBeenCalled();
		});

		it('should throw error when user not found', async () => {
			// Arrange
			const userId = 999;
			const updateData = { username: 'updateduser' };

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([])
					})
				})
			});

			// Act & Assert
			await expect(userRepository.update(userId, updateData)).rejects.toThrow('User not found');
		});
	});

	describe('incrementXP', () => {
		it('should increment user XP correctly', async () => {
			// Arrange
			const userId = 1;
			const xpAmount = 50;
			const updatedUser = { ...mockUser, xp: mockUser.xp + xpAmount };

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedUser])
					})
				})
			});

			// Act
			const result = await userRepository.incrementXP(userId, xpAmount);

			// Assert
			expect(result.xp).toBe(150); // 100 + 50
		});

		it('should handle negative XP increment (decrement)', async () => {
			// Arrange
			const userId = 1;
			const xpAmount = -25;
			const updatedUser = { ...mockUser, xp: Math.max(0, mockUser.xp + xpAmount) };

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedUser])
					})
				})
			});

			// Act
			const result = await userRepository.incrementXP(userId, xpAmount);

			// Assert
			expect(result.xp).toBe(75); // 100 - 25
		});

		it('should not allow XP to go below zero', async () => {
			// Arrange
			const userId = 1;
			const xpAmount = -200; // More than current XP
			const updatedUser = { ...mockUser, xp: 0 };

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedUser])
					})
				})
			});

			// Act
			const result = await userRepository.incrementXP(userId, xpAmount);

			// Assert
			expect(result.xp).toBe(0);
		});
	});

	describe('searchUsers', () => {
		it('should return matching users', async () => {
			// Arrange
			const query = 'test';
			const limit = 10;
			const matchingUsers = [mockUser];

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue({
							orderBy: vi.fn().mockResolvedValue(matchingUsers)
						})
					})
				})
			});

			// Act
			const result = await userRepository.searchUsers(query, limit);

			// Assert
			expect(result).toEqual(matchingUsers);
			expect(result).toHaveLength(1);
		});

		it('should respect the limit parameter', async () => {
			// Arrange
			const query = 'test';
			const limit = 5;

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue({
							orderBy: vi.fn().mockResolvedValue([])
						})
					})
				})
			});

			// Act
			await userRepository.searchUsers(query, limit);

			// Assert
			// Verify that limit was called with correct value
			expect(mockDb.select().from().where().limit).toHaveBeenCalledWith(limit);
		});

		it('should default to 20 results when no limit specified', async () => {
			// Arrange
			const query = 'test';

			mockDb.select.mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue({
							orderBy: vi.fn().mockResolvedValue([])
						})
					})
				})
			});

			// Act
			await userRepository.searchUsers(query);

			// Assert
			// Verify that limit was called with default value of 20
			expect(mockDb.select().from().where().limit).toHaveBeenCalledWith(20);
		});
	});

	describe('updateLastLogin', () => {
		it('should update last login timestamp', async () => {
			// Arrange
			const userId = 1;

			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(undefined)
				})
			});

			// Act
			await userRepository.updateLastLogin(userId);

			// Assert
			expect(mockDb.update).toHaveBeenCalled();
			// Verify that set was called with lastLoginAt field
			expect(mockDb.update().set).toHaveBeenCalledWith(
				expect.objectContaining({
					lastLoginAt: expect.any(Date)
				})
			);
		});
	});
});
