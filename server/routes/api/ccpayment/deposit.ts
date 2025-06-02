/**
 * CCPayment Deposit API Routes
 * 
 * Handles deposit creation and processing
 */

import express from 'express';
import { z } from 'zod';
import { db } from '../../../db';
import { transactions } from '@schema';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../src/core/logger';

// TODO: Import CCPayment client
// import { ccpaymentClient } from '../../services/ccpayment-client'; 

const router = express.Router();

// Create a deposit
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
      productName: z.string().optional()
    });

    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: validationResult.error.format()
      });
    }

    const { amount, currency, productName } = validationResult.data;
    const userId = req.session.user.id;
    
    // TODO: CCPayment Integration Point
    // Generate a unique order ID
    const orderId = `DEP-${userId}-${Date.now()}-${uuidv4().substring(0, 8)}`;
    
    // Record the transaction in our database as pending
    await db.insert(transactions).values({
      userId,
      amount,
      type: 'deposit',
      status: 'pending',
      metadata: {
        provider: 'ccpayment',
        orderId,
        currency
      },
      description: `Deposit of ${amount} ${currency}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // TODO: CCPayment Integration Point
    // Create the actual payment link
    // const paymentLink = await ccpaymentClient.createDepositLink({
    //   amount,
    //   currency,
    //   orderId,
    //   productName: productName || 'DGT Tokens',
    //   redirectUrl: `${process.env.FRONTEND_URL}/wallet/deposit-success?orderId=${orderId}`,
    //   notifyUrl: `${process.env.API_URL}/api/ccpayment/webhook`
    // });

    // Mock response for now
    const paymentLink = `https://pay.ccpayment.com?orderId=${orderId}`;

    return res.status(200).json({
      paymentLink,
      orderId,
      amount,
      currency
    });
  } catch (error) {
    logger.error('Error creating deposit:', error);
    return res.status(500).json({ error: 'Failed to create deposit' });
  }
});

// Check deposit status
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
          eq(transactions.type, 'deposit'),
          eq(transactions.metadata['orderId'], orderId),
          eq(transactions.userId, req.session.user.id)
        )
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Deposit not found' });
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
    logger.error('Error checking deposit status:', error);
    return res.status(500).json({ error: 'Failed to check deposit status' });
  }
});

export default router; 