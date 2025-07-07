import React from 'react';
import { StatsWidget } from './StatsWidget';
import { HotTopicsWidget } from './HotTopicsWidget';
import { ActivityFeedWidget } from './ActivityFeedWidget';
import { getSidebarWidgets, getZoneThemeKey, type WidgetType } from '@/lib/forum/sidebarUtils';
import { cn } from '@/lib/utils';

interface DynamicSidebarProps {
	structureId?: StructureId;
	zoneSlug?: string;
	className?: string;
}

/**
 * Widget factory function that renders the appropriate widget component
 * based on the widget type
 */
const WidgetFactory: React.FC<{
	widgetType: WidgetType;
	structureId?: StructureId;
	colorTheme: string;
	className?: string;
}> = ({ widgetType, structureId, colorTheme, className }) => {
	const commonProps = {
		structureId,
		colorTheme,
		className
	};

	switch (widgetType) {
		case 'stats':
			return <StatsWidget {...commonProps} />;

		case 'hotTopics':
			return <HotTopicsWidget {...commonProps} limit={5} />;

		case 'recentActivity':
			return <ActivityFeedWidget {...commonProps} limit={5} />;

		default:
			// Fallback for unknown widget types
			console.warn(`Unknown widget type: ${widgetType}`);
			return null;
	}
};

/**
 * Dynamic sidebar that renders widgets based on zone configuration
 * Automatically determines which widgets to show based on the current zone
 */
export function DynamicSidebar({ structureId, zoneSlug, className }: DynamicSidebarProps) {
	// Get the widgets to display for this zone
	const widgetsToShow = getSidebarWidgets(structureId, zoneSlug);

	// Get the theme key for consistent theming
	const colorTheme = getZoneThemeKey(zoneSlug);

	// If no widgets are configured, don't render anything
	if (widgetsToShow.length === 0) {
		return null;
	}

	return (
		<aside className={cn('space-y-6', className)}>
			{widgetsToShow.map((widgetType, index) => (
				<WidgetFactory
					key={`${widgetType}-${index}`}
					widgetType={widgetType}
					structureId={structureId}
					colorTheme={colorTheme}
					className="w-full"
				/>
			))}
		</aside>
	);
}
