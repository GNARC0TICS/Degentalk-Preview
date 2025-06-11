/**
 * Tip Service Tests
 *
 * [REFAC-ENGAGEMENT]
 *
 * Tests for the tip service functionality including:
 * - Tip processing
 * - Stats retrieval
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tipService } from '../../src/domains/engagement/tip/tip.service';
import { dgtService } from '../../src/domains/wallet/dgt.service';
import { db } from '@db';
import { WalletError } from '../../src/domains/wallet/wallet.errors';

// Mock dependencies
vi.mock('../../src/domains/wallet/dgt.service', () => ({
	dgtService: {
		transferDgt: vi.fn().mockResolvedValue({
			senderBalance: BigInt(500),
			recipientBalance: BigInt(1500)
		})
	}
}));

vi.mock('../../src/core/db', () => ({
	db: {
		transaction: vi.fn((callback) => callback()),
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				returning: vi.fn(() => [{ id: 1 }])
			}))
		})),
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: vi.fn(() => [{ username: 'testuser' }])
				}))
			}))
		})),
		// For stats queries
		execute: vi.fn().mockResolvedValue({
			rows: [
				{
					totalSent: '1000',
					totalReceived: '500',
					transactionCount: 10
				}
			]
		})
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

describe('Tip Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('processTip', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should process a successful tip', async () => {
      const result = await tipService.processTip(
        1, // fromUserId
        2, // toUserId
        BigInt(100), // amount
        'Great post!', // reason
        { type: 'post', id: 123 } // contentReference
      );

			expect(result).toBeDefined();
			expect(dgtService.transferDgt).toHaveBeenCalledWith(
				1,
				2,
				BigInt(100),
				'TIP',
				expect.objectContaining({
					reason: 'Great post!',
					contentType: 'post',
					contentId: 123
				})
			);
			expect(db.insert).toHaveBeenCalled();
		});

		it('should throw an error when tipping amount is invalid', async () => {
			vi.mocked(dgtService.transferDgt).mockRejectedValueOnce(
				new WalletError('Insufficient funds', 400, 'WALLET_INSUFFICIENT_FUNDS')
			);

			await expect(tipService.processTip(1, 2, BigInt(1000000), 'Great post!')).rejects.toThrow();
		});

		it('should throw an error when tipping yourself', async () => {
			await expect(tipService.processTip(1, 1, BigInt(100), 'Self tip')).rejects.toThrow();
		});
	});

  describe('getUserTipStats', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return user tip statistics', async () => {
      const stats = await tipService.getUserTipStats(1);

			expect(stats).toEqual({
				totalSent: 1000,
				totalReceived: 500,
				transactionCount: 10
			});
			expect(db.execute).toHaveBeenCalled();
		});
	});

  describe('getContentTipStats', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should return content tip statistics', async () => {
      vi.mocked(db.execute).mockResolvedValueOnce({
        rows: [{ 
          totalAmount: '500', 
          tipCount: 5
        }]
      });

			const stats = await tipService.getContentTipStats('post', 123);

			expect(stats).toEqual({
				totalAmount: 500,
				tipCount: 5
			});
			expect(db.execute).toHaveBeenCalled();
		});
	});
});
