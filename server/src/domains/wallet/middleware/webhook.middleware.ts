import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type { WebhookMiddleware } from './types';

/**
 * Webhook Validation Middleware
 *
 * Validates incoming webhooks from CCPayment to ensure authenticity and prevent tampering.
 */

// In-memory store for webhook rate limiting (use Redis in production)
const webhookRateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Validate CCPayment webhook signature
 */
const validateCCPaymentWebhook = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const signature = req.headers['ccpayment-signature'] as string;
		const timestamp = req.headers['ccpayment-timestamp'] as string;

		if (!signature || !timestamp) {
			res.status(400).json({
				success: false,
				message: 'Missing webhook signature or timestamp',
				error: { type: 'MISSING_WEBHOOK_HEADERS' }
			});
			return;
		}

		// Get app secret from environment
		const appSecret = process.env.CCPAYMENT_APP_SECRET;
		if (!appSecret) {
			console.error('CCPAYMENT_APP_SECRET not configured');
			res.status(500).json({
				success: false,
				message: 'Webhook validation not configured',
				error: { type: 'CONFIGURATION_ERROR' }
			});
			return;
		}

		// Verify timestamp is recent (within 5 minutes)
		const webhookTime = parseInt(timestamp);
		const currentTime = Math.floor(Date.now() / 1000);
		const timeDiff = Math.abs(currentTime - webhookTime);

		if (timeDiff > 300) {
			// 5 minutes
			res.status(400).json({
				success: false,
				message: 'Webhook timestamp too old',
				error: {
					type: 'TIMESTAMP_TOO_OLD',
					maxAge: 300,
					actualAge: timeDiff
				}
			});
			return;
		}

		// Verify signature
		const payloadString = JSON.stringify(req.body);
		const stringToSign = timestamp + payloadString;
		const expectedSignature = crypto
			.createHmac('sha256', appSecret)
			.update(stringToSign)
			.digest('hex');

		if (signature !== expectedSignature) {
			console.error('Webhook signature validation failed', {
				received: signature,
				expected: expectedSignature,
				payload: payloadString.substring(0, 100) + '...'
			});

			res.status(401).json({
				success: false,
				message: 'Invalid webhook signature',
				error: { type: 'INVALID_SIGNATURE' }
			});
			return;
		}

		// Signature is valid, proceed
		next();
	} catch (error) {
		console.error('Error validating webhook:', error);
		res.status(500).json({
			success: false,
			message: 'Webhook validation error',
			error: { type: 'VALIDATION_ERROR' }
		});
	}
};

/**
 * Rate limit webhook requests to prevent spam/abuse
 */
const rateLimitWebhooks = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		// Use IP address for rate limiting
		const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
		const key = `webhook:${clientIP}`;
		const now = Date.now();
		const windowMs = 60 * 1000; // 1 minute window
		const maxRequests = 100; // Max 100 webhooks per minute per IP

		let record = webhookRateLimitStore.get(key);

		if (!record || now > record.resetTime) {
			// Create new record or reset expired one
			record = {
				count: 0,
				resetTime: now + windowMs
			};
		}

		if (record.count >= maxRequests) {
			res.status(429).json({
				success: false,
				message: 'Webhook rate limit exceeded',
				error: {
					type: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
					resetTime: new Date(record.resetTime).toISOString(),
					maxRequests
				}
			});
			return;
		}

		record.count++;
		webhookRateLimitStore.set(key, record);

		// Add rate limit headers
		res.set({
			'X-Webhook-RateLimit-Limit': maxRequests.toString(),
			'X-Webhook-RateLimit-Remaining': (maxRequests - record.count).toString(),
			'X-Webhook-RateLimit-Reset': record.resetTime.toString()
		});

		next();
	} catch (error) {
		console.error('Error in webhook rate limiting:', error);
		res.status(500).json({
			success: false,
			message: 'Webhook rate limiting error',
			error: { type: 'RATE_LIMIT_ERROR' }
		});
	}
};

/**
 * Validate webhook payload structure
 */
const validateWebhookPayload = (req: Request, res: Response, next: NextFunction): void => {
	try {
		const { eventType } = req.body;

		if (!eventType) {
			res.status(400).json({
				success: false,
				message: 'Missing eventType in webhook payload',
				error: { type: 'MISSING_EVENT_TYPE' }
			});
			return;
		}

		const validEventTypes = ['deposit', 'withdraw', 'internal_transfer', 'swap'];
		if (!validEventTypes.includes(eventType)) {
			res.status(400).json({
				success: false,
				message: `Invalid eventType: ${eventType}`,
				error: {
					type: 'INVALID_EVENT_TYPE',
					validTypes: validEventTypes
				}
			});
			return;
		}

		// Additional validation based on event type
		switch (eventType) {
			case 'deposit':
				if (!req.body.recordId || !req.body.uid || !req.body.amount) {
					res.status(400).json({
						success: false,
						message: 'Missing required fields for deposit webhook',
						error: { type: 'MISSING_DEPOSIT_FIELDS' }
					});
					return;
				}
				break;

			case 'withdraw':
				if (!req.body.recordId || !req.body.uid || !req.body.amount) {
					res.status(400).json({
						success: false,
						message: 'Missing required fields for withdrawal webhook',
						error: { type: 'MISSING_WITHDRAWAL_FIELDS' }
					});
					return;
				}
				break;

			case 'internal_transfer':
				if (!req.body.recordId || !req.body.fromUid || !req.body.toUid || !req.body.amount) {
					res.status(400).json({
						success: false,
						message: 'Missing required fields for transfer webhook',
						error: { type: 'MISSING_TRANSFER_FIELDS' }
					});
					return;
				}
				break;

			case 'swap':
				if (!req.body.recordId || !req.body.uid || !req.body.fromAmount || !req.body.toCoinId) {
					res.status(400).json({
						success: false,
						message: 'Missing required fields for swap webhook',
						error: { type: 'MISSING_SWAP_FIELDS' }
					});
					return;
				}
				break;
		}

		next();
	} catch (error) {
		console.error('Error validating webhook payload:', error);
		res.status(500).json({
			success: false,
			message: 'Webhook payload validation error',
			error: { type: 'PAYLOAD_VALIDATION_ERROR' }
		});
	}
};

export const webhookMiddleware: WebhookMiddleware = {
	validateCCPaymentWebhook,
	rateLimitWebhooks
};

// Export individual middleware functions
export { validateCCPaymentWebhook, rateLimitWebhooks, validateWebhookPayload };
