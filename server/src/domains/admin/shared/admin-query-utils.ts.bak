/**
 * Admin Query Utilities
 *
 * Shared utilities for common database query patterns across admin services
 * Reduces code duplication and ensures consistent behavior
 */

import { SQL, and, or, like, ilike, eq, ne, gte, lte, asc, desc } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';

// Common filter types
export interface SearchFilter {
	search?: string;
	searchFields?: PgColumn[];
}

export interface DateRangeFilter {
	startDate?: Date;
	endDate?: Date;
	dateField?: PgColumn;
}

export interface StatusFilter {
	status?: string | string[];
	statusField?: PgColumn;
}

export interface RoleFilter {
	role?: string | string[];
	roleField?: PgColumn;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	offset?: number;
}

export interface SortParams {
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	sortField?: PgColumn;
}

/**
 * Build search conditions for text search across multiple fields
 */
export function buildSearchConditions(filter: SearchFilter): SQL<unknown> | undefined {
	if (!filter.search || !filter.searchFields || filter.searchFields.length === 0) {
		return undefined;
	}

	const searchTerm = `%${filter.search}%`;
	const conditions = filter.searchFields.map((field) => ilike(field, searchTerm));

	return or(...conditions);
}

/**
 * Build date range conditions
 */
export function buildDateRangeConditions(filter: DateRangeFilter): SQL<unknown> | undefined {
	if (!filter.dateField) return undefined;

	const conditions: SQL<unknown>[] = [];

	if (filter.startDate) {
		conditions.push(gte(filter.dateField, filter.startDate));
	}

	if (filter.endDate) {
		conditions.push(lte(filter.dateField, filter.endDate));
	}

	return conditions.length > 0 ? and(...conditions) : undefined;
}

/**
 * Build status filter conditions
 */
export function buildStatusConditions(filter: StatusFilter): SQL<unknown> | undefined {
	if (!filter.status || !filter.statusField) return undefined;

	if (Array.isArray(filter.status)) {
		// Multiple statuses - use OR conditions
		const conditions = filter.status.map((status) => eq(filter.statusField!, status));
		return or(...conditions);
	} else {
		// Single status
		return eq(filter.statusField, filter.status);
	}
}

/**
 * Build role filter conditions
 */
export function buildRoleConditions(filter: RoleFilter): SQL<unknown> | undefined {
	if (!filter.role || !filter.roleField) return undefined;

	if (Array.isArray(filter.role)) {
		// Multiple roles
		const conditions = filter.role.map((role) => eq(filter.roleField!, role));
		return or(...conditions);
	} else {
		// Single role
		return eq(filter.roleField, filter.role);
	}
}

/**
 * Combine multiple filter conditions with AND logic
 */
export function combineFilterConditions(
	...conditions: (SQL<unknown> | undefined)[]
): SQL<unknown> | undefined {
	const validConditions = conditions.filter(Boolean) as SQL<unknown>[];
	return validConditions.length > 0 ? and(...validConditions) : undefined;
}

/**
 * Build sort conditions
 */
export function buildSortConditions(params: SortParams) {
	if (!params.sortField) return [];

	const direction = params.sortOrder === 'desc' ? desc : asc;
	return [direction(params.sortField)];
}

/**
 * Calculate pagination offset
 */
export function calculatePaginationOffset(params: PaginationParams): number {
	const page = params.page || 1;
	const limit = params.limit || 10;
	return (page - 1) * limit;
}

/**
 * Normalize pagination parameters
 */
export function normalizePaginationParams(params: PaginationParams): Required<PaginationParams> {
	const page = Math.max(1, params.page || 1);
	const limit = Math.min(100, Math.max(1, params.limit || 10));
	const offset = (page - 1) * limit;

	return { page, limit, offset };
}

/**
 * Build pagination metadata for responses
 */
export function buildPaginationMeta(
	total: number,
	params: Required<PaginationParams>
): {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
} {
	const totalPages = Math.ceil(total / params.limit);

	return {
		total,
		page: params.page,
		limit: params.limit,
		totalPages,
		hasNextPage: params.page < totalPages,
		hasPreviousPage: params.page > 1
	};
}

/**
 * Generic user search utility
 */
export function buildUserSearchConditions(
	searchTerm: string,
	usernameField: PgColumn,
	emailField?: PgColumn
): SQL<unknown> | undefined {
	if (!searchTerm || searchTerm.length < 2) return undefined;

	const conditions = [ilike(usernameField, `%${searchTerm}%`)];

	if (emailField) {
		conditions.push(ilike(emailField, `%${searchTerm}%`));
	}

	return or(...conditions);
}

/**
 * Build exclusion conditions (NOT IN)
 */
export function buildExclusionConditions<T>(
	field: PgColumn,
	excludeValues: T[]
): SQL<unknown> | undefined {
	if (!excludeValues || excludeValues.length === 0) return undefined;

	const conditions = excludeValues.map((value) => ne(field, value));
	return and(...conditions);
}

/**
 * Utility for building complex filter chains
 */
export class FilterBuilder {
	private conditions: SQL<unknown>[] = [];

	addSearch(filter: SearchFilter): this {
		const condition = buildSearchConditions(filter);
		if (condition) this.conditions.push(condition);
		return this;
	}

	addDateRange(filter: DateRangeFilter): this {
		const condition = buildDateRangeConditions(filter);
		if (condition) this.conditions.push(condition);
		return this;
	}

	addStatus(filter: StatusFilter): this {
		const condition = buildStatusConditions(filter);
		if (condition) this.conditions.push(condition);
		return this;
	}

	addRole(filter: RoleFilter): this {
		const condition = buildRoleConditions(filter);
		if (condition) this.conditions.push(condition);
		return this;
	}

	addCustom(condition: SQL<unknown> | undefined): this {
		if (condition) this.conditions.push(condition);
		return this;
	}

	build(): SQL<unknown> | undefined {
		return this.conditions.length > 0 ? and(...this.conditions) : undefined;
	}

	clear(): this {
		this.conditions = [];
		return this;
	}
}

/**
 * Common sort field mappings for admin entities
 */
export const COMMON_SORT_FIELDS = {
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	name: 'name',
	title: 'title',
	username: 'username',
	email: 'email',
	role: 'role',
	status: 'status'
} as const;

/**
 * Validate and normalize sort parameters
 */
export function validateSortParams(
	sortBy?: string,
	sortOrder?: string,
	allowedFields: string[] = Object.keys(COMMON_SORT_FIELDS)
): { sortBy: string; sortOrder: 'asc' | 'desc' } | null {
	if (!sortBy || !allowedFields.includes(sortBy)) {
		return null;
	}

	const normalizedOrder = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';

	return {
		sortBy,
		sortOrder: normalizedOrder
	};
}
