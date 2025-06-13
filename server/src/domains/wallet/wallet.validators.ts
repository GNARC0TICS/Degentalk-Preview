/**
 * Wallet Validators
 *
 * [REFAC-WALLET]
 *
 * This file contains request validation middleware for wallet routes.
 * It ensures that incoming requests have the correct data structure
 * before being processed by controller methods.
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../core/errors';

/**
 * Middleware to validate cryptocurrency amounts in requests
 * @param minAmount Minimum allowed amount (default: 0)
 * @param maxAmount Maximum allowed amount (optional)
 */
export function validateAmountMiddleware(minAmount: number = 0, maxAmount?: number) {
	return (req: Request, res: Response, next: NextFunction) => {
		const amount =
			parseFloat(req.body.amount) || parseFloat(req.body.value) || parseFloat(req.params.amount);

		if (isNaN(amount)) {
			return res.status(400).json({
				error: 'Invalid amount',
				details: 'Amount must be a valid number.'
			});
		}

		if (amount < minAmount) {
			return res.status(400).json({
				error: `Amount too small`,
				details: `Minimum amount is ${minAmount}.`
			});
		}

		if (maxAmount !== undefined && amount > maxAmount) {
			return res.status(400).json({
				error: `Amount too large`,
				details: `Maximum amount is ${maxAmount}.`
			});
		}

		// Amount is valid, proceed to the next middleware/handler
		next();
	};
}

// Validate transfer DGT request
export const transferDgtSchema = z.object({
	toUserId: z.number().int().positive(),
	amount: z
		.number()
		.or(z.string())
		.refine(
			(val) => {
				const num = typeof val === 'string' ? Number(val) : val;
				return num > 0;
			},
			{
				message: 'Amount must be a positive number'
			}
		),
	reason: z.string().optional()
});

// Validate create deposit address request
export const depositAddressSchema = z.object({
	currency: z.string().min(1).max(10)
});

// Validate DGT purchase request
export const dgtPurchaseSchema = z.object({
	dgtAmount: z
		.number()
		.or(z.string())
		.refine(
			(val) => {
				const num = typeof val === 'string' ? Number(val) : val;
				return num > 0;
			},
			{
				message: 'DGT amount must be a positive number'
			}
		),
	cryptoCurrency: z.string().min(1).max(10)
});

// Validate withdrawal request
export const withdrawalSchema = z.object({
	amount: z.number().positive(),
	currency: z.string().min(1).max(10),
	address: z.string().min(10) // Keeping address generic for now, might be non-Tron
});

/**
 * Generic validation middleware creator
 */
const validateSchema = (schema: z.ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const formattedErrors = error.errors.map((err) => ({
					path: err.path.join('.'),
					message: err.message
				}));

				throw new WalletError('Validation error', 400, WalletErrorCodes.VALIDATION_ERROR, {
					errors: formattedErrors
				});
			}
			next(error);
		}
	};
};

// Export validation middleware
export const validateTransferDgt = validateSchema(transferDgtSchema);
export const validateCreateDepositAddress = validateSchema(depositAddressSchema);
export const validateDgtPurchase = validateSchema(dgtPurchaseSchema);
export const validateWithdrawal = validateSchema(withdrawalSchema);

// Generic validate request function for other modules to use
export function validateRequest(schema: z.ZodSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					error: 'Validation error',
					details: error.errors
				});
			}
			next(error);
		}
	};
}

export const WalletRequestSchemas = {
	// ... existing code ...
};
