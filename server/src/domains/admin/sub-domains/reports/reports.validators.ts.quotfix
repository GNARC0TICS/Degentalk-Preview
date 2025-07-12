/**
 * Admin Reports Validators
 *
 * Zod validation schemas for reports and moderation actions.
 */

import { z } from 'zod';

// Schema for fetching reports with pagination and filters
export const GetReportsQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	status: z.enum(['pending', 'resolved', 'dismissed', 'all']).optional(),
	type: z.enum(['post', 'thread', 'message', 'user', 'all']).optional(),
	search: z.string().optional(),
	sortBy: z.string().optional().default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Schema for resolving or dismissing a report
export const ReportActionSchema = z.object({
	notes: z.string().optional()
});

// Schema for banning a user
export const BanUserSchema = z.object({
	reason: z.string().min(1, { message: 'Ban reason is required.' }),
	duration: z.string().optional() // e.g., "7d", "1m", "permanent"
	// notifyUser: z.boolean().default(true), // This seems like a server-side decision, not client input
});

// Schema for deleting content
export const DeleteContentSchema = z.object({
	reason: z.string().min(1, { message: 'Deletion reason is required.' })
});

export type GetReportsQueryInput = z.infer<typeof GetReportsQuerySchema>;
export type ReportActionInput = z.infer<typeof ReportActionSchema>;
export type BanUserInput = z.infer<typeof BanUserSchema>;
export type DeleteContentInput = z.infer<typeof DeleteContentSchema>;
