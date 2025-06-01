/**
 * Vault Domain Template
 * 
 * [REFAC-VAULT]
 * 
 * This template provides the structure for implementing the Vault module
 * in the Engagement domain as part of the final restructuring sprint (May 2025).
 */

// vault.routes.ts
export const vaultRoutesTemplate = `/**
 * Vault Routes
 * 
 * [REFAC-VAULT]
 * 
 * This file defines API routes for vault functionality
 * including time-locked token storage and release.
 */

import { Router } from 'express';
import { vaultController } from './vault.controller';
import { asyncHandler } from '../../../wallet/wallet.errors';
import { authMiddleware } from '../../../../middleware/auth';
import { validateCreateVault, validateReleaseVault } from './vault.validators';

// Create router
const router = Router();

// Apply auth middleware to all vault routes
router.use(authMiddleware);

/**
 * @route GET /api/engagement/vault/list
 * @desc Get user's active vaults
 * @access Private
 */
router.get(
  '/list',
  asyncHandler(vaultController.getUserVaults.bind(vaultController))
);

/**
 * @route POST /api/engagement/vault/create
 * @desc Create a new time-locked vault
 * @access Private
 */
router.post(
  '/create',
  validateCreateVault,
  asyncHandler(vaultController.createVault.bind(vaultController))
);

/**
 * @route POST /api/engagement/vault/release/:vaultId
 * @desc Release tokens from a vault if conditions are met
 * @access Private
 */
router.post(
  '/release/:vaultId',
  validateReleaseVault,
  asyncHandler(vaultController.releaseVault.bind(vaultController))
);

/**
 * @route GET /api/engagement/vault/history
 * @desc Get vault history for user
 * @access Private
 */
router.get(
  '/history',
  asyncHandler(vaultController.getVaultHistory.bind(vaultController))
);

export default router;`;

// vault.controller.ts
export const vaultControllerTemplate = `/**
 * Vault Controller
 * 
 * [REFAC-VAULT]
 * 
 * This controller handles vault-related API requests,
 * for time-locked token storage and release.
 */

import { Request, Response } from 'express';
import { logger } from '../../../../core/logger';
import { vaultService } from './vault.service';
import { WalletError, WalletErrorCodes } from '../../../wallet/wallet.errors';

/**
 * Vault controller for handling vault-related requests
 */
export class VaultController {
  /**
   * Get user's active vaults
   */
  async getUserVaults(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const vaults = await vaultService.getUserVaults(userId);
      
      res.json(vaults);
    } catch (error) {
      logger.error('Error getting user vaults:', error);
      
      if (error instanceof WalletError) {
        res.status(error.httpStatus).json({
          error: error.message,
          code: error.code
        });
        return;
      }
      
      res.status(500).json({
        error: 'Failed to get user vaults',
        code: WalletErrorCodes.UNKNOWN_ERROR
      });
    }
  }

  /**
   * Create a new time-locked vault
   */
  async createVault(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { amount, lockPeriodDays, name, currency = 'DGT' } = req.body;
      
      // Create vault
      const vault = await vaultService.createVault(
        userId,
        BigInt(amount),
        lockPeriodDays,
        name,
        currency
      );
      
      res.status(201).json(vault);
    } catch (error) {
      logger.error('Error creating vault:', error);
      
      if (error instanceof WalletError) {
        res.status(error.httpStatus).json({
          error: error.message,
          code: error.code
        });
        return;
      }
      
      res.status(500).json({
        error: 'Failed to create vault',
        code: WalletErrorCodes.UNKNOWN_ERROR
      });
    }
  }

  /**
   * Release tokens from a vault if conditions are met
   */
  async releaseVault(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const vaultId = parseInt(req.params.vaultId);
      
      if (isNaN(vaultId)) {
        res.status(400).json({
          error: 'Invalid vault ID',
          code: WalletErrorCodes.INVALID_REQUEST
        });
        return;
      }
      
      // Release vault
      const result = await vaultService.releaseVault(userId, vaultId);
      
      res.json(result);
    } catch (error) {
      logger.error('Error releasing vault:', error);
      
      if (error instanceof WalletError) {
        res.status(error.httpStatus).json({
          error: error.message,
          code: error.code
        });
        return;
      }
      
      res.status(500).json({
        error: 'Failed to release vault',
        code: WalletErrorCodes.UNKNOWN_ERROR
      });
    }
  }

  /**
   * Get vault history for user
   */
  async getVaultHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const history = await vaultService.getVaultHistory(userId, page, limit);
      
      res.json(history);
    } catch (error) {
      logger.error('Error getting vault history:', error);
      
      if (error instanceof WalletError) {
        res.status(error.httpStatus).json({
          error: error.message,
          code: error.code
        });
        return;
      }
      
      res.status(500).json({
        error: 'Failed to get vault history',
        code: WalletErrorCodes.UNKNOWN_ERROR
      });
    }
  }
}

// Export a singleton instance
export const vaultController = new VaultController();`;

