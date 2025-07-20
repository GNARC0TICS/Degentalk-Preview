/**
 * Shared Types System - Main Export
 *
 * Centralized, type-safe access to all shared types.
 * Explicit exports ensure tree-shaking and clean APIs.
 */
// Type guards
export { isUser, isUserProfile, isForum, isThread, isPost, isWallet, isTransaction, isShopItem, isFrame, isBadge, isTitle } from './core/index.js';
// Economy helpers
export { toDGTAmount, fromDGTAmount, DGT_DECIMALS, DGT_PRECISION, RARITY_COLORS } from './core/index.js';
export { roleHierarchy, roleAliases, getCanonicalRole, hasRoleAtLeast, isRole, isValidRole, canModerateShoutbox, canAccessAdminPanel, canModerateContent, canModerateMarket, isAdmin, isSuperAdmin, isModerator, isAdminOrModerator, getUserPermissions, hasRoleOrHigher } from './role.types.js';
// Schema validators
export { XpConfigSchema, XpActionSchema, XpMultiplierSchema, LevelFormulaSchema, LevelMilestoneSchema, validateXpConfig, validatePartialXpConfig, defaultXpConfig, EconomyConfigSchema, CurrencyConfigSchema, FeeConfigSchema, WalletLimitsSchema, DistributionConfigSchema, StakingConfigSchema, ShopPricingSchema, validateEconomyConfig, validatePartialEconomyConfig, FeaturesConfigSchema, FeatureFlagSchema, RolloutStrategySchema, PermissionSchema, RoleSchema, AccessRuleSchema, ForumAccessSchema, validateFeaturesConfig, validatePartialFeaturesConfig, evaluateFeatureFlag } from './config/index.js';
export { isValidUuid, isValidUserId, isValidDate, isValidDateString, isPositiveNumber, isNonNegativeNumber, isNonEmptyString, isValidEmail, isValidUsername, isNonEmptyArray, isArrayOf, hasProperty, hasProperties, validateApiInput, validateOptionalInput, isEnumValue, validatePaginationParams, validateSortParams, createValidationError } from './validation/index.js';
// ID validation utilities
export { isValidUUID, isValidId, createIdValidator, isUserId, isThreadId, isPostId, isWalletId, isTransactionId, isForumId, isItemId, isFrameId, isBadgeId, isTitleId, asUserId, asThreadId, asPostId, asWalletId, asTransactionId, asForumId, asItemId, asFrameId, asBadgeId, asTitleId } from './ids.js';
// Economy validation and utilities
export { isValidAmount, isDgtAmount, isUsdAmount, isXpAmount, asDgtAmount, asUsdAmount, asXpAmount, asTipAmount, asRainAmount, toDgtAmount, toUsdAmount, toXpAmount, ECONOMY_CONSTANTS } from './economy.js';
// Branded ID types
export * from './ids.js';
// ID creation helpers from utils
export { toUserId, toThreadId, toPostId, toForumId, toStructureId, toZoneId, toParentZoneId, toTransactionId, toWalletId, toItemId, toFrameId, toBadgeId, toTitleId, toTagId, toMissionId, toAchievementId, toProductId, toPathId, toAdminId, toReportId, toConversationId, toRoomId, toLevelId, toEntityId, toId, parseId, generateId, idsEqual, filterValidIds, parseIdParam, assertValidId, isValidNumericId, parseEntityIdParam } from '../utils/id.js';
