export type Theme = 'light' | 'dark';

// Lucide icons are React components that accept SVG props.
import type { LucideIcon } from 'lucide-react';

// Configuration for a single icon entry in the map.
export interface IconConfig {
	/** Default Lucide icon component */
	lucide?: LucideIcon;
	/** Path to a static SVG file used as fallback */
	fallbackSvg?: string;
	/** Path to a static PNG file used as fallback */
	fallbackPng?: string;
	/** Lottie JSON animation object or path */
	lottie?: any;
	/** Theme-specific overrides */
	themeVariants?: Partial<Record<Theme, LucideIcon | string>>;
}

/**
 * Canonical map type.
 * Use `satisfies IconMap` to preserve literal keys while ensuring structure.
 */
export type IconMap = Record<string, IconConfig>;

// Convenience re-export for maps using `as const` with satisfies.
export type { LucideIcon };
