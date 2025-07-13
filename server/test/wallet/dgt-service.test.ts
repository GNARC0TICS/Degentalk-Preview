/**
 * DGT Service Tests
 *
 * [REFAC-DGT]
 *
 * Tests for the DGT service functionality including:
 * - Balance operations
 * - Transfers
 * - Purchase fulfillment
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import {
	mockUuid,
	mockUserId,
	mockThreadId,
	mockPostId,
	mockMissionId,
	mockAchievementId,
	TEST_UUIDS
} from '@shared/test-utils/mock-uuid';
import { dgtService } from '../../src/domains/wallet/dgt.service';
import { db } from '@db';
import { eq } from 'drizzle-orm';
import { WalletError } from '../../src/domains/wallet/wallet.errors';

// Mock drizzle-orm
vi.mock('../../src/core/db', () => ({
	db: {
		transaction: vi.fn((callback) => callback()),
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: vi.fn(() => [{ dgtWalletBalance: '1000' }])
				}))
			}))
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn(() => ({
					returning: vi.fn(() => [{ newBalance: '500' }])
				}))
			}))
		})),
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				returning: vi.fn(() => [])
			}))
		}))
	}
}));

// Mock logger
vi.mock('../../src/utils/logger', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn()
	}
}));

describe('DGT Service', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('getUserBalance', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});
		it('should return the user balance', async () => {
			const result = await dgtService.getUserBalance(1);

			expect(result).toBe(BigInt(1000));
			expect(db.select).toHaveBeenCalled();
		});

		it('should throw an error if user is not found', async () => {
			// Mock user not found
			vi.mocked(db.select).mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue([])
					})
				})
			} as any);

			await expect(dgtService.getUserBalance(999)).rejects.toThrow(WalletError);
		});
	});

	describe('addDgt', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});
		it('should add DGT to user balance', async () => {
			const result = await dgtService.addDgt(1, BigInt(500), 'PURCHASE');

			expect(result).toBe(BigInt(500));
			expect(db.transaction).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalled();
			expect(db.insert).toHaveBeenCalled();
		});

		it('should throw an error for negative amounts', async () => {
			await expect(dgtService.addDgt(1, BigInt(-100), 'PURCHASE')).rejects.toThrow(WalletError);
		});
	});

	describe('deductDgt', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});
		it('should deduct DGT from user balance', async () => {
			const result = await dgtService.deductDgt(1, BigInt(500), 'WITHDRAW');

			expect(result).toBe(BigInt(500));
			expect(db.transaction).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalled();
			expect(db.insert).toHaveBeenCalled();
		});

		it('should throw an error for insufficient funds', async () => {
			// Mock insufficient balance
			vi.mocked(db.select).mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue([{ dgtWalletBalance: '100' }])
					})
				})
			} as any);

			await expect(dgtService.deductDgt(1, BigInt(500), 'WITHDRAW')).rejects.toThrow(WalletError);
		});
	});

	describe('transferDgt', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});
		it('should transfer DGT between users', async () => {
			// Mock user lookups
			vi.mocked(db.select)
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockReturnValue([{ dgtWalletBalance: '1000' }])
						})
					})
				} as any)
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockReturnValue([{ id: mockUuid() }])
						})
					})
				} as any);

			// Mock balance updates
			vi.mocked(db.update)
				.mockReturnValueOnce({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							returning: vi.fn().mockReturnValue([{ newBalance: '500' }])
						})
					})
				} as any)
				.mockReturnValueOnce({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							returning: vi.fn().mockReturnValue([{ newBalance: '1500' }])
						})
					})
				} as any);

			const result = await dgtService.transferDgt(1, 2, BigInt(500), 'TIP');

			expect(result).toEqual({
				senderBalance: BigInt(500),
				recipientBalance: BigInt(1500)
			});
			expect(db.transaction).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalledTimes(3); // Sender, recipient, and potentially treasury
			expect(db.insert).toHaveBeenCalledTimes(3); // Sender tx, recipient tx, fee tx
		});
	});

	describe('fulfillDgtPurchase', () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});
		it('should fulfill a DGT purchase', async () => {
			// Mock purchase order lookup
			vi.mocked(db.select)
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockReturnValue([
								{
									id: mockUuid(),
									userId: mockUserId(),
									dgtAmountRequested: '1000',
									status: 'pending',
									metadata: {}
								}
							])
						})
					})
				} as any)
				.mockReturnValueOnce({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockReturnValue([
								{
									dgtWalletBalance: '500'
								}
							])
						})
					})
				} as any);

			// Mock order update
			vi.mocked(db.update).mockReturnValueOnce({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockReturnValue([
							{
								id: mockUuid(),
								status: 'confirmed'
							}
						])
					})
				})
			} as any);

			const result = await dgtService.fulfillDgtPurchase(1, 'confirmed', {
				transactionHash: '0x123'
			});

			expect(result).toEqual({
				id: mockUuid(),
				status: 'confirmed'
			});
			expect(db.transaction).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalledTimes(2); // Order update and balance update
		});
	});
});
