/**
 * CCPayment Webhook Service
 *
 * This service processes verified webhook events from CCPayment.
 * It handles deposit confirmations, purchase fulfillment, and other events.
 */

import { WalletService } from '../wallet/wallet.service';
import { dgtPurchaseOrders, users, transactions } from '@schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@db'; // Corrected path
import { logger } from '../../core/logger'; // Corrected path
import type { CCPaymentWebhookEvent } from '../wallet/ccpayment.service';
import { dgtService } from '../wallet/dgt.service';

/**
 * CCPayment webhook service for processing webhook events
 */
export class CCPaymentWebhookService {
	/**
	 * Process a webhook event from CCPayment
	 * @param event Webhook event data
	 * @returns Processing result
	 */
	async processWebhookEvent(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			logger.info('Processing CCPayment webhook event', {
				eventType: event.eventType,
				orderId: event.orderId,
				status: event.status,
				amount: event.amount,
				currency: event.currency
			});

			switch (event.eventType) {
				case 'deposit_completed':
					return await this.handleDepositCompleted(event);

				case 'deposit_failed':
					return await this.handleDepositFailed(event);

				case 'withdrawal_completed':
					return await this.handleWithdrawalCompleted(event);

				case 'withdrawal_failed':
					return await this.handleWithdrawalFailed(event);

				default:
					logger.warn('Unknown webhook event type', { eventType: event.eventType });
					return { success: false, message: 'Unknown event type' };
			}
		} catch (error) {
			logger.error('Error processing webhook event', error);
			return {
				success: false,
				message: `Error processing webhook: ${error.message}`
			};
		}
	}

	/**
	 * Handle deposit completion webhook
	 * @param event Webhook event
	 * @returns Processing result
	 */
	private async handleDepositCompleted(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			// Find the DGT purchase order associated with this deposit
			const [purchaseOrder] = await db
				.select()
				.from(dgtPurchaseOrders)
				.where(eq(dgtPurchaseOrders.ccpaymentReference, event.merchantOrderId))
				.limit(1);

			if (!purchaseOrder) {
				logger.warn('No matching purchase order found for completed deposit', {
					merchantOrderId: event.merchantOrderId
				});

				// This could be a direct crypto deposit not tied to a DGT purchase
				// We can handle that case here if needed

				return {
					success: true,
					message: 'No matching DGT purchase order found, processed as direct deposit'
				};
			}

			// Update the purchase order status and fulfill it
			await dgtService.fulfillDgtPurchase(purchaseOrder.id, 'confirmed', {
				webhookEventId: event.orderId,
				txHash: event.txHash,
				actualAmount: event.actualAmount,
				processedAt: new Date().toISOString()
			});

			return {
				success: true,
				message: `DGT purchase completed for order ${purchaseOrder.id}`
			};
		} catch (error) {
			logger.error('Error handling deposit completed webhook', error);
			return {
				success: false,
				message: `Error fulfilling DGT purchase: ${error.message}`
			};
		}
	}

	/**
	 * Handle deposit failure webhook
	 * @param event Webhook event
	 * @returns Processing result
	 */
	private async handleDepositFailed(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			// Find the DGT purchase order associated with this deposit
			const [purchaseOrder] = await db
				.select()
				.from(dgtPurchaseOrders)
				.where(eq(dgtPurchaseOrders.ccpaymentReference, event.merchantOrderId))
				.limit(1);

			if (!purchaseOrder) {
				logger.warn('No matching purchase order found for failed deposit', {
					merchantOrderId: event.merchantOrderId
				});

				return {
					success: true,
					message: 'No matching DGT purchase order found for failed deposit'
				};
			}

			// Mark the purchase order as failed
			await dgtService.fulfillDgtPurchase(purchaseOrder.id, 'failed', {
				webhookEventId: event.orderId,
				failureReason: event.status,
				processedAt: new Date().toISOString()
			});

			return {
				success: true,
				message: `DGT purchase marked as failed for order ${purchaseOrder.id}`
			};
		} catch (error) {
			logger.error('Error handling deposit failed webhook', error);
			return {
				success: false,
				message: `Error marking DGT purchase as failed: ${error.message}`
			};
		}
	}

	/**
	 * Handle withdrawal completion webhook
	 * @param event Webhook event
	 * @returns Processing result
	 */
	private async handleWithdrawalCompleted(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			// Find the transaction associated with this withdrawal
			const [transaction] = await db
				.select()
				.from(transactions)
				.where(
					and(
						eq(transactions.type, 'WITHDRAWAL'),
						eq(transactions.metadata['ccpaymentOrderId'], event.merchantOrderId)
					)
				)
				.limit(1);

			if (!transaction) {
				logger.warn('No matching transaction found for completed withdrawal', {
					merchantOrderId: event.merchantOrderId
				});

				return {
					success: true,
					message: 'No matching transaction found for completed withdrawal'
				};
			}

			// Update the transaction with completed status and blockchain details
			await db
				.update(transactions)
				.set({
					status: 'confirmed',
					blockchainTxId: event.txHash,
					updatedAt: new Date(),
					metadata: {
						...transaction.metadata,
						webhookEventId: event.orderId,
						completedAt: new Date().toISOString(),
						networkFee: event.actualAmount
							? (parseFloat(event.amount) - parseFloat(event.actualAmount)).toString()
							: undefined
					}
				})
				.where(eq(transactions.id, transaction.id));

			return {
				success: true,
				message: `Withdrawal transaction ${transaction.id} marked as completed`
			};
		} catch (error) {
			logger.error('Error handling withdrawal completed webhook', error);
			return {
				success: false,
				message: `Error updating withdrawal transaction: ${error.message}`
			};
		}
	}

	/**
	 * Handle withdrawal failure webhook
	 * @param event Webhook event
	 * @returns Processing result
	 */
	private async handleWithdrawalFailed(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			// Find the transaction associated with this withdrawal
			const [transaction] = await db
				.select()
				.from(transactions)
				.where(
					and(
						eq(transactions.type, 'WITHDRAWAL'),
						eq(transactions.metadata['ccpaymentOrderId'], event.merchantOrderId)
					)
				)
				.limit(1);

			if (!transaction) {
				logger.warn('No matching transaction found for failed withdrawal', {
					merchantOrderId: event.merchantOrderId
				});

				return {
					success: true,
					message: 'No matching transaction found for failed withdrawal'
				};
			}

			// Update the transaction with failed status
			await db
				.update(transactions)
				.set({
					status: 'failed',
					updatedAt: new Date(),
					metadata: {
						...transaction.metadata,
						webhookEventId: event.orderId,
						failureReason: event.status,
						failedAt: new Date().toISOString()
					}
				})
				.where(eq(transactions.id, transaction.id));

			// If this was a withdrawal, refund the user's crypto balance
			// This depends on your business logic

			return {
				success: true,
				message: `Withdrawal transaction ${transaction.id} marked as failed`
			};
		} catch (error) {
			logger.error('Error handling withdrawal failed webhook', error);
			return {
				success: false,
				message: `Error updating withdrawal transaction: ${error.message}`
			};
		}
	}
}

// Export a singleton instance
export const ccpaymentWebhookService = new CCPaymentWebhookService();
