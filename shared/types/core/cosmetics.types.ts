import type { UserId, ItemId, FrameId, BadgeId, TitleId, Id } from '../ids';

/**
 * Cosmetics Domain Types
 * 
 * Types for shop items, cosmetics, frames, badges, and visual customization.
 * Ensures type safety for all cosmetic and shop operations.
 */

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type ItemCategory = 'frame' | 'badge' | 'title' | 'effect' | 'emoji' | 'theme';
export type ItemType = 'cosmetic' | 'consumable' | 'permanent' | 'limited';

export interface ShopItem<TId extends Id<any> = ItemId> {
  id: TId;
  name: string;
  description: string;
  category: ItemCategory;
  type: ItemType;
  rarity: ItemRarity;
  price: ItemPrice;
  requirements: ItemRequirements;
  metadata: ItemMetadata;
  stock: ItemStock;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemPrice {
  dgt: number;
  originalPrice?: number;
  discount?: {
    percentage: number;
    endsAt: Date;
  };
  bundlePrice?: {
    quantity: number;
    price: number;
  };
}

export interface ItemRequirements {
  level?: number;
  role?: string;
  achievements?: string[];
  items?: ItemId[];
  season?: string;
  event?: string;
}

export interface ItemMetadata {
  previewUrl?: string;
  thumbnailUrl?: string;
  animationUrl?: string;
  colors?: string[];
  effects?: ItemEffects;
  stats?: ItemStats;
  tags: string[];
}

export interface ItemEffects {
  glow?: {
    color: string;
    intensity: number;
  };
  particle?: {
    type: string;
    color: string;
    density: number;
  };
  animation?: {
    type: string;
    duration: number;
    loop: boolean;
  };
}

export interface ItemStats {
  durability?: number;
  uses?: number;
  cooldown?: number;
  bonusXp?: number;
  bonusDgt?: number;
}

export interface ItemStock {
  type: 'unlimited' | 'limited' | 'unique';
  total?: number;
  remaining?: number;
  perUser?: number;
}

export interface Frame extends ShopItem<FrameId> {
  category: 'frame';
  cssClass: string;
  borderStyle: FrameBorderStyle;
  animations: FrameAnimation[];
}

export interface FrameBorderStyle {
  width: number;
  style: 'solid' | 'gradient' | 'animated' | 'custom';
  color?: string;
  gradient?: {
    colors: string[];
    angle: number;
  };
  pattern?: string;
}

export interface FrameAnimation {
  name: string;
  keyframes: string;
  duration: number;
  timing: string;
  iterationCount: number | 'infinite';
}

export interface Badge extends ShopItem<BadgeId> {
  category: 'badge';
  icon: string;
  size: 'small' | 'medium' | 'large';
  position: 'prefix' | 'suffix' | 'overlay';
  stackable: boolean;
  maxStack: number;
}

export interface Title extends ShopItem<TitleId> {
  category: 'title';
  text: string;
  color: string;
  font?: string;
  effects?: TitleEffects;
}

export interface TitleEffects {
  gradient?: string[];
  shadow?: string;
  outline?: string;
  animation?: string;
}

export interface UserCosmetics {
  userId: UserId;
  activeFrame: FrameId | null;
  activeBadges: BadgeId[];
  activeTitle: TitleId | null;
  activeEffects: string[];
  inventory: CosmeticInventory;
  favorites: ItemId[];
  equipped: EquippedItems;
}

export interface CosmeticInventory {
  items: InventoryItem[];
  slots: number;
  usedSlots: number;
}

export interface InventoryItem {
  itemId: ItemId;
  purchasedAt: Date;
  expiresAt?: Date;
  uses?: number;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface EquippedItems {
  frame?: FrameId;
  badges: BadgeId[];
  title?: TitleId;
  effects: string[];
  theme?: string;
}

export interface ItemBundle {
  id: string;
  name: string;
  description: string;
  items: BundleItem[];
  price: number;
  discount: number;
  savings: number;
  expiresAt?: Date;
  stock?: number;
}

export interface BundleItem {
  itemId: ItemId;
  quantity: number;
  isBonus: boolean;
}

// Request/Response types
export interface PurchaseItemRequest {
  itemId: ItemId;
  quantity?: number;
  giftToUserId?: UserId;
}

export interface EquipItemRequest {
  itemId: ItemId;
  slot?: string;
}

export interface ShopSearchParams {
  query?: string;
  category?: ItemCategory;
  rarity?: ItemRarity;
  minPrice?: number;
  maxPrice?: number;
  requirementsmet?: boolean;
  inStock?: boolean;
  sortBy?: 'price' | 'rarity' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

// Type guards
export function isShopItem(value: unknown): value is ShopItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'category' in value &&
    'price' in value
  );
}

export function isFrame(value: unknown): value is Frame {
  return isShopItem(value) && 'category' in value && value.category === 'frame';
}

export function isBadge(value: unknown): value is Badge {
  return isShopItem(value) && 'category' in value && value.category === 'badge';
}

export function isTitle(value: unknown): value is Title {
  return isShopItem(value) && 'category' in value && value.category === 'title';
}

export function isItemBundle(value: unknown): value is ItemBundle {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'items' in value &&
    'price' in value &&
    'discount' in value &&
    'savings' in value &&
    Array.isArray((value as ItemBundle).items) &&
    typeof (value as ItemBundle).price === 'number'
  );
}

export function isUserCosmetics(value: unknown): value is UserCosmetics {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    'inventory' in value &&
    'favorites' in value &&
    'equipped' in value &&
    Array.isArray((value as UserCosmetics).activeBadges) &&
    Array.isArray((value as UserCosmetics).favorites)
  );
}

// Utility types
export type ShopItemPreview = Pick<ShopItem, 'id' | 'name' | 'rarity' | 'price'> & {
  thumbnailUrl?: string;
};
export type ItemWithOwnership = ShopItem & { 
  owned: boolean; 
  equipped: boolean;
  purchasedAt?: Date;
};
export type RarityConfig = Record<ItemRarity, {
  color: string;
  backgroundColor: string;
  dropRate: number;
  priceMultiplier: number;
}>;

// Constants
export const RARITY_COLORS: RarityConfig = {
  common: {
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    dropRate: 0.60,
    priceMultiplier: 1.0
  },
  rare: {
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    dropRate: 0.25,
    priceMultiplier: 2.5
  },
  epic: {
    color: '#9333ea',
    backgroundColor: '#ede9fe',
    dropRate: 0.10,
    priceMultiplier: 5.0
  },
  legendary: {
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    dropRate: 0.04,
    priceMultiplier: 10.0
  },
  mythic: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    dropRate: 0.01,
    priceMultiplier: 25.0
  }
};