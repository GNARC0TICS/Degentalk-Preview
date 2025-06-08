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
  /** Tailwind CSS class for badges (optional) */
  tailwindClass: z.string().optional(),
});

export type Rarity = z.infer<typeof RaritySchema>;

// -------------------- Emoji Category Section --------------------
/**
 * Emoji category definition.
 */
export const EmojiCategorySchema = z.object({
  /** Category key (e.g., 'basic', 'premium') */
  key: z.string(),
  /** Display label */
  label: z.string(),
});

export type EmojiCategory = z.infer<typeof EmojiCategorySchema>;

// -------------------- Emoji Unlock Method Section --------------------
/**
 * Emoji unlock method definition.
 */
export const EmojiUnlockMethodSchema = z.object({
  /** Unlock method key (e.g., 'free', 'shop') */
  key: z.string(),
  /** Display label */
  label: z.string(),
});

export type EmojiUnlockMethod = z.infer<typeof EmojiUnlockMethodSchema>;

// -------------------- Color Scheme Section --------------------
/**
 * Available color definition for UI elements.
 */
export const ColorSchemeSchema = z.object({
  /** Color name (display label) */
  name: z.string(),
  /** Color value (Tailwind class name or hex) */
  value: z.string(),
});

export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

// -------------------- Tag Styles Section --------------------
/**
 * Tag style definition for forum tags.
 */
export const TagStyleSchema = z.object({
  /** Tag key */
  key: z.string(),
  /** Display label */
  label: z.string(),
  /** CSS classes for styling */
  cssClasses: z.string(),
});

export type TagStyle = z.infer<typeof TagStyleSchema>;

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
  /** Emoji Category definitions */
  emojiCategories: z.record(z.string(), EmojiCategorySchema),
  /** Emoji Unlock Method definitions */
  emojiUnlockMethods: z.record(z.string(), EmojiUnlockMethodSchema),
  /** Available color schemes for UI elements like prefixes */
  colorSchemes: z.record(z.string(), ColorSchemeSchema),
  /** Tag styles for forum tags */
  tagStyles: z.record(z.string(), TagStyleSchema),
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
    common: { key: 'common', label: 'Common', color: '#A0AEC0', emoji: '⚪', tailwindClass: 'bg-gray-500' },
    uncommon: { key: 'uncommon', label: 'Uncommon', color: '#38A169', emoji: '🟢', tailwindClass: 'bg-green-500' },
    rare: { key: 'rare', label: 'Rare', color: '#4299E1', emoji: '🔵', tailwindClass: 'bg-blue-500' },
    epic: { key: 'epic', label: 'Epic', color: '#9F7AEA', emoji: '🟣', tailwindClass: 'bg-purple-500' },
    legendary: { key: 'legendary', label: 'Legendary', color: '#F6E05E', emoji: '🟡', tailwindClass: 'bg-amber-500 text-black' },
    mythic: { key: 'mythic', label: 'Mythic', color: '#F56565', emoji: '🔴', tailwindClass: 'bg-red-600' },
    cope: { key: 'cope', label: 'Cope', color: '#8B5CF6', emoji: '🟪', tailwindClass: 'bg-violet-500' },
    // TODO: Add more rarities as needed
  },
  emojiCategories: {
    basic: { key: 'basic', label: 'Basic' },
    premium: { key: 'premium', label: 'Premium' },
    special: { key: 'special', label: 'Special' },
    seasonal: { key: 'seasonal', label: 'Seasonal' },
    crypto: { key: 'crypto', label: 'Crypto' },
    standard: { key: 'standard', label: 'Standard' }
  },
  emojiUnlockMethods: {
    free: { key: 'free', label: 'Free' },
    shop: { key: 'shop', label: 'Shop Purchase' },
    xp: { key: 'xp', label: 'XP Achievement' },
    event: { key: 'event', label: 'Special Event' },
  },
  colorSchemes: {
    slate: { name: 'Slate', value: 'slate' },
    gray: { name: 'Gray', value: 'gray' },
    zinc: { name: 'Zinc', value: 'zinc' },
    red: { name: 'Red', value: 'red' },
    orange: { name: 'Orange', value: 'orange' },
    amber: { name: 'Amber', value: 'amber' },
    yellow: { name: 'Yellow', value: 'yellow' },
    lime: { name: 'Lime', value: 'lime' },
    green: { name: 'Green', value: 'green' },
    emerald: { name: 'Emerald', value: 'emerald' },
    teal: { name: 'Teal', value: 'teal' },
    cyan: { name: 'Cyan', value: 'cyan' },
    blue: { name: 'Blue', value: 'blue' },
    indigo: { name: 'Indigo', value: 'indigo' },
    violet: { name: 'Violet', value: 'violet' },
    purple: { name: 'Purple', value: 'purple' },
    fuchsia: { name: 'Fuchsia', value: 'fuchsia' },
    pink: { name: 'Pink', value: 'pink' },
    rose: { name: 'Rose', value: 'rose' },
  },
  tagStyles: {
    nfts: { key: 'nfts', label: 'NFTs', cssClasses: 'bg-purple-900/20 text-purple-300 border-purple-800/30' },
    eth: { key: 'eth', label: 'ETH', cssClasses: 'bg-blue-900/20 text-blue-300 border-blue-800/30' },
    solana: { key: 'solana', label: 'Solana', cssClasses: 'bg-emerald-900/20 text-emerald-300 border-emerald-800/30' },
    defi: { key: 'defi', label: 'DeFi', cssClasses: 'bg-cyan-900/20 text-cyan-300 border-cyan-800/30' },
    mindset: { key: 'mindset', label: 'Mindset', cssClasses: 'bg-amber-900/20 text-amber-300 border-amber-800/30' },
    casino: { key: 'casino', label: 'Casino', cssClasses: 'bg-red-900/20 text-red-300 border-red-800/30' },
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