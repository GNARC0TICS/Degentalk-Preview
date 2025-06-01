/**
 * CCPayment Withdrawal API Routes
 * 
 * Handles withdrawal requests and processing
 */

import express from 'express';
import { z } from 'zod';
import { db } from '../../../db';
import { transactions, withdrawalRequests } from '@db/schema';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../src/core/logger';

// TODO: Import CCPayment client
// import { ccpaymentClient } from '../../services/ccpayment-client';

const router = express.Router();

// Create a withdrawal request
router.post('/', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const schema = z.object({
      amount: z.number().positive(),
      currency: z.string().min(1).max(10),
      address: z.string().min(10).max(255)
    });

    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.format()
      });
    }

    const { amount, currency, address } = validationResult.data;
    const userId = req.session.user.id;
    
    // TODO: CCPayment Integration Point
    // Generate a unique order ID
    const orderId = `WD-${userId}-${Date.now()}-${uuidv4().substring(0, 8)}`;
    
    // Check user balance
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      columns: {
        id: true,
        dgtWalletBalance: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate balance (assuming conversion from DGT to requested currency)
    if (user.dgtWalletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal request record
    await db.insert(withdrawalRequests).values({
      userId,
      amount,
      currency,
      status: 'pending',
      walletAddress: address,
      requestedAt: new Date()
    });

    // Record the transaction in our database as pending
    await db.insert(transactions).values({
      userId,
      amount,
      type: 'withdrawal',
      status: 'pending',
      toWalletAddress: address,
      metadata: {
        provider: 'ccpayment',
        orderId,
        currency
      },
      description: `Withdrawal of ${amount} ${currency}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // TODO: CCPayment Integration Point
    // Actually initiate the withdrawal
    // const withdrawalId = await ccpaymentClient.requestWithdrawal({
    //   amount,
    //   currency,
    //   orderId,
    //   address,
    //   notifyUrl: `${process.env.API_URL}/api/ccpayment/webhook`
    // });

    // For now, return a mock response
    const withdrawalId = `wd_${Date.now()}`;

    return res.status(200).json({
      withdrawalId,
      orderId,
      amount,
      currency,
      address,
      status: 'pending'
    });
  } catch (error) {
    logger.error('Error creating withdrawal:', error);
    return res.status(500).json({ error: 'Failed to create withdrawal' });
  }
});

// Check withdrawal status
router.get('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if user is authenticated
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get transaction from database
    const transaction = await db.query.transactions.findFirst({
      where: (transactions, { eq, and }) => 
        and(
          eq(transactions.type, 'withdrawal'),
          eq(transactions.metadata['orderId'], orderId),
          eq(transactions.userId, req.session.user.id)
        )
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    // TODO: CCPayment Integration Point
    // In the real implementation, we would check with CCPayment
    // const status = await ccpaymentClient.getTransactionStatus(orderId);
    
    return res.status(200).json({
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      transactionHash: transaction.blockchainTxId
    });
  } catch (error) {
    logger.error('Error checking withdrawal status:', error);
    return res.status(500).json({ error: 'Failed to check withdrawal status' });
  }
});

export default router; 