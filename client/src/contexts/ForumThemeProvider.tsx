import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import type { ReactNode, ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { ZONE_THEMES } from '@/config/zoneThemes.config'; // Default themes
import { apiRequest } from '@/lib/queryClient'; // Fetch utility
import { Flame, Target, Archive, Dices, FileText, Folder } from 'lucide-react';

// LucideIcon is now imported from lucide-react

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

// Use centralized CSS variable utilities
import { setZoneAccentVariables } from '@/styles/cssVariables';

// Local alias for icon component type
type LucideIcon = ComponentType<LucideProps>;

export interface ThemeSettings {
	icon?: LucideIcon | string; // Allow string for emoji or SVG path
	color?: string; // e.g., Tailwind text color class like 'text-red-400'
	bgColor?: string; // e.g., Tailwind background color class
	borderColor?: string; // e.g., Tailwind border color class
	hexColor?: string; // Actual hex color value for the theme
	// Potentially add other theme-related properties like bannerImage, etc.
}

export interface ThemeOverrides {
	[semanticKey: string]: Partial<ThemeSettings>;
}

interface ForumThemeContextType {
	getTheme: (semanticKey?: string | null) => ThemeSettings;
	setThemeOverrides: (overrides: ThemeOverrides) => void; // For dynamic updates if needed
	currentOverrides: ThemeOverrides;
	setActiveTheme: (semanticKey: string) => void; // Set CSS variables for the active theme
}

// Map Tailwind color classes to hex values for CSS variables
const COLOR_CLASS_TO_HEX: Record<string, string> = {
	'text-red-400': '#f87171',
	'text-blue-400': '#60a5fa',
	'text-purple-400': '#c084fc',
	'text-amber-400': '#fbbf24',
	'text-gray-400': '#9ca3af',
	'text-violet-400': '#a78bfa',
	'text-emerald-400': '#34d399',
	'text-pink-400': '#f472b6',
	'text-indigo-400': '#818cf8',
	'text-green-400': '#4ade80',
	'text-orange-400': '#fb923c',
	'text-teal-400': '#2dd4bf',
	'text-yellow-400': '#facc15',
	'text-cyan-400': '#22d3ee'
};

const defaultTheme = ZONE_THEMES.default;

const ForumThemeContext = createContext<ForumThemeContextType | undefined>(undefined);

export const ForumThemeProvider: React.FC<{
	children: ReactNode;
	initialOverrides?: ThemeOverrides;
}> = ({ children, initialOverrides = {} }) => {
	const [themeOverrides, setThemeOverrides] = useState<ThemeOverrides>(initialOverrides);
	// const [isLoadingRemoteThemes, setIsLoadingRemoteThemes] = useState(false); // Placeholder

	// Update CSS variables function using centralized utility
	const setActiveTheme = useCallback((semanticKey: string) => {
		const theme = getTheme(semanticKey);
		let hexColor = '#10b981'; // Default emerald color

		// Try to extract hex color from the theme
		if (theme.hexColor) {
			hexColor = theme.hexColor;
		} else if (theme.color && COLOR_CLASS_TO_HEX[theme.color]) {
			hexColor = COLOR_CLASS_TO_HEX[theme.color];
		}

		// Use centralized utility to set CSS variables
		setZoneAccentVariables(hexColor);
	}, []);

	// Replace placeholder fetch useEffect block with real implementation
	useEffect(() => {
		const fetchRemoteThemes = async () => {
			try {
				const remoteThemes = await apiRequest<
					Record<string, Partial<ThemeSettings & { icon?: string; hexColor?: string }>>
				>({
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
					setThemeOverrides((currentLocalOverrides) => ({
						...currentLocalOverrides,
						...formattedOverrides
					}));
				}
			} catch (error) {
				console.error('Failed to fetch remote theme configurations:', error);
			}
		};

		fetchRemoteThemes();
	}, []);

	const getTheme = useCallback(
		(semanticKey?: string | null): ThemeSettings => {
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

			// Extract hex color for CSS variables
			const colorClass = override?.color || baseTheme.color || '';
			const hexColor = override?.hexColor || COLOR_CLASS_TO_HEX[colorClass] || '#10b981';

			return {
				icon: finalIcon, // This can be LucideIcon or string (emoji)
				color: override?.color || baseTheme.color,
				bgColor: override?.bgColor || baseTheme.bgColor,
				borderColor: override?.borderColor || baseTheme.borderColor,
				hexColor: hexColor
			};
		},
		[themeOverrides]
	);

	const contextValue = useMemo(
		() => ({
			getTheme,
			setThemeOverrides,
			currentOverrides: themeOverrides,
			setActiveTheme
		}),
		[getTheme, themeOverrides, setActiveTheme]
	);

	return <ForumThemeContext.Provider value={contextValue}>{children}</ForumThemeContext.Provider>;
};

export const useForumTheme = () => {
	const context = useContext(ForumThemeContext);
	if (context === undefined) {
		throw new Error('useForumTheme must be used within a ForumThemeProvider');
	}
	return context;
};
