/**
 * Treasury Routes
 * 
 * Defines API routes for treasury operations including balance management,
 * adjustments, and settings.
 */

import { Router, Request, Response } from 'express';
import { db } from '../../../db';
import { sql } from 'drizzle-orm';
import { users, transactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAdmin } from '../auth/middleware/auth.middleware';
import { getUserId } from '../auth/services/auth.service';

/**
 * Format DGT amount from storage format (BIGINT with 6 decimal precision) to display format
 */
function formatDgtAmount(amount: number | bigint): number {
  return Number(amount) / 1000000;
}

/**
 * Parse DGT amount from display format to storage format
 */
function parseDgtAmount(displayAmount: number): number {
  return Math.round(displayAmount * 1000000);
}

/**
 * Helper function to adjust treasury balance (used by both /adjust and /adjust-usdt endpoints)
 */
async function adjustTreasuryBalance(req: Request, res: Response, params: {
  amount: number;
  type: string;
  reason?: string;
  currency: string;
}): Promise<Response> {
  try {
    const adminId = getUserId(req);
    const { amount, type, reason, currency } = params;
    
    if (!amount || !type || !currency) {
      return res.status(400).json({ 
        message: "Required fields: amount, type (credit/debit), currency (DGT/USDT)" 
      });
    }
    
    if (type !== 'credit' && type !== 'debit') {
      return res.status(400).json({ 
        message: "Type must be 'credit' or 'debit'" 
      });
    }
    
    if (currency !== 'DGT' && currency !== 'USDT') {
      return res.status(400).json({ 
        message: "Currency must be 'DGT' or 'USDT'" 
      });
    }
    
    // Validate amount
    const amountNumeric = parseFloat(amount.toString());
    if (isNaN(amountNumeric) || amountNumeric <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }
    
    // Begin transaction
    await db.transaction(async (tx) => {
      // Fetch current treasury settings
      const treasuryResult = await tx.execute(sql`
        SELECT treasury_usdt_balance, dgt_treasury_balance FROM treasury_settings LIMIT 1
      `);
      
      if (treasuryResult.rows.length === 0) {
        throw new Error("Treasury settings not found");
      }
      
      const treasurySettings = treasuryResult.rows[0];
      
      // Calculate new balance based on currency
      let newBalance: number;
      let previousBalance: number;
      let dbField: string;
      let amountToAdjust: number;
      
      if (currency === 'USDT') {
        previousBalance = Number(treasurySettings.treasury_usdt_balance) || 0;
        dbField = 'treasury_usdt_balance';
        amountToAdjust = amountNumeric;
      } else { // DGT
        previousBalance = Number(treasurySettings.dgt_treasury_balance) || 0;
        dbField = 'dgt_treasury_balance';
        amountToAdjust = parseDgtAmount(amountNumeric);
      }
      
      if (type === 'credit') {
        newBalance = previousBalance + amountToAdjust;
      } else { // debit
        if (previousBalance < amountToAdjust) {
          throw new Error(`Insufficient treasury ${currency} balance`);
        }
        newBalance = previousBalance - amountToAdjust;
      }
      
      // Update treasury balance using standard SQL for improved parameter safety
      if (dbField === 'treasury_usdt_balance') {
        await tx.execute(sql`
          UPDATE treasury_settings
          SET treasury_usdt_balance = ${newBalance}, 
              updated_at = NOW(),
              updated_by = ${adminId}
          WHERE setting_id = 1
        `);
      } else {
        await tx.execute(sql`
          UPDATE treasury_settings
          SET dgt_treasury_balance = ${newBalance}, 
              updated_at = NOW(),
              updated_by = ${adminId}
          WHERE setting_id = 1
        `);
      }
      
      // Create transaction record
      const transactionResult = await tx.execute(sql`
        INSERT INTO transactions (
          user_id,
          amount,
          type,
          status,
          description,
          metadata,
          is_treasury_transaction,
          currency_type,
          created_at,
          updated_at,
          confirmed_at
        ) VALUES (
          ${adminId},
          ${amountToAdjust},
          ${'TREASURY_ADJUST'},
          ${'confirmed'},
          ${type === 'credit' ? `Treasury ${currency} Credit: ${reason || 'No reason provided'}` : `Treasury ${currency} Debit: ${reason || 'No reason provided'}`},
          ${JSON.stringify({
            adjustment_type: type,
            reason: reason || 'No reason provided',
            currency,
            display_amount: amountNumeric // Store original display amount for DGT
          })},
          ${true},
          ${currency},
          NOW(),
          NOW(),
          NOW()
        ) RETURNING transaction_id
      `);
      
      // Create admin audit log
      await tx.execute(sql`
        INSERT INTO admin_audit_logs (
          user_id,
          action,
          entity_type,
          entity_id,
          details,
          created_at,
          ip_address
        ) VALUES (
          ${adminId},
          ${`TREASURY_${currency}_${type.toUpperCase()}`},
          ${'treasury_settings'},
          ${1},
          ${JSON.stringify({
            amount: currency === 'DGT' ? amountNumeric : amountToAdjust, // Display amount for DGT
            previous_balance: currency === 'DGT' ? formatDgtAmount(previousBalance) : previousBalance,
            new_balance: currency === 'DGT' ? formatDgtAmount(newBalance) : newBalance,
            reason
          })},
          NOW(),
          ${req.ip || '127.0.0.1'}
        )
      `);
    });
    
    return res.status(200).json({
      success: true,
      message: `Successfully ${type === 'credit' ? 'credited' : 'debited'} ${amountNumeric} ${currency} to treasury`
    });
  } catch (error: any) {
    console.error('Error adjusting treasury balance:', error);
    
    if (error.message && (error.message.includes("Insufficient treasury") || 
        error.message === "Treasury settings not found")) {
      return res.status(400).json({ message: error.message });
    }
    
    return res.status(500).json({ message: "Internal server error" });
  }
}

