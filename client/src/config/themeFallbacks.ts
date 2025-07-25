/**
 * @deprecated Use theme.config.ts instead
 * This file is maintained for backward compatibility
 */
import { type LucideIcon } from 'lucide-react';
import { zoneThemes, getForumTheme } from '@shared/config/zoneThemes.config';

export interface DefaultZoneTheme {
	icon: LucideIcon;
	color: string;
}

// Re-export from theme.config.ts for backward compatibility
export const DEFAULT_ZONE_THEMES: Record<string, DefaultZoneTheme> = Object.entries(zoneThemes).reduce(
	(acc, [key, theme]) => ({
		...acc,
		[key]: {
			icon: theme.icon,
			color: theme.color,
		},
	}),
	{}
);
