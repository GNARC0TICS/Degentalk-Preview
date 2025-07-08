import { userService } from '@server/src/core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { db } from '@db';
import { wallets, users } from '@schema';
import { eq, and, sql } from 'drizzle-orm';
import { walletConfigService } from '../wallet-config.service';
import type { SecurityMiddleware, RateLimitResult } from './types';
import { logger } from "../../../core/logger";
import { sendErrorResponse } from '@server/src/core/utils/transformer.helpers';

/**
 * Wallet Security Middleware
 *
 * Provides rate limiting, fraud detection, and security controls for wallet operations.
 */

// In-memory rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for a specific operation
 */
const checkRateLimit = async (
	userId: string,
	operation: string,
	maxAttempts: number,
	windowMinutes: number
): Promise<RateLimitResult> => {
	const key = `${userId}:${operation}`;
	const now = Date.now();
	const windowMs = windowMinutes * 60 * 1000;

	let record = rateLimitStore.get(key);

	if (!record || now > record.resetTime) {
		// Create new record or reset expired one
		record = {
			count: 0,
			resetTime: now + windowMs
		};
	}

	if (record.count >= maxAttempts) {
		return {
			allowed: false,
			remaining: 0,
			resetTime: record.resetTime
		};
	}

	record.count++;
	rateLimitStore.set(key, record);

	return {
		allowed: true,
		remaining: maxAttempts - record.count,
		resetTime: record.resetTime
	};
};

/**
 * Rate limiting for deposits
 */
const depositRateLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			sendErrorResponse(res, 'Authentication required', 401);
			return;
		}

		const config = await walletConfigService.getConfig();
		const rateCheck = await checkRateLimit(
			userId,
			'deposit',
			config.limits.depositsPerHour,
			60 // 1 hour window
		);

		if (!rateCheck.allowed) {
			const resetTime = new Date(rateCheck.resetTime);
			sendErrorResponse(res, 'Deposit rate limit exceeded', 429);
			return;
		}

		// Add rate limit headers
		res.set({
			'X-RateLimit-Limit': config.limits.depositsPerHour.toString(),
			'X-RateLimit-Remaining': rateCheck.remaining.toString(),
			'X-RateLimit-Reset': rateCheck.resetTime.toString()
		});

		next();
	} catch (error) {
		logger.error('Error in deposit rate limit middleware:', error);
		sendErrorResponse(res, 'Internal server error', 500);
	}
};

/**
 * Rate limiting for transfers/tips
 */
const transferRateLimit = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			sendErrorResponse(res, 'Authentication required', 401);
			return;
		}

		const config = await walletConfigService.getConfig();
		const rateCheck = await checkRateLimit(
			userId,
			'transfer',
			config.limits.tipsPerMinute,
			1 // 1 minute window
		);

		if (!rateCheck.allowed) {
			const resetTime = new Date(rateCheck.resetTime);
			sendErrorResponse(res, 'Transfer rate limit exceeded', 429);
			return;
		}

		// Add rate limit headers
		res.set({
			'X-RateLimit-Limit': config.limits.tipsPerMinute.toString(),
			'X-RateLimit-Remaining': rateCheck.remaining.toString(),
			'X-RateLimit-Reset': rateCheck.resetTime.toString()
		});

		next();
	} catch (error) {
		logger.error('Error in transfer rate limit middleware:', error);
		sendErrorResponse(res, 'Internal server error', 500);
	}
};

/**
 * Security checks for withdrawals
 */
const withdrawalSecurityCheck = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			sendErrorResponse(res, 'Authentication required', 401);
			return;
		}

		// Check if withdrawals are enabled
		const config = await walletConfigService.getConfig();
		if (!config.features.allowCryptoWithdrawals) {
			sendErrorResponse(res, 'Crypto withdrawals are currently disabled', 403);
			return;
		}

		// Get user info for additional security checks
		const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

		if (user.length === 0) {
			sendErrorResponse(res, 'User not found', 404);
			return;
		}

		const userData = user[0];

		// Additional security checks can be added here:
		// - Account age verification
		// - Email verification status
		// - Two-factor authentication status
		// - Suspicious activity detection

		// Example: Check if account is less than 24 hours old
		const accountAge = Date.now() - new Date(userData.createdAt).getTime();
		const minAccountAge = 24 * 60 * 60 * 1000; // 24 hours

		if (accountAge < minAccountAge) {
			sendErrorResponse(res, 'Account must be at least 24 hours old to withdraw', 403);
			return;
		}

		next();
	} catch (error) {
		logger.error('Error in withdrawal security check:', error);
		sendErrorResponse(res, 'Internal server error', 500);
	}
};

/**
 * Validate DGT transfer amounts and limits
 */
const dgtTransferValidation = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { amount, toUserId } = req.body;
		const fromUserId = userService.getUserFromRequest(req)?.id;

		if (!fromUserId) {
			sendErrorResponse(res, 'Authentication required', 401);
			return;
		}

		// Validate amount
		if (!amount || amount <= 0) {
			sendErrorResponse(res, 'Invalid transfer amount', 400);
			return;
		}

		// Check config limits
		const config = await walletConfigService.getConfig();
		if (amount > config.limits.maxDGTTransfer) {
			sendErrorResponse(res, `Transfer amount exceeds maximum limit of ${config.limits.maxDGTTransfer} DGT`, 400);
			return;
		}

		// Validate target user
		if (!toUserId || fromUserId === toUserId) {
			sendErrorResponse(res, 'Invalid transfer recipient', 400);
			return;
		}

		// Check if target user exists
		const targetUser = await db.select().from(users).where(eq(users.id, toUserId)).limit(1);

		if (targetUser.length === 0) {
			sendErrorResponse(res, 'Transfer recipient not found', 404);
			return;
		}

		next();
	} catch (error) {
		logger.error('Error in DGT transfer validation:', error);
		sendErrorResponse(res, 'Internal server error', 500);
	}
};

/**
 * Validate admin DGT operations (credit/debit)
 */
const adminDGTOperationValidation = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { userId: targetUserId, amount } = req.body;
		const adminUserId = userService.getUserFromRequest(req)?.id;

		if (!adminUserId) {
			sendErrorResponse(res, 'Admin authentication required', 401);
			return;
		}

		// Validate amount
		if (!amount || amount <= 0) {
			sendErrorResponse(res, 'Invalid operation amount', 400);
			return;
		}

		// Check daily credit limit for admin operations
		const config = await walletConfigService.getConfig();
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// This could be implemented with more sophisticated tracking
		// For now, we'll just check the config limit
		if (amount > config.limits.maxDailyCreditAmount) {
			sendErrorResponse(res, `Operation amount exceeds daily limit of ${config.limits.maxDailyCreditAmount} DGT`, 400);
			return;
		}

		// Validate target user
		if (!targetUserId) {
			sendErrorResponse(res, 'Target user ID required', 400);
			return;
		}

		// Check if target user exists
		const targetUser = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);

		if (targetUser.length === 0) {
			sendErrorResponse(res, 'Target user not found', 404);
			return;
		}

		next();
	} catch (error) {
		logger.error('Error in admin DGT operation validation:', error);
		sendErrorResponse(res, 'Internal server error', 500);
	}
};

export const securityMiddleware: SecurityMiddleware = {
	depositRateLimit,
	transferRateLimit,
	withdrawalSecurityCheck,
	dgtTransferValidation,
	adminDGTOperationValidation
};
