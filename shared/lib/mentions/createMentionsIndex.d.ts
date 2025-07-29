import type { CreateMentionsIndexParams } from './types.js';
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
export declare function createMentionsIndex(params: CreateMentionsIndexParams): Promise<number>;
//# sourceMappingURL=createMentionsIndex.d.ts.map