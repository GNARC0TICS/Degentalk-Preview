/**
 * Unified Theme System Types
 * 
 * Database-driven theme management for DegenTalk
 * Supports global, forum-specific, and future user-specific themes
 */

import type { ForumId, UserId } from './ids.js';

/**
 * Theme scope determines where a theme is applied
 */
export type ThemeScope = 'global' | 'forum' | 'user';

/**
 * Visual intensity levels for effects
 */
export type GlowIntensity = 'low' | 'medium' | 'high';

/**
 * Rarity tiers for special theme effects
 */
export type RarityOverlay = 'common' | 'premium' | 'legendary';

/**
 * Core theme colors following design system conventions
 */
export interface ThemeColors {
  // Primary palette
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  
  // Base colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  
  // UI elements
  border: string;
  input: string;
  ring: string;
  
  // Semantic colors
  destructive: string;
  destructiveForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  
  // DegenTalk specific
  degen: string;          // For XP, levels, gamification
  degenGlow: string;      // For glow effects
  premium: string;        // For cosmetics, premium features
  premiumGlow: string;    // For premium glow effects
}

/**
 * Visual effects configuration
 */
export interface ThemeEffects {
  borderRadius: string;    // CSS value: '0.25rem' | '0.5rem' | '1rem'
  glowIntensity: number;   // 0-100 scale
  animationSpeed: number;  // Multiplier: 0.5-2.0
  
  // Tailwind utility classes for advanced effects
  gradient?: string;       // e.g., 'from-purple-900/40 via-purple-800/20 to-purple-700/10'
  glow?: string;          // e.g., 'shadow-purple-500/20'
  glowIntensityClass?: GlowIntensity;
  rarityOverlay?: RarityOverlay;
}

/**
 * Complete theme definition
 */
export interface Theme {
  // Identity
  id: string;
  themeKey: string;        // Unique identifier for lookups
  name: string;            // Internal name
  displayName: string;     // User-facing name
  
  // Assignment
  scope: ThemeScope;
  forumId?: ForumId;       // Required if scope = 'forum'
  userId?: UserId;         // Required if scope = 'user' (future)
  isDefault: boolean;      // Is this the fallback theme?
  isActive: boolean;       // Is this theme enabled?
  
  // Visual properties
  colors: ThemeColors;
  effects: ThemeEffects;
  
  // UI hints
  icon?: string;           // Lucide icon name or emoji
  preview?: string;        // Preview image URL
  
  // Metadata
  version: number;         // For A/B testing
  metadata?: Record<string, unknown>; // Extensibility
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserId;
}

/**
 * Theme creation input (without generated fields)
 */
export type NewTheme = Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Partial theme for updates
 */
export type ThemeUpdate = Partial<Omit<Theme, 'id' | 'themeKey' | 'createdAt' | 'createdBy'>>;

/**
 * Theme selection context
 */
export interface ThemeContext {
  forumId?: ForumId;
  userId?: UserId;
}

/**
 * Theme with computed CSS variables
 */
export interface ComputedTheme extends Theme {
  cssVariables: Record<string, string>;
}

/**
 * Helper type for theme lookups
 */
export type ThemeKey = string;

/**
 * Theme assignment for specific contexts
 */
export interface ThemeAssignment {
  themeId: string;
  scope: ThemeScope;
  targetId?: ForumId | UserId; // ID of forum or user
  priority: number;            // Higher priority wins
  createdAt: Date;
  updatedAt: Date;
}