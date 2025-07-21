/**
 * Pagination Types for Wallet Domain
 */

import type { DgtTransaction } from '@shared/types/wallet';

/**
 * Paginated result with items and metadata
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}