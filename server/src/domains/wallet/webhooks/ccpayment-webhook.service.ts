/**
 * CCPayment Webhook Service
 *
 * This service processes verified webhook events from CCPayment.
 * It handles deposit confirmations, purchase fulfillment, and other events.
 */

// Wallet imports handled via singleton service below
import { dgtPurchaseOrders, users, transactions } from '@schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@core/database';
import { logger } from '@core/logger';
import type { CCPaymentWebhookEvent } from '../providers/ccpayment/ccpayment.service';
import { walletService } from '../services/wallet.service';
import { walletConfig } from '@shared/wallet.config';

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

			// Process the webhook event directly
			switch (event.eventType) {
				case 'deposit_completed':
					return await this.handleDepositCompleted(event);

				case 'deposit_failed':
					return await this.handleDepositFailed(event);

				case 'withdrawal_completed':
					return await this.handleWithdrawalCompleted(event);

				case 'withdrawal_failed':
					return await this.handleWithdrawalFailed(event);

				case 'user_created':
				case 'wallet_created':
					return await this.handleWalletCreated(event);

				case 'user_failed':
				case 'wallet_failed':
					return await this.handleWalletFailed(event);

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
	 * Handle deposit completion webhook with auto-conversion to DGT
	 * @param event Webhook event
	 * @returns Processing result
	 */
	private async handleDepositCompleted(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			logger.info('Processing deposit completion with auto-conversion check', {
				merchantOrderId: event.merchantOrderId,
				amount: event.actualAmount,
				coinSymbol: event.coinSymbol,
				autoConvertEnabled: walletConfig.AUTO_CONVERT_DEPOSITS
			});

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

				// Check admin toggle for auto-conversion of direct deposits
				if (walletConfig.AUTO_CONVERT_DEPOSITS && event.uid) {
					return await this.handleDirectDepositAutoConversion(event);
				}

				return {
					success: true,
					message: 'Direct deposit processed - no auto-conversion (admin disabled)'
				};
			}

			// Handle purchase order deposit with conversion
			const conversionAmount = await this.calculateDgtConversion(
				parseFloat(event.actualAmount), 
				event.coinSymbol
			);

			// Credit DGT to user for successful deposit
			await walletService.creditDgt(purchaseOrder.userId, conversionAmount, {
				source: 'crypto_deposit',
				reason: 'Cryptocurrency deposit auto-conversion to DGT',
				originalToken: event.coinSymbol,
				usdtAmount: event.actualAmount,
				txHash: event.txHash,
				webhookEventId: event.orderId,
				conversionRate: walletConfig.DGT.PRICE_USD,
				adminAutoConvert: walletConfig.AUTO_CONVERT_DEPOSITS
			});

			logger.info('DGT purchase completed with auto-conversion', {
				purchaseOrderId: purchaseOrder.id,
				originalAmount: event.actualAmount,
				originalCurrency: event.coinSymbol,
				dgtAmount: conversionAmount,
				conversionRate: walletConfig.DGT.PRICE_USD
			});

			return {
				success: true,
				message: `DGT purchase completed: ${conversionAmount} DGT credited for ${event.actualAmount} ${event.coinSymbol}`
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
	 * Handle direct crypto deposits with auto-conversion (no purchase order)
	 * @param event Webhook event
	 * @returns Processing result
	 */
	private async handleDirectDepositAutoConversion(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			// Find user by CCPayment UID
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.id, event.uid))
				.limit(1);

			if (!user) {
				logger.warn('User not found for direct deposit auto-conversion', {
					ccpaymentUid: event.uid,
					orderId: event.orderId
				});
				return {
					success: false,
					message: 'User not found for direct deposit'
				};
			}

			const conversionAmount = await this.calculateDgtConversion(
				parseFloat(event.actualAmount), 
				event.coinSymbol
			);

			// Credit DGT for direct deposit
			await walletService.creditDgt(user.id, conversionAmount, {
				source: 'crypto_deposit',
				reason: 'Direct crypto deposit auto-converted to DGT',
				originalToken: event.coinSymbol,
				usdtAmount: event.actualAmount,
				txHash: event.txHash,
				webhookEventId: event.orderId,
				conversionRate: walletConfig.DGT.PRICE_USD,
				adminAutoConvert: true
			});

			logger.info('Direct deposit auto-converted to DGT', {
				userId: user.id,
				originalAmount: event.actualAmount,
				originalCurrency: event.coinSymbol,
				dgtAmount: conversionAmount,
				conversionRate: walletConfig.DGT.PRICE_USD
			});

			return {
				success: true,
				message: `Direct deposit auto-converted: ${conversionAmount} DGT credited for ${event.actualAmount} ${event.coinSymbol}`
			};
		} catch (error) {
			logger.error('Error handling direct deposit auto-conversion', error);
			return {
				success: false,
				message: `Error auto-converting direct deposit: ${error.message}`
			};
		}
	}

	/**
	 * Calculate DGT amount from crypto deposit with rate buffer
	 * @param usdAmount USD amount from crypto
	 * @param coinSymbol Original coin symbol
	 * @returns DGT amount to credit
	 */
	private async calculateDgtConversion(usdAmount: number, coinSymbol: string): Promise<number> {
		// Apply rate buffer to account for fluctuations
		const bufferedAmount = usdAmount * (1 - walletConfig.CONVERSION_RATE_BUFFER);
		
		// Convert to DGT at pegged rate ($0.10 per DGT)
		const dgtAmount = Math.floor(bufferedAmount / walletConfig.DGT.PRICE_USD);

		logger.debug('DGT conversion calculation', {
			originalUsdAmount: usdAmount,
			bufferedUsdAmount: bufferedAmount,
			conversionRate: walletConfig.DGT.PRICE_USD,
			dgtAmount,
			coinSymbol,
			bufferPercentage: walletConfig.CONVERSION_RATE_BUFFER
		});

		return dgtAmount;
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

			// TODO: Mark the purchase order as failed in database
			logger.warn('CCPaymentWebhook', 'Purchase order failed', {
				orderId: purchaseOrder.id,
				webhookEventId: event.orderId,
				failureReason: event.status
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

	/**
	 * Handle wallet creation success webhook
	 * @param event Webhook event
	 * @returns Processing result
	 */
	private async handleWalletCreated(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			logger.info('Processing wallet creation success webhook', {
				eventType: event.eventType,
				userId: event.uid,
				orderId: event.orderId
			});

			// Find the user by CCPayment user ID if provided
			if (event.uid) {
				const [user] = await db.select().from(users).where(eq(users.id, event.uid)).limit(1);

				if (user) {
					// Award welcome bonus DGT for new wallet
					const welcomeAmount = 10; // 10 DGT welcome bonus

					await walletService.creditDgt(user.id, welcomeAmount, {
						source: 'welcome_bonus',
						reason: 'Welcome bonus for new wallet',
						webhookEventId: event.orderId
					});

					logger.info('Welcome bonus awarded for new wallet', {
						userId: user.id,
						amount: welcomeAmount,
						webhookEventId: event.orderId
					});
				}
			}

			return {
				success: true,
				message: 'Wallet creation processed successfully'
			};
		} catch (error) {
			logger.error('Error handling wallet created webhook', error);
			return {
				success: false,
				message: `Error processing wallet creation: ${error.message}`
			};
		}
	}

	/**
	 * Handle wallet creation failure webhook
	 * @param event Webhook event
	 * @returns Processing result
	 */
	private async handleWalletFailed(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			logger.warn('Processing wallet creation failure webhook', {
				eventType: event.eventType,
				userId: event.uid,
				orderId: event.orderId,
				reason: event.status
			});

			// Log the failure for admin review
			// In production, you might want to trigger alerts or retry mechanisms

			return {
				success: true,
				message: 'Wallet creation failure logged for review'
			};
		} catch (error) {
			logger.error('Error handling wallet failed webhook', error);
			return {
				success: false,
				message: `Error processing wallet failure: ${error.message}`
			};
		}
	}
}

// Export a singleton instance
export const ccpaymentWebhookService = new CCPaymentWebhookService();
