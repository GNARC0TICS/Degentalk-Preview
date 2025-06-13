# Degentalk™ Configuration System

## How to use these docs

- **Quick Start & Examples:** See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Integration Patterns:** See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Rules & Best Practices:** See [CONFIGURATION_RULES.md](./CONFIGURATION_RULES.md)
- **Schema Reference:** See [schemas/README.md](./schemas/README.md)
- **Migration Log:** See [CONFIG_MIGRATION_LOG.md](./CONFIG_MIGRATION_LOG.md)

## Overview

The Degentalk™ Configuration System centralizes all hardcoded values, styling definitions, business rules, and feature settings into a set of strongly-typed, validated configuration files. This system was implemented to eliminate scattered hardcoded values throughout the codebase and provide a single source of truth for all configurable aspects of the platform.

## 🎯 **Key Benefits**

- **🔧 Maintainability**: All configuration in one place, no more hunting through components for hardcoded values
- **🔒 Type Safety**: Zod schemas ensure runtime validation and TypeScript intellisense
- **🎨 Consistency**: Standardized styling and behavior across the platform
- **⚡ Developer Experience**: Easy to modify settings without touching component logic
- **🔄 Extensibility**: Simple to add new configuration options as features grow

## 📁 **Configuration Files Structure**

```
client/src/config/
├── README.md                    # This file - overview and documentation
├── CONFIG_MIGRATION_LOG.md      # Detailed log of all migrations from hardcoded values
├── cosmetics.config.ts          # UI styling, colors, rarities, shop templates
├── economy.config.ts            # XP, DGT, shop pricing, tip/rain settings
├── tags.config.ts               # Forum-wide tags and prefixes
├── xp.config.ts                 # XP actions and title unlock thresholds
├── zones.config.ts              # Zone-specific rules and multipliers
├── forumRules.config.ts         # Forum structure, zones, thread management
├── roles.config.ts              # User roles, permissions, access control
├── admin-routes.ts              # Admin panel navigation and route definitions
└── schemas/                     # Schema documentation (auto-generated)
    ├── cosmetics-schemas.md
    ├── economy-schemas.md
    ├── forum-schemas.md
    └── roles-schemas.md
```

## 🏗️ **Core Architecture**

### Schema-First Design

Each configuration file follows this pattern:

1. **Zod Schemas**: Define the structure and validation rules
2. **TypeScript Types**: Auto-generated from schemas for IDE support  
3. **Default Configuration**: Production-ready values with TODO comments for uncertain values
4. **Runtime Validation**: Automatic validation on application startup

### Example Structure

```typescript
import { z } from 'zod';

// 1. Define Schema
export const ExampleConfigSchema = z.object({
  feature: z.string(),
  enabled: z.boolean(),
  settings: z.object({
    threshold: z.number().min(0),
    options: z.array(z.string())
  })
});

// 2. Generate Type
export type ExampleConfig = z.infer<typeof ExampleConfigSchema>;

// 3. Default Configuration
export const exampleConfig: ExampleConfig = {
  feature: "example-feature",
  enabled: true,
  settings: {
    threshold: 100,
    options: ["option1", "option2"]
  }
};
```

## 📋 **Configuration File Details**

### `cosmetics.config.ts`

**Purpose**: UI styling, visual elements, and cosmetic items
**Key Schemas**:

- `RaritySchema` - Item rarity definitions with colors and styling
- `ColorSchemeSchema` - Tailwind color schemes for UI elements
- `TagStyleSchema` - Forum tag styling definitions
- `CosmeticItemSchema` - Shop cosmetic items and templates

**Usage Example**:

```typescript
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';

// Get rarity styling
const rarityClass = cosmeticsConfig.rarities.legendary.tailwindClass;

// Get available colors for forms
const colors = Object.values(cosmeticsConfig.colorSchemes);
```

### `economy.config.ts`

**Purpose**: Economic systems, rewards, and financial settings
**Key Schemas**:

- `XpRewardsSchema` - Experience point rewards for actions
- `DgtConfigSchema` - DGT token settings and limits
- `TipRainConfigSchema` - Tip and rain feature configuration

