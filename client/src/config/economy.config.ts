import { z } from 'zod';

/**
 * Economy configuration for XP, DGT, shop, tip/rain, and progression curve.
 */

// -------------------- XP Section --------------------
/**
 * XP reward values for various actions.
 */
export const XpRewardsSchema = z.object({
  /** XP for creating a new thread */
  newThread: z.number(),
  /** XP for creating a new post */
  newPost: z.number(),
  /** XP for receiving a like */
  receivedLike: z.number(),
  /** XP for receiving a reaction */
  receivedReaction: z.number(),
  /** General XP per action */
  generalXpPerAction: z.number(),
  /** XP threshold for multipliers */
  multiplierThreshold: z.number(),
  /** XP for daily login */
  dailyLogin: z.number(),
  /** XP for weekly bonus */
  weeklyBonus: z.number(),
  /** XP for referral */
  referral: z.number(),
  /** XP for badge award */
  badgeAward: z.number(),
  /** XP for comment */
  comment: z.number(),
});

export type XpRewards = z.infer<typeof XpRewardsSchema>;

/**
 * XP progression curve config.
 */
export const XpProgressionSchema = z.object({
  /** Base for exponential curve (e.g., 1.25) */
  base: z.number(),
  /** Minimum XP for level 1 */
  minXP: z.number(),
  /** Maximum XP for highest level */
  maxXP: z.number(),
});

export type XpProgression = z.infer<typeof XpProgressionSchema>;

// -------------------- DGT Section --------------------
/**
 * DGT tokenomics and limits.
 */
export const DgtConfigSchema = z.object({
  /** DGT to USD peg (if any) */
  pegUSD: z.number(),
  /** Daily tip limit in DGT */
  tipLimitDaily: z.number(),
  /** Rain event limit in DGT */
  rainLimit: z.number(),
  /** Minimum withdrawal amount */
  minWithdrawal: z.number(),
  /** Withdrawal fee percent */
  withdrawalFeePercent: z.number(),
  /** Reward distribution delay (hours) */
  rewardDistributionDelayHours: z.number(),
  /** Tip burn percent */
  tipBurnPercent: z.number(),
  /** Tip recipient percent */
  tipRecipientPercent: z.number(),
});

export type DgtConfig = z.infer<typeof DgtConfigSchema>;

// -------------------- Shop Section --------------------
/**
 * Shop item prices and vanity item costs.
 */
export const ShopConfigSchema = z.object({
  /** Vanity item prices by type */
  vanityItemPrices: z.record(z.string(), z.number()),
});

export type ShopConfig = z.infer<typeof ShopConfigSchema>;

// -------------------- Tip/Rain Section --------------------
/**
 * Tip and rain settings.
 */
export const TipRainConfigSchema = z.object({
  /** Tip settings */
  tip: z.object({
    enabled: z.boolean(),
    minAmountDGT: z.number(),
    minAmountUSDT: z.number(),
    maxAmountDGT: z.number(),
    maxAmountUSDT: z.number(),
    burnPercentage: z.number(),
    processingFeePercentage: z.number(),
    cooldownSeconds: z.number(),
  }),
  /** Rain settings */
  rain: z.object({
    enabled: z.boolean(),
    minAmountDGT: z.number(),
    minAmountUSDT: z.number(),
    maxRecipients: z.number(),
    cooldownSeconds: z.number(),
  }),
});

export type TipRainConfig = z.infer<typeof TipRainConfigSchema>;

// -------------------- Airdroppable Tokens Section --------------------
/**
 * Defines a token type that can be airdropped.
 */
export const AirdroppableTokenSchema = z.object({
  /** Unique key for the token (e.g., 'XP', 'DGT') */
  key: z.string(),
  /** Display label for the token (e.g., 'XP (Experience Points)') */
  label: z.string(),
});

export type AirdroppableToken = z.infer<typeof AirdroppableTokenSchema>;

// -------------------- Main Economy Config --------------------
export const EconomyConfigSchema = z.object({
  xp: XpRewardsSchema,
  progression: XpProgressionSchema,
  dgt: DgtConfigSchema,
  shop: ShopConfigSchema,
  tipRain: TipRainConfigSchema,
  airdroppableTokens: z.record(z.string(), AirdroppableTokenSchema),
});

/**
 * Default economy config reflecting current hardcoded values.
 */
export const economyConfig = {
  xp: {
    newThread: 10,
    newPost: 5,
    receivedLike: 2,
    receivedReaction: 1,
    generalXpPerAction: 5,
    multiplierThreshold: 1000,
    dailyLogin: 5, // from admin UI default
    weeklyBonus: 50, // from admin UI default
    referral: 100, // from admin UI default
    badgeAward: 25, // from admin UI default
    comment: 5, // from admin UI default
  },
  progression: {
    base: 1.25, // from xpConfig.ts
    minXP: 0,
    maxXP: 100000,
  },
  dgt: {
    pegUSD: 0.10, // TODO: Confirm if this is fixed or dynamic
    tipLimitDaily: 1000, // TODO: Confirm actual daily cap
    rainLimit: 1500, // TODO: Confirm actual rain cap
    minWithdrawal: 5, // from dgtEconomyParameters
    withdrawalFeePercent: 0, // from dgtEconomyParameters
    rewardDistributionDelayHours: 24, // from dgtEconomyParameters
    tipBurnPercent: 10, // from dgtEconomyParameters
    tipRecipientPercent: 90, // from dgtEconomyParameters
  },
  shop: {
    vanityItemPrices: {
      animatedFlair: 500,
      signatureFont: 250,
      // TODO: Add more from shop UI/config
    },
  },
  tipRain: {
    tip: {
      enabled: true,
      minAmountDGT: 10,
      minAmountUSDT: 0.1,
      maxAmountDGT: 1000,
      maxAmountUSDT: 100,
      burnPercentage: 5,
      processingFeePercentage: 2.5,
      cooldownSeconds: 10,
    },
    rain: {
      enabled: true,
      minAmountDGT: 10,
      minAmountUSDT: 1,
      maxRecipients: 15,
      cooldownSeconds: 60,
    },
  },
  airdroppableTokens: {
    xp: { key: 'XP', label: 'XP (Experience Points)' },
    dgt: { key: 'DGT', label: 'DGT (Digital Gold Token)' },
  },
} as const; 