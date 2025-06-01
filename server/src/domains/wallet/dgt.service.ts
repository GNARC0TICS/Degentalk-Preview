/**
 * DGT Service for Internal Token Ledger Management
 * 
 * [REFAC-DGT]
 * 
 * This service manages the off-chain DGT token ledger, handling:
 * - DGT balance queries and updates
 * - Grant/deduct operations
 * - Purchase fulfillment
 * - DGT transfers between users
 * - Integration with engagement features (tip, rain, etc.)
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  users, 
  dgtPurchaseOrders, 
  transactions, 
  transactionTypeEnum, 
  transactionStatusEnum
} from '@shared/schema';
import { db } from '../../core/db';
import { logger } from '../../core/logger';
import { eq, sql } from 'drizzle-orm';
import { 
  DGT_CURRENCY, 
  TRANSACTION_FEE_PERCENT, 
  MIN_TRANSACTION_AMOUNT, 
  MAX_USER_BALANCE, 
  DGT_TREASURY_USER_ID
} from './wallet.constants';
// import { calculateTransactionFee } from './wallet.utils'; // Removed as file not found and function not used
import { WalletError, ErrorCodes } from '../../core/errors';

// Transaction types specific to DGT
type DgtTransactionType = 
  | 'PURCHASE'
  | 'TIP'
  | 'RAIN'
  | 'AIRDROP'
  | 'WITHDRAW'
  | 'ADMIN_ADJUST'
  | 'REWARD'
  | 'FEE';

/**
 * DGT service for internal token ledger management
 */
