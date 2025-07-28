/**
 * Shared Types System - Main Export
 *
 * Centralized, type-safe access to all shared types.
 * Explicit exports ensure tree-shaking and clean APIs.
 * 
 * Organization:
 * 1. Core Domain Types (User, Forum, Thread, etc.)
 * 2. Economy Types (Wallet, Transaction, etc.)
 * 3. Configuration Types
 * 4. Utility Types & Helpers
 * 5. ID Types & Validators
 */

/* eslint-disable degen/no-missing-branded-id-import */

// ============================================
// API TYPES
// ============================================
export type {
	ApiSuccess,
	ApiError,
	ApiResponse,
	PaginationMeta,
	FilterMeta,
	PaginatedRequest,
	FilteredRequest,
	PaginatedFilteredRequest,
	ApiErrorCode,
	ControllerResponse,
	TypedRequest,
	TypedResponse,
	ExtractApiData
} from './api.types.js';

export type {
	BaseConfig,
	FeatureGate,
	ModuleConfig,
	ApiConfig,
	DatabaseConfig,
	CacheConfig,
	SecurityConfig,
	NotificationConfig,
	UIConfig,
	EconomyConfig as LegacyEconomyConfig,
	GamificationConfig,
	ForumConfig,
	SocialConfig,
	ConfigValidation,
	ConfigStore,
	EnvironmentConfig,
	ConfigChange,
	ConfigAuditLog,
	ConfigService
} from './config.types.js';

// ============================================
// CORE DOMAIN TYPES
// ============================================

// Forum & Content Types
// Forum types
export type {
	Forum,
	ForumSettings,
	ForumPrefix,
	ForumRule,
	ForumStats,
	Post as CorePost,
	PostMetadata,
	PostReaction,
	ThreadView,
	ThreadSubscription,
	CreatePostRequest,
	UpdatePostRequest,
	PostSearchParams,
	PostWithAuthor,
	ForumHierarchy
} from './forum-core.types.js';

// Post Types (display-ready with populated user data)
export type {
	Post,
	PostAuthor,
	CreatePostInput,
	UpdatePostInput
} from './post.types.js';

// Economy types
export type {
	DGTToken,
	Wallet,
	WalletFeatures,
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
} from './economy-core.types.js';

// Cosmetics types
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

// Thread Types
export type {
	Thread,
	ThreadUser,
	ThreadPrefix,
	ThreadTag,
	ThreadPermissions,
	ThreadListItem,
	MentionThread,
	CreateThreadInput,
	UpdateThreadInput,
	ThreadSearchParams,
	ThreadResponse,
	ThreadsListResponse
} from './thread.types.js';

// Type Guards
export {
	isForum,
	isPost
} from './forum-core.types.js';

export {
	isWallet,
	isTransaction
} from './economy-core.types.js';

export {
	isShopItem,
	isFrame,
	isBadge,
	isTitle
} from './cosmetics.types.js';

export {
	isThread,
	hasThreadPermissions,
	isThreadListItem
} from './thread.types.js';

// Economy helpers
export { toDGTAmount, fromDGTAmount, DGT_DECIMALS, DGT_PRECISION } from './economy-core.types.js';
export { RARITY_COLORS } from './cosmetics.types.js';

// ============================================
// USER & ROLE TYPES
// ============================================

// Role Types
export type { 
	Role, 
	RoleName,
	BasicRole,
	RoleEntity,
	RoleFormData,
	RoleWithUsers
} from './role.types.js';

export {
	roleHierarchy,
	roleAliases,
	getCanonicalRole,
	hasRoleAtLeast,
	isRole,
	isValidRole,
	canModerateShoutbox,
	canAccessAdminPanel,
	canModerateContent,
	canModerateMarket,
	isAdmin,
	isSuperAdmin,
	isModerator,
	isAdminOrModerator,
	getUserPermissions,
	hasRoleOrHigher
} from './role.types.js';

// User Types
export type { User, UserSummary, PublicUser } from './user.types.js';

// ============================================
// CONFIGURATION TYPES
// ============================================
export type {
	XpConfig,
	XpAction,
	XpMultiplier,
	LevelFormula,
	LevelMilestone
} from './xp.schema.js';

export type {
	EconomyConfig,
	CurrencyConfig,
	FeeConfig,
	WalletLimits,
	DistributionConfig,
	StakingConfig,
	ShopPricing
} from './economy.schema.js';

export type {
	FeaturesConfig,
	FeatureFlag,
	RolloutStrategy,
	Permission as ConfigPermission,
	AccessRule,
	ForumAccess
} from './features.schema.js';

// Schema validators
export {
	XpConfigSchema,
	XpActionSchema,
	XpMultiplierSchema,
	LevelFormulaSchema,
	LevelMilestoneSchema,
	validateXpConfig,
	validatePartialXpConfig,
	defaultXpConfig
} from './xp.schema.js';

