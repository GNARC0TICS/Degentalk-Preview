# Configuration Schema Documentation

## 📋 **Schema Overview**

This directory contains detailed documentation for all configuration schemas used in the Degentalk platform.

## 🏗️ **Available Schemas**

### Core Configuration Files

| Schema File | Purpose | Key Schemas |
|-------------|---------|-------------|
| **cosmetics.config.ts** | UI styling and visual elements | `RaritySchema`, `ColorSchemeSchema`, `TagStyleSchema` |
| **economy.config.ts** | Economic systems and rewards | `XpRewardsSchema`, `DgtConfigSchema`, `TipRainConfigSchema` |
| **forumRules.config.ts** | Forum structure and moderation | `ForumZoneSchema`, `ThreadStatusOptionSchema` |
| **roles.config.ts** | User roles and permissions | `RoleSchema`, `PermissionCategorySchema` |

## 🔍 **Schema Validation**

All schemas use [Zod](https://zod.dev) for runtime validation:

```typescript
import { z } from 'zod';

export const ExampleSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(255),
  count: z.number().min(0),
  enabled: z.boolean().default(true)
});

export type Example = z.infer<typeof ExampleSchema>;
```

## 📊 **Current Statistics**

- **Total Schemas**: 18+ defined schemas
- **Configuration Files**: 5 active config files  
- **Runtime Validation**: Enabled for all configurations
- **TypeScript Integration**: Full type safety

## 🔗 **Related Documentation**

- [Main README](../README.md) - Configuration system overview
- [Developer Guide](../DEVELOPER_GUIDE.md) - Usage instructions
- [Configuration Rules](../CONFIGURATION_RULES.md) - Best practices

---

*Schema documentation is maintained alongside the configuration system.*
