/**
 * Thread Configuration
 *
 * Centralized configuration for thread behavior and UI preferences.
 */

export const THREAD_CONFIG = {
	replyFormBehavior: 'inline', // 'inline' | 'modal'
	defaultEditor: 'bbcode',
	enableQuotePreview: true
} as const;

export type ThreadConfig = typeof THREAD_CONFIG;
