/**
 * Admin Operation Utilities
 *
 * Shared utilities for common admin operations and business logic
 * Reduces code duplication across admin services
 */

import { logger } from '@core/logger';
import { AdminError, AdminErrorCodes } from '../admin.errors';
import type { AdminId, EntityId } from '@shared/types/ids';

// Common role definitions
export const USER_ROLES = {
	USER: 'user',
	MODERATOR: 'mod',
	ADMIN: 'admin'
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
	[USER_ROLES.USER]: 1,
	[USER_ROLES.MODERATOR]: 2,
	[USER_ROLES.ADMIN]: 3
} as const;

/**
 * Check if a role has sufficient permissions compared to another role
 */
export function hasRolePermission(userRole: string, requiredRole: string): boolean {
	const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
	const requiredLevel = ROLE_HIERARCHY[requiredRole as UserRole] || 0;
	return userLevel >= requiredLevel;
}

/**
 * Get all roles that are equal or lower than the given role
 */
export function getManageableRoles(userRole: string): string[] {
	const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;

	return Object.entries(ROLE_HIERARCHY)
		.filter(([, level]) => level <= userLevel)
		.map(([role]) => role);
}

/**
 * Validate role assignment permission
 */
export function validateRoleAssignment(
	assignerRole: string,
	targetRole: string,
	newRole: string
): void {
	// Can't assign role higher than your own
	if (!hasRolePermission(assignerRole, newRole)) {
		throw new AdminError(
			`Insufficient permissions to assign role: ${newRole}`,
			403,
			AdminErrorCodes.FORBIDDEN
		);
	}

	// Can't modify someone with equal or higher role (unless you're admin)
	if (assignerRole !== USER_ROLES.ADMIN && !hasRolePermission(assignerRole, targetRole)) {
		throw new AdminError(
			'Cannot modify user with equal or higher role',
			403,
			AdminErrorCodes.FORBIDDEN
		);
	}
}

/**
 * Format user display name consistently
 */
export function formatUserDisplayName(
	username: string,
	role?: string,
	showRole: boolean = false
): string {
	if (!showRole || !role) return username;

	const roleIndicator =
		role === USER_ROLES.ADMIN ? ' 👑' : role === USER_ROLES.MODERATOR ? ' 🛡️' : '';

	return `${username}${roleIndicator}`;
}

/**
 * Generate audit log entry for admin actions
 */
export function createAuditLogEntry(
	action: string,
	entityType: string,
	entityId: string,
	adminId: AdminId,
	details?: Record<string, any>
): {
	action: string;
	entityType: string;
	entityId: string;
	adminId: AdminId;
	details: string;
	timestamp: Date;
} {
	return {
		action: action.toUpperCase(),
		entityType: entityType.toLowerCase(),
		entityId: String(entityId),
		adminId,
		details: JSON.stringify(details || {}),
		timestamp: new Date()
	};
}

/**
 * Sanitize sensitive data for logging
 */
export function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
	const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'apiKey'];
	const sanitized = { ...data };

	for (const field of sensitiveFields) {
		if (field in sanitized) {
			sanitized[field] = '[REDACTED]';
		}
	}

	return sanitized;
}

/**
 * Format entity changes for audit logs
 */
export function formatEntityChanges(
	before: Record<string, any>,
	after: Record<string, any>
): Record<string, { before: any; after: any }> {
	const changes: Record<string, { before: any; after: any }> = {};

	// Check for changed fields
	for (const [key, newValue] of Object.entries(after)) {
		if (before[key] !== newValue) {
			changes[key] = {
				before: before[key],
				after: newValue
			};
		}
	}

	return changes;
}

/**
 * Validate admin operation permissions
 */
export function validateAdminOperation(
	operation: string,
	userRole: string,
	resourceType: string,
	targetRole?: string
): void {
	// Define operation permissions
	const operationPermissions = {
		CREATE_USER: USER_ROLES.ADMIN,
		DELETE_USER: USER_ROLES.ADMIN,
		BAN_USER: USER_ROLES.MODERATOR,
		UNBAN_USER: USER_ROLES.MODERATOR,
		CHANGE_ROLE: USER_ROLES.ADMIN,
		UPDATE_SETTINGS: USER_ROLES.ADMIN,
		DELETE_CONTENT: USER_ROLES.MODERATOR,
		VIEW_REPORTS: USER_ROLES.MODERATOR,
		MANAGE_ECONOMY: USER_ROLES.ADMIN
	};

	const requiredRole = operationPermissions[operation as keyof typeof operationPermissions];

	if (!requiredRole) {
		logger.warn('AdminOperationUtils', 'Unknown operation attempted', { operation, userRole });
		return; // Allow unknown operations (defensive programming)
	}

	if (!hasRolePermission(userRole, requiredRole)) {
		throw new AdminError(
			`Insufficient permissions for operation: ${operation}`,
			403,
			AdminErrorCodes.FORBIDDEN
		);
	}

	// Additional check for role-related operations
	if (operation.includes('ROLE') && targetRole) {
		validateRoleAssignment(userRole, targetRole, targetRole);
	}
}

