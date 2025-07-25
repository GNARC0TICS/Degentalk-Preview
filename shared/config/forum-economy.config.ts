// Forum Economy Configuration
// This file contains all economy-related settings for forums

import { z } from 'zod';

// Schema for validation
export const forumEconomySchema = z.object({
	xp: z.object({
		createThread: z.number().positive(),
		reply: z.number().positive(),
		likeReceived: z.number().positive(),
		dailyCap: z.number().positive()
	}),
	tipping: z.object({
		min: z.number().positive(),
		max: z.number().positive(),
		currency: z.string()
	}),
	uploads: z.object({
		maxAvatarSizeMB: z.number().positive(),
		allowedTypes: z.array(z.string())
	}),
	themes: z.object({
		defaultZoneColor: z.string(),
		fallbackBannerUrl: z.string()
	})
});

export type ForumEconomyConfig = z.infer<typeof forumEconomySchema>;

export const forumEconomyConfig: ForumEconomyConfig = {
	xp: {
		createThread: 50,
		reply: 25,
		likeReceived: 10,
		dailyCap: 500
	},
	tipping: {
		min: 1,
		max: 1000,
		currency: 'DGT'
	},
	uploads: {
		maxAvatarSizeMB: 2,
		allowedTypes: ['image/jpeg', 'image/png']
	},
	themes: {
		defaultZoneColor: '#0ff',
		fallbackBannerUrl: '/static/default-banner.png'
	}
} as const;

// Validate on module load
try {
	forumEconomySchema.parse(forumEconomyConfig);
} catch (error) {
	console.error('Forum economy config validation failed:', error);
	throw error;
}