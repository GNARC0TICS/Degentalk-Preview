/**
 * Wallet Validation Schemas
 *
 * Zod schemas for validating wallet API requests
 * Ensures type safety and proper validation
 */

import { z } from 'zod';

/**
 * Create deposit address validation
 */
export const createDepositAddressSchema = z.object({
	body: z.object({
		coinSymbol: z
			.string()
			.min(1, 'Coin symbol is required')
			.max(10, 'Coin symbol too long')
			.regex(/^[A-Z0-9]+$/, 'Coin symbol must be uppercase alphanumeric'),
		chain: z.string().min(1, 'Chain is required').max(50, 'Chain name too long').optional()
	})
});

/**
 * Withdrawal request validation
 */
export const withdrawalRequestSchema = z.object({
	body: z.object({
		currency: z
			.string()
			.min(1, 'Currency is required')
			.max(10, 'Currency too long')
			.regex(/^[A-Z0-9]+$/, 'Currency must be uppercase alphanumeric'),
		amount: z
			.number()
			.positive('Amount must be positive')
			.min(0.000001, 'Amount too small')
			.max(1000000, 'Amount too large'),
		address: z.string().min(1, 'Address is required').max(100, 'Address too long').trim(),
		memo: z.string().max(100, 'Memo too long').optional(),
		note: z.string().max(500, 'Note too long').optional()
	})
});

/**
 * Transaction history query validation
 */
export const transactionHistorySchema = z.object({
	query: z.object({
		page: z
			.string()
			.regex(/^\d+$/, 'Page must be a number')
			.transform((val) => parseInt(val))
			.refine((val) => val >= 1, 'Page must be at least 1')
			.optional(),
		limit: z
			.string()
			.regex(/^\d+$/, 'Limit must be a number')
			.transform((val) => parseInt(val))
			.refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
			.optional(),
		sortBy: z.enum(['createdAt', 'updatedAt', 'amount']).optional(),
		sortOrder: z.enum(['asc', 'desc']).optional()
	})
});

/**
 * DGT transfer validation
 */
export const dgtTransferSchema = z.object({
	body: z.object({
		to: z
			.string()
			.min(1, 'Recipient user ID is required')
			.regex(/^user_[a-zA-Z0-9]+$/, 'Invalid user ID format'),
		amount: z
			.number()
			.positive('Amount must be positive')
			.min(1, 'Minimum transfer amount is 1 DGT')
			.max(1000000, 'Maximum transfer amount is 1,000,000 DGT'),
		reason: z.string().max(200, 'Reason too long').optional(),
		metadata: z.record(z.unknown()).optional()
	})
});

/**
 * Webhook validation
 */
export const webhookSchema = z.object({
	params: z.object({
		provider: z.enum(['ccpayment'], 'Unsupported webhook provider')
	}),
	headers: z
		.object({
			'x-signature': z.string().optional(),
			'content-type': z.string().optional()
		})
		.passthrough(),
	body: z.record(z.unknown())
});

/**
 * Common crypto address validation patterns
 */
export const addressPatterns = {
	BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
	ETH: /^0x[a-fA-F0-9]{40}$/,
	USDT: /^0x[a-fA-F0-9]{40}$/, // USDT on Ethereum
	SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
};

/**
 * Enhanced withdrawal validation with address format checking
 */
