import { db } from '@db';
import {
	webhookEvents,
	depositRecords,
	withdrawalRecords,
	internalTransfers,
	swapRecords,
	ccpaymentUsers
} from '@schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { walletConfigService } from './wallet-config.service';
import { dgtService } from './dgt.service';

/**
 * Enhanced Webhook Service for CCPayment Integration
 *
 * Handles webhook events from CCPayment and updates the appropriate wallet transaction records.
 */
export class WebhookService {
	/**
	 * Verify webhook signature from CCPayment
	 */
	verifyWebhookSignature(
		payload: any,
		signature: string,
		timestamp: string,
		appSecret: string
	): boolean {
		try {
			// CCPayment webhook signature verification
			const payloadString = JSON.stringify(payload);
			const stringToSign = timestamp + payloadString;
			const expectedSignature = crypto
				.createHmac('sha256', appSecret)
				.update(stringToSign)
				.digest('hex');

			return signature === expectedSignature;
		} catch (error) {
			console.error('Error verifying webhook signature:', error);
			return false;
		}
	}

	/**
	 * Process incoming webhook event
	 */
	async processWebhookEvent(
		payload: any,
		signature: string
	): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			// Generate unique webhook ID
			const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			// Store webhook event for auditing
			await db.insert(webhookEvents).values({
				webhookId: webhookId,
				eventType: payload.eventType || 'unknown',
				status: 'received',
				rawPayload: JSON.stringify(payload),
				signature: signature,
				isProcessed: false,
				retryCount: '0'
			});

			// Process based on event type
			let result: { success: boolean; message: string };

			switch (payload.eventType) {
				case 'deposit':
					result = await this.handleDepositWebhook(payload, webhookId);
					break;
				case 'withdraw':
					result = await this.handleWithdrawalWebhook(payload, webhookId);
					break;
				case 'internal_transfer':
					result = await this.handleInternalTransferWebhook(payload, webhookId);
					break;
				case 'swap':
					result = await this.handleSwapWebhook(payload, webhookId);
					break;
				default:
					result = {
						success: false,
						message: `Unknown event type: ${payload.eventType}`
					};
			}

			// Update webhook event status
			await db
				.update(webhookEvents)
				.set({
					status: result.success ? 'processed' : 'failed',
					isProcessed: result.success,
					processedAt: new Date(),
					processingError: result.success ? null : result.message
				})
				.where(eq(webhookEvents.webhookId, webhookId));

