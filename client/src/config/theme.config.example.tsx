/**
 * Example usage of the centralized theme configuration
 * 
 * This file demonstrates how to use the theme.config.ts file
 * in various scenarios throughout the application.
 */

import { theme, getForumTheme, type ZoneTheme } from '@shared/config/forumThemes.config';

// ============================================================================
// Example 1: Using colors
// ============================================================================

export function ColorExample() {
  return (
    <div>
      {/* Direct color usage */}
      <div style={{ color: theme.colors.brand.primary }}>
        Primary brand color
      </div>
      
      {/* Using semantic colors */}
      <div style={{ backgroundColor: theme.colors.semantic.success }}>
        Success state
      </div>
      
      {/* Using neutral colors */}
      <div style={{ 
        backgroundColor: theme.colors.neutral.card,
        color: theme.colors.neutral.foreground 
      }}>
        Card with proper contrast
      </div>
    </div>
  );
}

// ============================================================================
// Example 2: Using zone themes
// ============================================================================

export function ZoneThemeExample({ zoneKey }: { zoneKey?: string }) {
  // Get zone theme with automatic fallback to default
  const zoneTheme = getForumTheme(zoneKey);
  const Icon = zoneTheme.icon;
  
  return (
    <div className={`${zoneTheme.bgColor} ${zoneTheme.borderColor} border rounded-lg p-4`}>
      <div className="flex items-center gap-2">
        <Icon className={zoneTheme.color} />
        <span className={zoneTheme.color}>{zoneTheme.label}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Example 3: Using typography
// ============================================================================

export function TypographyExample() {
  return (
    <div>
      {/* Using font families */}
      <h1 style={{ 
        fontFamily: `${theme.typography.fonts.headline.name}, ${theme.typography.fonts.headline.fallback.join(', ')}`,
        fontSize: theme.typography.sizes['4xl'].size,
        lineHeight: theme.typography.sizes['4xl'].lineHeight,
        fontWeight: theme.typography.weights.bold
      }}>
        Headline Text
      </h1>
      
      {/* Using monospace font */}
      <code style={{
        fontFamily: `${theme.typography.fonts.mono.name}, ${theme.typography.fonts.mono.fallback.join(', ')}`,
        fontSize: theme.typography.sizes.sm.size
      }}>
        console.log('Hello, Degentalk!');
      </code>
    </div>
  );
}

// ============================================================================
// Example 4: Using spacing
// ============================================================================

export function SpacingExample() {
  return (
    <div style={{ padding: theme.spacing[4] }}>
      <div style={{ marginBottom: theme.spacing[8] }}>
        Section with consistent spacing
      </div>
      <div style={{ gap: theme.spacing[4] }} className="flex">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Using effects
// ============================================================================

export function EffectsExample() {
  return (
    <div>
      {/* Card with shadow */}
      <div style={{ 
        boxShadow: theme.effects.shadows.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[6]
      }}>
        Card with shadow effect
      </div>
      
      {/* Glowing button */}
      <button style={{
        boxShadow: theme.effects.shadows.glow,
        backgroundColor: theme.colors.brand.primary,
        color: theme.colors.neutral.white,
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        borderRadius: theme.borderRadius.md
      }}>
        Glowing Button
      </button>
    </div>
  );
}

// ============================================================================
// Example 6: Using component tokens
// ============================================================================

export function ComponentTokenExample() {
  const buttonStyle = theme.components.button.primary;
  
  return (
    <button
      style={{
        backgroundColor: buttonStyle.bg,
        color: buttonStyle.text,
        padding: `${theme.spacing[2.5]} ${theme.spacing[4]}`,
        borderRadius: theme.borderRadius.lg,
        fontWeight: theme.typography.weights.medium,
        transition: `all ${theme.animations.durations['200']} ${theme.animations.timings.smooth}`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = buttonStyle.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = buttonStyle.bg;
      }}
    >
      Primary Button
    </button>
  );
}

// ============================================================================
// Example 7: Building a complete component with theme
// ============================================================================

interface ThemedCardProps {
  title: string;
  description: string;
  zoneKey?: string;
}

export function ThemedCard({ title, description, zoneKey }: ThemedCardProps) {
  const zoneTheme = getForumTheme(zoneKey);
  const Icon = zoneTheme.icon;
  
  return (
    <div
      className={`${zoneTheme.bgColor} ${zoneTheme.borderColor} border rounded-xl p-6`}
      style={{
        boxShadow: theme.effects.shadows.card,
        transition: `all ${theme.animations.durations['200']} ${theme.animations.timings.smooth}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`${zoneTheme.color} w-6 h-6`} />
        <h3 
          className={zoneTheme.color}
          style={{
            fontSize: theme.typography.sizes.xl.size,
            fontWeight: theme.typography.weights.semibold,
            fontFamily: `${theme.typography.fonts.headline.name}, ${theme.typography.fonts.headline.fallback.join(', ')}`
          }}
        >
          {title}
        </h3>
      </div>
      
      {/* Content */}
      <p style={{
        color: theme.colors.neutral.mutedForeground,
        fontSize: theme.typography.sizes.sm.size,
        lineHeight: theme.typography.lineHeights.relaxed
      }}>
        {description}
      </p>
      
      {/* Footer */}
      <div 
        className="mt-4 pt-4"
        style={{
          borderTop: `1px solid ${theme.colors.neutral.border}33` // 20% opacity
        }}
      >
        <span className={zoneTheme.color} style={{
          fontSize: theme.typography.sizes.xs.size,
          fontWeight: theme.typography.weights.medium
        }}>
          {zoneTheme.label}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Example 8: Using animations
// ============================================================================

export function AnimationExample() {
  return (
    <div>
      {/* Animated element */}
      <div
        className="animate-pulse"
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: theme.colors.brand.primary,
          borderRadius: theme.borderRadius.lg,
          animationDuration: theme.animations.durations['1000'],
          animationTimingFunction: theme.animations.timings['in-out']
        }}
      />
      
      {/* Custom transition */}
      <button
        className="hover:scale-105"
        style={{
          transition: `transform ${theme.animations.durations['200']} ${theme.animations.timings['bounce-in']}`
        }}
      >
        Hover me!
      </button>
    </div>
  );
}

// ============================================================================
// Example 9: Responsive design with breakpoints
// ============================================================================

export function ResponsiveExample() {
  return (
    <div>
      <style jsx>{`
        .responsive-text {
          font-size: ${theme.typography.sizes.base.size};
        }
        
        @media (min-width: ${theme.screens.md}) {
          .responsive-text {
            font-size: ${theme.typography.sizes.lg.size};
          }
        }
        
        @media (min-width: ${theme.screens.lg}) {
          .responsive-text {
            font-size: ${theme.typography.sizes.xl.size};
          }
        }
      `}</style>
      
      <p className="responsive-text">
        This text scales with screen size
      </p>
    </div>
  );
}

// ============================================================================
// Example 10: Using z-index scale
// ============================================================================

export function ZIndexExample() {
  return (
    <div className="relative">
      <div style={{ 
        position: 'absolute',
        zIndex: theme.zIndex.dropdown,
        backgroundColor: theme.colors.neutral.card,
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius.md,
        boxShadow: theme.effects.shadows.lg
      }}>
        Dropdown content
      </div>
      
      <div style={{
        position: 'fixed',
        zIndex: theme.zIndex.modal,
        inset: 0,
        backgroundColor: theme.colors.neutral.background + 'CC' // 80% opacity
      }}>
        Modal overlay
      </div>
    </div>
  );
}