// vault.service.ts
export const vaultServiceTemplate = `/**
 * Vault Service
 * 
 * [REFAC-VAULT]
 * 
 * This service manages time-locked token storage (vaults) functionality.
 */

import { db } from '../db';
import { sql, eq, and, gte, lte, desc } from 'drizzle-orm';
import { vaults, users as usersTable, transactions as transactionsTable, walletTransactions } from '@shared/schema';
import { logger } from '../../../../core/logger';
import { WalletService } from '../wallet/wallet.service';
import { VaultError, VaultErrorCodes } from './vault.errors';

/**
 * Vault service for managing time-locked token storage
 */
export class VaultService {
  /**
   * Get active vaults for a user
   */
  async getUserVaults(userId: number) {
    try {
      // Get vaults where lockEndTime is in the future or vault is active
      const userVaults = await db
        .select()
        .from(vaults)
        .where(
          and(
            eq(vaults.userId, userId),
            eq(vaults.status, 'active')
          )
        )
        .orderBy(desc(vaults.createdAt));
      
      // Calculate additional info for each vault
      const enhancedVaults = userVaults.map(vault => {
        const lockEndTime = new Date(vault.lockEndTime);
        const now = new Date();
        const isReleasable = lockEndTime <= now;
        const remainingTimeMs = Math.max(0, lockEndTime.getTime() - now.getTime());
        
        // Convert remaining time to days, hours, minutes
        const remainingDays = Math.floor(remainingTimeMs / (1000 * 60 * 60 * 24));
        const remainingHours = Math.floor((remainingTimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
          ...vault,
          isReleasable,
          remainingDays,
          remainingHours,
          remainingMinutes
        };
      });
      
      return enhancedVaults;
    } catch (error) {
      logger.error('Error getting user vaults:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to get user vaults',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Create a new time-locked vault
   */
  async createVault(
    userId: number,
    amount: bigint,
    lockPeriodDays: number,
    name: string,
    currency: string = 'DGT'
  ) {
    try {
      // Validate amounts and lock period
      if (amount <= BigInt(0)) {
        throw new WalletError(
          'Invalid amount',
          400,
          WalletErrorCodes.INVALID_AMOUNT
        );
      }
      
      if (lockPeriodDays < 1) {
        throw new WalletError(
          'Lock period must be at least 1 day',
          400,
          WalletErrorCodes.INVALID_REQUEST
        );
      }
      
      // Calculate lock end time
      const lockEndTime = new Date();
      lockEndTime.setDate(lockEndTime.getDate() + lockPeriodDays);
      
      // Deduct amount from user's wallet (currently only supports DGT)
      if (currency === 'DGT') {
        await dgtService.deductDgt(userId, amount, 'VAULT_DEPOSIT', {
          vaultName: name,
          lockPeriodDays
        });
      } else {
        throw new WalletError(
          'Only DGT currency is currently supported for vaults',
          400,
          WalletErrorCodes.INVALID_REQUEST
        );
      }
      
      // Create vault record
      const [vault] = await db
        .insert(vaults)
        .values({
          userId,
          amount: amount.toString(),
          lockStartTime: new Date(),
          lockEndTime,
          status: 'active',
          name,
          currency
        })
        .returning();
      
      return vault;
    } catch (error) {
      logger.error('Error creating vault:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to create vault',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Release tokens from a vault if conditions are met
   */
  async releaseVault(userId: number, vaultId: number) {
    try {
      // Get vault
      const [vault] = await db
        .select()
        .from(vaults)
        .where(
          and(
            eq(vaults.id, vaultId),
            eq(vaults.userId, userId),
            eq(vaults.status, 'active')
          )
        )
        .limit(1);
      
      if (!vault) {
        throw new WalletError(
          'Vault not found',
          404,
          WalletErrorCodes.VAULT_NOT_FOUND
        );
      }
      
      // Check if lock period has ended
      const lockEndTime = new Date(vault.lockEndTime);
      const now = new Date();
      
      if (lockEndTime > now) {
        throw new WalletError(
          'Vault is still locked',
          400,
          WalletErrorCodes.VAULT_LOCKED,
          {
            remainingTime: {
              days: Math.floor((lockEndTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
              hours: Math.floor(((lockEndTime.getTime() - now.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor(((lockEndTime.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))
            }
          }
        );
      }
      
      // Release funds (currently only supports DGT)
      const amount = BigInt(vault.amount);
      
      if (vault.currency === 'DGT') {
        await dgtService.addDgt(userId, amount, 'VAULT_RELEASE', {
          vaultId: vault.id,
          vaultName: vault.name
        });
      } else {
        throw new WalletError(
          'Only DGT currency is currently supported for vaults',
          400,
          WalletErrorCodes.INVALID_REQUEST
        );
      }
      
      // Update vault status
      const [updatedVault] = await db
        .update(vaults)
        .set({
          status: 'released',
          releasedAt: now
        })
        .where(eq(vaults.id, vaultId))
        .returning();
      
      return {
        vault: updatedVault,
        amount: Number(amount),
        message: 'Vault released successfully'
      };
    } catch (error) {
      logger.error('Error releasing vault:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to release vault',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get vault history for user
   */
  async getVaultHistory(userId: number, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Get all vaults for user including history (released vaults)
      const vaultHistory = await db
        .select()
        .from(vaults)
        .where(eq(vaults.userId, userId))
        .orderBy(desc(vaults.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Get transaction IDs related to vaults
      const vaultTransactionIds = vaultHistory
        .flatMap(vault => vault.transactionIds || [])
        .filter(Boolean);
      
      // Get relevant transactions if there are any
      let vaultTransactions = [];
      if (vaultTransactionIds.length > 0) {
        vaultTransactions = await db
          .select()
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, userId),
              // Use 'in' operator with transaction IDs
              // This might need to be adjusted based on your ORM/query builder
              // or you might need to do multiple queries
              // For this example, assuming a hypothetical 'in' operator
              // transactions.id.in(vaultTransactionIds)
              eq(transactions.type, 'VAULT_DEPOSIT'),
              eq(transactions.userId, userId)
            )
          );
      }
      
      return {
        vaults: vaultHistory,
        transactions: vaultTransactions,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error getting vault history:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to get vault history',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }
}

// Export a singleton instance
export const vaultService = new VaultService();`;