			return result;
		} catch (error) {
			console.error('Error processing webhook event:', error);
			return {
				success: false,
				message: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	/**
	 * Handle deposit webhook events
	 */
	private async handleDepositWebhook(
		payload: any,
		webhookId: string
	): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			const {
				recordId,
				uid,
				coinId,
				coinSymbol,
				chain,
				amount,
				serviceFee,
				coinUSDPrice,
				fromAddress,
				toAddress,
				txId,
				status,
				isFlaggedRisky
			} = payload;

			// Find Degentalk user from CCPayment UID
			const userMapping = await db
				.select()
				.from(ccpaymentUsers)
				.where(eq(ccpaymentUsers.ccpaymentUserId, uid))
				.limit(1);

			if (userMapping.length === 0) {
				return {
					success: false,
					message: `No user mapping found for CCPayment UID: ${uid}`
				};
			}

			const userId = userMapping[0].userId;

			// Check if deposit record already exists
			const existingRecord = await db
				.select()
				.from(depositRecords)
				.where(eq(depositRecords.recordId, recordId))
				.limit(1);

			if (existingRecord.length > 0) {
				// Update existing record
				await db
					.update(depositRecords)
					.set({
						status: status,
						serviceFee: serviceFee || existingRecord[0].serviceFee,
						coinUSDPrice: coinUSDPrice || existingRecord[0].coinUSDPrice,
						fromAddress: fromAddress || existingRecord[0].fromAddress,
						txId: txId || existingRecord[0].txId,
						isFlaggedRisky: isFlaggedRisky || existingRecord[0].isFlaggedRisky,
						arrivedAt: status === 'Success' ? new Date() : existingRecord[0].arrivedAt
					})
					.where(eq(depositRecords.recordId, recordId));
			} else {
				// Create new deposit record
				await db.insert(depositRecords).values({
					userId: userId,
					recordId: recordId,
					coinId: coinId,
					coinSymbol: coinSymbol,
					chain: chain,
					amount: amount,
					serviceFee: serviceFee,
					coinUSDPrice: coinUSDPrice,
					fromAddress: fromAddress,
					toAddress: toAddress,
					txId: txId,
					status: status,
					isFlaggedRisky: isFlaggedRisky || false,
					arrivedAt: status === 'Success' ? new Date() : null
				});
			}

			// Handle DGT conversion for successful deposits
			if (status === 'Success') {
				await this.processDGTConversion(userId, recordId, amount, coinSymbol, coinUSDPrice);
			}

			// Update webhook event with related record info
			await db
				.update(webhookEvents)
				.set({
					relatedRecordType: 'deposit',
					relatedRecordId: recordId
				})
				.where(eq(webhookEvents.webhookId, webhookId));

			return {
				success: true,
				message: `Deposit ${recordId} processed successfully`
			};
		} catch (error) {
			console.error('Error handling deposit webhook:', error);
			return {
				success: false,
				message: `Deposit processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	/**
	 * Handle withdrawal webhook events
	 */
	private async handleWithdrawalWebhook(
		payload: any,
		webhookId: string
	): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			const {
				recordId,
				uid,
				coinId,
				coinSymbol,
				chain,
				amount,
				serviceFee,
				coinUSDPrice,
				fromAddress,
				toAddress,
				txId,
				status,
				failureReason,
				isFlaggedRisky
			} = payload;

			// Find Degentalk user from CCPayment UID
			const userMapping = await db
				.select()
				.from(ccpaymentUsers)
				.where(eq(ccpaymentUsers.ccpaymentUserId, uid))
				.limit(1);

			if (userMapping.length === 0) {
				return {
					success: false,
					message: `No user mapping found for CCPayment UID: ${uid}`
				};
			}

			const userId = userMapping[0].userId;

			// Update withdrawal record
			await db
				.update(withdrawalRecords)
				.set({
					coinSymbol: coinSymbol,
					chain: chain,
					serviceFee: serviceFee,
					coinUSDPrice: coinUSDPrice,
					fromAddress: fromAddress,
					txId: txId,
					status: status,
					failureReason: failureReason,
					isFlaggedRisky: isFlaggedRisky || false,
					processedAt: new Date()
				})
				.where(and(eq(withdrawalRecords.recordId, recordId), eq(withdrawalRecords.userId, userId)));

			// Update webhook event with related record info
			await db
				.update(webhookEvents)
				.set({
					relatedRecordType: 'withdrawal',
					relatedRecordId: recordId
				})
				.where(eq(webhookEvents.webhookId, webhookId));

			return {
				success: true,
				message: `Withdrawal ${recordId} processed successfully`
			};
		} catch (error) {
			console.error('Error handling withdrawal webhook:', error);
			return {
				success: false,
				message: `Withdrawal processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	/**
	 * Handle internal transfer webhook events
	 */
	private async handleInternalTransferWebhook(
		payload: any,
		webhookId: string
	): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			const {
				recordId,
				fromUid,
				toUid,
				coinId,
				coinSymbol,
				amount,
				serviceFee,
				coinUSDPrice,
				status,
				failureReason
			} = payload;

			// Find Degentalk users from CCPayment UIDs
			const [fromUserMapping, toUserMapping] = await Promise.all([
				db
					.select()
					.from(ccpaymentUsers)
					.where(eq(ccpaymentUsers.ccpaymentUserId, fromUid))
					.limit(1),
				db.select().from(ccpaymentUsers).where(eq(ccpaymentUsers.ccpaymentUserId, toUid)).limit(1)
			]);

			if (fromUserMapping.length === 0 || toUserMapping.length === 0) {
				return {
					success: false,
					message: `User mapping not found for UIDs: ${fromUid}, ${toUid}`
				};
			}

			// Update internal transfer record
			await db
				.update(internalTransfers)
				.set({
					coinSymbol: coinSymbol,
					serviceFee: serviceFee,
					coinUSDPrice: coinUSDPrice,
					status: status,
					failureReason: failureReason,
					processedAt: new Date()
				})
				.where(eq(internalTransfers.recordId, recordId));

			// Update webhook event with related record info
			await db
				.update(webhookEvents)
				.set({
					relatedRecordType: 'transfer',
					relatedRecordId: recordId
				})
				.where(eq(webhookEvents.webhookId, webhookId));

			return {
				success: true,
				message: `Internal transfer ${recordId} processed successfully`
			};
		} catch (error) {
			console.error('Error handling internal transfer webhook:', error);
			return {
				success: false,
				message: `Internal transfer processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	/**
	 * Handle swap webhook events
	 */
	private async handleSwapWebhook(
		payload: any,
		webhookId: string
	): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			const {
				recordId,
				uid,
				fromCoinId,
				fromCoinSymbol,
				fromAmount,
				fromCoinUSDPrice,
				toCoinId,
				toCoinSymbol,
				toAmount,
				toCoinUSDPrice,
				exchangeRate,
				serviceFee,
				status,
				failureReason
			} = payload;

			// Find Degentalk user from CCPayment UID
			const userMapping = await db
				.select()
				.from(ccpaymentUsers)
				.where(eq(ccpaymentUsers.ccpaymentUserId, uid))
				.limit(1);

			if (userMapping.length === 0) {
				return {
					success: false,
					message: `No user mapping found for CCPayment UID: ${uid}`
				};
			}

			const userId = userMapping[0].userId;

			// Update swap record
			await db
				.update(swapRecords)
				.set({
					fromCoinSymbol: fromCoinSymbol,
					fromCoinUSDPrice: fromCoinUSDPrice,
					toCoinSymbol: toCoinSymbol,
					toAmount: toAmount,
					toCoinUSDPrice: toCoinUSDPrice,
					exchangeRate: exchangeRate,
					serviceFee: serviceFee,
					status: status,
					failureReason: failureReason,
					processedAt: new Date()
				})
				.where(and(eq(swapRecords.recordId, recordId), eq(swapRecords.userId, userId)));

			// Update webhook event with related record info
			await db
				.update(webhookEvents)
				.set({
					relatedRecordType: 'swap',
					relatedRecordId: recordId
				})
				.where(eq(webhookEvents.webhookId, webhookId));

			return {
				success: true,
				message: `Swap ${recordId} processed successfully`
			};
		} catch (error) {
			console.error('Error handling swap webhook:', error);
			return {
				success: false,
				message: `Swap processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	/**
	 * Retry failed webhook processing
	 */
	async retryFailedWebhook(webhookId: string): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			const webhookEvent = await db
				.select()
				.from(webhookEvents)
				.where(eq(webhookEvents.webhookId, webhookId))
				.limit(1);

			if (webhookEvent.length === 0) {
				return {
					success: false,
					message: 'Webhook event not found'
				};
			}

			const event = webhookEvent[0];
			const payload = JSON.parse(event.rawPayload);

			// Increment retry count
			const newRetryCount = (parseInt(event.retryCount) + 1).toString();
			await db
				.update(webhookEvents)
				.set({
					retryCount: newRetryCount,
					status: 'processing'
				})
				.where(eq(webhookEvents.webhookId, webhookId));

			// Reprocess the event
			const result = await this.processWebhookEvent(payload, event.signature || '');

			return result;
		} catch (error) {
			console.error('Error retrying webhook:', error);
			return {
				success: false,
				message: `Retry error: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	/**
	 * Process DGT conversion for successful deposits
	 */
	private async processDGTConversion(
		userId: string,
		recordId: string,
		depositAmount: string,
		originalToken: string,
		coinUSDPrice: string
	): Promise<void> {
		try {
			const config = await walletConfigService.getConfig();

			// Check if auto-conversion is enabled
			if (!config.ccpayment.autoSwapEnabled) {
				console.log(`DGT auto-conversion disabled for deposit ${recordId}`);
				return;
			}

			// Calculate USDT amount from deposit
			// CCPayment automatically swaps to USDT, so we use the USD value
			const usdValue = parseFloat(depositAmount) * parseFloat(coinUSDPrice);
			const usdtAmount = usdValue; // USDT is pegged 1:1 to USD

			// Check minimum deposit threshold
			if (usdtAmount < config.dgt.minDepositUSD) {
				console.log(
					`Deposit ${recordId} below minimum threshold: $${usdtAmount} < $${config.dgt.minDepositUSD}`
				);
				return;
			}

			// Calculate DGT amount using configured rate
			const dgtAmount = usdtAmount * config.dgt.usdToDGTRate;

			// Update deposit record with DGT conversion details
			await db
				.update(depositRecords)
				.set({
					usdtAmount: usdtAmount.toString(),
					dgtAmount: dgtAmount.toString(),
					conversionRate: config.dgt.usdToDGTRate.toString(),
					originalToken: originalToken
				})
				.where(eq(depositRecords.recordId, recordId));

			// Credit DGT to user's account
			await dgtService.creditDGT(userId, dgtAmount, {
				source: 'crypto_deposit',
				originalToken: originalToken,
				usdtAmount: usdtAmount.toString(),
				depositRecordId: recordId,
				reason: `Crypto deposit conversion: ${depositAmount} ${originalToken} → ${dgtAmount} DGT`
			});

			console.log(
				`DGT conversion completed: ${depositAmount} ${originalToken} → ${dgtAmount} DGT for user ${userId}`
			);
		} catch (error) {
			console.error(`Error processing DGT conversion for deposit ${recordId}:`, error);

			// Update deposit record with conversion error
			await db
				.update(depositRecords)
				.set({
					originalToken: originalToken
					// Mark conversion as failed in a way that can be retried later
				})
				.where(eq(depositRecords.recordId, recordId));

			// Don't throw error - deposit should still be marked as successful
			// Conversion can be retried manually by admin if needed
		}
	}
}
