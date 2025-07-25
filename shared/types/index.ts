/**
 * Shared Types System - Main Export
 *
 * Centralized, type-safe access to all shared types.
 * Explicit exports ensure tree-shaking and clean APIs.
 */

/* eslint-disable degen/no-missing-branded-id-import */

// Re-export legacy API types (preserved for compatibility)
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

// Core domain types
export type {

	// Forum types
	Forum,
	ForumSettings,
	ForumPrefix,
	ForumRule,
	ForumStats,
	Post,
	PostMetadata,
	PostReaction,
	ThreadView,
	ThreadSubscription,
	CreatePostRequest,
	UpdatePostRequest,
	PostSearchParams,
	PostWithAuthor,
	ForumHierarchy,

	// Economy types
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
	TransactionSummary,

	// Cosmetics types
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
} from './core/index.js';

// Thread types (consolidated)
export type {
	Thread,
	ThreadUser,
	ThreadPrefix,
	ThreadTag,
	ThreadPermissions,
	ThreadListItem,
	CreateThreadInput,
	UpdateThreadInput,
	ThreadSearchParams,
	ThreadResponse,
	ThreadsListResponse
} from './thread.types.js';

// Type guards
export {
	isForum,
	isPost,
	isWallet,
	isTransaction,
	isShopItem,
	isFrame,
	isBadge,
	isTitle
} from './core/index.js';

export {
	isThread,
	hasThreadPermissions,
	isThreadListItem
} from './thread.types.js';

// Economy helpers
export { toDGTAmount, fromDGTAmount, DGT_DECIMALS, DGT_PRECISION, RARITY_COLORS } from './core/index.js';

// Role types (unified source of truth)
export type { 
	Role, 
	BasicRole
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

// Configuration schemas and types
export type {
	XpConfig,
	XpAction,
	XpMultiplier,
	LevelFormula,
	LevelMilestone,
	EconomyConfig,
	CurrencyConfig,
	FeeConfig,
	WalletLimits,
	DistributionConfig,
	StakingConfig,
	ShopPricing,
	FeaturesConfig,
	FeatureFlag,
	RolloutStrategy,
	Permission as ConfigPermission,
	AccessRule,
	ForumAccess
} from './config/index.js';

// Schema validators
export {
	XpConfigSchema,
	XpActionSchema,
	XpMultiplierSchema,
	LevelFormulaSchema,
	LevelMilestoneSchema,
	validateXpConfig,
	validatePartialXpConfig,
	defaultXpConfig,
	EconomyConfigSchema,
	CurrencyConfigSchema,
	FeeConfigSchema,
	WalletLimitsSchema,
	DistributionConfigSchema,
	StakingConfigSchema,
	ShopPricingSchema,
	validateEconomyConfig,
	validatePartialEconomyConfig,
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
} from './config/index.js';

// Validation utilities
export type { ValidationError } from './validation/index.js';

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
} from './validation/index.js';

// Frontend-safe ID types
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

// Common utility types
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

// Economy value types
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

// User type now in shared/types/user.types.ts
export type { User, UserSummary, PublicUser } from './user.types.js';

// Branded ID types
export * from './ids.js';

// Auth types removed - use User from user.types.ts

// ID creation helpers from utils
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
