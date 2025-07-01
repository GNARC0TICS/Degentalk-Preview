/**
 * Configuration Types & Schemas Barrel Export
 * 
 * Explicit exports for all configuration schemas and types.
 * Enables runtime validation and type-safe configuration management.
 */

// XP Configuration
export type {
  XpConfig,
  XpAction,
  XpMultiplier,
  LevelFormula,
  LevelMilestone
} from './xp.schema';

export {
  XpConfigSchema,
  XpActionSchema,
  XpMultiplierSchema,
  LevelFormulaSchema,
  LevelMilestoneSchema,
  validateXpConfig,
  validatePartialXpConfig,
  defaultXpConfig
} from './xp.schema';

// Economy Configuration
export type {
  EconomyConfig,
  CurrencyConfig,
  FeeConfig,
  WalletLimits,
  DistributionConfig,
  StakingConfig,
  ShopPricing
} from './economy.schema';

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
} from './economy.schema';

// Features & Access Control Configuration
export type {
  FeaturesConfig,
  FeatureFlag,
  RolloutStrategy,
  Permission,
  Role,
  AccessRule,
  ForumAccess
} from './features.schema';

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
} from './features.schema';

// Core Entity Schemas
export type {
  UserSchemaType,
  ForumSchemaType,
  ThreadSchemaType,
  PostSchemaType,
  WalletSchemaType,
  TransactionSchemaType,
  ShopItemSchemaType
} from './core-entities.schema';

export {
  UserSchema,
  UserSettingsSchema,
  UserStatsSchema,
  ForumSchema,
  ForumSettingsSchema,
  ForumStatsSchema,
  ThreadSchema,
  ThreadMetadataSchema,
  PostSchema,
  PostMetadataSchema,
  WalletSchema,
  WalletFeaturesSchema,
  WalletLimitsSchema,
  TransactionSchema,
  TransactionMetadataSchema,
  ShopItemSchema,
  ItemPriceSchema,
  ItemRequirementsSchema,
  ItemMetadataSchema,
  ItemStockSchema,
  validateUser,
  validateForum,
  validateThread,
  validatePost,
  validateWallet,
  validateTransaction,
  validateShopItem
} from './core-entities.schema';