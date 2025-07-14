export const featureFlags = {
	widgetSystem: {
		enableWidgets: true
	},
	forum: {
		showHotRibbon: true,
		smartOrdering: false
	},
	performance: {
		enableCaching: false // Start disabled, enable in staging/prod
	}
} as const;

// Backward-compat: existing constant keeps working
export const ENABLE_WIDGETS = featureFlags.widgetSystem.enableWidgets;