**Usage Example**:

```typescript
import { economyConfig } from '@/config/economy.config.ts';

// Award XP for a new post
const xpReward = economyConfig.xp.newPost;

// Check tip limits
const maxTip = economyConfig.tipRain.tip.maxAmountDGT;
```

### `forumRules.config.ts`

**Purpose**: Forum structure, zones, thread management, and moderation
**Key Schemas**:

- `ForumZoneSchema` - Forum zone definitions and hierarchy
- `ThreadStatusOptionSchema` - Thread status filtering options
- `PrefixStyleSchema` - Thread prefix styling

### `roles.config.ts`

**Purpose**: User roles, permissions, and access control
**Key Schemas**:

- `RoleSchema` - Role definitions with permissions
- `PermissionCategorySchema` - Permission groupings for admin UI

### `admin-routes.ts`

**Purpose**: Admin panel navigation structure and route definitions

### Admin Configuration Pages

The admin panel exposes forms for editing runtime configuration:

- `/admin/config/tags` – manage forum tag styling via `tagConfig`.
- `/admin/config/xp` – update XP actions and title unlock settings.
- `/admin/config/zones` – edit the forum zone registry.

## 🔄 **Integration with Codebase**

### Import Pattern

Always import the full config object to maintain tree-shaking and consistency:

```typescript
// ✅ CORRECT
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';
import { economyConfig } from '@/config/economy.config.ts';

// ❌ INCORRECT - Don't destructure at import level
import { rarities } from '@/config/cosmetics.config.ts';
```

### Usage in Components

Replace hardcoded values with config lookups:

```typescript
// ❌ Before (hardcoded)
const rarityOptions = [
  { value: 'common', label: 'Common', color: '#A0AEC0' },
  { value: 'rare', label: 'Rare', color: '#4299E1' }
];

// ✅ After (config-driven)
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';

const rarityOptions = Object.values(cosmeticsConfig.rarities).map(rarity => ({
  value: rarity.key,
  label: rarity.label,
  color: rarity.color
}));
```

### Dynamic Rendering

Use config data to drive component rendering:

```typescript
// Dynamic dropdown options
{Object.values(economyConfig.airdroppableTokens).map(token => (
  <option key={token.key} value={token.key}>
    {token.label}
  </option>
))}
```

## 🛠️ **Development Guidelines**

### Adding New Configuration

1. **Choose the Right File**: Determine which config file fits your new setting
2. **Define Schema First**: Add Zod schema with proper validation
3. **Add Default Values**: Include sensible defaults with TODO comments if uncertain
4. **Update Type Exports**: Ensure TypeScript types are exported
5. **Test Integration**: Verify the config works in your component
6. **Document Migration**: Add entry to `CONFIG_MIGRATION_LOG.md`

### Modifying Existing Configuration

1. **Update Schema**: Modify the Zod schema if structure changes
2. **Update Default Values**: Adjust the configuration data
3. **Check Usages**: Search codebase for components using the config
4. **Test Thoroughly**: Ensure all dependent components still work
5. **Log Changes**: Document in `CONFIG_MIGRATION_LOG.md`

### Migration Comments

All code changes should include `[CONFIG-REFAC]` comments:

```typescript
// [CONFIG-REFAC] Replaced hardcoded rarities with cosmeticsConfig.rarities
const rarityOptions = Object.values(cosmeticsConfig.rarities);
```

## 🔍 **Finding Configuration Usage**

### Search Patterns

Use these patterns to find where configurations are used:

```bash
# Find all config imports
grep -r "from '@/config/" client/src/

# Find specific config usage
grep -r "cosmeticsConfig\." client/src/
grep -r "economyConfig\." client/src/

# Find migration comments
grep -r "\[CONFIG-REFAC\]" client/src/
```

### Common Integration Points

- **Admin Forms**: Dynamic dropdown options and validation
- **UI Components**: Styling classes and color schemes  
- **Business Logic**: Reward calculations and limits
- **Content Rendering**: Forum structure and categorization

