/**
 * Wallet Middleware Index
 *
 * Central export point for all wallet security and validation middleware.
 */

export { securityMiddleware } from './security.middleware';
export {
	webhookMiddleware,
	validateCCPaymentWebhook,
	rateLimitWebhooks,
	validateWebhookPayload
} from './webhook.middleware';

// Re-export types for convenience
export type {
	SecurityMiddleware,
	WebhookMiddleware,
	RateLimitRecord,
	RateLimitResult,
	SecurityError,
	WebhookError
} from './types';

// Export combined middleware collections
export const walletMiddleware = {
	security: securityMiddleware,
	webhook: webhookMiddleware
};