/**
 * Generate secure random token for admin operations
 */
export function generateSecureToken(length: number = 32): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';

	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return result;
}

/**
 * Normalize and validate admin entity IDs
 */
export function validateEntityId(id: any, entityType: string): number {
	const numId = id;

	if (isNaN(numId) || !isFinite(numId) || numId <= 0) {
		throw new AdminError(
			`Invalid ${entityType} ID: must be a positive number`,
			400,
			AdminErrorCodes.INVALID_REQUEST
		);
	}

	return numId;
}

/**
 * Format admin response with consistent metadata
 */
export function formatAdminResponse<T>(
	data: T,
	operation: string,
	entityType?: string,
	metadata?: Record<string, any>
): {
	success: true;
	data: T;
	operation: string;
	entityType?: string;
	timestamp: string;
	metadata?: Record<string, any>;
} {
	return {
		success: true,
		data,
		operation,
		...(entityType && { entityType }),
		timestamp: new Date().toISOString(),
		...(metadata && { metadata })
	};
}

/**
 * Rate limiting utilities for admin operations
 */
export class AdminRateLimiter {
	private attempts: Map<string, { count: number; resetTime: number }> = new Map();
	private readonly maxAttempts: number;
	private readonly windowMs: number;

	constructor(maxAttempts: number = 10, windowMs: number = 60000) {
		this.maxAttempts = maxAttempts;
		this.windowMs = windowMs;
	}

	isAllowed(key: string): boolean {
		const now = Date.now();
		const record = this.attempts.get(key);

		if (!record || now > record.resetTime) {
			// Reset or create new record
			this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
			return true;
		}

		if (record.count >= this.maxAttempts) {
			return false;
		}

		record.count++;
		return true;
	}

	getRemainingAttempts(key: string): number {
		const record = this.attempts.get(key);
		if (!record || Date.now() > record.resetTime) {
			return this.maxAttempts;
		}
		return Math.max(0, this.maxAttempts - record.count);
	}

	reset(key: string): void {
		this.attempts.delete(key);
	}
}

/**
 * Batch operation utilities
 */
export class BatchOperationManager {
	private batchSize: number;
	private delayMs: number;

	constructor(batchSize: number = 50, delayMs: number = 100) {
		this.batchSize = batchSize;
		this.delayMs = delayMs;
	}

	async processBatch<T, R>(
		items: T[],
		processor: (batch: T[]) => Promise<R[]>,
		onProgress?: (processed: number, total: number) => void
	): Promise<R[]> {
		const results: R[] = [];

		for (let i = 0; i < items.length; i += this.batchSize) {
			const batch = items.slice(i, i + this.batchSize);
			const batchResults = await processor(batch);
			results.push(...batchResults);

			if (onProgress) {
				onProgress(i + batch.length, items.length);
			}

			// Add delay between batches to prevent overwhelming the system
			if (i + this.batchSize < items.length && this.delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, this.delayMs));
			}
		}

		return results;
	}
}

/**
 * Common status definitions for admin entities
 */
export const ENTITY_STATUS = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	PENDING: 'pending',
	SUSPENDED: 'suspended',
	DELETED: 'deleted'
} as const;

export type EntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS];

/**
 * Validate entity status transitions
 */
export function validateStatusTransition(
	currentStatus: string,
	newStatus: string,
	entityType: string
): void {
	// Define allowed transitions
	const allowedTransitions: Record<string, string[]> = {
		[ENTITY_STATUS.ACTIVE]: [
			ENTITY_STATUS.INACTIVE,
			ENTITY_STATUS.SUSPENDED,
			ENTITY_STATUS.DELETED
		],
		[ENTITY_STATUS.INACTIVE]: [ENTITY_STATUS.ACTIVE, ENTITY_STATUS.DELETED],
		[ENTITY_STATUS.PENDING]: [ENTITY_STATUS.ACTIVE, ENTITY_STATUS.DELETED],
		[ENTITY_STATUS.SUSPENDED]: [ENTITY_STATUS.ACTIVE, ENTITY_STATUS.DELETED],
		[ENTITY_STATUS.DELETED]: [] // Can't transition from deleted
	};

	const allowed = allowedTransitions[currentStatus] || [];

	if (!allowed.includes(newStatus)) {
		throw new AdminError(
			`Invalid status transition for ${entityType}: ${currentStatus} → ${newStatus}`,
			400,
			AdminErrorCodes.INVALID_REQUEST
		);
	}
}

export const adminCreateAuditLogEntry = createAuditLogEntry;
