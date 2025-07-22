/**
 * Forum-specific formatting utilities
 * 
 * Formatting functions optimized for forum display patterns
 */

import { formatDate } from '../format-date';

/**
 * Formats a date for forum posts and threads (relative format)
 * 
 * @param date - The date to format
 * @returns A user-friendly formatted date
 */
export function formatForumDate(date: string | Date) {
	return formatDate(date, { relative: true });
}

/**
 * Formats a timestamp specifically for the forum thread UI
 * 
 * @param date - The date to format
 * @returns A more detailed formatted date with time
 */
export function formatThreadTimestamp(date: string | Date) {
	return formatDate(date, { includeTime: true });
}

/**
 * Formats thread view counts with abbreviations
 */
export function formatThreadViews(count: number): string {
	if (count >= 1000000) {
		return `${(count / 1000000).toFixed(1)}M views`;
	}
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K views`;
	}
	return `${count} views`;
}

/**
 * Formats post counts for forums
 */
export function formatPostCount(count: number): string {
	if (count >= 1000000) {
		return `${(count / 1000000).toFixed(1)}M posts`;
	}
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K posts`;
	}
	return `${count} ${count === 1 ? 'post' : 'posts'}`;
}

/**
 * Formats thread counts for forums
 */
export function formatThreadCount(count: number): string {
	if (count >= 1000000) {
		return `${(count / 1000000).toFixed(1)}M threads`;
	}
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K threads`;
	}
	return `${count} ${count === 1 ? 'thread' : 'threads'}`;
}