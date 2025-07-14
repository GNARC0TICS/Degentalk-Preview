/**
 * CCPayment Webhook Validation (v2)
 *
 * This module provides validation schemas for incoming CCPayment webhooks.
 * For v2, we primarily care about the presence of headers, as the body is a raw string
 * that gets parsed after signature validation.
 */

import { z } from 'zod';

export const ccpaymentWebhookHeadersSchema = z.object({
	headers: z.object({
		Appid: z.string({
			required_error: 'CCPayment Appid header is required'
		}),
		Sign: z.string({
			required_error: 'CCPayment Sign header is required'
		}),
		Timestamp: z.string({
			required_error: 'CCPayment Timestamp header is required'
		}),
	}).strip(), // Use .strip() to remove any other headers that might be present
});