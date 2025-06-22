/**
 * User-facing Reports Validators
 *
 * Defines validation schemas for report endpoints.
 */

import { z } from 'zod';

export const CreateReportSchema = z.object({
	contentType: z.enum(['post', 'thread', 'message']),
	contentId: z.number().int().positive(),
	reason: z.enum([
		'spam',
		'harassment',
		'inappropriate_content',
		'hate_speech',
		'misinformation',
		'copyright_violation',
		'scam',
		'off_topic',
		'low_quality',
		'duplicate',
		'other'
	]),
	details: z.string().max(500).optional()
});