export class DgtService {
  /**
   * Get user's DGT balance
   * @param userId User ID
   * @returns Current DGT balance
   */
  async getUserBalance(userId: number): Promise<bigint> {
    try {
      logger.info('DGT_SERVICE', `DgtService.getUserBalance called with userId: ${userId}`);
      
      const [userResult] = await db
        .select({ dgtWalletBalance: users.dgtWalletBalance })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      logger.info('DGT_SERVICE', `DgtService.getUserBalance query result:`, userResult);
      
      if (!userResult) {
        logger.warn('DGT_SERVICE', `User not found for userId: ${userId}`);
        throw new WalletError(
          'User not found',
          404,
          ErrorCodes.USER_NOT_FOUND
        );
      }
      
      logger.info('DGT_SERVICE', `DgtService.getUserBalance returning balance: ${userResult.dgtWalletBalance} for userId: ${userId}`);
      return BigInt(userResult.dgtWalletBalance);
    } catch (error) {
      logger.error('DGT_SERVICE', 'Error getting DGT balance:', error instanceof Error ? error.message : String(error));
      throw new WalletError(
        'Failed to get DGT balance',
        500,
        ErrorCodes.DB_ERROR,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Add DGT to user's balance
   * @param userId User ID
   * @param amount Amount to add (positive integer)
   * @param type Transaction type
   * @param metadata Additional transaction metadata
   * @returns New balance
   */
  async addDgt(
    userId: number, 
    amount: bigint, 
    type: DgtTransactionType, 
    metadata: Record<string, any> = {}
  ): Promise<bigint> {
    try {
      // Validate inputs
      if (amount <= BigInt(0)) {
        throw new WalletError(
          'Amount must be positive',
          400,
          ErrorCodes.WALLET_INVALID_OPERATION
        );
      }
      
      // Begin transaction
      return await db.transaction(async (tx) => {
        // Update user balance
        const [result] = await tx
          .update(users)
          .set({ 
            dgtWalletBalance: sql`LEAST(COALESCE(${users.dgtWalletBalance}, 0) + ${Number(amount)}, ${MAX_USER_BALANCE})`
          })
          .where(eq(users.id, userId))
          .returning({ newBalance: users.dgtWalletBalance });
        
        if (!result) {
          throw new WalletError(
            'User not found',
            404,
            ErrorCodes.USER_NOT_FOUND
          );
        }
        
        // Record transaction
        await tx.insert(transactions).values({
          userId,
          amount: Number(amount),
          type: this.mapToTransactionType(type),
          status: 'confirmed',
          description: `${type} transaction - Added ${amount} DGT`,
          metadata: metadata || {},
          isTreasuryTransaction: type === 'ADMIN_ADJUST' || type === 'REWARD'
        });
        
        // Return new balance
        return BigInt(result.newBalance);
      });
    } catch (error) {
      logger.error('DGT_SERVICE', 'Error adding DGT:', error instanceof Error ? error.message : String(error));
      throw new WalletError(
        'Failed to add DGT to balance',
        500,
        ErrorCodes.DB_ERROR,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Remove DGT from user's balance
   * @param userId User ID
   * @param amount Amount to deduct (positive integer)
   * @param type Transaction type
   * @param metadata Additional transaction metadata
   * @returns New balance
   */
  async deductDgt(
    userId: number, 
    amount: bigint, 
    type: DgtTransactionType, 
    metadata: Record<string, any> = {}
  ): Promise<bigint> {
    try {
      // Validate inputs
      if (amount <= BigInt(0)) {
        throw new WalletError(
          'Amount must be positive',
          400,
          ErrorCodes.WALLET_INVALID_OPERATION
        );
      }
      
      // Begin transaction
      return await db.transaction(async (tx) => {
        // Check if user has sufficient balance
        const [user] = await tx
          .select({ dgtWalletBalance: users.dgtWalletBalance })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        
        if (!user) {
          throw new WalletError(
            'User not found',
            404,
            ErrorCodes.USER_NOT_FOUND
          );
        }
        
        const currentBalance = BigInt(user.dgtWalletBalance);
        
        if (currentBalance < amount) {
          throw new WalletError(
            'Insufficient DGT balance',
            400,
            ErrorCodes.WALLET_INSUFFICIENT_FUNDS,
            { 
              currentBalance: currentBalance.toString(),
              requiredAmount: amount.toString()
            }
          );
        }
        
        // Update user balance
        const [result] = await tx
          .update(users)
          .set({ 
            dgtWalletBalance: sql`COALESCE(${users.dgtWalletBalance}, 0) - ${Number(amount)}`
          })
          .where(eq(users.id, userId))
          .returning({ newBalance: users.dgtWalletBalance });
        
        // Record transaction
        await tx.insert(transactions).values({
          userId,
          amount: -Number(amount), 
          type: this.mapToTransactionType(type),
          status: 'confirmed',
          description: `${type} transaction - Deducted ${amount} DGT`,
          metadata: metadata || {},
          isTreasuryTransaction: type === 'ADMIN_ADJUST'
        });
        
        // Return new balance
        return BigInt(result.newBalance);
      });
    } catch (error) {
      logger.error('DGT_SERVICE', 'Error deducting DGT:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof WalletError && error.code === ErrorCodes.WALLET_INSUFFICIENT_FUNDS) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to deduct DGT from balance',
        500,
        ErrorCodes.DB_ERROR,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Transfer DGT between users
   * @param fromUserId Sender user ID
   * @param toUserId Recipient user ID
   * @param amount Amount to transfer (positive integer)
   * @param type Transaction type (TIP, RAIN, etc.)
   * @param metadata Additional transaction metadata
   * @returns Object with new balances for both users
   */
  async transferDgt(
    fromUserId: number,
    toUserId: number,
    amount: bigint,
    type: DgtTransactionType,
    metadata: Record<string, any> = {}
  ): Promise<{ senderBalance: bigint; recipientBalance: bigint }> {
    logger.info('DGT_SERVICE', `Transferring ${amount} DGT from user ${fromUserId} to ${toUserId} for type ${type}`);
    try {
      // Validate inputs
      if (amount <= BigInt(0)) {
        throw new WalletError(
          'Amount must be positive',
          400,
          ErrorCodes.WALLET_INVALID_OPERATION
        );
      }
      
      if (fromUserId === toUserId) {
        throw new WalletError(
          'Cannot transfer to self',
          400,
          ErrorCodes.WALLET_INVALID_OPERATION
        );
      }
      
      if (amount < BigInt(MIN_TRANSACTION_AMOUNT)) {
        throw new WalletError(
          `Amount must be at least ${MIN_TRANSACTION_AMOUNT} DGT`,
          400,
          ErrorCodes.WALLET_INVALID_OPERATION
        );
      }
      
      // Begin transaction
      return await db.transaction(async (tx) => {
        // Check if sender has sufficient balance
        const [sender] = await tx
          .select({ dgtWalletBalance: users.dgtWalletBalance })
          .from(users)
          .where(eq(users.id, fromUserId))
          .limit(1);
        
        if (!sender) {
          throw new WalletError(
            'Sender not found',
            404,
            ErrorCodes.USER_NOT_FOUND
          );
        }
        
        const currentBalance = BigInt(sender.dgtWalletBalance);
        
        if (currentBalance < amount) {
          throw new WalletError(
            'Insufficient DGT balance',
            400,
            ErrorCodes.WALLET_INSUFFICIENT_FUNDS,
            { 
              currentBalance: currentBalance.toString(),
              requiredAmount: amount.toString()
            }
          );
        }
        
        // Check if recipient exists
        const [recipient] = await tx
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, toUserId))
          .limit(1);
        
        if (!recipient) {
          throw new WalletError(
            'Recipient not found',
            404,
            ErrorCodes.USER_NOT_FOUND,
            { userId: toUserId }
          );
        }
        
        // Calculate fee if applicable
        const feePercent = TRANSACTION_FEE_PERCENT / 100;
        const feeAmount = BigInt(Math.floor(Number(amount) * feePercent));
        const recipientAmount = amount - feeAmount;
        
        // Update sender balance
        const [senderResult] = await tx
          .update(users)
          .set({ 
            dgtWalletBalance: sql`COALESCE(${users.dgtWalletBalance}, 0) - ${Number(amount)}`
          })
          .where(eq(users.id, fromUserId))
          .returning({ newBalance: users.dgtWalletBalance });
        
        // Update recipient balance
        const [recipientResult] = await tx
          .update(users)
          .set({ 
            dgtWalletBalance: sql`LEAST(COALESCE(${users.dgtWalletBalance}, 0) + ${Number(recipientAmount)}, ${MAX_USER_BALANCE})`
          })
          .where(eq(users.id, toUserId))
          .returning({ newBalance: users.dgtWalletBalance });
        
        // Record sender transaction
        await tx.insert(transactions).values({
          userId: fromUserId,
          fromUserId,
          toUserId,
          amount: -Number(amount),
          type: this.mapToTransactionType(type),
          status: 'confirmed',
          description: `${type} transaction - Sent ${amount} DGT to user #${toUserId}`,
          metadata: {
            ...metadata,
            feeAmount: feeAmount.toString(),
            recipientAmount: recipientAmount.toString()
          }
        });
        
        // Record recipient transaction
        await tx.insert(transactions).values({
          userId: toUserId,
          fromUserId,
          toUserId,
          amount: Number(recipientAmount),
          type: this.mapToTransactionType(type),
          status: 'confirmed',
          description: `${type} transaction - Received ${recipientAmount} DGT from user #${fromUserId}`,
          metadata: {
            ...metadata,
            originalAmount: amount.toString(),
            feeAmount: feeAmount.toString()
          }
        });
        
        // Record fee transaction if applicable
        if (feeAmount > BigInt(0)) {
          // Update treasury balance (platform fee account)
          await tx
            .update(users)
            .set({ 
              dgtWalletBalance: sql`COALESCE(${users.dgtWalletBalance}, 0) + ${Number(feeAmount)}`
            })
            .where(eq(users.id, DGT_TREASURY_USER_ID));
            
          // Record fee transaction
          await tx.insert(transactions).values({
            userId: DGT_TREASURY_USER_ID,
            fromUserId, // Keep fromUserId to trace original sender of the fee-generating transaction
            amount: Number(feeAmount),
            type: 'FEE',
            status: 'confirmed',
            description: `Transaction fee from ${type} - User #${fromUserId} to #${toUserId}`,
            metadata: {
              originalTransactionType: type,
              originalAmount: amount.toString(),
              feePercent: TRANSACTION_FEE_PERCENT
            },
            isTreasuryTransaction: true
          });
        }
        
        // Return new balances
        return {
          senderBalance: BigInt(senderResult.newBalance),
          recipientBalance: BigInt(recipientResult.newBalance)
        };
      });
    } catch (error) {
      logger.error('DGT_SERVICE', 'Error transferring DGT:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to transfer DGT',
        500,
        ErrorCodes.DB_ERROR,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Fulfill a DGT purchase from CCPayment
   * @param purchaseOrderId ID of the purchase order
   * @param status New status (confirmed, failed)
   * @param metadata Additional transaction metadata
   * @returns Purchase order with updated status
   */
  async fulfillDgtPurchase(
    purchaseOrderId: number,
    status: 'confirmed' | 'failed',
    metadata: Record<string, any> = {}
  ): Promise<any> {
    logger.info('DGT_SERVICE', `Attempting to fulfill DGT purchase order ${purchaseOrderId} with status ${status}`);
    try {
      // Begin transaction
      return await db.transaction(async (tx) => {
        // Get purchase order
        const [purchaseOrder] = await tx
          .select()
          .from(dgtPurchaseOrders)
          .where(eq(dgtPurchaseOrders.id, purchaseOrderId))
          .limit(1);
        
        if (!purchaseOrder) {
          throw new WalletError(
            'Purchase order not found',
            404,
            ErrorCodes.NOT_FOUND
          );
        }
        
        // If already processed, return early
        if (purchaseOrder.status !== 'pending') {
          return purchaseOrder;
        }
        
        // Update purchase order status
        const [updatedOrder] = await tx
          .update(dgtPurchaseOrders)
          .set({ 
            status,
            metadata: {
              ...(purchaseOrder.metadata || {}),
              ...metadata,
              processedAt: new Date().toISOString()
            },
            updatedAt: new Date()
          })
          .where(eq(dgtPurchaseOrders.id, purchaseOrderId))
          .returning();
        
        // If confirmed, credit user's DGT balance
        if (status === 'confirmed') {
          // Get current user balance
          const [user] = await tx
            .select({ dgtWalletBalance: users.dgtWalletBalance })
            .from(users)
            .where(eq(users.id, purchaseOrder.userId))
            .limit(1);
          
          if (!user) {
            throw new WalletError(
              'User not found',
              404,
              ErrorCodes.USER_NOT_FOUND
            );
          }
          
          // Calculate new balance
          const currentBalance = BigInt(user.dgtWalletBalance);
          const purchaseAmount = BigInt(purchaseOrder.dgtAmountRequested);
          const newBalance = currentBalance + purchaseAmount;
          
          // Update user balance (with maximum cap)
          await tx
            .update(users)
            .set({ 
              dgtWalletBalance: sql`LEAST(COALESCE(${users.dgtWalletBalance}, 0) + ${Number(purchaseAmount)}, ${MAX_USER_BALANCE})`
            })
            .where(eq(users.id, purchaseOrder.userId));
          
          // Record purchase transaction
          await tx.insert(transactions).values({
            userId: purchaseOrder.userId,
            amount: Number(purchaseAmount),
            type: 'DEPOSIT', // Standard type for purchases
            status: 'confirmed',
            description: `DGT Purchase - ${purchaseAmount} DGT with ${purchaseOrder.cryptoCurrencyExpected}`,
            metadata: {
              purchaseOrderId: purchaseOrder.id,
              cryptoAmount: purchaseOrder.cryptoAmountExpected.toString(),
              cryptoCurrency: purchaseOrder.cryptoCurrencyExpected,
              ccpaymentReference: purchaseOrder.ccpaymentReference,
              ...metadata
            }
          });
        }
        
        return updatedOrder;
      });
    } catch (error) {
      logger.error('DGT_SERVICE', `Error fulfilling DGT purchase order ${purchaseOrderId}:`, error instanceof Error ? error.message : String(error));
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to fulfill DGT purchase',
        500,
        ErrorCodes.DB_ERROR,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Map internal DGT transaction types to schema transaction types
   */
  private mapToTransactionType(type: DgtTransactionType): typeof transactionTypeEnum.enumValues[number] {
    logger.info('DGT_SERVICE', `Mapping DgtTransactionType ${type} to TransactionType`);
    switch (type) {
      case 'PURCHASE':
        return 'DEPOSIT';
      case 'TIP':
        return 'TIP';
      case 'RAIN':
        return 'RAIN';
      case 'AIRDROP':
        return 'AIRDROP';
      case 'WITHDRAW':
        return 'WITHDRAWAL';
      case 'ADMIN_ADJUST':
        return 'ADMIN_ADJUST';
      case 'REWARD':
        return 'REWARD';
      case 'FEE':
        return 'FEE';
      default:
        return 'DEPOSIT'; // Should not happen with DgtTransactionType
    }
  }
}

// Export a singleton instance
export const dgtService = new DgtService();
