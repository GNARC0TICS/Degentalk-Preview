/**
 * Theme Hook
 * 
 * Manages theme loading and CSS variable application
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentForum } from '@/hooks/useCurrentForum';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/utils/api-request';
import type { ComputedTheme } from '@shared/types/theme.types';

/**
 * Hook to load and apply theme based on context
 */
export function useTheme() {
  const { forum } = useCurrentForum();
  const { user } = useAuth();
  
  // Build query params
  const params = new URLSearchParams();
  if (forum?.id) params.append('forumId', forum.id);
  
  // Fetch theme for current context
  const { data: theme, isLoading, error } = useQuery<ComputedTheme>({
    queryKey: ['theme', { forumId: forum?.id, userId: user?.id }],
    queryFn: async () => {
      const response = await apiRequest({
        url: `/api/themes/context?${params.toString()}`,
        method: 'GET'
      });
      return response;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
  
  // Apply theme CSS variables to document root
  useEffect(() => {
    if (!theme?.cssVariables) return;
    
    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Apply special classes based on theme properties
    if (theme.effects?.glowIntensityClass) {
      root.setAttribute('data-glow-intensity', theme.effects.glowIntensityClass);
    }
    
    if (theme.effects?.rarityOverlay) {
      root.setAttribute('data-rarity', theme.effects.rarityOverlay);
    }
    
    // Cleanup function
    return () => {
      // Reset to defaults when component unmounts
      // In production, you might want to keep the theme
    };
  }, [theme]);
  
  return {
    theme,
    isLoading,
    error,
    isReady: !isLoading && !error && !!theme
  };
}

/**
 * Hook to get current theme colors
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme?.colors || getDefaultColors();
}

/**
 * Hook to get current theme effects
 */
export function useThemeEffects() {
  const { theme } = useTheme();
  return theme?.effects || getDefaultEffects();
}

/**
 * Default colors fallback
 */
function getDefaultColors() {
  return {
    primary: '#a78bfa',
    primaryForeground: '#ffffff',
    secondary: '#6366f1',
    secondaryForeground: '#ffffff',
    background: '#18181b',
    foreground: '#ffffff',
    card: 'rgba(24, 24, 27, 0.9)',
    cardForeground: '#ffffff',
    border: 'rgba(63, 63, 70, 0.3)',
    input: 'rgba(39, 39, 42, 0.5)',
    ring: '#a78bfa',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    muted: 'rgba(161, 161, 170, 0.4)',
    mutedForeground: '#a1a1aa',
    accent: '#a78bfa',
    accentForeground: '#ffffff',
    degen: '#a78bfa',
    degenGlow: 'rgba(167, 139, 250, 0.5)',
    premium: '#fbbf24',
    premiumGlow: 'rgba(251, 191, 36, 0.5)'
  };
}

/**
 * Default effects fallback
 */
function getDefaultEffects() {
  return {
    borderRadius: '0.5rem',
    glowIntensity: 50,
    animationSpeed: 1.0
  };
}