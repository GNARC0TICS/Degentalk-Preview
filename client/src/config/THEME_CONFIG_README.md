# Theme Configuration System

## Overview

The `theme.config.ts` file serves as the centralized design system configuration for the Degentalk platform. It consolidates all design tokens including colors, typography, spacing, effects, and component-specific styles into a single, type-safe source of truth.

## File Structure

```
client/src/config/
├── theme.config.ts          # Main theme configuration
├── theme.config.example.tsx # Usage examples
├── themeConstants.ts       # Legacy (backward compatibility)
└── themeFallbacks.ts       # Legacy (backward compatibility)
```

## Key Features

### 1. **Type Safety**
All theme values are strongly typed, providing IntelliSense support and compile-time checking.

### 2. **Centralized Design Tokens**
- **Colors**: Brand, semantic, neutral, and zone-specific colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Effects**: Shadows, gradients, blur effects
- **Animations**: Durations and timing functions
- **Components**: Pre-defined component styles

### 3. **Zone Theme System**
Each zone (pit, mission, casino, etc.) has its own theme configuration including:
- Icon
- Text color
- Background color
- Border color
- Gradient colors
- Display label

## Usage

### Basic Import
```typescript
import { theme, getZoneTheme } from '@/config/theme.config';
```

### Using Colors
```typescript
// Direct color usage
<div style={{ color: theme.colors.brand.primary }}>
  Primary brand color
</div>

// Using semantic colors
<div style={{ backgroundColor: theme.colors.semantic.success }}>
  Success state
</div>
```

### Using Zone Themes
```typescript
const zoneTheme = getZoneTheme('pit'); // Falls back to 'default' if not found
const Icon = zoneTheme.icon;

<div className={`${zoneTheme.bgColor} ${zoneTheme.borderColor}`}>
  <Icon className={zoneTheme.color} />
  <span>{zoneTheme.label}</span>
</div>
```

### Using Typography
```typescript
// Headline font
<h1 style={{ 
  fontFamily: `${theme.typography.fonts.headline.name}, ${theme.typography.fonts.headline.fallback.join(', ')}`,
  fontSize: theme.typography.sizes['4xl'].size,
  fontWeight: theme.typography.weights.bold
}}>
  Headline Text
</h1>
```

### Using Spacing
```typescript
<div style={{ 
  padding: theme.spacing[4],
  marginBottom: theme.spacing[8]
}}>
  Consistently spaced content
</div>
```

### Using Effects
```typescript
// Card with shadow
<div style={{ 
  boxShadow: theme.effects.shadows.card,
  borderRadius: theme.borderRadius.lg
}}>
  Card content
</div>
```

### Using Component Tokens
```typescript
const buttonStyle = theme.components.button.primary;

<button style={{
  backgroundColor: buttonStyle.bg,
  color: buttonStyle.text
}}>
  Primary Button
</button>
```

## Integration with Tailwind

The theme configuration is designed to work alongside Tailwind CSS. The existing Tailwind configuration references many of these values through CSS custom properties.

### Helper Functions

- `getTailwindColors()`: Generates Tailwind-compatible color object
- `getFontFamilies()`: Generates font family strings for Tailwind

## Migration Guide

### From Old Theme Files

1. **Replace imports**:
   ```typescript
   // Old
   import { ZONE_THEMES } from '@/config/themeConstants';
   
   // New
   import { zoneThemes } from '@/config/theme.config';
   ```

2. **Update usage**:
   ```typescript
   // Old
   const theme = ZONE_THEMES[zoneKey];
   
   // New
   const theme = getZoneTheme(zoneKey);
   ```

### Adding New Themes

1. Add the theme to `zoneThemes` object in `theme.config.ts`
2. Include all required properties (icon, colors, label)
3. The theme will automatically be available through `getZoneTheme()`

## Best Practices

1. **Always use theme values** instead of hardcoding colors/sizes
2. **Use semantic names** when possible (e.g., `theme.colors.semantic.error` vs hardcoded red)
3. **Leverage TypeScript** for autocomplete and type checking
4. **Keep consistency** by using the predefined scales
5. **Document changes** when adding new tokens

## Future Enhancements

- [ ] Dark/light theme switching
- [ ] Custom theme creation UI
- [ ] Runtime theme switching
- [ ] CSS-in-JS integration
- [ ] Theme validation utilities