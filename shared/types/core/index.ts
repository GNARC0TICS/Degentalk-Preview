/**
 * Core Domain Types Barrel Export
 *
 * Explicit exports for all core business entity types.
 * Tree-shakable and maintains clean public API.
 */

// User types have been consolidated to shared/types/user.types.ts
// Import from there instead:
// import { User, UserSummary, PublicUser } from '@shared/types/user.types';

// Forum domain types
export type {
	Forum,
	ForumSettings,
	ForumPrefix,
	ForumRule,
	ForumStats,
	Thread,
	ThreadMetadata,
	Post,
	PostMetadata,
	PostReaction,
	ThreadView,
	ThreadSubscription,
	CreateThreadRequest,
	UpdateThreadRequest,
	CreatePostRequest,
	UpdatePostRequest,
	ThreadSearchParams,
	PostSearchParams,
	ThreadWithAuthor,
	PostWithAuthor,
	ThreadSummary,
	ForumHierarchy,
	ThreadPreview
} from './forum.types.js';

// Forum type guards
export {
	isForum,
	isThread,
	isPost,
	isThreadSubscription,
	isThreadView,
	isPostReaction
} from './forum.types.js';

// Economy domain types
export type {
	DGTToken,
	Wallet,
	WalletFeatures,
	WalletLimits,
	Transaction,
	TransactionReference,
	TransactionMetadata,
	PendingTransaction,
	Tip,
	Purchase,
	PurchaseItem,
	Withdrawal,
	EconomyStats,
	WalletHolder,
	CreateTransactionRequest,
	WithdrawRequest,
	TipRequest,
	PurchaseRequest,
	WalletHistoryParams,
	WalletWithUser,
	TransactionWithWallets,
	WalletSummary,
	TransactionSummary
} from './economy.types.js';

// Economy type guards and helpers
export {
	isWallet,
	isTransaction,
	isPendingTransaction,
	isTip,
	isWithdrawal,
	toDGTAmount,
	fromDGTAmount,
	DGT_DECIMALS,
	DGT_PRECISION
} from './economy.types.js';

// Cosmetics domain types
export type {
	ItemRarity,
	ItemCategory,
	ItemType,
	ShopItem,
	ItemPrice,
	ItemRequirements,
	ItemMetadata,
	ItemEffects,
	ItemStats,
	ItemStock,
	Frame,
	FrameBorderStyle,
	FrameAnimation,
	Badge,
	Title,
	TitleEffects,
	UserCosmetics,
	CosmeticInventory,
	InventoryItem,
	EquippedItems,
	ItemBundle,
	BundleItem,
	PurchaseItemRequest,
	EquipItemRequest,
	ShopSearchParams,
	ShopItemPreview,
	ItemWithOwnership,
	RarityConfig
} from './cosmetics.types.js';

// Cosmetics type guards and constants
export {
	isShopItem,
	isFrame,
	isBadge,
	isTitle,
	isItemBundle,
	isUserCosmetics,
	RARITY_COLORS
} from './cosmetics.types.js';
