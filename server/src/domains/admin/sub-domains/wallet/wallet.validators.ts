import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Admin Wallet Validators
 *
 * Request validation middleware for admin wallet operations.
 */

// Wallet Configuration Schema
const walletConfigSchema = z.object({
	config: z.object({
		ccpayment: z.object({
			autoSwapEnabled: z.boolean(),
			autoWithdrawEnabled: z.boolean(),
			testNetworkEnabled: z.boolean(),
			rateLockEnabled: z.boolean()
		}),
		features: z.object({
			allowCryptoWithdrawals: z.boolean(),
			allowCryptoSwaps: z.boolean(),
			allowDGTSpending: z.boolean(),
			allowInternalTransfers: z.boolean(),
			allowManualCredits: z.boolean()
		}),
		dgt: z.object({
			usdPrice: z.number().min(0.001).max(100),
			usdToDGTRate: z.number().min(0.1).max(10000),
			minDepositUSD: z.number().min(0.01).max(1000),
			maxDGTBalance: z.number().min(1000).max(100000000)
		}),
		limits: z.object({
			depositsPerHour: z.number().min(1).max(1000),
			tipsPerMinute: z.number().min(1).max(100),
			maxDGTTransfer: z.number().min(1).max(1000000),
			maxDailyCreditAmount: z.number().min(100).max(1000000)
		})
	})
});

// DGT Transaction Schema
const dgtTransactionSchema = z.object({
	userId: z.string().uuid('Invalid user ID format'),
	amount: z.number().min(0.01, 'Amount must be at least 0.01').max(1000000, 'Amount too large'),
	reason: z.string().max(500, 'Reason too long').optional()
});

// User ID Schema
const userIdSchema = z.object({
	userId: z.string().uuid('Invalid user ID format')
});

/**
 * Validate wallet configuration update request
 */
export const validateWalletConfig = (req: Request, res: Response, next: NextFunction): void => {
	try {
		walletConfigSchema.parse(req.body);
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({
				success: false,
				message: 'Invalid wallet configuration',
				errors: error.errors.map((e) => ({
					field: e.path.join('.'),
					message: e.message
				}))
			});
		} else {
			res.status(400).json({
				success: false,
				message: 'Invalid request format'
			});
		}
	}
};

/**
 * Validate DGT transaction request (credit/debit)
 */
export const validateDGTTransaction = (req: Request, res: Response, next: NextFunction): void => {
	try {
		dgtTransactionSchema.parse(req.body);
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({
				success: false,
				message: 'Invalid DGT transaction request',
				errors: error.errors.map((e) => ({
					field: e.path.join('.'),
					message: e.message
				}))
			});
		} else {
			res.status(400).json({
				success: false,
				message: 'Invalid request format'
			});
		}
	}
};

/**
 * Validate user ID parameter
 */
export const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
	try {
		userIdSchema.parse(req.params);
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({
				success: false,
				message: 'Invalid user ID format',
				errors: error.errors.map((e) => ({
					field: e.path.join('.'),
					message: e.message
				}))
			});
		} else {
			res.status(400).json({
				success: false,
				message: 'Invalid request format'
			});
		}
	}
};
