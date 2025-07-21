import type { TitleId } from '@shared/types/ids';

/**
 * Admin Title type based on database schema
 * This is different from the cosmetics Title type
 */
export interface AdminTitle {
  id: TitleId;
  name: string;
  description?: string;
  iconUrl?: string;
  rarity?: string;
  // Enhanced customization fields
  emoji?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  glowColor?: string;
  glowIntensity?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  animation?: string;
  animationDuration?: number;
  // Role binding
  roleId?: string;
  // Metadata
  isShopItem?: boolean;
  isUnlockable?: boolean;
  unlockConditions?: Record<string, any>;
  shopPrice?: number;
  shopCurrency?: string;
  createdAt: string;
  updatedAt: string;
}