import type { VisibilityStatus, ApplyModerationActionParams } from './types.js';

/**
 * @deprecated This file now only exports types for cross-boundary compatibility.
 * For server-side moderation action operations, use:
 * server/src/domains/admin/services/moderation-action.service.ts
 * 
 * For client-side operations, use API endpoints that utilize the server service.
 */

export type { VisibilityStatus, ApplyModerationActionParams };

/**
 * @deprecated This function has been moved to server-only service.
 * Use ModerationActionService.applyModerationAction() on the server side.
 * For client-side usage, call the appropriate API endpoint.
 */
export function applyModerationAction(_params: ApplyModerationActionParams): Promise<void> {
	throw new Error(
		'applyModerationAction() has been moved to server-only service. ' +
		'Use ModerationActionService.applyModerationAction() on server or call API endpoint from client.'
	);
}
