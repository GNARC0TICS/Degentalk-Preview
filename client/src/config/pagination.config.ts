/**
 * Pagination Configuration
 *
 * Centralized configuration for pagination settings across the forum.
 */

export const PAGINATION_CONFIG = {
	threadsPerPage: 20,
	postsPerPage: 15,
	infiniteScrollEnabled: false
} as const;

export type PaginationConfig = typeof PAGINATION_CONFIG;
