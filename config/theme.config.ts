/**
 * Centralized Theme Configuration
 * 
 * This file consolidates all design tokens for the DegenTalk platform.
 * All theme values should reference this configuration to ensure consistency.
 * 
 * WCAG AA Compliance: All color combinations must meet 4.5:1 contrast ratio
 */

export const theme = {
  // Color Palette
  colors: {
    // Brand Colors
    brand: {
      primary: '#10b981', // Emerald green
      primaryRgb: '16, 185, 129',
      secondary: '#fb923c', // Orange
      accent: '#dc2626', // Red
      gradient: {
        start: 'rgba(16, 185, 129, 0.8)',
        end: 'rgba(16, 185, 129, 0.4)',
        orange: 'rgba(251, 146, 60, 0.8)',
        red: 'rgba(220, 38, 38, 0.8)'
      }
    },
    
    // Semantic Colors
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      destructive: '#dc2626'
    },
    
    // Neutral Colors (OLED optimized)
    neutral: {
      black: '#000000', // Pure black for OLED
      white: '#ffffff',
      gray: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
        950: '#09090b'
      }
    },
    
    // Surface Colors (for components)
    surface: {
      background: '#000000',
      card: '#0d0d0d',
      cardHover: '#141414',
      elevated: '#1a1a1a',
      overlay: 'rgba(0, 0, 0, 0.8)',
      border: {
        subtle: '#27272a',
        default: '#3f3f46',
        strong: '#52525b',
        interactive: '#10b981'
      }
    },
    
    // Text Colors
    text: {
      primary: '#f2f2f2',
      secondary: '#a1a1aa',
      muted: '#71717a',
      accent: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      onBrand: '#ffffff',
      link: '#10b981',
      linkHover: '#059669'
    },
    
    // Zone-specific colors (referenced from themeConstants)
    zones: {
      general: '#10b981',
      trading: '#3b82f6',
      crypto: '#f59e0b',
      nft: '#8b5cf6',
      defi: '#06b6d4',
      'degen-casino': '#ec4899',
      'shitcoin-alley': '#f97316',
      'tax-and-regulations': '#6366f1',
      'affiliate-marketing': '#84cc16',
      giveaways: '#f59e0b',
      marketplace: '#14b8a6',
      'product-reviews': '#8b5cf6',
      'announcements-and-updates': '#ef4444',
      'off-topic': '#6b7280'
    }
  },
  
  // Typography System
  typography: {
    // Font Families
    fonts: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "'Orbitron', 'Space Grotesk', sans-serif",
      mono: "'JetBrains Mono', 'Space Mono', monospace",
      game: "'Press Start 2P', 'Audiowide', monospace"
    },
    
    // Font Sizes (for content feed)
    sizes: {
      // Base sizes
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
      
      // Content Feed Specific
      feedTitle: '16px',
      feedMeta: '13px',
      feedPreview: '14px',
      feedStats: '12px',
      feedCategory: '12px'
    },
    
    // Font Weights
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    
    // Line Heights
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    
    // Letter Spacing
    letterSpacing: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.04em',
      widest: '0.08em'
    }
  },
  
  // Spacing Scale
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    18: '4.5rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    88: '22rem',
    96: '24rem',
    120: '30rem',
    128: '32rem',
    144: '36rem'
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  
  // Effects
  effects: {
    // Shadows
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
      default: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      glow: {
        sm: '0 0 10px rgba(16, 185, 129, 0.5)',
        md: '0 0 20px rgba(16, 185, 129, 0.5)',
        lg: '0 0 30px rgba(16, 185, 129, 0.5)',
        orange: '0 0 20px rgba(251, 146, 60, 0.5)',
        red: '0 0 20px rgba(220, 38, 38, 0.5)'
      }
    },
    
    // Gradients
    gradients: {
      brand: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      warm: 'linear-gradient(135deg, #fb923c 0%, #dc2626 100%)',
      dark: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
      surface: 'linear-gradient(180deg, rgba(13, 13, 13, 0.9) 0%, rgba(13, 13, 13, 0.6) 100%)',
      overlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%)'
    },
    
    // Blur
    blur: {
      none: '0',
      sm: '4px',
      default: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '40px',
      '3xl': '64px'
    }
  },
  
  // Animation
  animation: {
    // Durations
    durations: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms'
    },
    
    // Easing Functions
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  // Component-specific tokens
  components: {
    feed: {
      item: {
        minHeight: '120px',
        padding: '16px',
        borderWidth: '1px',
        hoverScale: '1.02',
        touchTargetMin: '48px' // Mobile touch target
      },
      typography: {
        title: {
          size: '16px',
          weight: 600,
          lineHeight: 1.375
        },
        meta: {
          size: '13px',
          weight: 400,
          color: '#a1a1aa'
        },
        preview: {
          size: '14px',
          weight: 400,
          lineHeight: 1.625
        },
        stats: {
          size: '12px',
          weight: 500,
          color: '#71717a'
        }
      },
      colors: {
        background: '#0d0d0d',
        backgroundHover: '#141414',
        border: '#27272a',
        borderHover: '#3f3f46',
        hotIndicator: '#ef4444',
        newIndicator: '#10b981',
        staffBadge: '#3b82f6'
      }
    },
    
    tabs: {
      height: '48px',
      padding: '12px 16px',
      borderWidth: '2px',
      fontSize: '14px',
      fontWeight: 500,
      activeColor: '#fb923c',
      inactiveColor: '#71717a',
      hoverColor: '#fbbf24'
    },
    
    filters: {
      height: '40px',
      padding: '8px 16px',
      fontSize: '13px',
      borderRadius: '8px',
      background: '#1a1a1a',
      borderColor: '#3f3f46'
    }
  },
  
  // Breakpoints (matching Tailwind)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Z-index Scale
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070'
  }
} as const;

// Type exports for TypeScript usage
export type Theme = typeof theme;
export type ColorKey = keyof Theme['colors'];
export type TypographyKey = keyof Theme['typography'];
export type SpacingKey = keyof Theme['spacing'];
export type ComponentKey = keyof Theme['components'];

// Helper function to get CSS variable from theme
export const getCSSVariable = (path: string): string => {
  const parts = path.split('.');
  let value: any = theme;
  
  for (const part of parts) {
    value = value[part];
    if (!value) return '';
  }
  
  return value;
};

// Export default for easier imports
export default theme;