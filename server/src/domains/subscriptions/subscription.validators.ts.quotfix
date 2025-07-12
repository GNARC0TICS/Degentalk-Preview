/**
 * Subscription Validators
 *
 * Validation schemas and functions for subscription operations
 */

import { z } from 'zod';

// Purchase subscription validation
export const purchaseSubscriptionSchema = z.object({
	type: z.enum(['vip_pass', 'degen_pass'], {
		required_error: 'Subscription type is required',
		invalid_type_error: 'Invalid subscription type'
	})
});

// Cancel subscription validation
export const cancelSubscriptionSchema = z.object({
	reason: z.string().optional()
});

// Grant subscription validation (admin only)
export const grantSubscriptionSchema = z.object({
	userId: z.string().uuid('Invalid user ID format'),
	type: z.enum(['vip_pass', 'degen_pass'], {
		required_error: 'Subscription type is required',
		invalid_type_error: 'Invalid subscription type'
	}),
	reason: z.string().optional()
});

// Query parameters validation
export const subscriptionQuerySchema = z.object({
	page: z.string().regex(/^\d+$/).transform(Number).optional(),
	limit: z.string().regex(/^\d+$/).transform(Number).optional(),
	status: z.enum(['active', 'expired', 'cancelled', 'lifetime']).optional(),
	type: z.enum(['vip_pass', 'degen_pass']).optional(),
	month: z
		.string()
		.regex(/^(1[0-2]|[1-9])$/)
		.transform(Number)
		.optional(),
	year: z
		.string()
		.regex(/^\d{4}$/)
		.transform(Number)
		.optional()
});

// Benefit key validation
export const benefitKeySchema = z.object({
	benefitKey: z.string().min(1, 'Benefit key is required')
});

// Types
export type PurchaseSubscriptionRequest = z.infer<typeof purchaseSubscriptionSchema>;
export type CancelSubscriptionRequest = z.infer<typeof cancelSubscriptionSchema>;
export type GrantSubscriptionRequest = z.infer<typeof grantSubscriptionSchema>;
export type SubscriptionQuery = z.infer<typeof subscriptionQuerySchema>;
export type BenefitKeyRequest = z.infer<typeof benefitKeySchema>;
