import { z } from 'zod';

/**
 * CCPayment Webhook Validation Schemas
 *
 * Zod schemas for validating CCPayment webhook requests
 */

// CCPayment webhook event validation
export const ccpaymentWebhookValidation = z.object({
	headers: z.object({
		'x-signature': z.string().min(1, 'X-Signature header is required'),
		'x-timestamp': z.string().min(1, 'X-Timestamp header is required'),
		'x-app-id': z.string().min(1, 'X-App-Id header is required')
	}),
	body: z
		.object({
			eventType: z.string().min(1, 'Event type is required'),
			orderId: z.string().min(1, 'Order ID is required'),
			merchantOrderId: z.string().optional(),
			status: z.string().min(1, 'Status is required'),
			// Additional fields that may be present in webhook
			amount: z.number().optional(),
			currency: z.string().optional(),
			coinSymbol: z.string().optional(),
			fromAddr: z.string().optional(),
			toAddr: z.string().optional(),
			blockHash: z.string().optional(),
			txHash: z.string().optional(),
			blockNum: z.number().optional(),
			fee: z.number().optional(),
			timestamp: z.number().optional()
			// Allow additional properties for forward compatibility
			// Note: This is for financial webhooks so we're being permissive
			// but still validating the core required fields
		})
		.passthrough() // Allow additional properties
});

// Export for route usage
export const webhookValidation = {
	ccpaymentWebhook: ccpaymentWebhookValidation
};
