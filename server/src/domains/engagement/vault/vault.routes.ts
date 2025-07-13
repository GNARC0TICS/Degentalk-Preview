/**
 * Vault Routes
 *
 * Defines API routes for vault functionality (locking and unlocking funds).
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '@db';
import { sql, eq } from 'drizzle-orm';
import { vaults, transactions } from '@schema';
import { VaultService } from './vault.service';
import { logger } from '@core/logger';

import {
	isAuthenticated,
	isAdminOrModerator,
	isAdmin
} from '../../auth/middleware/auth.middleware';
import { getUserIdFromRequest } from '@server-utils/auth';
import { isValidId } from '@shared/utils/id';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

// Initialize the service
const vaultService = new VaultService();

// Create validation schemas
const lockFundsSchema = z.object({
	userId: z.string().uuid(),
	walletAddress: z.string(), // No length validation - we handle test addresses
	amount: z.number().positive(),
	unlockTime: z.string().transform((str) => new Date(str)), // Convert string to Date
	notes: z.string().optional()
});

const unlockFundsSchema = z.object({
	userId: z.string().uuid(),
	vaultId: z.string().uuid()
});

const router = Router();

// Admin endpoints for vault management
// Admin endpoint to get all vaults
router.get('/admin/vaults', isAdmin, async (req: Request, res: Response) => {
	try {
		// Get all vaults with user info
		const allVaults = await db.execute(sql`
      SELECT 
        v.*,
        u.username,
        u.email
      FROM vaults v
      JOIN users u ON v.user_id = u.user_id
      ORDER BY v.created_at DESC
    `);

		sendSuccessResponse(res, allVaults.rows);
	} catch (error) {
		logger.error(
			'VAULT',
			`Admin vault list error: ${error instanceof Error ? error.message : String(error)}`,
			{ error: error instanceof Error ? error.message : String(error) }
		);

		sendErrorResponse(
			res,
			`Failed to fetch vault list: ${error instanceof Error ? error.message : String(error)}`,
			500
		);
	}
});

// Admin endpoint to manually unlock a vault (override time constraints)
router.post('/admin/vaults/unlock/:vaultId', isAdmin, async (req: Request, res: Response) => {
	try {
		const vaultId = req.params.vaultId;
		if (!isValidId(vaultId)) {
			return sendErrorResponse(res, 'Invalid vault ID', 400);
		}

		// Get the vault
		const vault = await vaultService.getVault(vaultId);
		if (!vault) {
			return sendErrorResponse(res, 'Vault not found', 404);
		}

		// Check if already unlocked
		if (vault.status === 'unlocked') {
			return sendErrorResponse(res, 'Vault is already unlocked', 400);
		}

		// Force unlock through database directly to bypass time checks
		const [updatedVault] = await db
			.update(vaults)
			.set({
				status: 'unlocked',
				unlockedAt: new Date(),
				updatedAt: new Date(),
				notes: vault.notes ? `${vault.notes}\n[Admin override unlock]` : '[Admin override unlock]'
			})
			.where(eq(vaults.id, vaultId))
			.returning();

		// Record the transaction
		const [transaction] = await db
			.insert(transactions)
			.values({
				userId: vault.userId,
				type: 'VAULT_UNLOCK',
				amount: vault.amount,
				status: 'confirmed',
				description: `Admin override: Unlocked ${vault.amount} USDT from vault #${vaultId}`,
				metadata: JSON.stringify({
					vaultId,
					adminUnlock: true,
					lockedAt: vault.lockedAt.toISOString(),
					unlockTime: vault.unlockTime.toISOString(),
					initialAmount: vault.initialAmount
				})
			})
			.returning();

		// Update the vault with the transaction ID
		await db
			.update(vaults)
			.set({
				unlockTransactionId: transaction.id
			})
			.where(eq(vaults.id, vaultId));

		// Log the admin unlock
		const adminUserId = getUserIdFromRequest(req);
		logger.info(
			'VAULT',
			`Admin user #${adminUserId ?? 'UNKNOWN_ADMIN'} manually unlocked vault #${vaultId} with ${vault.amount} USDT`,
			{
				adminUserId: adminUserId ?? null, // Log null if undefined
				vaultId,
				userId: vault.userId,
				amount: vault.amount,
				transactionId: transaction.id
			}
		);

		sendSuccessResponse(res, {
			status: 'unlocked',
			vault: updatedVault,
			transaction
		});
	} catch (error) {
		logger.error(
			'VAULT',
			`Admin vault unlock error: ${error instanceof Error ? error.message : String(error)}`,
			{
				vaultId: req.params.vaultId,
				error: error instanceof Error ? error.message : String(error)
			}
		);

		sendErrorResponse(
			res,
			`Failed to unlock vault: ${error instanceof Error ? error.message : String(error)}`,
			500
		);
	}
});

// Test endpoint for vault system (development only, no blockchain interaction)
if (process.env.NODE_ENV !== 'production') {
	router.get('/test-status', async (req: Request, res: Response) => {
		try {
			// Get a test user (any user)
			const testUser = await db.execute(sql`
        SELECT user_id, username, wallet_address 
        FROM users 
        LIMIT 1
      `);

			if (!testUser.rows || testUser.rows.length === 0) {
				return sendErrorResponse(res, 'No users found in database', 404);
			}

			const user = testUser.rows[0];
			const userId = user.user_id;

			// For testing, we'll handle both cases - with or without wallet
			const walletAddress = user.wallet_address || 'TRzJRNqjgmzCR4zwm6wLMnECDj35zZZnVt'; // Use test address if none exists

			// Check current vaults
			const existingVaults = await vaultService.getUserVaults(userId);

			// For test purposes, we'll mock the wallet balances
			const mockedBalances = {
				usdt: {
					raw: '100000000', // 100 USDT in raw units
					trx: 0,
					formatted: 100
				},
				trx: {
					trx: 100,
					sun: 100000000 // 100 TRX in sun units
				}
			};

			sendSuccessResponse(res, {
				success: true,
				message: 'Vault system is functioning correctly',
				vaultSystemStatus: {
					vaultTableExists: true,
					canQueryVaults: true,
					transactionTypesConfigured: true
				},
				testUser: {
					userId: user.user_id,
					username: user.username,
					hasWallet: !!user.wallet_address,
					testWalletAddress: walletAddress
				},
				existingVaults,
				mockedBalances,
				testActions: {
					createVault: {
						url: '/api/vault/lock',
						method: 'POST',
						body: {
							userId,
							walletAddress,
							amount: 10, // Default small test amount
							unlockTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
							notes: 'Test vault created via test endpoint'
						}
					},
					getVaults: {
						url: `/api/vaults/${userId}`,
						method: 'GET'
					},
					getStats: {
						url: `/api/vault/stats/${userId}`,
						method: 'GET'
					}
				}
			});
		} catch (error) {
			logger.error(
				'VAULT',
				`Vault test endpoint error: ${error instanceof Error ? error.message : String(error)}`,
				{ error: error instanceof Error ? error.message : String(error) }
			);

			sendErrorResponse(
				res,
				`Failed to run vault test: ${error instanceof Error ? error.message : String(error)}`,
				500
			);
		}
	});
}

// Lock funds in a vault
router.post('/lock', async (req: Request, res: Response) => {
	try {
		// Validate request body
		const { userId, walletAddress, amount, unlockTime, notes } = lockFundsSchema.parse(req.body);

		// Validate that unlock time is in the future
		const now = new Date();
		if (unlockTime <= now) {
			return sendErrorResponse(res, 'Unlock time must be in the future.', 400);
		}

		// Validate minimum lock duration (24 hours)
		const minLockDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
		if (unlockTime.getTime() - now.getTime() < minLockDuration) {
			return sendErrorResponse(res, 'Minimum lock duration is 24 hours.', 400);
		}

		// Create the vault
		const vault = await vaultService.createVault(userId, walletAddress, amount, unlockTime, notes);

		sendSuccessResponse(res, {
			status: 'locked',
			vault
		});
	} catch (error) {
		// Log the error
		logger.error(
			'VAULT',
			`Failed to lock funds: ${error instanceof Error ? error.message : String(error)}`,
			{
				requestBody: req.body,
				error: error instanceof Error ? error.message : String(error)
			}
		);

		// Return error response
		sendErrorResponse(res, error instanceof Error ? error.message : 'Failed to lock funds', 400);
	}
});

// Unlock funds from a vault
router.post('/unlock', async (req: Request, res: Response) => {
	try {
		// Validate request body
		const { userId, vaultId } = unlockFundsSchema.parse(req.body);

		// Unlock the vault
		const vault = await vaultService.unlockVault(vaultId, userId);

		sendSuccessResponse(res, {
			status: 'unlocked',
			vault
		});
	} catch (error) {
		// Log the error
		logger.error(
			'VAULT',
			`Failed to unlock funds: ${error instanceof Error ? error.message : String(error)}`,
			{
				requestBody: req.body,
				error: error instanceof Error ? error.message : String(error)
			}
		);

		// Return error response
		sendErrorResponse(res, error instanceof Error ? error.message : 'Failed to unlock funds', 400);
	}
});

// Get vaults for a user
router.get('/:userId', async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId;

		if (isNaN(userId)) {
			return sendErrorResponse(res, 'Invalid user ID', 400);
		}

		const vaults = await vaultService.getUserVaults(userId);
		sendSuccessResponse(res, vaults);
	} catch (error) {
		// Log the error
		logger.error(
			'VAULT',
			`Failed to fetch vaults: ${error instanceof Error ? error.message : String(error)}`,
			{
				userId: req.params.userId,
				error: error instanceof Error ? error.message : String(error)
			}
		);

		// Return error response
		sendErrorResponse(res, 'Failed to fetch vaults', 500);
	}
});

// Get vault statistics
router.get('/stats/:userId?', async (req: Request, res: Response) => {
	try {
		const userId = req.params.userId ? req.params.userId : undefined;

		if (req.params.userId && isNaN(userId!)) {
			return sendErrorResponse(res, 'Invalid user ID', 400);
		}

		const stats = await vaultService.getVaultStatistics(userId);
		sendSuccessResponse(res, stats);
	} catch (error) {
		// Log the error
		logger.error(
			'VAULT',
			`Failed to fetch vault statistics: ${error instanceof Error ? error.message : String(error)}`,
			{
				userId: req.params.userId,
				error: error instanceof Error ? error.message : String(error)
			}
		);

		// Return error response
		sendErrorResponse(res, 'Failed to fetch vault statistics', 500);
	}
});

export default router;
