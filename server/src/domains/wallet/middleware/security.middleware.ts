import { userService } from '@server/src/core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { db } from '@db';
import { wallets, users } from '@schema';
import { eq, and, sql } from 'drizzle-orm';
import { walletConfigService } from '../wallet-config.service';
import type { SecurityMiddleware, RateLimitResult } from './types';
import { logger } from "../../../core/logger";

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
			res.status(401).json({ success: false, message: 'Authentication required' });
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
			res.status(429).json({
				success: false,
				message: 'Deposit rate limit exceeded',
				error: {
					type: 'RATE_LIMIT_EXCEEDED',
					resetTime: resetTime.toISOString(),
					maxAttempts: config.limits.depositsPerHour
				}
			});
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
		res.status(500).json({ success: false, message: 'Internal server error' });
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
			res.status(401).json({ success: false, message: 'Authentication required' });
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
			res.status(429).json({
				success: false,
				message: 'Transfer rate limit exceeded',
				error: {
					type: 'RATE_LIMIT_EXCEEDED',
					resetTime: resetTime.toISOString(),
					maxAttempts: config.limits.tipsPerMinute
				}
			});
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
		res.status(500).json({ success: false, message: 'Internal server error' });
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
			res.status(401).json({ success: false, message: 'Authentication required' });
			return;
		}

		// Check if withdrawals are enabled
		const config = await walletConfigService.getConfig();
		if (!config.features.allowCryptoWithdrawals) {
			res.status(403).json({
				success: false,
				message: 'Crypto withdrawals are currently disabled',
				error: { type: 'FEATURE_DISABLED' }
			});
			return;
		}

		// Get user info for additional security checks
		const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

		if (user.length === 0) {
			res.status(404).json({ success: false, message: 'User not found' });
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
			res.status(403).json({
				success: false,
				message: 'Account must be at least 24 hours old to withdraw',
				error: {
					type: 'ACCOUNT_TOO_NEW',
					accountAge: Math.floor(accountAge / (60 * 60 * 1000)), // hours
					requiredAge: 24
				}
			});
			return;
		}

		next();
	} catch (error) {
		logger.error('Error in withdrawal security check:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
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
			res.status(401).json({ success: false, message: 'Authentication required' });
			return;
		}

		// Validate amount
		if (!amount || amount <= 0) {
			res.status(400).json({
				success: false,
				message: 'Invalid transfer amount',
				error: { type: 'INVALID_AMOUNT' }
			});
			return;
		}

		// Check config limits
		const config = await walletConfigService.getConfig();
		if (amount > config.limits.maxDGTTransfer) {
			res.status(400).json({
				success: false,
				message: `Transfer amount exceeds maximum limit of ${config.limits.maxDGTTransfer} DGT`,
				error: {
					type: 'AMOUNT_EXCEEDS_LIMIT',
					maxAmount: config.limits.maxDGTTransfer
				}
			});
			return;
		}

		// Validate target user
		if (!toUserId || fromUserId === toUserId) {
			res.status(400).json({
				success: false,
				message: 'Invalid transfer recipient',
				error: { type: 'INVALID_RECIPIENT' }
			});
			return;
		}

		// Check if target user exists
		const targetUser = await db.select().from(users).where(eq(users.id, toUserId)).limit(1);

		if (targetUser.length === 0) {
			res.status(404).json({
				success: false,
				message: 'Transfer recipient not found',
				error: { type: 'RECIPIENT_NOT_FOUND' }
			});
			return;
		}

		next();
	} catch (error) {
		logger.error('Error in DGT transfer validation:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
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
			res.status(401).json({ success: false, message: 'Admin authentication required' });
			return;
		}

		// Validate amount
		if (!amount || amount <= 0) {
			res.status(400).json({
				success: false,
				message: 'Invalid operation amount',
				error: { type: 'INVALID_AMOUNT' }
			});
			return;
		}

		// Check daily credit limit for admin operations
		const config = await walletConfigService.getConfig();
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// This could be implemented with more sophisticated tracking
		// For now, we'll just check the config limit
		if (amount > config.limits.maxDailyCreditAmount) {
			res.status(400).json({
				success: false,
				message: `Operation amount exceeds daily limit of ${config.limits.maxDailyCreditAmount} DGT`,
				error: {
					type: 'DAILY_LIMIT_EXCEEDED',
					maxDailyAmount: config.limits.maxDailyCreditAmount
				}
			});
			return;
		}

		// Validate target user
		if (!targetUserId) {
			res.status(400).json({
				success: false,
				message: 'Target user ID required',
				error: { type: 'MISSING_TARGET_USER' }
			});
			return;
		}

		// Check if target user exists
		const targetUser = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);

		if (targetUser.length === 0) {
			res.status(404).json({
				success: false,
				message: 'Target user not found',
				error: { type: 'TARGET_USER_NOT_FOUND' }
			});
			return;
		}

		next();
	} catch (error) {
		logger.error('Error in admin DGT operation validation:', error);
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

export const securityMiddleware: SecurityMiddleware = {
	depositRateLimit,
	transferRateLimit,
	withdrawalSecurityCheck,
	dgtTransferValidation,
	adminDGTOperationValidation
};