// vault.validators.ts
export const vaultValidatorsTemplate = `/**
 * Vault Validators
 * 
 * [REFAC-VAULT]
 * 
 * This file contains request validation middleware for vault routes.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { WalletError, WalletErrorCodes } from '../../../wallet/wallet.errors';

// Validate create vault request
export const createVaultSchema = z.object({
  amount: z.number().or(z.string()).refine(val => {
    const num = typeof val === 'string' ? Number(val) : val;
    return num > 0;
  }, {
    message: 'Amount must be a positive number'
  }),
  lockPeriodDays: z.number().int().min(1, {
    message: 'Lock period must be at least 1 day'
  }),
  name: z.string().min(1).max(100, {
    message: 'Name must be between 1 and 100 characters'
  }),
  currency: z.string().default('DGT').optional()
});

// Validate release vault request
export const releaseVaultSchema = z.object({
  vaultId: z.number().or(z.string()).refine(val => {
    const num = typeof val === 'string' ? Number(val) : val;
    return !isNaN(num) && num > 0;
  }, {
    message: 'Valid vault ID is required'
  })
});

/**
 * Validate create vault request
 */
export const validateCreateVault = (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createVaultSchema.parse(req.body);
    req.body = data;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      throw new WalletError(
        'Validation error',
        400,
        WalletErrorCodes.VALIDATION_ERROR,
        { errors: formattedErrors }
      );
    }
    next(error);
  }
};

/**
 * Validate release vault request
 */
export const validateReleaseVault = (req: Request, res: Response, next: NextFunction) => {
  try {
    const vaultId = req.params.vaultId;
    const data = releaseVaultSchema.parse({ vaultId });
    req.params.vaultId = String(data.vaultId);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      throw new WalletError(
        'Validation error',
        400,
        WalletErrorCodes.VALIDATION_ERROR,
        { errors: formattedErrors }
      );
    }
    next(error);
  }
};

// Add error codes to wallet.errors.ts
export const vaultErrorCodesTemplate = `  VAULT_NOT_FOUND: 'WALLET_VAULT_NOT_FOUND',
  VAULT_LOCKED: 'WALLET_VAULT_LOCKED',`;

// Export schemas for testing
export {
  createVaultSchema,
  releaseVaultSchema
};`;

