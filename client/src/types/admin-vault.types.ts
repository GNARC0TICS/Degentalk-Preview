/**
 * Extended vault types for admin management
 * These extend the base types with admin-specific properties
 */

import type { BaseVaultItem, ItemRarity, UnlockMethod } from './vault.types';

// Extended rarity to include seasonal
export type AdminItemRarity = ItemRarity | 'seasonal';

// Extended unlock methods to include lootbox
export type AdminUnlockMethod = UnlockMethod | 'lootbox';

// Extended vault item for admin management
export interface AdminVaultItem extends Omit<BaseVaultItem, 'rarity' | 'unlockMethods'> {
	rarity: AdminItemRarity;
	unlockMethods: AdminUnlockMethod[];
	releaseDateUtc?: string;
	expiryDateUtc?: string;
	dropChance?: number;
}