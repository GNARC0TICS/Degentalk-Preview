/**
 * Admin Shared Utilities - Barrel Export
 *
 * Centralized exports for all shared admin utilities
 * Provides clean imports and discoverability across admin services
 */

// Query utilities
export * from './admin-query-utils';

// Operation utilities
export * from './admin-operation-utils';

// Error boundaries and typed error handling
export * from './admin-error-boundaries';

// Response utilities (already created in Phase 1)
export * from '../admin.response';

// Validation utilities (already created in Phase 1)
export * from '../admin.validation';

/**
 * Usage Examples:
 *
 * // Query utilities
 * import { FilterBuilder, buildSearchConditions } from '@/domains/admin/shared';
 *
 * // Operation utilities
 * import { validateRoleAssignment, USER_ROLES } from '@/domains/admin/shared';
 *
 * // Error boundaries
 * import { AdminOperationBoundary, AdminErrorFactory } from '@/domains/admin/shared';
 *
 * // Response formatting
 * import { sendSuccess, sendError } from '@/domains/admin/shared';
 */

/**
 * Admin Service Architecture Overview
 *
 * This shared utilities layer provides:
 *
 * 1. **Query Utilities**: Consistent database query patterns
 *    - Search, filtering, pagination, sorting
 *    - Type-safe query builders
 *    - Common filter combinations
 *
 * 2. **Operation Utilities**: Business logic helpers
 *    - Role validation and hierarchy
 *    - Audit logging
 *    - Rate limiting
 *    - Batch operations
 *
 * 3. **Error Boundaries**: Structured error handling
 *    - Typed error categories
 *    - Retry mechanisms
 *    - User-friendly error messages
 *    - Operation context tracking
 *
 * 4. **Response/Validation**: API consistency
 *    - Standardized response formats
 *    - Request validation helpers
 *    - Type-safe parameter handling
 *
 * Benefits:
 * - Reduced code duplication across admin services
 * - Consistent behavior and patterns
 * - Better error handling and debugging
 * - Easier testing and maintenance
 * - Type safety throughout the admin layer
 */