const router = Router();

// Get treasury overview (admin only)
router.get('/overview', isAdmin, async (req: Request, res: Response) => {
  try {
    // Get treasury settings
    const treasuryResult = await db.execute(sql`
      SELECT 
        dgt_treasury_balance as "dgtTreasuryBalance",
        treasury_usdt_balance as "treasuryUsdtBalance",
        treasury_wallet_address as "treasuryWalletAddress",
        min_withdrawal_amount as "minWithdrawalAmount",
        withdrawal_fee_percent as "withdrawalFeePercent",
        dgt_usdt_exchange_rate as "dgtUsdtExchangeRate",
        updated_at as "lastUpdated"
      FROM treasury_settings
      LIMIT 1
    `);
    
    const treasurySettings = treasuryResult.rows[0];

    if (!treasurySettings) {
      return res.status(404).json({ message: "Treasury settings not found" });
    }

    // Get total circulating supply
    const supplyResult = await db.execute(sql`
      SELECT SUM(dgt_wallet_balance) as "circulatingSupply"
      FROM users
    `);
    
    const circulatingSupply = formatDgtAmount(Number(supplyResult.rows[0].circulatingSupply) || 0);
    
    // Get active wallet stats
    const walletStats = await db.execute(sql`
      SELECT 
        COUNT(*) as "activeWallets",
        COUNT(CASE WHEN wallet_address IS NOT NULL AND is_deleted = false THEN 1 ELSE NULL END) as "totalWalletCount",
        0 as "pendingWithdrawalCount",
        0 as "pendingWithdrawalTotal"
      FROM users
    `);
    
    // Get daily transaction volume - for now, just get the total with mock split
    const transactionVolumeResult = await db.execute(sql`
      SELECT 
        COALESCE(SUM(amount::numeric), 0) as "totalVolume",
        COUNT(*) as "transactionCount"
      FROM transactions
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND status = 'confirmed'
    `);
    
    // Simplify and split the volume temporarily until schema update
    const totalVolume = Number(transactionVolumeResult.rows[0].totalVolume) || 0;
    const mockDgtVolume = totalVolume * 0.7; // 70% DGT
    const mockUsdtVolume = totalVolume * 0.3; // 30% USDT
    
    // Get recent treasury transactions
    const recentTransactions = await db.execute(sql`
      SELECT
        transaction_id,
        type,
        amount,
        status,
        description,
        metadata,
        created_at,
        user_id
      FROM transactions
      WHERE is_treasury_transaction = true
      ORDER BY created_at DESC
      LIMIT 15
    `);

    // Format transactions for display
    const formattedTransactions = recentTransactions.rows.map((tx: any) => {
      let meta = {};
      let currency = 'DGT'; // Default
      
      try {
        // Handle different formats of metadata
        if (tx.metadata) {
          if (typeof tx.metadata === 'string') {
            meta = JSON.parse(tx.metadata);
            if (meta.currency) {
              currency = meta.currency;
            }
          } else if (typeof tx.metadata === 'object') {
            meta = tx.metadata;
            if (meta.currency) {
              currency = meta.currency;
            }
          }
        }
      } catch (e) {
        console.warn('Error parsing transaction metadata:', e);
      }
      
      // Use DGT formatting for DGT, regular for USDT
      const formattedAmount = currency === 'USDT' ? 
        Number(tx.amount) : 
        formatDgtAmount(Number(tx.amount));
        
      return {
        id: tx.transaction_id,
        type: tx.type,
        amount: formattedAmount,
        status: tx.status,
        created_at: tx.created_at,
        description: tx.description,
        currency,
        user_id: tx.user_id,
        meta
      };
    });

    // Calculate DGT supply stats
    const totalSupply = 1000000000; // 1 billion DGT fixed supply
    const treasuryBalance = formatDgtAmount(treasurySettings.dgtTreasuryBalance);
    const dailyDgtVolume = formatDgtAmount(mockDgtVolume);
    
    return res.status(200).json({
      // Treasury balances
      treasury_balance: treasuryBalance,
      treasury_balance_usdt: Number(treasurySettings.treasuryUsdtBalance) || 0,
      treasury_wallet_address: treasurySettings.treasuryWalletAddress,
      
      // Supply statistics
      circulating_supply: circulatingSupply,
      total_supply: totalSupply,
      percent_circulating: ((circulatingSupply / totalSupply) * 100).toFixed(2),
      
      // Settings
      min_withdrawal_amount: formatDgtAmount(treasurySettings.minWithdrawalAmount),
      withdrawal_fee_percent: treasurySettings.withdrawalFeePercent,
      dgt_usdt_exchange_rate: treasurySettings.dgtUsdtExchangeRate || 1,
      last_updated: treasurySettings.lastUpdated,
      
      // Wallet statistics
      active_wallets: Number(walletStats.rows[0].activeWallets) || 0,
      pending_withdrawal_count: Number(walletStats.rows[0].pendingWithdrawalCount) || 0,
      pending_withdrawal_total: Number(walletStats.rows[0].pendingWithdrawalTotal) || 0,
      
      // Transaction volume
      daily_dgt_volume: dailyDgtVolume,
      daily_usdt_volume: mockUsdtVolume,
      daily_transaction_count: Number(transactionVolumeResult.rows[0].transactionCount) || 0,
      
      // Recent activity
      recent_transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Error fetching treasury overview:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Adjust user DGT balance (admin only)
router.post('/adjust-balance', isAdmin, async (req: Request, res: Response) => {
  try {
    const adminId = getUserId(req);
    const { user_id, amount, type, reason } = req.body;
    
    if (!user_id || !amount || !type) {
      return res.status(400).json({ 
        message: "Required fields: user_id, amount, type (credit/debit)" 
      });
    }
    
    if (type !== 'credit' && type !== 'debit') {
      return res.status(400).json({ 
        message: "Type must be 'credit' or 'debit'" 
      });
    }
    
    // Check if user exists
    const userCheck = await db.execute(sql`
      SELECT user_id, username, dgt_wallet_balance 
      FROM users 
      WHERE user_id = ${user_id}
    `);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = userCheck.rows[0];
    const dgtAmountInStorage = parseDgtAmount(amount);
    
    // Begin transaction
    await db.transaction(async (tx) => {
      // Update user's DGT balance
      if (type === 'credit') {
        await tx.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance + ${dgtAmountInStorage}
          WHERE user_id = ${user_id}
        `);
        
        // Reduce from treasury
        await tx.execute(sql`
          UPDATE treasury_settings
          SET dgt_treasury_balance = dgt_treasury_balance - ${dgtAmountInStorage}
        `);
      } else {
        // Check if user has enough balance for debit
        if (Number(user.dgt_wallet_balance) < dgtAmountInStorage) {
          throw new Error("Insufficient user balance");
        }
        
        await tx.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance - ${dgtAmountInStorage}
          WHERE user_id = ${user_id}
        `);
        
        // Add to treasury
        await tx.execute(sql`
          UPDATE treasury_settings
          SET dgt_treasury_balance = dgt_treasury_balance + ${dgtAmountInStorage}
        `);
      }
      
      // Create transaction record
      const transactionResult = await tx.execute(sql`
        INSERT INTO transactions (
          user_id,
          amount,
          type,
          status,
          description,
          metadata,
          is_treasury_transaction,
          created_at,
          updated_at
        ) VALUES (
          ${user_id},
          ${dgtAmountInStorage},
          ${'ADMIN_ADJUST'},
          ${'confirmed'},
          ${type === 'credit' ? `Admin Credit: ${reason || 'No reason provided'}` : `Admin Debit: ${reason || 'No reason provided'}`},
          ${JSON.stringify({
            adjusted_by: adminId,
            adjustment_type: type,
            reason: reason || 'No reason provided',
            display_amount: amount
          })},
          ${true},
          NOW(),
          NOW()
        ) RETURNING *
      `);
      
      // Create admin audit log
      await tx.execute(sql`
        INSERT INTO admin_audit_logs (
          user_id,
          action,
          entity_type,
          entity_id,
          details,
          created_at,
          ip_address
        ) VALUES (
          ${adminId},
          ${type === 'credit' ? 'TREASURY_CREDIT' : 'TREASURY_DEBIT'},
          ${'user'},
          ${user_id},
          ${JSON.stringify({
            amount,
            username: user.username,
            reason,
            transaction_id: transactionResult.rows[0].transaction_id
          })},
          NOW(),
          ${req.ip || '127.0.0.1'}
        )
      `);
    });
    
    return res.status(200).json({
      success: true,
      message: `Successfully ${type === 'credit' ? 'credited' : 'debited'} ${amount} DGT to user ID ${user_id}`,
      user_id,
      amount,
      type
    });
  } catch (error) {
    console.error('Error adjusting balance:', error);
    
    if (error.message === "Insufficient user balance") {
      return res.status(400).json({ message: "Insufficient user balance for debit operation" });
    }
    
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Adjust treasury balance (admin only)
router.post('/adjust', isAdmin, async (req: Request, res: Response) => {
  const { amount, type, reason, currency } = req.body;
  return await adjustTreasuryBalance(req, res, { amount, type, reason, currency });
});

// Update treasury settings (admin only)
router.put('/settings', isAdmin, async (req: Request, res: Response) => {
  try {
    const adminId = getUserId(req);
    const { 
      min_withdrawal_amount, 
      withdrawal_fee_percent,
      dgt_usdt_exchange_rate
    } = req.body;
    
    const updates = [];
    const updateValues = {};
    
    // Check if any valid updates were provided
    if (min_withdrawal_amount === undefined && 
        withdrawal_fee_percent === undefined && 
        dgt_usdt_exchange_rate === undefined) {
      return res.status(400).json({ message: "No valid updates provided" });
    }
    
    // Build update query directly with parameters
    let query = sql`UPDATE treasury_settings SET `;
    let updateParts = [];
    
    if (min_withdrawal_amount !== undefined) {
      updateParts.push(sql`min_withdrawal_amount = ${parseDgtAmount(min_withdrawal_amount)}`);
    }
    
    if (withdrawal_fee_percent !== undefined) {
      updateParts.push(sql`withdrawal_fee_percent = ${withdrawal_fee_percent}`);
    }
    
    if (dgt_usdt_exchange_rate !== undefined) {
      updateParts.push(sql`dgt_usdt_exchange_rate = ${dgt_usdt_exchange_rate}`);
    }
    
    // Add updated_at and updated_by fields
    updateParts.push(sql`updated_at = NOW()`);
    updateParts.push(sql`updated_by = ${adminId}`);
    
    // Combine all update parts with commas
    let updateStr = updateParts[0];
    for (let i = 1; i < updateParts.length; i++) {
      updateStr = sql`${updateStr}, ${updateParts[i]}`;
    }
    
    // Complete the query
    query = sql`${query} ${updateStr} WHERE setting_id = 1`;
    
    // Execute the update
    await db.execute(query);
    
    // Log admin action
    await db.execute(sql`
      INSERT INTO admin_audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at,
        ip_address
      ) VALUES (
        ${adminId},
        ${'UPDATE_TREASURY_SETTINGS'},
        ${'treasury_settings'},
        ${1},
        ${JSON.stringify(req.body)},
        NOW(),
        ${req.ip || '127.0.0.1'}
      )
    `);
    
    return res.status(200).json({
      success: true,
      message: "Treasury settings updated successfully"
    });
  } catch (error) {
    console.error('Error updating treasury settings:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Adjust treasury USDT balance (admin only) - Legacy endpoint for backward compatibility
router.post('/adjust-usdt', isAdmin, async (req: Request, res: Response) => {
  try {
    // Modify the request to use the new unified endpoint format
    const { amount, type, reason } = req.body;
    
    // Use the same logic as the main adjust endpoint
    return await adjustTreasuryBalance(req, res, {
      amount,
      type,
      reason,
      currency: 'USDT'
    });
  } catch (error) {
    console.error('Error in adjust-usdt endpoint:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 