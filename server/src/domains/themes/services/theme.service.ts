/**
 * Enhanced Theme Service
 * 
 * Manages theme selection, caching, and CSS variable generation
 * Supports hierarchical theme resolution: User → Forum → Global
 */

import { db } from '@db';
import { uiThemes, type UiTheme } from '@schema/admin/uiThemes';
import { eq, and, or } from 'drizzle-orm';
import { cacheService } from '@core/cache/unified-cache.service';
import { logger } from '@core/logger';
import type { ForumId, UserId } from '@shared/types/ids';
import type { Theme, ThemeContext, ComputedTheme, ThemeColors } from '@shared/types/theme.types';

export class ThemeService {
  private readonly CACHE_PREFIX = 'theme:';
  private readonly CACHE_TTL = 3600; // 1 hour
  
  /**
   * Get theme for a specific context with fallback hierarchy
   */
  async getThemeForContext(context: ThemeContext): Promise<ComputedTheme> {
    // Check cache first
    const cacheKey = this.getCacheKey(context);
    const cached = await cacheService.get<ComputedTheme>(cacheKey);
    if (cached) return cached;
    
    // Priority order:
    // 1. User's selected theme (future feature)
    // 2. Forum-specific theme
    // 3. Global default theme
    
    let theme: UiTheme | undefined;
    
    // Future: Check user theme
    if (context.userId) {
      // theme = await this.getUserTheme(context.userId);
    }
    
    // Check forum theme
    if (!theme && context.forumId) {
      theme = await this.getForumTheme(context.forumId);
    }
    
    // Fall back to global default
    if (!theme) {
      theme = await this.getDefaultTheme();
    }
    
    // Convert to computed theme with CSS variables
    const computed = this.computeTheme(theme);
    
    // Cache the result
    await cacheService.set(cacheKey, computed, { ttl: this.CACHE_TTL });
    
    return computed;
  }
  
  /**
   * Get theme assigned to a specific forum
   */
  async getForumTheme(forumId: ForumId): Promise<UiTheme | undefined> {
    try {
      // In the current schema, themes are looked up by themeKey
      // This would need to be enhanced to support forum assignments
      // For now, we'll use a mapping approach
      
      const forumThemeMapping = await this.getForumThemeMapping();
      const themeKey = forumThemeMapping[forumId];
      
      if (!themeKey) return undefined;
      
      return await db.query.uiThemes.findFirst({
        where: and(
          eq(uiThemes.themeKey, themeKey),
          eq(uiThemes.isActive, true)
        )
      });
    } catch (error) {
      logger.error('Failed to get forum theme:', error);
      return undefined;
    }
  }
  
  /**
   * Get the global default theme
   */
  async getDefaultTheme(): Promise<UiTheme> {
    const defaultTheme = await db.query.uiThemes.findFirst({
      where: and(
        eq(uiThemes.themeKey, 'default'),
        eq(uiThemes.isActive, true)
      )
    });
    
    if (!defaultTheme) {
      // Return hardcoded fallback if no default in DB
      return this.getHardcodedDefault();
    }
    
    return defaultTheme;
  }
  
  /**
   * Convert database theme to computed theme with CSS variables
   */
  private computeTheme(theme: UiTheme): ComputedTheme {
    // Generate CSS variables from theme properties
    const cssVariables: Record<string, string> = {};
    
    // Map theme properties to CSS variables
    if (theme.color) cssVariables['--theme-accent'] = this.extractColorValue(theme.color);
    if (theme.bgColor) cssVariables['--theme-background'] = this.extractColorValue(theme.bgColor);
    if (theme.borderColor) cssVariables['--theme-border'] = this.extractColorValue(theme.borderColor);
    
    // Generate color palette
    const colors = this.generateColorPalette(theme);
    Object.entries(colors).forEach(([key, value]) => {
      cssVariables[`--${key}`] = value;
    });
    
    // Effects
    if (theme.glowIntensity) {
      const intensity = theme.glowIntensity === 'high' ? '100' : 
                       theme.glowIntensity === 'medium' ? '50' : '25';
      cssVariables['--glow-intensity'] = intensity;
    }
    
    // Convert to full theme object
    const computed: ComputedTheme = {
      id: theme.id,
      themeKey: theme.themeKey,
      name: theme.themeKey,
      displayName: theme.label || theme.themeKey,
      scope: 'global', // Default scope
      isDefault: theme.themeKey === 'default',
      isActive: theme.isActive,
      
      colors: colors as ThemeColors,
      
      effects: {
        borderRadius: '0.5rem', // Default
        glowIntensity: theme.glowIntensity === 'high' ? 100 : 
                       theme.glowIntensity === 'medium' ? 50 : 25,
        animationSpeed: 1.0,
        gradient: theme.gradient || undefined,
        glow: theme.glow || undefined,
        glowIntensityClass: theme.glowIntensity || 'medium',
        rarityOverlay: theme.rarityOverlay || 'common'
      },
      
      icon: theme.icon || undefined,
      version: theme.version,
      metadata: theme.metadata || {},
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      createdBy: 'system' as UserId, // Legacy themes
      
      cssVariables
    };
    
    return computed;
  }
  