// vault.test.ts
export const vaultTestTemplate = `/**
 * Vault Service Tests
 * 
 * [REFAC-VAULT]
 * 
 * Tests for the vault service functionality including:
 * - Creating a vault
 * - Releasing a vault
 * - Fetching vault history
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { vaultService } from '../../src/domains/engagement/vault/vault.service';
import { dgtService } from '../../src/domains/wallet/dgt.service';
import { db } from '../../src/core/db';
import { WalletError } from '../../src/domains/wallet/wallet.errors';

// Mock dependencies
vi.mock('../../src/domains/wallet/dgt.service', () => ({
  dgtService: {
    deductDgt: vi.fn().mockResolvedValue(BigInt(1000)),
    addDgt: vi.fn().mockResolvedValue(BigInt(1000))
  }
}));

vi.mock('../../src/core/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => [
                {
                  id: 1,
                  userId: 1,
                  amount: '1000',
                  lockStartTime: new Date().toISOString(),
                  lockEndTime: new Date(Date.now() + 86400000).toISOString(), // 1 day in future
                  status: 'active',
                  name: 'Test Vault',
                  currency: 'DGT',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ])
            }))
          }))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [
          {
            id: 1,
            userId: 1,
            amount: '1000',
            lockStartTime: new Date().toISOString(),
            lockEndTime: new Date(Date.now() + 86400000).toISOString(), // 1 day in future
            status: 'active',
            name: 'Test Vault',
            currency: 'DGT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => [
            {
              id: 1,
              userId: 1,
              amount: '1000',
              lockStartTime: new Date().toISOString(),
              lockEndTime: new Date(Date.now() - 86400000).toISOString(), // 1 day in past
              status: 'released',
              name: 'Test Vault',
              currency: 'DGT',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              releasedAt: new Date().toISOString()
            }
          ])
        }))
      }))
    }))
  }
}));

// Mock logger
vi.mock('../../../../core/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('Vault Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getUserVaults', () => {
    it('should return vaults with additional calculated properties', async () => {
      const result = await vaultService.getUserVaults(1);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('isReleasable');
      expect(result[0]).toHaveProperty('remainingDays');
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('createVault', () => {
    it('should create a new vault', async () => {
      const result = await vaultService.createVault(
        1, // userId
        BigInt(1000), // amount
        7, // lockPeriodDays
        'Test Vault' // name
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(dgtService.deductDgt).toHaveBeenCalledWith(
        1,
        BigInt(1000),
        'VAULT_DEPOSIT',
        expect.objectContaining({
          vaultName: 'Test Vault',
          lockPeriodDays: 7
        })
      );
      expect(db.insert).toHaveBeenCalled();
    });

    it('should throw error for invalid amount', async () => {
      await expect(
        vaultService.createVault(1, BigInt(0), 7, 'Test Vault')
      ).rejects.toThrow(WalletError);
    });

    it('should throw error for invalid lock period', async () => {
      await expect(
        vaultService.createVault(1, BigInt(1000), 0, 'Test Vault')
      ).rejects.toThrow(WalletError);
    });
  });

  describe('releaseVault', () => {
    it('should release a vault and return funds', async () => {
      // Override mock to have a past lock end time
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue([
              {
                id: 1,
                userId: 1,
                amount: '1000',
                lockStartTime: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
                lockEndTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                status: 'active',
                name: 'Test Vault',
                currency: 'DGT'
              }
            ])
          })
        })
      } as any);

      const result = await vaultService.releaseVault(1, 1);

      expect(result).toBeDefined();
      expect(result.vault).toHaveProperty('status', 'released');
      expect(dgtService.addDgt).toHaveBeenCalledWith(
        1,
        BigInt(1000),
        'VAULT_RELEASE',
        expect.objectContaining({
          vaultId: 1,
          vaultName: 'Test Vault'
        })
      );
      expect(db.update).toHaveBeenCalled();
    });

    it('should throw error if vault is still locked', async () => {
      // Override mock to have a future lock end time
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue([
              {
                id: 1,
                userId: 1,
                amount: '1000',
                lockStartTime: new Date().toISOString(),
                lockEndTime: new Date(Date.now() + 86400000).toISOString(), // 1 day in future
                status: 'active',
                name: 'Test Vault',
                currency: 'DGT'
              }
            ])
          })
        })
      } as any);

      await expect(
        vaultService.releaseVault(1, 1)
      ).rejects.toThrow(WalletError);
    });

    it('should throw error if vault not found', async () => {
      // Override mock to return no vault
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue([])
          })
        })
      } as any);

      await expect(
        vaultService.releaseVault(1, 999)
      ).rejects.toThrow(WalletError);
    });
  });

  describe('getVaultHistory', () => {
    it('should return vault history with pagination', async () => {
      const result = await vaultService.getVaultHistory(1, 1, 10);

      expect(result).toBeDefined();
      expect(result.vaults).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(db.select).toHaveBeenCalled();
    });
  });
});`;

