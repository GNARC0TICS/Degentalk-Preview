# Configuration System Rules & Best Practices

## 🎯 **Core Principles**

### 1. Single Source of Truth
- **All hardcoded values must be centralized** in configuration files
- **No duplicate configuration** across different files or components
- **Shared constants** should exist in one config location, not scattered

### 2. Schema-First Design
- **Define Zod schemas before data** to ensure type safety and validation
- **Export TypeScript types** derived from schemas for component usage
- **Validate all configuration** at runtime to catch errors early

### 3. Semantic Organization
- **Group related configuration** in the same file (UI styling in cosmetics, rewards in economy)
- **Use descriptive names** that clearly indicate purpose and scope
- **Follow consistent naming patterns** across all configuration files

## 📋 **File Organization Rules**

### Configuration File Responsibilities

| File | Responsibility | DO Include | DON'T Include |
|------|----------------|------------|---------------|
| `cosmetics.config.ts` | UI styling, visual elements | Colors, rarities, badges, shop templates | Business logic, API endpoints |
| `economy.config.ts` | Economic systems, rewards | XP values, DGT limits, pricing | UI components, styling |
| `forumRules.config.ts` | Forum structure, moderation | Thread options, zones, prefixes | User permissions, economy |
| `roles.config.ts` | Users, permissions, access | Role definitions, permission categories | Forum structure, styling |
| `admin-routes.ts` | Admin navigation | Route configs, menu structure | Business logic, styling |

### When to Create New Config Files
- **Size threshold**: When a config file exceeds ~500 lines
- **Logical separation**: When adding unrelated domain configuration
- **Team boundaries**: When different teams maintain different feature sets
- **Deployment boundaries**: When configurations need different update cycles

## 🔧 **Schema Design Rules**

### 1. Schema Structure
```typescript
// ✅ GOOD: Clear, validated schema
export const FeatureConfigSchema = z.object({
  key: z.string().min(1),                    // Required, non-empty
  label: z.string(),                         // Display name
  enabled: z.boolean().default(true),        // Feature toggle with default
  settings: z.object({
    threshold: z.number().min(0).max(100),   // Constrained number
    options: z.array(z.string()).min(1)      // Non-empty array
  })
});

// ❌ BAD: Loose, unvalidated schema  
export const FeatureConfigSchema = z.object({
  key: z.string(),                          // No validation
  label: z.any(),                           // Too permissive
  enabled: z.boolean(),                     // No default
  settings: z.record(z.any())               // No structure
});
```

### 2. Validation Rules
- **Use specific types** instead of `z.any()` whenever possible
- **Add constraints** (min/max for numbers, min length for strings)
- **Provide defaults** for optional fields to prevent undefined errors
- **Use enums** for finite sets of options instead of free-form strings

### 3. Documentation in Schemas
```typescript
export const WellDocumentedSchema = z.object({
  /** Unique identifier for the item */
  id: z.string().min(1),
  /** Display name shown to users */
  displayName: z.string(),
  /** Feature toggle - enables/disables this item */
  enabled: z.boolean().default(true),
  /** Configuration for advanced settings */
  advanced: z.object({
    /** Maximum allowed value (0-1000) */
    maxValue: z.number().min(0).max(1000),
    /** List of allowed categories */
    categories: z.array(z.string()).min(1)
  }).optional()
});
```

## 🏷️ **Naming Conventions**

### Schema Names
- **PascalCase** ending in `Schema`: `UserRoleSchema`, `ShopItemSchema`
- **Descriptive and specific**: `ThreadStatusOptionSchema` not `OptionSchema`
- **Avoid abbreviations**: `ForumCategorySchema` not `ForumCatSchema`

### Type Names
- **Match schema name** without `Schema` suffix: `UserRole`, `ShopItem`
- **Export all types** for component usage

### Config Object Names
- **camelCase** ending in `Config`: `cosmeticsConfig`, `economyConfig`
- **Singular form**: `forumRulesConfig` not `forumRulesConfigs`

### Field Names
- **camelCase** for object properties: `maxAmountDGT`, `tipLimitDaily`
- **Descriptive and unambiguous**: `cooldownSeconds` not `cooldown`
- **Include units in name**: `delayHours`, `weightKilograms`, `priceUSD`

## 🔄 **Data Organization Rules**

### 1. Grouping Related Data
```typescript
// ✅ GOOD: Logical grouping
export const economyConfig = {
  xp: {
    newThread: 10,
    newPost: 5,
    receivedLike: 2
  },
  tipRain: {
    tip: { enabled: true, minAmountDGT: 10 },
    rain: { enabled: true, maxRecipients: 15 }
  }
};

// ❌ BAD: Flat, unorganized structure
export const economyConfig = {
  xpNewThread: 10,
  xpNewPost: 5,
  tipEnabled: true,
  tipMinDGT: 10,
  rainEnabled: true,
  rainMaxRecipients: 15
};
```

