/**
 * Configuration Types & Schemas Barrel Export
 *
 * Explicit exports for all configuration schemas and types.
 * Enables runtime validation and type-safe configuration management.
 */
export type { XpConfig, XpAction, XpMultiplier, LevelFormula, LevelMilestone } from './xp.schema.js';
export { XpConfigSchema, XpActionSchema, XpMultiplierSchema, LevelFormulaSchema, LevelMilestoneSchema, validateXpConfig, validatePartialXpConfig, defaultXpConfig } from './xp.schema.js';
export type { EconomyConfig, CurrencyConfig, FeeConfig, WalletLimits, DistributionConfig, StakingConfig, ShopPricing } from './economy.schema.js';
export { EconomyConfigSchema, CurrencyConfigSchema, FeeConfigSchema, WalletLimitsSchema, DistributionConfigSchema, StakingConfigSchema, ShopPricingSchema, validateEconomyConfig, validatePartialEconomyConfig, defaultEconomyConfig } from './economy.schema.js';
export type { FeaturesConfig, FeatureFlag, RolloutStrategy, Permission, Role, AccessRule, ForumAccess } from './features.schema.js';
export { FeaturesConfigSchema, FeatureFlagSchema, RolloutStrategySchema, PermissionSchema, RoleSchema, AccessRuleSchema, ForumAccessSchema, validateFeaturesConfig, validatePartialFeaturesConfig, defaultFeaturesConfig, evaluateFeatureFlag } from './features.schema.js';
export type { UserSchemaType, ForumSchemaType, ThreadSchemaType, PostSchemaType, WalletSchemaType, TransactionSchemaType, ShopItemSchemaType } from './core-entities.schema.js';
export { UserSchema, UserSettingsSchema, UserStatsSchema, ForumSchema, ForumSettingsSchema, ForumStatsSchema, ThreadSchema, ThreadMetadataSchema, PostSchema, PostMetadataSchema, WalletSchema, WalletFeaturesSchema, TransactionSchema, TransactionMetadataSchema, ShopItemSchema, ItemPriceSchema, ItemRequirementsSchema, ItemMetadataSchema, ItemStockSchema, validateUser, validateForum, validateThread, validatePost, validateWallet, validateTransaction, validateShopItem } from './core-entities.schema.js';
