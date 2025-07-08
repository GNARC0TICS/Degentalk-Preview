import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type { WebhookMiddleware } from './types';
import { logger } from "../../../core/logger";
import { sendErrorResponse } from '@server/src/core/utils/transformer.helpers';

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
			sendErrorResponse(res, 'Missing webhook signature or timestamp', 400);
			return;
		}

		// Get app secret from environment
		const appSecret = process.env.CCPAYMENT_APP_SECRET;
		if (!appSecret) {
			logger.error('CCPAYMENT_APP_SECRET not configured');
			sendErrorResponse(res, 'Webhook validation not configured', 500);
			return;
		}

		// Verify timestamp is recent (within 5 minutes)
		const webhookTime = parseInt(timestamp);
		const currentTime = Math.floor(Date.now() / 1000);
		const timeDiff = Math.abs(currentTime - webhookTime);

		if (timeDiff > 300) {
			// 5 minutes
			sendErrorResponse(res, 'Webhook timestamp too old', 400);
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
			logger.error('Webhook signature validation failed', {
            				received: signature,
            				expected: expectedSignature,
            				payload: payloadString.substring(0, 100) + '...'
            			});

			sendErrorResponse(res, 'Invalid webhook signature', 401);
			return;
		}

		// Signature is valid, proceed
		next();
	} catch (error) {
		logger.error('Error validating webhook:', error);
		sendErrorResponse(res, 'Webhook validation error', 500);
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
			sendErrorResponse(res, 'Webhook rate limit exceeded', 429);
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
		logger.error('Error in webhook rate limiting:', error);
		sendErrorResponse(res, 'Webhook rate limiting error', 500);
	}
};

/**
 * Validate webhook payload structure
 */
const validateWebhookPayload = (req: Request, res: Response, next: NextFunction): void => {
	try {
		const { eventType } = req.body;

		if (!eventType) {
			sendErrorResponse(res, 'Missing eventType in webhook payload', 400);
			return;
		}

		const validEventTypes = ['deposit', 'withdraw', 'internal_transfer', 'swap'];
		if (!validEventTypes.includes(eventType)) {
			sendErrorResponse(res, `Invalid eventType: ${eventType}`, 400);
			return;
		}

		// Additional validation based on event type
		switch (eventType) {
			case 'deposit':
				if (!req.body.recordId || !req.body.uid || !req.body.amount) {
					sendErrorResponse(res, 'Missing required fields for deposit webhook', 400);
					return;
				}
				break;

			case 'withdraw':
				if (!req.body.recordId || !req.body.uid || !req.body.amount) {
					sendErrorResponse(res, 'Missing required fields for withdrawal webhook', 400);
					return;
				}
				break;

			case 'internal_transfer':
				if (!req.body.recordId || !req.body.fromUid || !req.body.toUid || !req.body.amount) {
					sendErrorResponse(res, 'Missing required fields for transfer webhook', 400);
					return;
				}
				break;

			case 'swap':
				if (!req.body.recordId || !req.body.uid || !req.body.fromAmount || !req.body.toCoinId) {
					sendErrorResponse(res, 'Missing required fields for swap webhook', 400);
					return;
				}
				break;
		}

		next();
	} catch (error) {
		logger.error('Error validating webhook payload:', error);
		sendErrorResponse(res, 'Webhook payload validation error', 500);
	}
};

export const webhookMiddleware: WebhookMiddleware = {
	validateCCPaymentWebhook,
	rateLimitWebhooks
};

// Export individual middleware functions
export { validateCCPaymentWebhook, rateLimitWebhooks, validateWebhookPayload };
