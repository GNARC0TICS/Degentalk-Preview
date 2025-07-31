/**
 * Base Repository
 *
 * QUALITY IMPROVEMENT: Repository pattern implementation for consistent data access
 * Provides common CRUD operations with proper error handling and type safety
 */
import { SQL } from 'drizzle-orm';
import type { AnyPgColumn, AnyPgTable } from 'drizzle-orm/pg-core';
import type { EntityId } from '@shared/types/ids';
export interface PaginationOptions {
    page?: number;
    limit?: number;
    offset?: number;
}
export interface SortOptions {
    column: string;
    direction: 'asc' | 'desc';
}
export interface FilterOptions {
    [key: string]: any;
}
export interface QueryOptions {
    pagination?: PaginationOptions;
    sort?: SortOptions[];
    filters?: FilterOptions;
    include?: string[];
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface RepositoryTransaction {
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
export declare class RepositoryError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly context?: Record<string, any> | undefined;
    constructor(message: string, code: string, statusCode?: number, context?: Record<string, any> | undefined);
}
export declare abstract class BaseRepository<T extends Record<string, any>> {
    protected abstract table: AnyPgTable;
    protected abstract entityName: string;
    /**
     * Find entity by ID
     */
    findById(id: EntityId): Promise<T | null>;
    /**
     * Find multiple entities with options
     */
    find(options?: QueryOptions): Promise<T[]>;
    /**
     * Find with pagination
     */
    findPaginated(options?: QueryOptions): Promise<PaginatedResult<T>>;
    /**
     * Create new entity
     */
    create(data: Partial<T>): Promise<T>;
    /**
     * Update entity by ID
     */
    update(id: EntityId, data: Partial<T>): Promise<T>;
    /**
     * Delete entity by ID
     */
    delete(id: EntityId): Promise<void>;
    /**
     * Check if entity exists
     */
    exists(id: EntityId): Promise<boolean>;
    /**
     * Count entities with filters
     */
    count(filters?: FilterOptions): Promise<number>;
    /**
     * Get ID column for the table
     */
    protected getIdColumn(): AnyPgColumn;
    /**
     * Get ID column name (can be overridden)
     */
    protected getIdColumnName(): string;
    /**
     * Get column by name
     */
    protected getColumnByName(name: string): AnyPgColumn;
    /**
     * Build filter conditions from filter options
     */
    protected buildFilterConditions(filters: FilterOptions): SQL[];
    /**
     * Build complex filter conditions
     */
    protected buildComplexCondition(column: AnyPgColumn, condition: any): SQL;
    /**
     * Prepare data for creation (can be overridden)
     */
    protected prepareCreateData(data: Partial<T>): any;
    /**
     * Prepare data for update (can be overridden)
     */
    protected prepareUpdateData(data: Partial<T>): any;
}
