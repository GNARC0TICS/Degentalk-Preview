import React from 'react';

// Re-export the widget registry components for backward compatibility
// This file is deprecated in favor of widgetRegistry.ts
import { widgetRegistry } from './widgetRegistry';

/**
 * @deprecated Use widgetRegistry instead
 * The component registry maps a unique string ID to a function that returns a dynamic import.
 * This enables lazy loading for each widget, improving initial page load performance.
 */
export const componentRegistry = Object.entries(widgetRegistry).reduce(
	(acc, [id, config]) => {
		acc[id] = config.component;
		return acc;
	},
	{} as Record<string, () => Promise<{ default: React.ComponentType<any> }>>
);

// This creates a TypeScript type that is a union of all the keys in the componentRegistry.
// e.g., 'profileCard' | 'shoutbox' | 'walletSummary' | ...
export type ComponentId = keyof typeof componentRegistry;