// create-vault-domain.sh script
export const createVaultDomainScript = `#!/bin/bash

# Create Vault Domain Script
# This script sets up the file structure for the vault module in the engagement domain

# Create directories
mkdir -p server/src/domains/engagement/vault
mkdir -p server/test/engagement/vault

# Create files
echo "Creating vault.routes.ts..."
cat > server/src/domains/engagement/vault/vault.routes.ts << EOF
$vaultRoutesTemplate
EOF

echo "Creating vault.controller.ts..."
cat > server/src/domains/engagement/vault/vault.controller.ts << EOF
$vaultControllerTemplate
EOF

echo "Creating vault.service.ts..."
cat > server/src/domains/engagement/vault/vault.service.ts << EOF
$vaultServiceTemplate
EOF

echo "Creating vault.validators.ts..."
cat > server/src/domains/engagement/vault/vault.validators.ts << EOF
$vaultValidatorsTemplate
EOF

echo "Creating vault.test.ts..."
cat > server/test/engagement/vault/vault.test.ts << EOF
$vaultTestTemplate
EOF

# Add VAULT error codes to wallet.errors.ts
echo "Updating wallet.errors.ts..."
sed -i '' "/UNKNOWN_ERROR: 'WALLET_UNKNOWN_ERROR',/a\\
$vaultErrorCodesTemplate
" server/src/domains/wallet/wallet.errors.ts

# Update engagement.service.ts to include vault service
echo "Updating engagement.service.ts..."
sed -i '' "/import { rainService } from '.\/rain\/rain.service';/a\\
import { vaultService } from './vault/vault.service';
" server/src/domains/engagement/engagement.service.ts

# Add vault service method to engagement service
cat >> server/src/domains/engagement/engagement.service.ts << 'EOF'

  /**
   * Create a vault for time-locked tokens
   * 
   * @param userId The user creating the vault
   * @param amount Amount of tokens to lock
   * @param lockPeriodDays Number of days to lock the tokens
   * @param name Name of the vault
   * @param currency Currency to use (default: DGT)
   */
  async createVault(
    userId: number,
    amount: bigint,
    lockPeriodDays: number,
    name: string,
    currency: string = 'DGT'
  ) {
    try {
      return await vaultService.createVault(
        userId,
        amount,
        lockPeriodDays,
        name,
        currency
      );
    } catch (error) {
      logger.error('Error creating vault:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to create vault',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }
EOF

# Update core/index.ts to register the vault routes
echo "Updating core/index.ts to register vault routes..."
sed -i '' "/import airdropRoutes from '..\/domains\/engagement\/airdrop\/airdrop.routes';/a\\
import vaultRoutes from '../domains/engagement/vault/vault.routes';
" server/src/core/index.ts

sed -i '' "/app.use('\/api\/engagement\/airdrop', airdropRoutes);/a\\
app.use('/api/engagement/vault', vaultRoutes);
" server/src/core/index.ts

echo "Vault domain setup complete!"
`; 