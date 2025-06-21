/**
 * CSS Variables Utility
 *
 * Provides functions for getting and setting CSS variables consistently across the app
 */

/**
 * Sets CSS variables for zone accent colors
 *
 * @param hexColor - The base accent color in hex format (#RRGGBB)
 */
export function setZoneAccentVariables(hexColor: string): void {
	const rgbValue = hexToRgb(hexColor);

	document.documentElement.style.setProperty('--zone-accent', hexColor);
	document.documentElement.style.setProperty('--zone-accent-rgb', rgbValue);
	document.documentElement.style.setProperty('--zone-accent-faded', `${hexColor}40`); // 25% opacity
	document.documentElement.style.setProperty('--zone-accent-gradient-start', `${hexColor}CC`); // 80% opacity
	document.documentElement.style.setProperty('--zone-accent-gradient-end', `${hexColor}66`); // 40% opacity
}

/**
 * Gets the current zone accent color
 *
 * @returns The current zone accent color in hex format
 */
export function getZoneAccent(): string {
	return (
		getComputedStyle(document.documentElement).getPropertyValue('--zone-accent').trim() || '#10b981'
	);
}

/**
 * Converts a hex color string to RGB format
 *
 * @param hex - The hex color string (#RRGGBB)
 * @returns RGB string in format "R, G, B"
 */
export function hexToRgb(hex: string): string {
	// Remove # if present
	hex = hex.replace('#', '');

	// Convert 3-digit hex to 6-digit
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	// Parse the hex values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	// Return RGB format
	return `${r}, ${g}, ${b}`;
}
