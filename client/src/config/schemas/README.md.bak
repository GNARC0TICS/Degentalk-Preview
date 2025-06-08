# Configuration Schema Documentation

## 📋 Schema Catalog

| Schema File | Purpose | Key Schemas | Component Usage |
|-------------|---------|-------------|-----------------|
| **cosmetics.config.ts** | UI styling and visual elements | `RaritySchema`, `ColorSchemeSchema`, `TagStyleSchema` | Admin forms, shop UI, forum styling |
| **economy.config.ts** | Economic systems and rewards | `XpRewardsSchema`, `DgtConfigSchema`, `TipRainConfigSchema` | XP calculations, tip/rain features |
| **forumRules.config.ts** | Forum structure and moderation | `ForumZoneSchema`, `ThreadStatusOptionSchema`, `PrefixStyleSchema` | Forum navigation, thread management |
| **roles.config.ts** | User roles and permissions | `RoleSchema`, `PermissionCategorySchema` | Access control, admin UI |

## 🔍 Schema Validation

All schemas use [Zod](https://zod.dev) for runtime validation and TypeScript type generation:

```typescript
import { z } from 'zod';
// Schema definition with validation rules
export const ExampleSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(255),
  count: z.number().min(0).max(1000),
  enabled: z.boolean().default(true)
});
// TypeScript type auto-generated from schema
export type Example = z.infer<typeof ExampleSchema>;
```

## 📊 Schema Statistics

- **Total Schemas**: 18+ defined schemas
- **Configuration Files**: 5 active config files
- **Type Exports**: All schemas export corresponding TypeScript types
- **Validation Rules**: Runtime validation enabled for all schemas
- **Simple Schemas**: 8 (basic object validation)
- **Complex Schemas**: 10 (nested objects, arrays, unions)
- **Record Schemas**: 5 (key-value configurations)

## 🎯 Common Schema Patterns

### 1. Item Definition Pattern

```typescript
export const ItemSchema = z.object({
  key: z.string(),      // Unique identifier
  label: z.string(),    // Display name
  value: z.any(),       // Configuration value
  enabled: z.boolean().default(true)  // Feature toggle
});
```

### 2. Styling Schema Pattern

```typescript
export const StyleSchema = z.object({
  key: z.string(),
  label: z.string(),
  cssClasses: z.string(),        // Tailwind classes
  color: z.string().optional(),  // Color code/name
  emoji: z.string().optional()   // Icon representation
});
```

### 3. Configuration Section Pattern

```typescript
export const ConfigSectionSchema = z.object({
  enabled: z.boolean(),
  settings: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    default: z.number()
  }),
  options: z.array(z.string())
});
```

## 🔧 Validation Rules Summary

- **Required strings**: `z.string().min(1)`
- **Display names**: `z.string().max(255)`
- **Keys/IDs**: `z.string().regex(/^[a-zA-Z0-9_]+$/)`
- **Positive numbers**: `z.number().min(0)`
- **Percentages**: `z.number().min(0).max(100)`
- **Counts**: `z.number().int().min(0)`
- **Non-empty arrays**: `z.array(z.string()).min(1)`
- **Limited arrays**: `z.array(z.string()).max(50)`
- **Record types**: `z.record(z.string(), SchemaType)`
- **Optional sections**: `z.object({...}).optional()`

## 🚨 Validation Error Handling

### Common Validation Errors

1. Missing required fields: Ensure all non-optional fields are present
2. Type mismatches: Check that numbers are numbers, strings are strings
3. Constraint violations: Verify min/max bounds are respected
4. Invalid keys: Ensure record keys match expected patterns

### Debugging Validation

```typescript
import { configSchema } from '@/config/example.config.ts';
try {
  configSchema.parse(configData);
} catch (error) {
  console.error('Config validation failed:', error.issues);
}
```

## 📈 Schema Evolution

### Adding New Schemas

1. Define schema with proper validation rules
2. Add to main config schema object
3. Export TypeScript type
4. Add default configuration data
5. Document in CONFIG_MIGRATION_LOG.md

### Modifying Existing Schemas

1. Ensure backward compatibility when possible
2. Use optional fields for new properties
3. Update existing configuration data
4. Test all components using the schema
5. Update documentation

### Deprecating Schemas

1. Mark as deprecated in comments
2. Provide migration path in documentation
3. Keep deprecated schema for transition period
4. Remove after confirming no usage

## 🔗 Related Documentation

- [Main README](../README.md) - Configuration system overview
- [Developer Guide](../DEVELOPER_GUIDE.md) - Usage instructions
- [Configuration Rules](../CONFIGURATION_RULES.md) - Best practices
- [Migration Log](../CONFIG_MIGRATION_LOG.md) - Change history

---
*This overview is automatically updated when schemas change. For specific schema details, see individual configuration files.*
