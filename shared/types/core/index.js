/**
 * Core Domain Types Barrel Export
 *
 * Explicit exports for all core business entity types.
 * Tree-shakable and maintains clean public API.
 */
// User type guards
export { isUser, isUserProfile, isUserAchievement, isInventoryItem, isUserInventory } from './user.types.js';
// Forum type guards
export { isForum, isThread, isPost, isThreadSubscription, isThreadView, isPostReaction } from './forum.types.js';
// Economy type guards and helpers
export { isWallet, isTransaction, isPendingTransaction, isTip, isWithdrawal, toDGTAmount, fromDGTAmount, DGT_DECIMALS, DGT_PRECISION } from './economy.types.js';
// Cosmetics type guards and constants
export { isShopItem, isFrame, isBadge, isTitle, isItemBundle, isUserCosmetics, RARITY_COLORS } from './cosmetics.types.js';
