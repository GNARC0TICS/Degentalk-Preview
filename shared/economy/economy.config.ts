import { z } from 'zod';
import type { ForumId } from '@degentalk/db/types';
import { logger } from "../../server/src/core/logger";
import { UserId } from "@shared/types";

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
		}),
		// New XP multiplier protection settings
		xpMultiplierLimits: z.object({
			maxTotalMultiplier: z.number().positive(),
			maxRoleMultiplier: z.number().positive(),
			maxForumMultiplier: z.number().positive(),
			stackingRule: z.enum(['additive', 'multiplicative', 'best_of', 'weighted_average']),
			enforcementMode: z.enum(['strict', 'warn', 'log_only'])
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
	},
	// XP multiplier protection configuration
	xpMultiplierLimits: {
		// Maximum total multiplier from all sources combined (suggested 3.5x)
		maxTotalMultiplier: 3.5,
		// Maximum multiplier from user roles (prevents super-admin abuse)
		maxRoleMultiplier: 2.5,
		// Maximum multiplier from forum-specific bonuses
		maxForumMultiplier: 2.0,
		// How multiple multipliers combine:
		// - 'additive': (role - 1) + (forum - 1) + 1 (linear stacking)
		// - 'multiplicative': role * forum (exponential stacking)
		// - 'best_of': max(role, forum) (highest wins)
		// - 'weighted_average': Weighted average based on source priority
		stackingRule: 'additive' as const,
		// How violations are handled:
		// - 'strict': Cap multipliers, log warning
		// - 'warn': Log warning but allow
		// - 'log_only': Silent logging for analysis
		enforcementMode: 'strict' as const
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

// -----------------------------
// 4. XP Multiplier Protection
// -----------------------------

/**
 * Multiplier combination strategies
 */
export const MultiplierStrategy = {
	/**
	 * Additive stacking: (role - 1) + (forum - 1) + 1
	 * Example: role=1.5, forum=1.3 → (0.5) + (0.3) + 1 = 1.8x
	 */
	additive: (roleMultiplier: number, forumMultiplier: number): number => {
		return roleMultiplier - 1 + (forumMultiplier - 1) + 1;
	},

	/**
	 * Multiplicative stacking: role * forum
	 * Example: role=1.5, forum=1.3 → 1.5 * 1.3 = 1.95x
	 */
	multiplicative: (roleMultiplier: number, forumMultiplier: number): number => {
		return roleMultiplier * forumMultiplier;
	},

	/**
	 * Best of: max(role, forum)
	 * Example: role=1.5, forum=1.3 → max(1.5, 1.3) = 1.5x
	 */
	bestOf: (roleMultiplier: number, forumMultiplier: number): number => {
		return Math.max(roleMultiplier, forumMultiplier);
	},

	/**
	 * Weighted average: role gets 60% weight, forum gets 40% weight
	 * Example: role=1.5, forum=1.3 → (1.5 * 0.6) + (1.3 * 0.4) = 1.42x
	 */
	weightedAverage: (roleMultiplier: number, forumMultiplier: number): number => {
		return roleMultiplier * 0.6 + forumMultiplier * 0.4;
	}
} as const;

/**
 * Sanitizes and combines multiple XP multipliers according to economy config rules
 *
 * @param roleMultiplier - Multiplier from user's role(s)
 * @param forumMultiplier - Multiplier from forum settings
 * @param contextInfo - Optional context for logging
 * @returns Sanitized total multiplier within configured limits
 */
export function sanitizeMultiplier(
	roleMultiplier: number,
	forumMultiplier: number,
	contextInfo?: {
		userId?: UserId;
		forumId?: ForumId;
		action?: string;
	}
): {
	finalMultiplier: number;
	originalMultiplier: number;
	wasCapped: boolean;
	violations: string[];
} {
	const config = economyConfig.xpMultiplierLimits;
	const violations: string[] = [];

	// Sanitize individual multipliers first
	let sanitizedRole = Math.max(1, roleMultiplier);
	let sanitizedForum = Math.max(1, forumMultiplier);

	// Check individual caps
	if (sanitizedRole > config.maxRoleMultiplier) {
		violations.push(
			`Role multiplier ${sanitizedRole.toFixed(2)} exceeds cap ${config.maxRoleMultiplier}`
		);
		sanitizedRole = config.maxRoleMultiplier;
	}

	if (sanitizedForum > config.maxForumMultiplier) {
		violations.push(
			`Forum multiplier ${sanitizedForum.toFixed(2)} exceeds cap ${config.maxForumMultiplier}`
		);
		sanitizedForum = config.maxForumMultiplier;
	}

	// Combine multipliers according to stacking rule
	let combinedMultiplier: number;
	const stackingRule = config.stackingRule as string;
	switch (stackingRule) {
		case 'additive':
			combinedMultiplier = MultiplierStrategy.additive(sanitizedRole, sanitizedForum);
			break;
		case 'multiplicative':
			combinedMultiplier = MultiplierStrategy.multiplicative(sanitizedRole, sanitizedForum);
			break;
		case 'best_of':
			combinedMultiplier = MultiplierStrategy.bestOf(sanitizedRole, sanitizedForum);
			break;
		case 'weighted_average':
			combinedMultiplier = MultiplierStrategy.weightedAverage(sanitizedRole, sanitizedForum);
			break;
		default:
			combinedMultiplier = MultiplierStrategy.additive(sanitizedRole, sanitizedForum);
	}

	const originalMultiplier = combinedMultiplier;

	// Apply total cap
	let finalMultiplier = combinedMultiplier;
	if (combinedMultiplier > config.maxTotalMultiplier) {
		violations.push(
			`Total multiplier ${combinedMultiplier.toFixed(2)} exceeds cap ${config.maxTotalMultiplier}`
		);
		finalMultiplier = config.maxTotalMultiplier;
	}

	const wasCapped = finalMultiplier !== originalMultiplier || violations.length > 0;

	// Handle enforcement
	if (violations.length > 0 && contextInfo) {
		const logData = {
			userId: contextInfo.userId,
			forumId: contextInfo.forumId,
			action: contextInfo.action,
			roleMultiplier: sanitizedRole,
			forumMultiplier: sanitizedForum,
			stackingRule: config.stackingRule,
			originalMultiplier: originalMultiplier.toFixed(3),
			finalMultiplier: finalMultiplier.toFixed(3),
			violations
		};

		const enforcementMode = config.enforcementMode as string;
		switch (enforcementMode) {
			case 'strict':
				console.warn('XP_MULTIPLIER_VIOLATION', 'Multiplier capped due to violations', logData);
				break;
			case 'warn':
				console.warn('XP_MULTIPLIER_WARNING', 'Multiplier violations detected', logData);
				// In warn mode, return original uncapped multiplier
				finalMultiplier = originalMultiplier;
				break;
			case 'log_only':
				logger.info('XP_MULTIPLIER_ANALYSIS', 'Multiplier data logged', logData);
				// In log_only mode, return original uncapped multiplier
				finalMultiplier = originalMultiplier;
				break;
		}
	}

	// Ensure minimum multiplier of 1.0
	finalMultiplier = Math.max(1.0, finalMultiplier);

	return {
		finalMultiplier,
		originalMultiplier,
		wasCapped,
		violations
	};
}

/**
 * Quick utility to get a safe multiplier value
 * @param roleMultiplier Role-based multiplier
 * @param forumMultiplier Forum-based multiplier
 * @returns Clamped multiplier value
 */
export function getSafeMultiplier(roleMultiplier: number, forumMultiplier: number): number {
	return sanitizeMultiplier(roleMultiplier, forumMultiplier).finalMultiplier;
}
