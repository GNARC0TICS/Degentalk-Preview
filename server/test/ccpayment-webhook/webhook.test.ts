/**
 * CCPayment Webhook Tests
 *
 * [REFAC-CCPAYMENT]
 *
 * Tests for CCPayment webhook processing functionality including:
 * - Signature verification
 * - Deposit handling
 * - Withdrawal handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ccpaymentWebhookService } from '../../src/domains/ccpayment-webhook/ccpayment-webhook.service';
import { ccpaymentService } from '../../src/domains/wallet/ccpayment.service';
import { dgtService } from '../../src/domains/wallet/dgt.service';
import { db } from '@db';

// Mock dependencies
vi.mock('../../src/domains/wallet/dgt.service', () => ({
	dgtService: {
		fulfillDgtPurchase: vi.fn().mockResolvedValue({
			id: 1,
			status: 'confirmed'
		})
	}
}));

vi.mock('../../src/domains/wallet/ccpayment.service', () => ({
	ccpaymentService: {
		verifyWebhookSignature: vi.fn().mockReturnValue(true)
	}
}));

vi.mock('../../src/core/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: vi.fn(() => [
						{
							id: 1,
							userId: 1,
							ccpaymentReference: 'test-order-id',
							status: 'pending'
						}
					])
				}))
			}))
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn(() => ({}))
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

describe('CCPayment Webhook Service', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('processWebhookEvent', () => {
		it('should process deposit_completed webhook events', async () => {
			const event = {
				eventType: 'deposit_completed',
				orderId: 'webhook-event-id',
				merchantOrderId: 'test-order-id',
				status: 'completed',
				amount: '100',
				actualAmount: '99.5',
				currency: 'USDT',
				network: 'TRC20',
				txHash: '0xabcdef1234567890',
				fromAddress: '0xsender',
				toAddress: '0xrecipient',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as any;

			const result = await ccpaymentWebhookService.processWebhookEvent(event);

			expect(result.success).toBe(true);
			expect(db.select).toHaveBeenCalled();
			expect(dgtService.fulfillDgtPurchase).toHaveBeenCalledWith(
				1,
				'confirmed',
				expect.objectContaining({
					webhookEventId: 'webhook-event-id',
					txHash: '0xabcdef1234567890',
					actualAmount: '99.5'
				})
			);
		});

		it('should process deposit_failed webhook events', async () => {
			const event = {
				eventType: 'deposit_failed',
				orderId: 'webhook-event-id',
				merchantOrderId: 'test-order-id',
				status: 'failed',
				amount: '100',
				currency: 'USDT',
				network: 'TRC20',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as any;

			const result = await ccpaymentWebhookService.processWebhookEvent(event);

			expect(result.success).toBe(true);
			expect(db.select).toHaveBeenCalled();
			expect(dgtService.fulfillDgtPurchase).toHaveBeenCalledWith(
				1,
				'failed',
				expect.objectContaining({
					webhookEventId: 'webhook-event-id',
					failureReason: 'failed'
				})
			);
		});

		it('should process withdrawal_completed webhook events', async () => {
			// Setup transaction mock
			vi.mocked(db.select).mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue([
							{
								id: 1,
								type: 'WITHDRAWAL',
								status: 'pending',
								metadata: {
									ccpaymentOrderId: 'test-order-id'
								}
							}
						])
					})
				})
			} as any);

			const event = {
				eventType: 'withdrawal_completed',
				orderId: 'webhook-event-id',
				merchantOrderId: 'test-order-id',
				status: 'completed',
				amount: '100',
				actualAmount: '99.5',
				currency: 'USDT',
				network: 'TRC20',
				txHash: '0xabcdef1234567890',
				toAddress: '0xrecipient',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as any;

			const result = await ccpaymentWebhookService.processWebhookEvent(event);

			expect(result.success).toBe(true);
			expect(db.select).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalled();
		});

		it('should process withdrawal_failed webhook events', async () => {
			// Setup transaction mock
			vi.mocked(db.select).mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue([
							{
								id: 1,
								type: 'WITHDRAWAL',
								status: 'pending',
								metadata: {
									ccpaymentOrderId: 'test-order-id'
								}
							}
						])
					})
				})
			} as any);

			const event = {
				eventType: 'withdrawal_failed',
				orderId: 'webhook-event-id',
				merchantOrderId: 'test-order-id',
				status: 'failed',
				amount: '100',
				currency: 'USDT',
				network: 'TRC20',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as any;

			const result = await ccpaymentWebhookService.processWebhookEvent(event);

			expect(result.success).toBe(true);
			expect(db.select).toHaveBeenCalled();
			expect(db.update).toHaveBeenCalled();
		});

		it('should return error for unknown event types', async () => {
			const event = {
				eventType: 'unknown_event',
				orderId: 'webhook-event-id',
				merchantOrderId: 'test-order-id',
				status: 'unknown',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			} as any;

			const result = await ccpaymentWebhookService.processWebhookEvent(event);

			expect(result.success).toBe(false);
			expect(result.message).toContain('Unknown event type');
		});
	});
});
