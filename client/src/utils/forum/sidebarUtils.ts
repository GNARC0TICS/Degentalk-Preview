import { sidebarWidgets, type WidgetType } from '@/config/sidebarWidgets.config';
import type { StructureId } from '@shared/types/ids';

export type { WidgetType };

/**
 * Maps zone slugs to their corresponding theme keys
 */
const ZONE_SLUG_TO_THEME_MAP: Record<string, string> = {
	'the-pit': 'pit',
	'mission-control': 'mission',
	'casino-floor': 'casino',
	'briefing-room': 'briefing',
	'the-archive': 'archive',
	degenshop: 'shop',
	general: 'general'
};

/**
 * Gets the sidebar widgets for a specific structure ID or zone
 * Falls back to default configuration if zone not found
 */
export function getSidebarWidgets(structureId?: StructureId, zoneSlug?: string): WidgetType[] {
	// If we have a zone slug, use it directly
	if (zoneSlug) {
		const themeKey = ZONE_SLUG_TO_THEME_MAP[zoneSlug] || 'default';
		return sidebarWidgets[themeKey as keyof typeof sidebarWidgets] || sidebarWidgets.default;
	}

	// TODO: In a real implementation, you would:
	// 1. Look up the structureId in the forum structure
	// 2. Determine which zone it belongs to
	// 3. Map that to the appropriate widget configuration

	// For now, return default configuration
	// This could be enhanced to:
	// - Query the ForumStructureContext to resolve structureId → zone
	// - Use that zone's slug to determine the widget set
	return sidebarWidgets.default;
}

/**
 * Gets the theme key for a given zone slug
 * Useful for passing to widget components for theming
 */
export function getZoneThemeKey(zoneSlug?: string): string {
	if (!zoneSlug) return 'default';
	return ZONE_SLUG_TO_THEME_MAP[zoneSlug] || 'default';
}

/**
 * Validates if a widget type is supported
 */
export function isValidWidgetType(widget: string): widget is WidgetType {
	return ['stats', 'hotTopics', 'recentActivity'].includes(widget);
}

/**
 * Gets widgets for specific zones (convenience functions)
 */
export const getWidgetsForZone = {
	pit: () => getSidebarWidgets(undefined, 'the-pit'),
	mission: () => getSidebarWidgets(undefined, 'mission-control'),
	casino: () => getSidebarWidgets(undefined, 'casino-floor'),
	briefing: () => getSidebarWidgets(undefined, 'briefing-room'),
	archive: () => getSidebarWidgets(undefined, 'the-archive'),
	shop: () => getSidebarWidgets(undefined, 'degenshop'),
	general: () => getSidebarWidgets(undefined, 'general')
};
