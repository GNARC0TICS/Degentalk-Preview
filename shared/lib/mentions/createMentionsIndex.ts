import type { CreateMentionsIndexParams } from './types';

/**
 * @deprecated This file now only exports types for cross-boundary compatibility.
 * For server-side mentions index operations, use:
 * server/src/domains/social/services/mentions-index.service.ts
 * 
 * For client-side operations, use API endpoints that utilize the server service.
 */

export type { CreateMentionsIndexParams };

/**
 * @deprecated This function has been moved to server-only service.
 * Use MentionsIndexService.createMentionsIndex() on the server side.
 * For client-side usage, call the appropriate API endpoint.
 */
export function createMentionsIndex(params: CreateMentionsIndexParams): Promise<number> {
	throw new Error(
		'createMentionsIndex() has been moved to server-only service. ' +
		'Use MentionsIndexService.createMentionsIndex() on server or call API endpoint from client.'
	);
}
