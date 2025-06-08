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
```

### 2. Validation Rules

- **Use specific types** instead of `z.any()` whenever possible
- **Add constraints** (min/max for numbers, min length for strings)
- **Provide defaults** for optional fields to prevent undefined errors
- **Use enums** for finite sets of options instead of free-form strings

## 🏷️ **Naming Conventions**

### Schema Names

- **PascalCase** ending in `Schema`: `UserRoleSchema`, `ShopItemSchema`
- **Descriptive and specific**: `ThreadStatusOptionSchema` not `OptionSchema`
- **Avoid abbreviations**: `ForumCategorySchema` not `ForumCatSchema`

### Config Object Names

- **camelCase** ending in `Config`: `cosmeticsConfig`, `economyConfig`
- **Singular form**: `forumRulesConfig` not `forumRulesConfigs`

## 🔗 **Integration Rules**

### 1. Import Patterns

```typescript
// ✅ CORRECT: Import full config object
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';

// ❌ INCORRECT: Destructuring at import level
import { rarities } from '@/config/cosmetics.config.ts';
```

### 2. File Extension Requirements

- **Always include `.ts` extension** in imports due to project configuration

### 3. Migration Comments

- **Mark all converted code** with `[CONFIG-REFAC]` comments

```typescript
// [CONFIG-REFAC] Replaced hardcoded rarity colors with cosmeticsConfig.rarities
const rarityClass = cosmeticsConfig.rarities[itemRarity].tailwindClass;
```

## 📝 **Documentation Requirements**

### 1. Migration Logging

- **Every hardcoded value replacement** must be logged in `CONFIG_MIGRATION_LOG.md`
- **Include file path, line numbers, and transformation details**

### 2. TODO Comment Standards

```typescript
export const economyConfig = {
  dgt: {
    pegUSD: 0.10, // TODO: Confirm if this is fixed or dynamic
    tipLimitDaily: 1000, // TODO: Confirm actual daily cap
  }
};
```

---

*Follow these rules to maintain a clean, scalable, and maintainable configuration system!*
