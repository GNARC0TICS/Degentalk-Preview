import { z } from 'zod';

/**
 * Cosmetics configuration for username colors, avatar frames, badges, titles, emoji packs, shop cosmetic templates, and rarities.
 */

// -------------------- Rarity Section --------------------
/**
 * Cosmetic rarity definition.
 */
export const RaritySchema = z.object({
  /** Rarity key (e.g., 'common', 'rare') */
  key: z.string(),
  /** Display label */
  label: z.string(),
  /** Color (hex or Tailwind) */
  color: z.string(),
  /** Emoji or icon (optional) */
  emoji: z.string().optional(),
});

export type Rarity = z.infer<typeof RaritySchema>;

// -------------------- Cosmetic Item Section --------------------
/**
 * Cosmetic item definition (flair, frame, badge, etc.).
 */
export const CosmeticItemSchema = z.object({
  /** Unique ID */
  id: z.string(),
  /** Type (e.g., 'flair', 'avatarFrame', 'badge', 'title', 'emojiPack') */
  type: z.string(),
  /** Rarity key */
  rarity: z.string(),
  /** Price in DGT */
  price: z.number(),
  /** Display name */
  name: z.string(),
  /** Description */
  description: z.string(),
  /** Emoji/icon (optional) */
  emoji: z.string().optional(),
  /** Effect (optional, e.g., 'glow-red') */
  effect: z.string().optional(),
  /** Frame style (optional) */
  frameStyle: z.string().optional(),
  /** Image URL (optional) */
  imageUrl: z.string().optional(),
  /** Plugin reward type (optional) */
  pluginType: z.string().optional(),
  /** Plugin reward value (optional) */
  pluginValue: z.any().optional(),
});

export type CosmeticItem = z.infer<typeof CosmeticItemSchema>;

// -------------------- Shop Cosmetic Templates Section --------------------
/**
 * Shop cosmetic template definition.
 */
export const ShopCosmeticTemplateSchema = z.object({
  /** Template key */
  key: z.string(),
  /** Template object (JSON) */
  template: z.any(),
});

export type ShopCosmeticTemplate = z.infer<typeof ShopCosmeticTemplateSchema>;

// -------------------- Main Cosmetics Config --------------------
export const CosmeticsConfigSchema = z.object({
  /** Rarity definitions */
  rarities: z.record(z.string(), RaritySchema),
  /** All cosmetic items */
  items: z.record(z.string(), CosmeticItemSchema),
  /** Shop cosmetic templates */
  shopTemplates: z.record(z.string(), ShopCosmeticTemplateSchema),
  /** System role colors (for username override) */
  systemRoleColors: z.record(z.string(), z.string()),
});

/**
 * Default cosmetics config reflecting current hardcoded values and shop UI.
 */
export const cosmeticsConfig = {
  rarities: {
    common: { key: 'common', label: 'Common', color: '#A0AEC0', emoji: '⚪' },
    rare: { key: 'rare', label: 'Rare', color: '#4299E1', emoji: '🔵' },
    epic: { key: 'epic', label: 'Epic', color: '#9F7AEA', emoji: '🟣' },
    legendary: { key: 'legendary', label: 'Legendary', color: '#F6E05E', emoji: '🟡' },
    mythic: { key: 'mythic', label: 'Mythic', color: '#F56565', emoji: '🔴' },
    cope: { key: 'cope', label: 'Cope', color: '#8B5CF6', emoji: '🟪' },
    // TODO: Add more rarities as needed
  },
  items: {
    'exit-liquidity-flair': {
      id: 'exit-liquidity-flair',
      type: 'flair',
      rarity: 'legendary',
      price: 1000,
      name: 'Exit Liquidity',
      description: '💀 Flex your rekt status with this flair.',
      emoji: '💀',
      effect: 'glow-red',
    },
    'golden-frame': {
      id: 'golden-frame',
      type: 'avatarFrame',
      rarity: 'mythic',
      price: 2000,
      name: 'Golden Frame',
      description: 'Adds a golden frame around your avatar.',
      frameStyle: 'golden-shine',
      imageUrl: '/frames/gold-frame.png',
    },
    // TODO: Add all shop cosmetics, badges, titles, emoji packs, etc.
  },
  shopTemplates: {
    usernameColor: {
      key: 'usernameColor',
      template: {
        type: 'usernameColor',
        value: '#FF0000',
        name: 'Red Username',
        description: 'Makes your username appear in red',
      },
    },
    userTitle: {
      key: 'userTitle',
      template: {
        type: 'userTitle',
        value: 'VIP Member',
        name: 'VIP Title',
        description: 'Displays a custom title next to your username',
      },
    },
    avatarFrame: {
      key: 'avatarFrame',
      template: {
        type: 'avatarFrame',
        value: '/frames/gold-frame.png',
        name: 'Gold Frame',
        description: 'Adds a golden frame around your avatar',
      },
    },
    emojiPack: {
      key: 'emojiPack',
      template: {
        type: 'emojiPack',
        value: {
          custom_smile: '/emojis/custom-smile.gif',
          custom_laugh: '/emojis/custom-laugh.webp',
        },
        name: 'Custom Emoji Pack',
        description: 'Unlocks custom emojis for use in posts',
      },
    },
    featureUnlock: {
      key: 'featureUnlock',
      template: {
        type: 'featureUnlock',
        value: 'customSignatureFont',
        name: 'Custom Signature Font',
        description: 'Allows using custom fonts in your signature',
      },
    },
    // TODO: Add more templates as needed
  },
  systemRoleColors: {
    admin: '#D72638',
    mod: '#1E88E5',
    dev: '#8E24AA',
    // TODO: Add more system roles/colors as needed
  },
} as const; 