## 🚨 **Important Rules**

### File Extensions

Always include `.ts` in config imports due to project requirements:

```typescript
// ✅ CORRECT
import { config } from '@/config/example.config.ts';

// ❌ INCORRECT
import { config } from '@/config/example.config';
```

### Validation

All configs are validated at runtime. Invalid configurations will throw errors on startup.

### TODO Values

Some configuration values are marked with `TODO` comments where exact values need verification:

```typescript
dgt: {
  pegUSD: 0.10, // TODO: Confirm if this is fixed or dynamic
  tipLimitDaily: 1000, // TODO: Confirm actual daily cap
}
```

These should be reviewed and updated with accurate values.

## 🔧 **Troubleshooting**

### Common Issues & Solutions

#### Import Errors

**Missing `.ts` Extension**

```
Error: Module not found: Can't resolve '@/config/cosmetics.config'
```

**Solution:**

```typescript
// ❌ INCORRECT
import { cosmeticsConfig } from '@/config/cosmetics.config';
// ✅ CORRECT
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';
```

**Destructuring at Import Level**

```
Error: Named export 'rarities' not found
```

**Solution:**

```typescript
// ❌ INCORRECT
import { rarities } from '@/config/cosmetics.config.ts';
// ✅ CORRECT
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';
const rarities = cosmeticsConfig.rarities;
```

#### Runtime Validation Errors

**Schema Validation Failed**

```
Error: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["rarities", "common", "label"],
    "message": "Required"
  }
]
```

**Diagnosis:** Missing required field in configuration data

**Solution:**

```typescript
// Check the config object has all required fields
export const cosmeticsConfig = {
  rarities: {
    common: {
      key: 'common',
      label: 'Common', // ← This was missing
      color: '#A0AEC0'
    }
  }
};
```

#### Component Integration Issues

**Undefined Config Properties**

```
Error: Cannot read property 'tailwindClass' of undefined
```

**Solution:**

```typescript
// ❌ RISKY
const className = cosmeticsConfig.rarities[rarity].tailwindClass;
// ✅ SAFE
const rarity = cosmeticsConfig.rarities[rarityKey];
const className = rarity?.tailwindClass || 'default-class';
```

### Debugging Tools

```typescript
import { cosmeticsConfigSchema, cosmeticsConfig } from '@/config/cosmetics.config.ts';
try {
  cosmeticsConfigSchema.parse(cosmeticsConfig);
  console.log('✅ Config validates successfully');
} catch (error) {
  console.error('❌ Config validation failed:', error.issues);
}
```

### Investigation Commands

```bash
# Find all files using a specific config
grep -r "cosmeticsConfig" client/src/
# Find specific config property usage
grep -r "rarities\." client/src/
# Find migration comments
grep -r "\[CONFIG-REFAC\]" client/src/
```

### Quick Checklist

- [ ] Import has `.ts` extension
- [ ] Not destructuring at import level
- [ ] Config property exists (use optional chaining)
- [ ] Schema matches data structure
- [ ] All required fields present in config data
- [ ] Types are properly exported from config files

### When to Ask for Help

Contact the team when:

1. Schema validation fails but the data looks correct
2. TypeScript errors that don't make sense after checking exports
3. Performance issues with config loading
4. Complex integration patterns not covered in documentation
5. TODO values that need product/business input

### Additional Resources

- [Zod Documentation](https://zod.dev) - Schema validation library
- [CONFIG_MIGRATION_LOG.md](./CONFIG_MIGRATION_LOG.md) - History of changes
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Usage patterns
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Type system reference

---
*Keep this troubleshooting guide updated with new issues as they arise!*

## 📈 **Future Enhancements**

- **Environment-based Configs**: Different settings for dev/staging/prod
- **Runtime Config Updates**: Admin interface for modifying settings
- **Config Validation API**: Endpoint to validate config changes
- **Auto-generated Documentation**: Schema-driven documentation generation
- **Config Versioning**: Track configuration changes over time

---

*This documentation is maintained alongside the configuration system. When adding new configs or changing existing ones, please update this README accordingly.*
