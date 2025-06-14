import { z } from 'zod';

/**
 * Validator for creating a referral source
 */
export const createReferralSourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  metadata: z.record(z.any()).optional()
});

/**
 * Validator for recording a user referral
 */
export const recordUserReferralSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive integer'),
  referredByUserId: z.number().int().positive('Referred by user ID must be a positive integer').optional(),
  sourceSlug: z.string().min(1, 'Source slug is required')
});

/**
 * Type for creating a referral source
 */
export type CreateReferralSourceInput = z.infer<typeof createReferralSourceSchema>;

/**
 * Type for recording a user referral
 */
export type RecordUserReferralInput = z.infer<typeof recordUserReferralSchema>; 