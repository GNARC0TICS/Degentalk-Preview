/**
 * Route ID Validation Middleware
 * 
 * This middleware automatically validates all route parameters that appear to be IDs
 * based on common naming patterns. It runs before controllers, providing a security
 * layer that prevents invalid IDs from reaching business logic.
 * 
 * Security benefits:
 * - Prevents SQL injection via malformed UUIDs
 * - Stops invalid IDs early in request lifecycle  
 * - Provides consistent validation across all routes
 * - Detailed logging for security monitoring
 */

import type { Request, Response, NextFunction } from 'express';
import { isValidId } from '@shared/utils/id';
import { logger } from '@core/logger';
import { sendErrorResponse } from '@core/utils/transformer.helpers';
import { securityMonitor } from '@core/security/security-monitor.service';

// ID parameter patterns to validate
const ID_PARAM_PATTERNS = [
	/^(id|Id|ID)$/,
	/^(.*)(Id|ID)$/,  // matches userId, forumId, threadId, etc.
	/^(.*?)_(id|Id|ID)$/,  // matches user_id, forum_id, etc.
];

// Known ID types for better error messages
const ID_TYPE_MAP: Record<string, string> = {
	'id': 'resource',
	'userId': 'user',
	'forumId': 'forum', 
	'threadId': 'thread',
	'postId': 'post',
	'categoryId': 'category',
	'tagId': 'tag',
	'itemId': 'item',
	'frameId': 'frame',
	'badgeId': 'badge',
	'walletId': 'wallet',
	'transactionId': 'transaction',
	'orderId': 'order',
	'productId': 'product',
	'entityId': 'entity',
	'messageId': 'message',
	'conversationId': 'conversation',
	'reportId': 'report',
	'announcementId': 'announcement',
	'levelId': 'level',
	'missionId': 'mission',
	'achievementId': 'achievement'
};

/**
 * Determines if a parameter name looks like an ID field
 */
function isIdParameter(paramName: string): boolean {
	return ID_PARAM_PATTERNS.some(pattern => pattern.test(paramName));
}

/**
 * Gets human-readable resource type from parameter name
 */
function getResourceType(paramName: string): string {
	return ID_TYPE_MAP[paramName] || 'resource';
}

/**
 * Validates all ID-like parameters in the request
 */
export function validateRouteIds(req: Request, res: Response, next: NextFunction): void {
	const routeParams = req.params;
	const invalidParams: string[] = [];
	
	// Check each route parameter
	for (const [paramName, paramValue] of Object.entries(routeParams)) {
		if (isIdParameter(paramName) && paramValue) {
			// Validate the ID format
			if (!isValidId(paramValue)) {
				invalidParams.push(paramName);
				
				// Enhanced security logging
				const resourceType = getResourceType(paramName);
				securityMonitor.logInvalidIdAttempt(req, paramName, paramValue, resourceType);
			}
		}
	}
	
	// If any invalid IDs found, reject the request
	if (invalidParams.length > 0) {
		const paramName = invalidParams[0];
		const resourceType = getResourceType(paramName);
		
		// Track validation failure metrics
		logger.error({
			msg: 'Route ID validation failed',
			invalidParams,
			route: req.originalUrl,
			method: req.method,
			userId: (req as any).user?.id,
			timestamp: new Date().toISOString()
		});
		
		return sendErrorResponse(
			res, 
			`Invalid ${resourceType} ID format. IDs must be valid UUIDs.`,
			400
		);
	}
	
	// Also validate query parameters that look like IDs
	validateQueryIds(req);
	
	next();
}

/**
 * Validates ID-like parameters in query string
 */
function validateQueryIds(req: Request): void {
	const query = req.query;
	
	for (const [paramName, paramValue] of Object.entries(query)) {
		if (isIdParameter(paramName) && paramValue && typeof paramValue === 'string') {
			if (!isValidId(paramValue)) {
				logger.warn({
					msg: 'Invalid ID in query parameter',
					paramName,
					route: req.route?.path,
					method: req.method
				});
			}
		}
	}
}

/**
 * Strict validation middleware for high-security routes
 * This version validates ALL parameters that look like UUIDs
 */
export function validateRouteIdsStrict(req: Request, res: Response, next: NextFunction): void {
	const allParams = { ...req.params, ...req.query, ...req.body };
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	
	for (const [key, value] of Object.entries(allParams)) {
		if (typeof value === 'string' && value.match(uuidRegex)) {
			if (!isValidId(value)) {
				logger.error({
					msg: 'Malformed UUID detected in request',
					parameter: key,
					route: req.originalUrl,
					method: req.method
				});
				
				return sendErrorResponse(res, 'Invalid request data', 400);
			}
		}
	}
	
	next();
}

/**
 * Development mode middleware that logs all IDs for debugging
 */
export function logRouteIds(req: Request, res: Response, next: NextFunction): void {
	if (process.env.NODE_ENV === 'development') {
		const idParams: Record<string, any> = {};
		
		for (const [paramName, paramValue] of Object.entries(req.params)) {
			if (isIdParameter(paramName)) {
				idParams[paramName] = {
					value: paramValue,
					valid: isValidId(paramValue)
				};
			}
		}
		
		if (Object.keys(idParams).length > 0) {
			logger.debug({
				msg: 'Route IDs detected',
				route: req.originalUrl,
				idParams
			});
		}
	}
	
	next();
}