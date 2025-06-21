import { z } from 'zod';

/*
 * Centralised XP / DGT economy configuration.
 * Do NOT import numbers directly anywhere else – always reference this object.
 * Values are mirrored from XP-DGT-SOURCE-OF-TRUTH.md (Smart-Adjustables section).
 */

// -----------------------------
// 1.  Zod schema for validation
// -----------------------------
export const EconomyConfigSchema = z
	.object({
		DGT_TO_USD: z.number().positive(),
		XP_PER_DGT: z.number().int().positive(),
		MAX_XP_PER_DAY: z.number().int().positive(),
		MAX_TIP_XP_PER_DAY: z.number().int().positive(),
		MIN_TIP_DGT: z.number().positive(),
		TIP_FEE_PERCENTAGE: z.number().positive(),
		FAUCET_REWARD_XP: z.number().int().positive(),
		FAUCET_REWARD_DGT: z.number().positive(),
		MIN_WITHDRAWAL_DGT: z.number().positive(),
		levelXPMap: z.record(z.string(), z.number().int().positive()),
		referralRewards: z.object({
			referee: z.object({ dgt: z.number().positive(), xp: z.number().int().positive() }),
			referrer: z.object({ dgt: z.number().positive(), xp: z.number().int().positive() })
		}),
		rainSettings: z.object({
			minAmount: z.number().positive(),
			maxRecipients: z.number().int().positive(),
			cooldownSeconds: z.number().int().positive()
		})
	})
	.strict();

// -----------------------------
// 2.  Runtime configuration
// -----------------------------
export const economyConfig = {
	DGT_TO_USD: 0.1,
	XP_PER_DGT: 1000,
	MAX_XP_PER_DAY: 1000,
	MAX_TIP_XP_PER_DAY: 200,
	MIN_TIP_DGT: 1,
	TIP_FEE_PERCENTAGE: 0.05,
	FAUCET_REWARD_XP: 50,
	FAUCET_REWARD_DGT: 0.5,
	MIN_WITHDRAWAL_DGT: 3,
	levelXPMap: {
		2: 250,
		3: 750,
		4: 1500,
		5: 2500,
		6: 4000,
		7: 6000,
		8: 8500,
		9: 11500,
		10: 15000
	},
	referralRewards: {
		referee: { dgt: 1, xp: 50 },
		referrer: { dgt: 5, xp: 200 }
	},
	rainSettings: {
		minAmount: 5,
		maxRecipients: 15,
		cooldownSeconds: 3600
	}
} as const;

// Validate once at module init – will throw on bad edit
EconomyConfigSchema.parse(economyConfig);

// -----------------------------
// 3.  Helper utilities
// -----------------------------
export type EconomyConfig = typeof economyConfig;

export const getEconomyConfig = (): EconomyConfig => economyConfig;

// Derive helper for level formula ≥ 11
export const getXpForLevel = (level: number): number => {
	if (level <= 1) return 0;
	if (level <= 10) {
		const xp = (economyConfig.levelXPMap as Record<number, number>)[
			level as keyof typeof economyConfig.levelXPMap
		];
		if (xp !== undefined) return xp;
	}
	// Formula for level 11+
	return level * level * 250 - 250;
};
