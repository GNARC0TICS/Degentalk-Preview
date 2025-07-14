/**
 * CCPayment Webhook Service (v2)
 *
 * This service processes verified webhook events from CCPayment's v2 API.
 * It is the critical link between external crypto deposits and the internal DGT economy.
 */

import { db } from '@core/database';
import { logger } from '@core/logger';
import { dgtService } from '../services/dgtService';
import { walletConfig } from '@shared/wallet.config';
import { settingsService } from '@core/services/settings.service';
import { validateAndConvertId } from '@core/helpers/validate-controller-ids';
import { ccpaymentApiService } from '../providers/ccpayment/ccpayment-api.service';
import { dgtPurchaseOrders, transactions } from '@schema';
import { eq, and } from 'drizzle-orm';

// --- v2 Webhook Interfaces --- //

interface WebhookMsgBase {
	recordId: string;
	coinId: number;
	coinSymbol: string;
	status: 'Success' | 'Processing' | 'Failed' | string; // Allow for other statuses
	isFlaggedAsRisky: boolean;
}

interface UserDepositMsg extends WebhookMsgBase {
	userId: string;
}

interface ApiDepositMsg extends WebhookMsgBase {
	orderId: string; // This is our dgtPurchaseOrder reference
}

interface WithdrawalMsg extends WebhookMsgBase {
	orderId: string;
	userId?: string; // Present in UserWithdrawal
}

export interface CCPaymentWebhookPayload {
	type: 'UserDeposit' | 'ApiDeposit' | 'ApiWithdrawal' | 'UserWithdrawal' | string;
	msg: UserDepositMsg | ApiDepositMsg | WithdrawalMsg | any;
}

export class CCPaymentWebhookService {
	/**
	 * Main entry point for processing a raw webhook request.
	 * @param rawPayload The raw string body of the webhook POST request.
	 * @param headers The headers from the request, containing signature info.
	 * @returns A result object.
	 */
	async processWebhook(
		rawPayload: string,
		headers: Record<string, string | undefined>
	): Promise<{ success: boolean; message: string }> {
		const appId = headers['appid'];
		const signature = headers['sign'];
		const timestamp = headers['timestamp'];

		if (!appId || !signature || !timestamp) {
			logger.warn('CCPaymentWebhookService', 'Missing signature headers in webhook');
			return { success: false, message: 'Missing signature headers' };
		}

		// 1. Verify Signature
		const isSignatureValid = ccpaymentApiService.validateWebhookSignature(
			rawPayload,
			appId,
			signature,
			timestamp
		);

		if (!isSignatureValid) {
			return { success: false, message: 'Invalid signature' };
		}

		// 2. Parse and Route Event
		try {
			const event: CCPaymentWebhookPayload = JSON.parse(rawPayload);
			logger.info('CCPaymentWebhookService', 'Processing webhook event', { type: event.type, status: event.msg.status });

			if (event.msg.status !== 'Success') {
				logger.info('CCPaymentWebhookService', 'Ignoring non-Success webhook status', { status: event.msg.status });
				return { success: true, message: 'Status is not Success, no action taken.' };
			}

			switch (event.type) {
				case 'UserDeposit':
					return this.handleUserDeposit(event.msg as UserDepositMsg);
				case 'ApiDeposit':
					return this.handleApiDeposit(event.msg as ApiDepositMsg);
				// Note: Withdrawal handling can be added here if needed
				default:
					logger.warn('CCPaymentWebhookService', 'Unhandled webhook event type', { type: event.type });
					return { success: true, message: 'Unhandled event type' };
			}
		} catch (error) {
			logger.error('CCPaymentWebhookService', 'Error parsing or processing webhook', { error, rawPayload });
			return { success: false, message: 'Webhook processing failed' };
		}
	}

