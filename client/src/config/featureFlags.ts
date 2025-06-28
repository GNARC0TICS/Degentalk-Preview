export const featureFlags = {
	widgetSystem: {
		enableWidgets: true
	},
	forum: {
		showHotRibbon: true,
		smartOrdering: false
	}
} as const;

// Backward-compat: existing constant keeps working
export const ENABLE_WIDGETS = featureFlags.widgetSystem.enableWidgets;