export const enhancedWithdrawalSchema = z.object({
	body: z
		.object({
			currency: z
				.string()
				.min(1, 'Currency is required')
				.max(10, 'Currency too long')
				.regex(/^[A-Z0-9]+$/, 'Currency must be uppercase alphanumeric'),
			amount: z
				.number()
				.positive('Amount must be positive')
				.min(0.000001, 'Amount too small')
				.max(1000000, 'Amount too large'),
			address: z.string().min(1, 'Address is required').max(100, 'Address too long').trim(),
			memo: z.string().max(100, 'Memo too long').optional(),
			note: z.string().max(500, 'Note too long').optional()
		})
		.superRefine((data, ctx) => {
			// Validate address format based on currency
			const pattern = addressPatterns[data.currency as keyof typeof addressPatterns];
			if (pattern && !pattern.test(data.address)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Invalid ${data.currency} address format`,
					path: ['address']
				});
			}
		})
});

/**
 * Validation for supported currencies
 */
export const supportedCurrencies = ['BTC', 'ETH', 'USDT', 'SOL'] as const;

export const currencySchema = z.enum(supportedCurrencies, {
	errorMap: () => ({ message: `Currency must be one of: ${supportedCurrencies.join(', ')}` })
});

/**
 * Minimum withdrawal amounts by currency
 */
export const minimumWithdrawals = {
	BTC: 0.001,
	ETH: 0.01,
	USDT: 10,
	SOL: 0.1
} as const;

/**
 * Maximum withdrawal amounts by currency
 */
export const maximumWithdrawals = {
	BTC: 10,
	ETH: 100,
	USDT: 100000,
	SOL: 1000
} as const;

/**
 * Withdrawal validation with amount limits
 */
export const withdrawalWithLimitsSchema = z.object({
	body: z
		.object({
			currency: currencySchema,
			amount: z.number().positive('Amount must be positive'),
			address: z.string().min(1, 'Address is required').max(100, 'Address too long').trim(),
			memo: z.string().max(100, 'Memo too long').optional(),
			note: z.string().max(500, 'Note too long').optional()
		})
		.superRefine((data, ctx) => {
			const currency = data.currency;
			const amount = data.amount;

			// Check minimum amount
			const minAmount = minimumWithdrawals[currency];
			if (amount < minAmount) {
				ctx.addIssue({
					code: z.ZodIssueCode.too_small,
					minimum: minAmount,
					type: 'number',
					inclusive: true,
					message: `Minimum withdrawal for ${currency} is ${minAmount}`,
					path: ['amount']
				});
			}

			// Check maximum amount
			const maxAmount = maximumWithdrawals[currency];
			if (amount > maxAmount) {
				ctx.addIssue({
					code: z.ZodIssueCode.too_big,
					maximum: maxAmount,
					type: 'number',
					inclusive: true,
					message: `Maximum withdrawal for ${currency} is ${maxAmount}`,
					path: ['amount']
				});
			}

			// Validate address format
			const pattern = addressPatterns[currency];
			if (pattern && !pattern.test(data.address)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Invalid ${currency} address format`,
					path: ['address']
				});
			}
		})
});

/**
 * Get token info validation
 */
export const getTokenInfoSchema = z.object({
	params: z.object({
		coinId: z.string().min(1, 'Coin ID is required')
	})
});

const validateAddress = z.object({
	body: z.object({
		address: z.string().min(1, 'Address is required'),
		chain: z.string().min(1, 'Chain is required')
	})
});

const swapCrypto = z.object({
	body: z.object({
		fromCoinId: z.number().int().positive('fromCoinId must be a positive integer'),
		toCoinId: z.number().int().positive('toCoinId must be a positive integer'),
		fromAmount: z.string().min(1, 'fromAmount is required')
	})
});

const purchaseDgtSchema = z.object({
	body: z.object({
		fromCoinId: z.number().int().positive('fromCoinId must be a positive integer'),
		fromAmount: z.number().positive('fromAmount must be positive'),
		toCoinSymbol: z.literal('DGT', {
			errorMap: () => ({ message: 'Only DGT purchases are supported' })
		})
	})
});

const getWithdrawFeeSchema = z.object({
	body: z.object({
		coinId: z.number().int().positive('coinId must be a positive integer'),
		chain: z.string().min(1, 'chain is required')
	})
});

/**
 * Admin deposit config update validation
 */
const walletAdminPatchSchema = z.object({
	body: z
		.object({
			autoConvertDeposits: z.boolean().optional(),
			manualConversionAllowed: z.boolean().optional(),
			conversionRateBuffer: z
				.number()
				.min(0, 'Conversion rate buffer cannot be negative')
				.max(0.1, 'Conversion rate buffer cannot exceed 10%')
				.optional(),
			depositsEnabled: z.boolean().optional(),
			withdrawalsEnabled: z.boolean().optional(),
			internalTransfersEnabled: z.boolean().optional()
		})
		.strict() // Prevent unknown fields
});

/**
 * Export all schemas
 */
export const walletValidation = {
	createDepositAddress: createDepositAddressSchema,
	withdrawal: withdrawalWithLimitsSchema,
	transactionHistory: transactionHistorySchema,
	dgtTransfer: dgtTransferSchema,
	webhook: webhookSchema,
	getTokenInfo: getTokenInfoSchema,
	validateAddress,
	swapCrypto,
	purchaseDgt: purchaseDgtSchema,
	getWithdrawFee: getWithdrawFeeSchema,
	walletAdminPatch: walletAdminPatchSchema
};
