/**
 * Admin Treasury Validators
 *
 * Zod validation schemas for treasury-related API requests.
 */

import { z } from 'zod';

// Schema for making a deposit from treasury to a user
export const TreasuryDepositSchema = z.object({
	amount: z.number().positive({ message: 'Amount must be a positive number.' }),
	userId: z.string().uuid({ message: 'User ID must be a valid UUID.' }),
	description: z.string().optional(),
	metadata: z.record(z.any()).optional()
});

// Schema for recovering funds from a user to treasury
export const TreasuryWithdrawalSchema = z.object({
	amount: z.number().positive({ message: 'Amount must be a positive number.' }),
	userId: z.string().uuid({ message: 'User ID must be a valid UUID.' }),
	description: z.string().optional(),
	metadata: z.record(z.any()).optional()
});

// Schema for updating treasury settings
export const TreasurySettingsUpdateSchema = z.object({
	treasuryWalletAddress: z
		.string()
		.min(1, { message: 'Treasury wallet address cannot be empty.' })
		.optional(),
	dgtTreasuryBalance: z
		.number()
		.min(0, { message: 'DGT treasury balance cannot be negative.' })
		.optional(),
	minWithdrawalAmount: z
		.number()
		.min(0, { message: 'Minimum withdrawal amount cannot be negative.' })
		.optional(),
	withdrawalFeePercent: z
		.number()
		.min(0, { message: 'Withdrawal fee percent cannot be negative.' })
		.max(100, { message: 'Withdrawal fee percent cannot exceed 100.' })
		.optional(),
	rewardDistributionDelayHours: z
		.number()
		.int({ message: 'Reward distribution delay must be an integer.' })
		.min(0, { message: 'Reward distribution delay cannot be negative.' })
		.optional(),
	tipBurnPercent: z.number().min(0).max(100).optional(),
	tipRecipientPercent: z.number().min(0).max(100).optional(),
	minTipAmount: z.number().min(0).optional(),
	maxTipAmount: z.number().min(0).optional(),
	enableLikes: z.boolean().optional(),
	enableTips: z.boolean().optional(),
	likesGiveXp: z.boolean().optional(),
	tipsGiveXp: z.boolean().optional(),
	likeXpAmount: z.number().int().optional(),
	tipXpMultiplier: z.number().optional()
}).partial();

// Schema for mass airdrop
export const MassAirdropSchema = z.object({
	userIds: z.array(z.string().uuid()).min(1, { message: 'At least one user ID must be provided.' }),
	amountPerUser: z.number().positive({ message: 'Amount per user must be a positive number.' }),
	reason: z.string().optional()
});

export type TreasuryDepositInput = z.infer<typeof TreasuryDepositSchema>;
export type TreasuryWithdrawalInput = z.infer<typeof TreasuryWithdrawalSchema>;
export type TreasurySettingsUpdateInput = z.infer<typeof TreasurySettingsUpdateSchema>;
export type MassAirdropInput = z.infer<typeof MassAirdropSchema>;
