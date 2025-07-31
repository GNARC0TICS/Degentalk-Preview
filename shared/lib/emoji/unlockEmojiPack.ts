import type { UnlockEmojiPackParams, UnlockEmojiPackResult } from './types.js';

/**
 * @deprecated This file now only exports types for cross-boundary compatibility.
 * For server-side emoji pack unlocking operations, use:
 * server/src/domains/shop/services/emoji-pack-unlock.service.ts
 * 
 * For client-side operations, use API endpoints that utilize the server service.
 */

export type { UnlockEmojiPackParams, UnlockEmojiPackResult };

/**
 * @deprecated This function has been moved to server-only service.
 * Use EmojiPackUnlockService.unlockEmojiPackForUser() on the server side.
 * For client-side usage, call the appropriate API endpoint.
 */
export function unlockEmojiPackForUser(_params: UnlockEmojiPackParams): Promise<UnlockEmojiPackResult> {
	throw new Error(
		'unlockEmojiPackForUser() has been moved to server-only service. ' +
		'Use EmojiPackUnlockService.unlockEmojiPackForUser() on server or call API endpoint from client.'
	);
}
