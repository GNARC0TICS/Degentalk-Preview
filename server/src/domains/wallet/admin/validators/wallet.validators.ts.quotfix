import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendErrorResponse } from "@core/utils/transformer.helpers";

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
			sendErrorResponse(res, 'Invalid wallet configuration', 400);
		} else {
			sendErrorResponse(res, 'Invalid request format', 400);
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
			sendErrorResponse(res, 'Invalid DGT transaction request', 400);
		} else {
			sendErrorResponse(res, 'Invalid request format', 400);
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
			sendErrorResponse(res, 'Invalid user ID format', 400);
		} else {
			sendErrorResponse(res, 'Invalid request format', 400);
		}
	}
};
