import { describe, it, expect } from 'vitest';
import type {
	AdminUser,
	UserFormData,
	EconomyConfig,
	AdminApiResponse,
	BulkOperationRequest,
	Achievement
} from '@/types/admin.types';
import { createUserId } from '@shared';

describe('Admin Types', () => {
	describe('User interface', () => {
		it('should enforce required fields', () => {
			const validUser: AdminUser = {
				id: createUserId('user123'),
				username: 'testuser',
				email: 'test@example.com',
				role: 'user',
				status: 'active',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z'
			};

			expect(validUser.id).toBe(createUserId('user123'));
			expect(validUser.status).toBe('active');
		});

		it('should allow optional fields', () => {
			const userWithOptionals: AdminUser = {
				id: createUserId('user123'),
				username: 'testuser',
				email: 'test@example.com',
				role: 'admin',
				status: 'active',
				createdAt: '2024-01-01T00:00:00Z',
				updatedAt: '2024-01-01T00:00:00Z',
				permissions: ['admin:read', 'admin:write'],
				lastLoginAt: '2024-01-02T00:00:00Z',
				profileData: {
					bio: 'Test user bio',
					avatarUrl: 'https://example.com/avatar.jpg'
				}
			};

			expect(userWithOptionals.permissions).toContain('admin:read');
			expect(userWithOptionals.profileData?.bio).toBe('Test user bio');
		});
	});

	describe('UserFormData interface', () => {
		it('should structure form data correctly', () => {
			const formData: UserFormData = {
				username: 'newuser',
				email: 'new@example.com',
				role: 'user',
				status: 'pending',
				permissions: ['user:read'],
				password: 'securePassword123'
			};

			expect(formData.username).toBe('newuser');
			expect(formData.permissions).toHaveLength(1);
		});
	});

	describe('EconomyConfig interface', () => {
		it('should enforce proper economy configuration structure', () => {
			const config: EconomyConfig = {
				dgtPrice: 0.1,
				xpMultipliers: {
					forum: 1.0,
					admin: 2.0
				},
				rewardRates: {
					postReward: 5,
					threadReward: 10,
					likeReward: 1,
					tipReward: 0.1
				},
				limits: {
					maxDgtTransfer: 10000,
					dailyXpCap: 1000,
					maxWalletBalance: 1000000,
					minWithdrawal: 10
				},
				fees: {
					withdrawalFee: 0.05,
					transferFee: 0.01
				}
			};

			expect(config.dgtPrice).toBe(0.1);
			expect(config.limits.maxDgtTransfer).toBe(10000);
			expect(config.fees.withdrawalFee).toBe(0.05);
		});
	});

	describe('AdminApiResponse wrapper', () => {
		it('should wrap successful responses correctly', () => {
			const response: AdminApiResponse<AdminUser[]> = {
				success: true,
				data: [
					{
						id: createUserId('user1'),
						username: 'test1',
						email: 'test1@example.com',
						role: 'user',
						status: 'active',
						createdAt: '2024-01-01T00:00:00Z',
						updatedAt: '2024-01-01T00:00:00Z'
					}
				],
				metadata: {
					pagination: {
						page: 1,
						limit: 10,
						total: 1,
						totalPages: 1
					},
					timestamp: '2024-01-01T00:00:00Z'
				}
			};

			expect(response.success).toBe(true);
			expect(response.data).toHaveLength(1);
			expect(response.metadata?.pagination?.total).toBe(1);
		});

		it('should handle error responses', () => {
			const errorResponse: AdminApiResponse<never> = {
				success: false,
				data: null as never,
				message: 'Operation failed',
				errors: ['Validation error', 'Permission denied']
			};

			expect(errorResponse.success).toBe(false);
			expect(errorResponse.errors).toHaveLength(2);
		});
	});

	describe('BulkOperationRequest', () => {
		it('should structure bulk operations correctly', () => {
			const bulkRequest: BulkOperationRequest = {
				operation: 'suspend',
				targets: ['user1', 'user2', 'user3'],
				data: {
					suspensionReason: 'Violation of terms',
					duration: '7 days'
				},
				reason: 'Bulk suspension for policy violation'
			};

			expect(bulkRequest.operation).toBe('suspend');
			expect(bulkRequest.targets).toHaveLength(3);
			expect(bulkRequest.data?.suspensionReason).toBe('Violation of terms');
		});
	});

	describe('Achievement interface', () => {
		it('should enforce achievement structure', () => {
			const achievement: Achievement = {
				id: 'first_post',
				name: 'First Post',
				description: 'Created your first forum post',
				category: 'forum',
				rarity: 'common',
				requirements: [
					{
						type: 'posts',
						value: 1,
						operator: 'gte'
					}
				],
				rewards: [
					{
						type: 'xp',
						value: 10
					},
					{
						type: 'badge',
						value: 'first_poster'
					}
				],
				isActive: true,
				icon: '📝',
				color: '#10b981'
			};

			expect(achievement.rarity).toBe('common');
			expect(achievement.requirements).toHaveLength(1);
			expect(achievement.rewards).toHaveLength(2);
			expect(achievement.requirements[0]?.type).toBe('posts');
			expect(achievement.rewards[0]?.type).toBe('xp');
		});
	});
});
