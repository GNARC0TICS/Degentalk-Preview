/**
 * Shared Types System - Main Export
 * 
 * Centralized, type-safe access to all shared types.
 * Explicit exports ensure tree-shaking and clean APIs.
 */

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
} from './api.types';

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
} from './config.types';

// Core domain types
export type {
  // User types - Security-Enhanced
  User,
  PublicUser,
  AuthenticatedUserSelf,
  AdminUserDetail,
  UserRole,
  Permission,
  PermissionScope,
  SessionToken,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  UserSettings,
  DisplaySettings,
  UserStats,
  UserProfile,
  UserBadge,
  UserTitle,
  UserFrame,
  UserWallet,
  UserAchievement,
  UserInventory,
  CreateUserRequest,
  UpdateUserRequest,
  AdminUpdateUserRequest,
  UserSearchParams,
  UserWithWallet,
  UserWithStats,
  UserSummary,
  UserWarning,
  UserSuspension,
  GDPRDataExport,
  
  // Forum types
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
  ThreadPreview,
  
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
} from './core';

// Type guards
export {
  isUser,
  isUserProfile,
  isForum,
  isThread,
  isPost,
  isWallet,
  isTransaction,
  isShopItem,
  isFrame,
  isBadge,
  isTitle
} from './core';

// Economy helpers
export {
  toDGTAmount,
  fromDGTAmount,
  DGT_DECIMALS,
  DGT_PRECISION,
  RARITY_COLORS
} from './core';

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
  Role,
  AccessRule,
  ForumAccess
} from './config';

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
} from './config';

// Validation utilities
export type {
  ValidationError
} from './validation';

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
} from './validation';

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
  CategoryId,
  VaultId,
  ActionId,
  TipId,
  EntityId,
  EmojiId,
  ReporterId,
  ContentId,
  LevelId,
  TagId,
  OrderId,
  GroupId,
  ParentZoneId,
  ZoneId,
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
} from './ids';

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
  isTitleId,
  asUserId,
  asThreadId,
  asPostId,
  asWalletId,
  asTransactionId,
  asForumId,
  asItemId,
  asFrameId,
  asBadgeId,
  asTitleId
} from './ids';

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
  createdBy?: UserId;
  updatedBy?: UserId;
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
} from './economy';

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
} from './economy';
