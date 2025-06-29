import { z } from 'zod';

export const featureFlagSchema = z.object({
	key: z.string(),
	description: z.string().optional(),
	isEnabled: z.boolean(),
	rolloutPercentage: z.number().min(0).max(100)
});

export const featureFlagsSchema = z.array(featureFlagSchema);
export type FeatureFlag = z.infer<typeof featureFlagSchema>;
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;
