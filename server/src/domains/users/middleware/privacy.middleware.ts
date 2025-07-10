/**
 * Privacy Middleware - GDPR Compliance & User Data Protection
 *
 * Ensures all user data responses are properly filtered based on
 * user permissions, privacy settings, and GDPR requirements.
 */

import type { Request, Response, NextFunction } from 'express';
import { UserTransformer } from '../transformers/user.transformer';
import type { UserId } from '@shared/types/ids';
import { logger } from '../../../core/logger';
import { getAuthenticatedUser } from '@core/utils/auth.helpers';
import { sendErrorResponse } from '@core/utils/transformer.helpers';

export interface PrivacyRequest extends Request {
	user?: {
		id: UserId;
		role: string;
		permissions?: string[];
	};
	targetUser?: {
		id: UserId;
		privacySettings?: any;
	};
}

/**
 * Middleware to automatically transform user data in API responses
 * based on requesting user's permissions and target user's privacy settings
 */
export const userPrivacyMiddleware = (req: PrivacyRequest, res: Response, next: NextFunction) => {
	const originalJson = res.json;

	res.json = function (data: any) {
		if (data && data.success && data.data) {
			const transformedData = transformUserData(
				data.data,
				getAuthenticatedUser(req),
				req.targetUser
			);

			return originalJson.call(this, {
				...data,
				data: transformedData
			});
		}

		return originalJson.call(this, data);
	};

	next();
};

/**
 * Transform user data based on privacy rules and permissions
 */
function transformUserData(data: any, requestingUser?: any, targetUser?: any): any {
	// Handle arrays of user data
	if (Array.isArray(data)) {
		return data.map((item) => transformSingleUserData(item, requestingUser, targetUser));
	}

	// Handle single user object
	if (isUserData(data)) {
		return transformSingleUserData(data, requestingUser, targetUser);
	}

	// Handle nested user data in other objects
	if (typeof data === 'object' && data !== null) {
		const transformed = { ...data };

		// Transform common user fields
		if (transformed.user) {
			transformed.user = transformSingleUserData(transformed.user, requestingUser, targetUser);
		}
		if (transformed.author) {
			transformed.author = transformSingleUserData(transformed.author, requestingUser, targetUser);
		}
		if (transformed.creator) {
			transformed.creator = transformSingleUserData(
				transformed.creator,
				requestingUser,
				targetUser
			);
		}

		return transformed;
	}

	return data;
}

/**
 * Transform a single user data object
 */
function transformSingleUserData(userData: any, requestingUser?: any, targetUser?: any): any {
	if (!userData || !isUserData(userData)) {
		return userData;
	}

	const isSelf = requestingUser && userData.id === requestingUser.id;
	const isAdmin =
		requestingUser && (requestingUser.role === 'admin' || requestingUser.role === 'owner');

	// Self-view: authenticated self data
	if (isSelf) {
		return UserTransformer.toAuthenticatedSelf(userData);
	}

	// Admin view: admin detail (if user allows or for moderation purposes)
	if (isAdmin) {
		return UserTransformer.toAdminUserDetail(userData);
	}

	// Default: public user data with privacy filtering
	return applyPrivacyFiltering(
		UserTransformer.toPublicUser(userData),
		userData.privacySettings || targetUser?.privacySettings
	);
}

/**
 * Apply user's privacy settings to public user data
 */
function applyPrivacyFiltering(publicUser: any, privacySettings?: any): any {
	if (!privacySettings) return publicUser;

	const filtered = { ...publicUser };

	// Hide online status if privacy setting disabled
	if (!privacySettings.onlineStatus) {
		filtered.isOnline = false;
	}

	// Hide last seen if privacy setting disabled
	if (!privacySettings.lastSeen) {
		delete filtered.lastSeen;
	}

	// Filter stats based on profile visibility
	if (privacySettings.profileVisibility === 'private') {
		delete filtered.stats;
		delete filtered.lastSeen;
		filtered.isOnline = false;
	}

	return filtered;
}

/**
 * Check if data object represents user data
 */
function isUserData(obj: any): boolean {
	return (
		obj &&
		typeof obj === 'object' &&
		obj.id &&
		(obj.username || obj.email) &&
		!obj.title && // Not a forum post
		!obj.content && // Not a forum post
		!obj.amount
	); // Not a transaction
}

/**
 * Middleware to anonymize IP addresses in logs and responses
 */
export const ipAnonymizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
	// Store anonymized IP for logging
	req.ip = anonymizeIP(req.ip);

	// Override IP in forwarded headers
	if (req.headers['x-forwarded-for']) {
		const ips = (req.headers['x-forwarded-for'] as string).split(',');
		req.headers['x-forwarded-for'] = ips.map((ip) => anonymizeIP(ip.trim())).join(', ');
	}

	next();
};

/**
 * Anonymize IP address for GDPR compliance
 */
function anonymizeIP(ip: string): string {
	if (!ip) return '';

	// IPv4: xxx.xxx.xxx.0
	if (ip.includes('.')) {
		const parts = ip.split('.');
		if (parts.length === 4) {
			return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
		}
	}

	// IPv6: xxxx:xxxx:xxxx:xxxx::
	if (ip.includes(':')) {
		const parts = ip.split(':');
		if (parts.length >= 4) {
			return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
		}
	}

	return '[anonymized]';
}

/**
 * Middleware to ensure GDPR consent is checked for data processing
 */
export const gdprConsentMiddleware = (req: PrivacyRequest, res: Response, next: NextFunction) => {
	// For data export or sensitive operations, check consent
	if (req.path.includes('/export') || req.path.includes('/analytics')) {
		if (!getAuthenticatedUser(req)) {
			return sendErrorResponse(res, 'Authentication required for data processing operations', 401);
		}

		// Add consent check logic here
		// This would typically check the user's current consent status
	}

	next();
};

/**
 * Audit middleware to log data access for GDPR compliance
 */
export const dataAccessAuditMiddleware = (
	req: PrivacyRequest,
	res: Response,
	next: NextFunction
) => {
	const originalJson = res.json;

	res.json = function (data: any) {
		// Log data access for audit trail
		if (getAuthenticatedUser(req) && data && data.success) {
			logDataAccess({
				userId: getAuthenticatedUser(req).id,
				action: `${req.method} ${req.path}`,
				timestamp: new Date(),
				ip: req.ip,
				userAgent: req.headers['user-agent'] || 'unknown'
			});
		}

		return originalJson.call(this, data);
	};

	next();
};

/**
 * Log data access for GDPR audit trail
 */
function logDataAccess(event: {
	userId: UserId;
	action: string;
	timestamp: Date;
	ip: string;
	userAgent: string;
}) {
	// Implementation would typically write to audit log database
	logger.info('[GDPR AUDIT]', {
		userId: event.userId,
		action: event.action,
		timestamp: event.timestamp.toISOString(),
		ip: event.ip, // Already anonymized by ipAnonymizationMiddleware
		userAgent: event.userAgent
	});
}