  /**
   * Generate full color palette from theme properties
   */
  private generateColorPalette(theme: UiTheme): Partial<ThemeColors> {
    // Extract base color from theme
    const accentColor = this.extractColorValue(theme.color || 'text-zinc-400');
    const bgColor = this.extractColorValue(theme.bgColor || 'bg-zinc-900/40');
    const borderColor = this.extractColorValue(theme.borderColor || 'border-zinc-700/30');
    
    return {
      // Primary palette (derived from accent)
      primary: accentColor,
      primaryForeground: '#ffffff',
      
      // Base colors
      background: bgColor,
      foreground: '#ffffff',
      card: 'rgba(24, 24, 27, 0.9)', // zinc-900/90
      cardForeground: '#ffffff',
      
      // UI elements
      border: borderColor,
      input: 'rgba(39, 39, 42, 0.5)', // zinc-800/50
      ring: accentColor,
      
      // Semantic colors (defaults)
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      muted: 'rgba(161, 161, 170, 0.4)', // zinc-400/40
      mutedForeground: '#a1a1aa',
      accent: accentColor,
      accentForeground: '#ffffff',
      
      // DegenTalk specific
      degen: accentColor,
      degenGlow: `${accentColor}80`, // 50% opacity
      premium: '#fbbf24',
      premiumGlow: 'rgba(251, 191, 36, 0.5)'
    };
  }
  
  /**
   * Extract color value from Tailwind class
   */
  private extractColorValue(tailwindClass: string): string {
    // Map common Tailwind classes to color values
    // This is a simplified mapping - enhance as needed
    const colorMap: Record<string, string> = {
      'text-red-400': '#f87171',
      'text-blue-400': '#60a5fa',
      'text-purple-400': '#a78bfa',
      'text-amber-400': '#fbbf24',
      'text-gray-400': '#9ca3af',
      'text-violet-400': '#a78bfa',
      'text-zinc-400': '#a1a1aa',
      'text-cyan-400': '#22d3ee',
      'text-orange-400': '#fb923c',
      'text-emerald-400': '#34d399',
      'text-indigo-400': '#818cf8',
      'text-sky-400': '#38bdf8',
      'text-pink-400': '#f472b6',
      'text-yellow-400': '#facc15',
      'text-purple-300': '#c084fc',
      // Add more mappings as needed
    };
    
    // Extract color from bg- or border- classes
    if (tailwindClass.startsWith('bg-') || tailwindClass.startsWith('border-')) {
      const baseClass = tailwindClass.replace(/^(bg-|border-)/, 'text-');
      return colorMap[baseClass] || '#a1a1aa'; // Default to zinc-400
    }
    
    return colorMap[tailwindClass] || tailwindClass;
  }
  
  /**
   * Get forum to theme mapping
   * In production, this would be stored in the database
   */
  private async getForumThemeMapping(): Promise<Record<string, string>> {
    // This would be replaced with database lookups
    return {
      'pit': 'pit',
      'casino': 'casino',
      'shop': 'shop',
      'briefing': 'briefing',
      'archive': 'archive',
      // Fallback themes for other forums
      'general': 'ocean',
      'announcements': 'sunset',
      'support': 'forest',
      'dev': 'cosmic'
    };
  }
  
  /**
   * Get cache key for theme context
   */
  private getCacheKey(context: ThemeContext): string {
    const parts = [this.CACHE_PREFIX];
    if (context.userId) parts.push(`user:${context.userId}`);
    if (context.forumId) parts.push(`forum:${context.forumId}`);
    if (parts.length === 1) parts.push('global');
    return parts.join(':');
  }
  
  /**
   * Hardcoded default theme fallback
   */
  private getHardcodedDefault(): UiTheme {
    return {
      id: 'default',
      themeKey: 'default',
      icon: 'MessageSquare',
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-900/30',
      borderColor: 'border-zinc-500/30',
      label: 'Default',
      version: 1,
      isActive: true,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      gradient: 'from-zinc-900/30 via-zinc-800/20 to-zinc-700/10',
      glow: 'shadow-zinc-500/20',
      glowIntensity: 'medium',
      rarityOverlay: 'common'
    };
  }
  
  /**
   * Clear theme cache
   */
  async clearCache(context?: ThemeContext): Promise<void> {
    if (context) {
      const key = this.getCacheKey(context);
      await cacheService.delete(key);
    } else {
      // Clear all theme cache
      await cacheService.deletePattern(`${this.CACHE_PREFIX}*`);
    }
  }
}

// Export singleton instance
export const themeService = new ThemeService();