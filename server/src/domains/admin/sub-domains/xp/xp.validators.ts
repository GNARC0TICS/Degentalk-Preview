/**
 * XP Admin Validation Schemas
 */

import { z } from 'zod';

export const XpSettingsSchema = z.object({
	enabled: z.boolean().optional(),
	multiplier: z.number().min(0).max(10).optional(),
	maxDailyXp: z.number().min(0).optional()
});

export const CreateLevelSchema = z.object({
	level: z.number().int().min(1).max(1000),
	xpRequired: z.number().int().min(0),
	title: z.string().min(1).max(100).optional(),
	rewardDgt: z.number().min(0).optional(),
	description: z.string().max(500).optional()
});

export const UpdateLevelSchema = CreateLevelSchema.partial();

export const AdjustUserXpSchema = z.object({
	userId: z.number().int().positive(),
	amount: z.number().int().min(-100000).max(100000),
	reason: z.string().min(1).max(200)
});
