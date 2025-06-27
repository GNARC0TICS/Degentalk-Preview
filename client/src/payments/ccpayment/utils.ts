/**
 * CCPayment Utilities
 *
 * Helper functions for CCPayment integration
 */

import crypto from 'crypto';
import { CCPaymentTransactionStatus } from './types';

/**
 * Creates a signature for CCPayment API requests
 *
 * @param appId - CCPayment App ID
 * @param appSecret - CCPayment App Secret
 * @param data - The request data to sign
 * @param timestamp - UNIX timestamp in seconds
 * @returns SHA256 hash signature
 */
export function createSignature(
	appId: string,
	appSecret: string,
	data: Record<string, any>,
	timestamp: number
): string {
	try {
		// Sort the parameters alphabetically by key
		const sortedParams = Object.keys(data)
			.sort()
			.reduce((result: Record<string, any>, key: string) => {
				result[key] = data[key];
				return result;
			}, {});

		// Convert to JSON string
		const jsonStr = JSON.stringify(sortedParams);

		// Create the signature string: appId + timestamp + jsonStr + appSecret
		const signatureStr = `${appId}${timestamp}${jsonStr}${appSecret}`;

		// Create SHA256 hash
		return crypto.createHash('sha256').update(signatureStr).digest('hex');
	} catch (error) {
		throw new Error('Failed to create CCPayment API signature');
	}
}

/**
 * Verifies a webhook signature from CCPayment
 *
 * @param appId - CCPayment App ID
 * @param appSecret - CCPayment App Secret
 * @param data - The webhook payload
 * @param signature - The signature from the webhook header
 * @param timestamp - The timestamp from the webhook header
 * @returns Whether the signature is valid
 */
export function verifyWebhookSignature(
	appId: string,
	appSecret: string,
	data: Record<string, any>,
	signature: string,
	timestamp: string
): boolean {
	try {
		const calculatedSignature = createSignature(appId, appSecret, data, parseInt(timestamp));
		return calculatedSignature === signature;
	} catch (error) {
		return false;
	}
}

/**
 * Formats a transaction status for display
 *
 * @param status - CCPayment transaction status
 * @returns Formatted status with display text and color
 */
export function formatTransactionStatus(status: string): {
	label: string;
	color: string;
} {
	const statusMap: Record<string, { label: string; color: string }> = {
		[CCPaymentTransactionStatus.PENDING]: {
			label: 'Pending',
			color: 'text-yellow-500'
		},
		[CCPaymentTransactionStatus.PROCESSING]: {
			label: 'Processing',
			color: 'text-blue-500'
		},
		[CCPaymentTransactionStatus.COMPLETED]: {
			label: 'Completed',
			color: 'text-green-500'
		},
		[CCPaymentTransactionStatus.FAILED]: {
			label: 'Failed',
			color: 'text-red-500'
		},
		[CCPaymentTransactionStatus.CANCELLED]: {
			label: 'Cancelled',
			color: 'text-gray-500'
		}
	};

	return statusMap[status] || { label: status, color: 'text-gray-500' };
}

/**
 * Generates a unique order ID for CCPayment transactions
 *
 * @param userId - User ID
 * @param prefix - Optional prefix (default: "DGT")
 * @returns Unique order ID string
 */
export function generateOrderId(userId: string, prefix = 'DGT'): string {
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, '0');

	return `${prefix}-${userId}-${timestamp}-${random}`;
}
