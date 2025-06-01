import { db } from '../db';
import { sql } from 'drizzle-orm';
import { users, transactions } from '@db/schema';
import { eq } from 'drizzle-orm';
import { logger, LogLevel, LogAction } from "../src/core/logger";

/**
 * Convert DGT amount from storage format (BIGINT with 6 decimal precision) to display format
 */
export function formatDgtAmount(amount: number | bigint): number {
  return Number(amount) / 1000000;
}

/**
 * Convert DGT amount from display format to storage format
 */
export function parseDgtAmount(displayAmount: number): bigint {
  return BigInt(Math.round(displayAmount * 1000000));
}

/**
 * Calculate DGT amount based on USDT amount and current exchange rate
 */
export async function calculateDgtFromUsdt(usdtAmount: number): Promise<number> {
  try {
    // Get current exchange rate from treasury settings
    const [treasurySettings] = await db.execute(sql`
      SELECT * FROM dgt_economy_parameters LIMIT 1
    `);
    
    // Default to 1:1 exchange rate if not configured
    const exchangeRate = treasurySettings?.rows[0]?.dgt_usdt_exchange_rate || 1;
    const dgtAmount = usdtAmount * exchangeRate;
    
    return dgtAmount;
  } catch (error) {
    logger.error("WALLET", 'Error calculating DGT from USDT', error);
    return usdtAmount; // Fallback to 1:1 exchange rate
  }
}

/**
 * Confirm a deposit after blockchain verification
 * This function would be called by an admin action or automated blockchain listener
 */
export async function confirmDeposit(
  transactionId: number, 
  usdtAmount: number, 
  blockchainTxId?: string
): Promise<boolean> {
  try {
    // Begin transaction
    await db.transaction(async (tx) => {
      // Get transaction details
      const [depositTx] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.transactionId, transactionId));
      
      if (!depositTx || depositTx.status !== 'pending' || depositTx.type !== 'DEPOSIT') {
        throw new Error('Invalid transaction for confirmation');
      }
      
      // Calculate DGT amount based on USDT amount
      const dgtAmount = await calculateDgtFromUsdt(usdtAmount);
      const dgtAmountInStorage = parseDgtAmount(dgtAmount);
      
      // Update user's balance
      await tx
        .update(users)
        .set({
          dgtWalletBalance: sql`dgt_wallet_balance + ${dgtAmountInStorage.toString()}`,
          walletBalanceUsdt: sql`wallet_balance_usdt + ${usdtAmount}`
        })
        .where(eq(users.id, depositTx.userId));
      
      // Update transaction
      await tx
        .update(transactions)
        .set({
          amount: dgtAmountInStorage,
          status: 'confirmed',
          blockchainTxId: blockchainTxId || depositTx.blockchainTxId,
          confirmedAt: new Date(),
          updatedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(depositTx.metadata?.toString() || '{}'),
            confirmed_dgt_amount: dgtAmount,
            confirmed_usdt_amount: usdtAmount,
            confirmation_date: new Date()
          })
        })
        .where(eq(transactions.transactionId, transactionId));
      
      // Update treasury settings (USDT balance)
      await tx.execute(sql`
        UPDATE dgt_economy_parameters
        SET treasury_usdt_balance = treasury_usdt_balance + ${usdtAmount}
      `);
    });
    
    return true;
  } catch (error) {
    logger.error("WALLET", 'Error confirming deposit', error);
    return false;
  }
}

/**
 * Process a withdrawal request
 * This function would be called by an admin action
 */
export async function processWithdrawal(
  transactionId: number,
  status: 'confirmed' | 'rejected',
  blockchainTxId?: string,
  adminNotes?: string
): Promise<boolean> {
  try {
    // Begin transaction
    await db.transaction(async (tx) => {
      // Get transaction details
      const [withdrawalTx] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.transactionId, transactionId));
      
      if (!withdrawalTx || withdrawalTx.status !== 'pending' || withdrawalTx.type !== 'WITHDRAWAL') {
        throw new Error('Invalid transaction for processing');
      }
      
      const metadata = JSON.parse(withdrawalTx.metadata?.toString() || '{}');
      const usdtAmount = metadata.usdt_amount || 0;
      
      // Get user
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, withdrawalTx.userId));
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // If rejected, return funds to user's balance
      if (status === 'rejected') {
        await tx
          .update(users)
          .set({
            walletBalanceUsdt: (user.walletBalanceUsdt || 0) + usdtAmount,
            walletPendingWithdrawals: (user.walletPendingWithdrawals || 0) - 1
          })
          .where(eq(users.id, withdrawalTx.userId));
      } else {
        // If confirmed, just update pending withdrawals count
        await tx
          .update(users)
          .set({
            walletPendingWithdrawals: (user.walletPendingWithdrawals || 0) - 1
          })
          .where(eq(users.id, withdrawalTx.userId));
        
        // Update treasury USDT balance
        await tx.execute(sql`
          UPDATE dgt_economy_parameters
          SET treasury_usdt_balance = treasury_usdt_balance - ${usdtAmount}
        `);
      }
      
      // Update transaction
      await tx
        .update(transactions)
        .set({
          status: status,
          blockchainTxId: blockchainTxId || withdrawalTx.blockchainTxId,
          confirmedAt: status === 'confirmed' ? new Date() : null,
          updatedAt: new Date(),
          metadata: JSON.stringify({
            ...metadata,
            admin_notes: adminNotes || '',
            processing_date: new Date(),
            final_status: status,
            blockchain_tx_id: blockchainTxId
          })
        })
        .where(eq(transactions.transactionId, transactionId));
    });
    
    return true;
  } catch (error) {
    logger.error("WALLET", 'Error processing withdrawal', error);
    return false;
  }
}

/**
 * Simulate a mock blockchain verification of a deposit
 * This would be replaced with actual blockchain verification in production
 */
export async function mockVerifyDeposit(
  txHash: string,
  usdtAmount: number
): Promise<{ verified: boolean; blockchainTxId: string }> {
  // This is a mock function that would be replaced with actual blockchain verification
  // In production, you would check the transaction on the blockchain
  
  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For development/testing, just return success
  return {
    verified: true,
    blockchainTxId: txHash || `MOCK-TX-${Date.now()}`
  };
}

/**
 * Check if a pending deposit exists for a transaction hash
 */
export async function findPendingDepositByHash(txHash: string): Promise<any> {
  try {
    const pendingDeposits = await db
      .select()
      .from(transactions)
      .where(
        sql`
          type = 'DEPOSIT' AND 
          status = 'pending' AND 
          blockchain_tx_id = ${txHash}
        `
      );
    
    return pendingDeposits[0] || null;
  } catch (error) {
    logger.error("WALLET", 'Error finding pending deposit', error);
    return null;
  }
}