export {
	EconomyConfigSchema,
	CurrencyConfigSchema,
	FeeConfigSchema,
	WalletLimitsSchema,
	DistributionConfigSchema,
	StakingConfigSchema,
	ShopPricingSchema,
	validateEconomyConfig,
	validatePartialEconomyConfig
} from './economy.schema.js';

export {
	FeaturesConfigSchema,
	FeatureFlagSchema,
	RolloutStrategySchema,
	PermissionSchema,
	RoleSchema,
	AccessRuleSchema,
	ForumAccessSchema,
	validateFeaturesConfig,
	validatePartialFeaturesConfig,
	evaluateFeatureFlag
} from './features.schema.js';

// ============================================
// VALIDATION & UTILITIES
// ============================================
export type { ValidationError } from './validation.js';

export {
	isValidUuid,
	isValidUserId,
	isValidDate,
	isValidDateString,
	isPositiveNumber,
	isNonNegativeNumber,
	isNonEmptyString,
	isValidEmail,
	isValidUsername,
	isNonEmptyArray,
	isArrayOf,
	hasProperty,
	hasProperties,
	validateApiInput,
	validateOptionalInput,
	isEnumValue,
	validatePaginationParams,
	validateSortParams,
	createValidationError
} from './validation.js';

// ============================================
// ID TYPES & VALIDATORS
// ============================================
export type {
	// Core entity IDs
	UserId,
	ThreadId,
	PostId,
	WalletId,
	TransactionId,
	ForumId,
	ItemId,
	FrameId,
	BadgeId,
	TitleId,
	PrefixId,

	// Extended entity IDs
	MissionId,
	AchievementId,
	ProductId,
	PathId,
	AdminId,
	ReportId,
	ConversationId,
	RoomId,
	LevelId,
	EntityId,
	ReporterId,
	ContentId,
	CategoryId,
	VaultId,
	AdminUserId,
	ModeratorId,
	BanId,
	WarningId,
	PermissionId,
	RoleId,
	DraftId,
	EmojiPackId,
	CosmeticId,
	PackageId,
	InventoryItemId,
	TemplateId,
	SubscriptionId,
	ActionId,
	TipId,
	EmojiId,
	TagId,
	OrderId,
	GroupId,
	StructureId,
	InventoryId,
	MessageId,
	AnnouncementId,
	MentionId,

	// Economy-specific IDs
	CryptoWalletId,
	RainEventId,
	WithdrawalId,
	DgtPackageId,
	PurchaseOrderId,

	// Generic ID helper
	Id
} from './ids.js';

// ID validation utilities
export {
	isValidUUID,
	isValidId,
	createIdValidator,
	isUserId,
	isThreadId,
	isPostId,
	isWalletId,
	isTransactionId,
	isForumId,
	isItemId,
	isFrameId,
	isBadgeId,
	isTitleId
} from './ids.js';

// ============================================
// COMMON UTILITY TYPES
// ============================================
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Timestamp utilities
export type Timestamped = {
	createdAt: Date;
	updatedAt: Date;
};

export type SoftDeletable = {
	deletedAt: Date | null;
};

export type Auditable = Timestamped & {
	createdBy?: string; // Use string for now to avoid circular dependency
	updatedBy?: string;
};

// API utilities
export type WithPagination<T> = {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

export type SearchResult<T> = WithPagination<T> & {
	query?: string;
	filters?: Record<string, unknown>;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
};

// ============================================
// ECONOMY TYPES
// ============================================
export type {
	// Amount types
	DgtAmount,
	UsdAmount,
	XpAmount,
	ReputationAmount,
	TipAmount,
	RainAmount,
	WithdrawalAmount,
	DepositAmount,
	FeeAmount,
	ExchangeRate,
	PriceInDgt,
	PriceInUsd,

	// Economy enums
	TransactionType,
	TransactionStatus,
	WithdrawalStatus,
	VaultStatus
} from './economy.js';

// Economy validation and utilities
export {
	isValidAmount,
	isDgtAmount,
	isUsdAmount,
	isXpAmount,
	asDgtAmount,
	asUsdAmount,
	asXpAmount,
	asTipAmount,
	asRainAmount,
	toDgtAmount,
	toUsdAmount,
	toXpAmount,
	ECONOMY_CONSTANTS
} from './economy.js';

// ============================================
// ID CREATION HELPERS
// ============================================
export {
	toUserId,
	toThreadId,
	toPostId,
	toForumId,
	toStructureId,
	toTransactionId,
	toWalletId,
	toItemId,
	toFrameId,
	toBadgeId,
	toTitleId,
	toTagId,
	toMissionId,
	toAchievementId,
	toProductId,
	toPathId,
	toAdminId,
	toReportId,
	toConversationId,
	toRoomId,
	toLevelId,
	toEntityId,
	toId,
	parseId,
	generateId,
	idsEqual,
	filterValidIds,
	parseIdParam,
	assertValidId,
	isValidNumericId,
	parseEntityIdParam
} from '../utils/id.js';
