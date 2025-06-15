import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ZONE_THEMES } from '@/config/themeConstants'; // Default themes
import { apiRequest } from '@/lib/queryClient'; // Fetch utility
import {
  Flame,
  Target,
  Archive,
  Dices,
  FileText,
  Folder
} from 'lucide-react';

// const ADMIN_CONFIGURABLE_THEMES_API_PATH = '/api/themes/config'; // Example API endpoint

// Mapping of string icon names (from backend) to Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Target,
  Archive,
  Dices,
  FileText,
  Folder
};

const UI_THEMES_ENDPOINT = '/api/ui/themes';

export interface ThemeSettings {
  icon?: LucideIcon | string; // Allow string for emoji or SVG path
  color?: string; // e.g., Tailwind text color class like 'text-red-400'
  bgColor?: string; // e.g., Tailwind background color class
  borderColor?: string; // e.g., Tailwind border color class
  // Potentially add other theme-related properties like bannerImage, etc.
}

export interface ThemeOverrides {
  [semanticKey: string]: Partial<ThemeSettings>;
}

interface ForumThemeContextType {
  getTheme: (semanticKey?: string | null) => ThemeSettings;
  setThemeOverrides: (overrides: ThemeOverrides) => void; // For dynamic updates if needed
  currentOverrides: ThemeOverrides;
}

const defaultTheme = ZONE_THEMES.default;

const ForumThemeContext = createContext<ForumThemeContextType | undefined>(undefined);

export const ForumThemeProvider: React.FC<{ children: ReactNode; initialOverrides?: ThemeOverrides }> = ({
  children,
  initialOverrides = {},
}) => {
  const [themeOverrides, setThemeOverrides] = useState<ThemeOverrides>(initialOverrides);
  // const [isLoadingRemoteThemes, setIsLoadingRemoteThemes] = useState(false); // Placeholder

  // Replace placeholder fetch useEffect block with real implementation
  useEffect(() => {
    const fetchRemoteThemes = async () => {
      try {
        const remoteThemes = await apiRequest<Record<string, Partial<ThemeSettings & { icon?: string }>>>({
          url: UI_THEMES_ENDPOINT
        });

        if (remoteThemes) {
          const formattedOverrides: ThemeOverrides = {};
          Object.entries(remoteThemes).forEach(([key, value]) => {
            const { icon: iconName, ...rest } = value;
            formattedOverrides[key] = {
              ...rest,
              icon: iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : undefined
            };
          });
          setThemeOverrides(currentLocalOverrides => ({ ...currentLocalOverrides, ...formattedOverrides }));
        }
      } catch (error) {
        console.error('Failed to fetch remote theme configurations:', error);
      }
    };

    fetchRemoteThemes();
  }, []);

  const getTheme = useCallback((semanticKey?: string | null): ThemeSettings => {
    const key = semanticKey || 'default';
    // Theme overrides from state (which could include fetched remote themes) take precedence
    const override = themeOverrides[key]; 
    // Fallback to ZONE_THEMES if no override for the specific key
    const baseTheme = ZONE_THEMES[key as keyof typeof ZONE_THEMES] || defaultTheme;

    // If icon is a component from ZONE_THEMES, it's already LucideIcon.
    // If it's a string (emoji from MergedZone/Forum), it's handled.
    let finalIcon: LucideIcon | string | undefined = baseTheme.icon;
    if (override?.icon) {
      finalIcon = override.icon;
    }
    
    return {
      icon: finalIcon, // This can be LucideIcon or string (emoji)
      color: override?.color || baseTheme.color,
      bgColor: override?.bgColor || baseTheme.bgColor,
      borderColor: override?.borderColor || baseTheme.borderColor,
    };
  }, [themeOverrides]);

  const contextValue = useMemo(() => ({
    getTheme,
    setThemeOverrides,
    currentOverrides: themeOverrides,
  }), [getTheme, themeOverrides]);

  return (
    <ForumThemeContext.Provider value={contextValue}>
      {children}
    </ForumThemeContext.Provider>
  );
};

export const useForumTheme = () => {
  const context = useContext(ForumThemeContext);
  if (context === undefined) {
    throw new Error('useForumTheme must be used within a ForumThemeProvider');
  }
  return context;
};
