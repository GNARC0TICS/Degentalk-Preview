/**
 * XP Admin Validation Schemas
 */

import { z } from 'zod';

export const XpSettingsSchema = z.object({
	enabled: z.boolean().optional(),
	multiplier: z.number().min(0).max(10).optional(),
	maxDailyXp: z.number().min(0).optional()
});

const visualFields = {
	iconUrl: z.string().url().max(255).optional(),
	frameUrl: z.string().url().max(255).optional(),
	colorTheme: z.string().max(25).optional(),
	animationEffect: z.string().max(30).optional(),
	rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']).optional()
};

export const CreateLevelSchema = z
	.object({
		level: z.number().int().min(1).max(1000),
		xpRequired: z.number().int().min(0),
		rewardTitle: z.string().min(1).max(100).optional(),
		rewardDgt: z.number().min(0).optional(),
		description: z.string().max(500).optional(),
		unlocks: z.record(z.any()).optional()
	})
	.extend(visualFields);

export const UpdateLevelSchema = CreateLevelSchema.partial();

export const AdjustUserXpSchema = z.object({
	userId: z.string().uuid(),
	amount: z.number().int().min(-100000).max(100000),
	reason: z.string().min(1).max(200)
});