### 2. Default Values
- **Provide sensible defaults** for all optional fields
- **Use production-ready values** where possible
- **Mark uncertain values** with `TODO` comments for later verification
- **Avoid `null` or `undefined`** in config data - use optional schema fields instead

### 3. TODO Comment Standards
```typescript
export const economyConfig = {
  dgt: {
    pegUSD: 0.10, // TODO: Confirm if this is fixed or dynamic
    tipLimitDaily: 1000, // TODO: Confirm actual daily cap from product team
    // TODO: Add staking rewards configuration once feature is defined
  }
};
```

## 🔗 **Integration Rules**

### 1. Import Patterns
```typescript
// ✅ CORRECT: Import full config object
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';
import { economyConfig } from '@/config/economy.config.ts';

// Use in component
const rarity = cosmeticsConfig.rarities.legendary;

// ❌ INCORRECT: Destructuring at import level
import { rarities } from '@/config/cosmetics.config.ts';
```

### 2. File Extension Requirements
- **Always include `.ts` extension** in imports due to project configuration
- **Consistent across all config imports** to avoid build issues

### 3. Migration Comments
- **Mark all converted code** with `[CONFIG-REFAC]` comments
- **Reference original hardcoded value** in comment for tracking
- **Include config path** in comment for easy finding

```typescript
// [CONFIG-REFAC] Replaced hardcoded rarity colors with cosmeticsConfig.rarities
const rarityClass = cosmeticsConfig.rarities[itemRarity].tailwindClass;
```

## 📝 **Documentation Requirements**

### 1. Migration Logging
- **Every hardcoded value replacement** must be logged in `CONFIG_MIGRATION_LOG.md`
- **Include file path, line numbers, and transformation details**
- **Use consistent table format** for easy scanning

### 2. Code Comments
- **Document purpose** of complex configuration sections
- **Explain business rules** that aren't obvious from the data
- **Mark experimental or temporary** configurations clearly

### 3. Schema Documentation
- **Use JSDoc comments** in schema definitions
- **Explain validation rules** and constraints
- **Provide usage examples** for complex schemas

## ⚠️ **Anti-Patterns to Avoid**

### 1. Configuration Smells
```typescript
// ❌ BAD: Magic numbers without context
timeout: 5000,

// ✅ GOOD: Descriptive and documented
timeoutMilliseconds: 5000, // 5 second timeout for API requests

// ❌ BAD: Generic/unclear names
data: { stuff: "value" },

// ✅ GOOD: Specific and clear
userPreferences: { theme: "dark" },

// ❌ BAD: Hardcoded references in config
baseURL: "https://api.degentalk.com/v1",

// ✅ GOOD: Environment-aware configuration
baseURL: process.env.API_BASE_URL || "https://api.degentalk.com/v1"
```

### 2. Schema Anti-Patterns
```typescript
// ❌ BAD: Overly permissive
config: z.any(),

// ✅ GOOD: Properly constrained
config: z.object({
  feature: z.enum(['enabled', 'disabled', 'beta']),
  threshold: z.number().min(0).max(100)
}),

// ❌ BAD: No validation
userInput: z.string(),

// ✅ GOOD: Validated input
userInput: z.string().min(1).max(255).regex(/^[a-zA-Z0-9_]+$/),
```

### 3. Organization Anti-Patterns
- **Don't mix domains** in single config files
- **Don't duplicate configuration** across multiple files
- **Don't use config for component logic** - keep it data-only
- **Don't skip migration logging** - always document changes

## 🔬 **Testing Configuration**

### 1. Schema Validation Tests
```typescript
// Test that config passes schema validation
import { economyConfigSchema } from '@/config/economy.config.ts';

test('economy config validates against schema', () => {
  expect(() => economyConfigSchema.parse(economyConfig)).not.toThrow();
});
```

### 2. Configuration Usage Tests
```typescript
// Test that components can access config values
test('component uses config correctly', () => {
  const maxTip = economyConfig.tipRain.tip.maxAmountDGT;
  expect(typeof maxTip).toBe('number');
  expect(maxTip).toBeGreaterThan(0);
});
```

## 📈 **Evolution Guidelines**

### 1. Backward Compatibility
- **Don't remove config fields** without migration plan
- **Add new fields as optional** when possible
- **Deprecate before removing** - mark with comments first

### 2. Performance Considerations
- **Keep config objects reasonably sized** (< 1MB in JSON)
- **Use lazy loading** for large configuration sections if needed
- **Consider caching** for computed configuration values

### 3. Future Extensibility
- **Design schemas for extension** - use objects instead of primitive values where growth is expected
- **Plan for environment-specific overrides** 
- **Consider configuration hot-reloading** for admin-configurable values

---

*Follow these rules to maintain a clean, scalable, and maintainable configuration system!* 