import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { logger } from '@app/lib/logger';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatNumber(value: number | string, locale: string = 'en-US'): string {
	const num = typeof value === 'string' ? Number(value) : value;
	if (Number.isNaN(num)) return String(value);
	return new Intl.NumberFormat(locale).format(num);
}

export function formatCurrency(
	value: number | string,
	currency: string = 'USD',
	locale: string = 'en-US'
): string {
	const num = typeof value === 'string' ? Number(value) : value;
	if (Number.isNaN(num)) return String(value);
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		maximumFractionDigits: 2
	}).format(num);
}

export function formatRelativeTime(date: Date | string | number): string {
	const target = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
	const diffMs = Date.now() - target.getTime();
	const diffSec = Math.round(diffMs / 1000);
	const intervals: [number, Intl.RelativeTimeFormatUnit][] = [
		[60, 'second'],
		[60, 'minute'],
		[24, 'hour'],
		[7, 'day'],
		[4.34524, 'week'],
		[12, 'month'],
		[Number.POSITIVE_INFINITY, 'year']
	];
	let unit: Intl.RelativeTimeFormatUnit = 'second';
	let value = diffSec;
	for (const [amount, nextUnit] of intervals) {
		if (Math.abs(value) < amount) {
			break;
		}
		value = Math.round(value / amount);
		unit = nextUnit;
	}
	const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	return rtf.format(-value, unit);
}

export function getInitials(name: string): string {
	if (!name) return '';
	const parts = name.trim().split(/\s+/);
	const initials = parts
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');
	return initials;
}

// Helper function to determine if a color is light
export function isLightColor(color: string): boolean {
	// Default for undefined or invalid colors
	if (!color || typeof color !== 'string') return false;

	// Convert hex to RGB
	let r, g, b;

	if (color.startsWith('#')) {
		const hex = color.slice(1);
		// Handle both 3-char and 6-char hex
		if (hex.length === 3) {
			r = parseInt(hex[0] + hex[0], 16);
			g = parseInt(hex[1] + hex[1], 16);
			b = parseInt(hex[2] + hex[2], 16);
		} else if (hex.length === 6) {
			r = parseInt(hex.slice(0, 2), 16);
			g = parseInt(hex.slice(2, 4), 16);
			b = parseInt(hex.slice(4, 6), 16);
		} else {
			return false; // Invalid hex
		}
	} else {
		// Basic support for rgb/rgba - could be expanded
		const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
		if (match) {
			r = parseInt(match[1]);
			g = parseInt(match[2]);
			b = parseInt(match[3]);
		} else {
			return false; // Unsupported color format
		}
	}

	// Calculate perceived brightness
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;

	// Consider colors with brightness > 155 as light
	return brightness > 155;
}

// Format date nicely
export function formatDate(dateString: string): string {
	if (!dateString) return '—';

	try {
		const date = new Date(dateString);
		// Check if date is valid
		if (isNaN(date.getTime())) {
			return 'Invalid Date';
		}
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	} catch (e) {
		logger.error('Utils', 'Error formatting date:', { data: [dateString, e] });
		return 'Invalid Date';
	}
}