	/**
	 * Handles a direct deposit to a user's wallet.
	 * This triggers an auto-conversion to DGT if enabled by the admin.
	 */
	private async handleUserDeposit(msg: UserDepositMsg): Promise<{ success: boolean; message: string }> {
		const settings = await settingsService.getWalletSettings();
		if (!settings.autoConvertDeposits) {
			logger.info('CCPaymentWebhookService', 'Direct user deposit received, but auto-conversion is disabled.', { userId: msg.userId });
			return { success: true, message: 'Auto-conversion disabled' };
		}

		const userId = validateAndConvertId(msg.userId, 'User');
		if (!userId) {
			logger.warn('CCPaymentWebhookService', 'Invalid userId in UserDeposit webhook', { userId: msg.userId });
			return { success: false, message: 'Invalid user ID' };
		}

		// To get the deposited amount, we must fetch the transaction details.
		// The webhook only notifies us; it doesn't contain the amount.
		const record = await this.getDepositRecord(msg.recordId);
		if (!record) {
			return { success: false, message: `Could not fetch record for ${msg.recordId}` };
		}

		const conversionAmount = await this.calculateDgtConversion(parseFloat(record.amount), record.coinSymbol);

		await dgtService.processReward(
			userId,
			conversionAmount,
			'crypto_deposit',
			`Direct deposit auto-converted from ${record.amount} ${record.coinSymbol}`
		);

		logger.info('CCPaymentWebhookService', 'Direct deposit auto-converted to DGT', { userId, dgtAmount: conversionAmount });
		return { success: true, message: 'Direct deposit converted to DGT' };
	}

	/**
	 * Handles a deposit related to a specific DGT purchase order.
	 * This is the primary flow for users buying DGT.
	 */
	private async handleApiDeposit(msg: ApiDepositMsg): Promise<{ success: boolean; message: string }> {
		const purchaseOrder = await db.query.dgtPurchaseOrders.findFirst({
			where: eq(dgtPurchaseOrders.ccpaymentReference, msg.orderId),
		});

		if (!purchaseOrder) {
			logger.warn('CCPaymentWebhookService', 'No matching DGT purchase order for ApiDeposit', { orderId: msg.orderId });
			return { success: false, message: 'No matching purchase order' };
		}

		if (purchaseOrder.status === 'completed') {
			logger.warn('CCPaymentWebhookService', 'Received webhook for already completed order', { orderId: msg.orderId });
			return { success: true, message: 'Order already completed' };
		}

		// Credit the exact amount of DGT the user requested.
		await dgtService.creditDgt(purchaseOrder.userId, purchaseOrder.dgtAmountRequested, {
			source: 'dgt_purchase',
			reason: `DGT Purchase via ${purchaseOrder.cryptoCurrencyExpected}`,
			dgtPurchaseOrderId: purchaseOrder.id,
		});

		// Mark the order as complete.
		await db.update(dgtPurchaseOrders)
			.set({ status: 'completed', updatedAt: new Date() })
			.where(eq(dgtPurchaseOrders.id, purchaseOrder.id));

		logger.info('CCPaymentWebhookService', 'DGT purchase order fulfilled', { purchaseOrderId: purchaseOrder.id });
		return { success: true, message: 'DGT purchase fulfilled' };
	}

	/**
	 * Fetches the authoritative deposit record from the API.
	 */
	private async getDepositRecord(recordId: string): Promise<{ amount: string; coinSymbol: string } | null> {
		try {
			const response = await ccpaymentApiService.makeRequest<{ record: any }>(
				'/ccpayment/v2/getAppDepositRecord',
				{ recordId }
			);
			return response.record;
		} catch (error) {
			logger.error('CCPaymentWebhookService', 'Failed to fetch deposit record', { recordId, error });
			return null;
		}
	}

	/**
	 * Calculates the DGT amount from a given crypto amount based on its USD value.
	 */
	private async calculateDgtConversion(cryptoAmount: number, cryptoSymbol: string): Promise<number> {
		// This is a simplified conversion. A robust implementation would fetch the real-time price.
		// For now, we assume the webhook provides enough info or we have a price feed.
		// This part needs to be implemented based on how you get the USD value of the deposit.
		// Let's assume we need to fetch the price.
		const priceData = await ccpaymentApiService.makeRequest<{ prices: Record<string, string> }>(
			'/ccpayment/v2/getCoinUSDTPrice',
			{ coinIds: [walletConfig.COIN_IDS[cryptoSymbol]] } // Assumes walletConfig has this mapping
		);

		const usdPrice = parseFloat(priceData.prices[walletConfig.COIN_IDS[cryptoSymbol]]);
		if (!usdPrice) {
			throw new Error(`Could not fetch price for ${cryptoSymbol}`);
		}

		const usdValue = cryptoAmount * usdPrice;
		const bufferedUsdValue = usdValue * (1 - walletConfig.CONVERSION_RATE_BUFFER);
		const dgtAmount = Math.floor(bufferedUsdValue / walletConfig.DGT.PRICE_USD);

		logger.debug('DGT conversion calculation', { usdValue, dgtAmount });
		return dgtAmount;
	}
}

export const ccpaymentWebhookService = new CCPaymentWebhookService();