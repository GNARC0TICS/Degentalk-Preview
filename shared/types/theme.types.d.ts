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
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    degen: string;
    degenGlow: string;
    premium: string;
    premiumGlow: string;
}
/**
 * Visual effects configuration
 */
export interface ThemeEffects {
    borderRadius: string;
    glowIntensity: number;
    animationSpeed: number;
    gradient?: string;
    glow?: string;
    glowIntensityClass?: GlowIntensity;
    rarityOverlay?: RarityOverlay;
}
/**
 * Complete theme definition
 */
export interface Theme {
    id: string;
    themeKey: string;
    name: string;
    displayName: string;
    scope: ThemeScope;
    forumId?: ForumId;
    userId?: UserId;
    isDefault: boolean;
    isActive: boolean;
    colors: ThemeColors;
    effects: ThemeEffects;
    icon?: string;
    preview?: string;
    version: number;
    metadata?: Record<string, unknown>;
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
    targetId?: ForumId | UserId;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}
