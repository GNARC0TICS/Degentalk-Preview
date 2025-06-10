# Configuration System - Developer Quick Start

## 🚀 **Quick Start Guide**

### New to the Config System?

Follow this guide to get up to speed quickly with using and extending the Degentalk™ configuration system.

## 📥 **Using Existing Configuration**

### 1. Import the Config

```typescript
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';
import { economyConfig } from '@/config/economy.config.ts';
import { forumRulesConfig } from '@/config/forumRules.config.ts';
import { rolesConfig } from '@/config/roles.config.ts';
```

### 2. Replace Hardcoded Values

```typescript
// ❌ Before
const maxTipAmount = 1000;

// ✅ After
const maxTipAmount = economyConfig.tipRain.tip.maxAmountDGT;
```

### 3. Dynamic Options in Forms

```typescript
// ✅ Dynamic rarity dropdown
const rarityOptions = Object.values(cosmeticsConfig.rarities).map(rarity => ({
  value: rarity.key,
  label: rarity.label,
  className: rarity.tailwindClass
}));

// Use in JSX
<select>
  {rarityOptions.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>
```

## 🔧 **Adding New Configuration**

### Step 1: Choose the Right Config File

- **UI/Styling**: `cosmetics.config.ts`
- **Rewards/Economy**: `economy.config.ts`  
- **Forum/Content**: `forumRules.config.ts`
- **Permissions**: `roles.config.ts`
- **Admin Navigation**: `admin-routes.ts`

### Step 2: Define Your Schema

```typescript
// In the appropriate config file
export const YourNewSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number().min(0),
  enabled: z.boolean().default(true)
});

export type YourNewType = z.infer<typeof YourNewSchema>;
```

### Step 3: Add to Main Config Schema

```typescript
export const MainConfigSchema = z.object({
  // ... existing schemas
  yourNewSection: z.record(z.string(), YourNewSchema),
});
```

### Step 4: Add Default Data

```typescript
export const yourConfig = {
  // ... existing config
  yourNewSection: {
    example: {
      key: 'example',
      label: 'Example Item',
      value: 100,
      enabled: true
    }
  }
};
```

### Step 5: Use in Components

```typescript
import { yourConfig } from '@/config/your.config.ts';

const exampleValue = yourConfig.yourNewSection.example.value;
```

### Step 6: Document the Migration

Add entry to `CONFIG_MIGRATION_LOG.md`:

```markdown
| YourComponent.tsx | 42 | Hardcoded value: 100 | yourConfig.yourNewSection.example.value [CONFIG-REFAC] |
```

## 🎨 **Common Patterns**

### Dynamic Styling Classes

```typescript
// Get Tailwind classes from config
const buttonClass = cosmeticsConfig.rarities[itemRarity].tailwindClass;

// Apply in JSX
<button className={`base-classes ${buttonClass}`}>
  Styled Button
</button>
```

### Form Options Generation

```typescript
// Generate options for dropdowns/radios
const generateOptions = (configSection: Record<string, any>) => 
  Object.values(configSection).map(item => ({
    value: item.key,
    label: item.label,
    ...item // spread additional properties
  }));

const colorOptions = generateOptions(cosmeticsConfig.colorSchemes);
```

### Conditional Features

```typescript
// Feature toggles from config
if (economyConfig.tipRain.tip.enabled) {
  // Render tip feature
}

// Permission checks
if (rolesConfig.roles[userRole]?.permissions.includes('admin.users.edit')) {
  // Show admin controls
}
```

### Validation Using Config

```typescript
// Use config values for validation
const validateTipAmount = (amount: number) => {
  const { minAmountDGT, maxAmountDGT } = economyConfig.tipRain.tip;
  return amount >= minAmountDGT && amount <= maxAmountDGT;
};
```

## 🔍 **Finding What You Need**

### Quick Reference by Use Case

**Setting up form dropdowns?**

- Look for `*Options` or `*Categories` in relevant config
- Example: `cosmeticsConfig.colorSchemes`, `economyConfig.airdroppableTokens`

**Need styling classes?**

- Check `cosmeticsConfig.rarities.*.tailwindClass`
- Check `cosmeticsConfig.tagStyles.*.cssClasses`
- Check `forumRulesConfig.prefixStyles`

**Setting limits/thresholds?**

- Check `economyConfig.tipRain.*` for financial limits
- Check `economyConfig.xp.*` for reward amounts
- Check `economyConfig.dgt.*` for token settings

**Permission checks?**

- Check `rolesConfig.roles.*` for role definitions
- Check `rolesConfig.permissions.*` for permission categories

### Search Commands

```bash
# Find all config usage
grep -r "Config\." client/src/

# Find specific config imports
grep -r "from '@/config/" client/src/

# Find hardcoded values that might need migration
grep -r "TODO.*config" client/src/
```

## ⚠️ **Common Mistakes**

### 1. Destructuring at Import

```typescript
// ❌ DON'T DO THIS
import { rarities } from '@/config/cosmetics.config.ts';

// ✅ DO THIS INSTEAD
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';
const rarities = cosmeticsConfig.rarities;
```

### 2. Missing File Extensions

```typescript
// ❌ MISSING .ts EXTENSION
import { config } from '@/config/cosmetics.config';

// ✅ INCLUDE .ts EXTENSION
import { config } from '@/config/cosmetics.config.ts';
```

### 3. Forgetting Migration Comments

```typescript
// ❌ NO COMMENT
const options = Object.values(cosmeticsConfig.rarities);

// ✅ WITH MIGRATION COMMENT
// [CONFIG-REFAC] Replaced hardcoded rarity options with cosmeticsConfig.rarities
const options = Object.values(cosmeticsConfig.rarities);
```

### 4. Not Updating the Migration Log

Always add entries to `CONFIG_MIGRATION_LOG.md` when replacing hardcoded values!

## 🧪 **Testing Your Changes**

### 1. Type Check

```bash
npm run type-check
```

### 2. Runtime Validation

The configs are validated at startup. Check browser console for Zod validation errors.

### 3. Component Testing

```typescript
// Test that your component can access the config
import { yourConfig } from '@/config/your.config.ts';

console.log('Config loaded:', yourConfig.yourNewSection);
```

### 4. Search for Usage

```bash
# Make sure all references to old hardcoded values are updated
grep -r "oldHardcodedValue" client/src/
```

## 📚 **Further Reading**

- [Full README](./README.md) - Complete system documentation
- [Migration Log](./CONFIG_MIGRATION_LOG.md) - History of all changes
- [Zod Documentation](https://zod.dev) - Schema validation library
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) - For advanced type manipulation

## 💡 **Pro Tips**

1. **Use TypeScript autocomplete** - Import the config and let your IDE show you available options
2. **Check existing patterns** - Look at how similar configs are used in other components
3. **Start small** - Replace one hardcoded value at a time rather than entire components
4. **Test thoroughly** - Make sure dropdowns still work and styling still applies correctly
5. **Ask questions** - Check with team about TODO values or uncertain configurations

---

*Happy configuring! 🎯*
