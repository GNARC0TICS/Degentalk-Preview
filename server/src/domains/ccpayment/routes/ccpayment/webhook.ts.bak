/**
 * CCPayment Webhook API Route
 * 
 * Handles webhook notifications from CCPayment about transaction status changes
 */

import express from 'express';
import { z } from 'zod';
import { db } from '../@db';
import { transactions, users, withdrawalRequests } from '@schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../../../src/core/logger';

// TODO: Import CCPayment client for signature verification
// import { ccpaymentClient } from '../../services/ccpayment-client';

const router = express.Router();

// Define webhook payload schema
const webhookSchema = z.object({
  order_id: z.string(),
  status: z.string(),
  tx_hash: z.string().optional(),
  amount: z.string(),
  currency: z.string(),
  transaction_type: z.enum(['deposit', 'withdrawal']),
  timestamp: z.string()
});

// CCPayment webhook handler
router.post('/', async (req, res) => {
  try {
    // Extract signature and timestamp from headers
    const signature = req.headers['x-ccpayment-signature'] as string;
    const timestamp = req.headers['x-ccpayment-timestamp'] as string;
    
    if (!signature || !timestamp) {
      logger.warn('CCPayment webhook missing signature or timestamp headers');
      return res.status(401).json({ error: 'Missing authentication headers' });
    }
    
    // TODO: CCPayment Integration Point - Verify signature
    // Uncomment in actual implementation
    // const isValidSignature = ccpaymentClient.verifyWebhookSignature(
    //   req.body,
    //   signature,
    //   timestamp
    // );
    
    // if (!isValidSignature) {
    //   logger.warn('CCPayment webhook signature validation failed');
    //   return res.status(403).json({ error: 'Invalid signature' });
    // }

    // Validate webhook payload
    const validationResult = webhookSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn('CCPayment webhook invalid payload', validationResult.error);
      return res.status(400).json({ 
        error: 'Invalid webhook data',
        details: validationResult.error.format()
      });
    }

    const {
      order_id: orderId,
      status,
      tx_hash: txHash,
      amount,
      currency,
      transaction_type: transactionType
    } = validationResult.data;

    // Convert amount to number
    const numericAmount = parseFloat(amount);
    
    // Find the transaction in our database
    const transaction = await db.query.transactions.findFirst({
      where: (transactions, { eq }) => 
        eq(transactions.metadata['orderId'], orderId)
    });

    if (!transaction) {
      logger.warn(`CCPayment webhook: Transaction not found for orderId ${orderId}`);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Map CCPayment status to our status
    let newStatus = 'pending';
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        newStatus = 'completed';
        break;
      case 'processing':
        newStatus = 'processing';
        break;
      case 'failed':
      case 'rejected':
        newStatus = 'failed';
        break;
      case 'cancelled':
        newStatus = 'cancelled';
        break;
      default:
        newStatus = 'pending';
    }

    // Update transaction in database
    await db.update(transactions)
      .set({
        status: newStatus,
        blockchainTxId: txHash,
        updatedAt: new Date()
      })
      .where(eq(transactions.id, transaction.id));

    // Handle transaction type specific logic
    if (transactionType === 'deposit' && newStatus === 'completed') {
      // Credit user's account for completed deposit
      if (transaction.userId) {
        await db.update(users)
          .set({
            dgtWalletBalance: {
              increment: numericAmount
            }
          })
          .where(eq(users.id, transaction.userId));
        
        logger.info(`User ${transaction.userId} credited with ${numericAmount} DGT for deposit ${orderId}`);
      }
    } else if (transactionType === 'withdrawal') {
      // Update withdrawal request status
      await db.update(withdrawalRequests)
        .set({
          status: newStatus,
          processedAt: newStatus === 'completed' ? new Date() : undefined,
          transactionId: transaction.id
        })
        .where(
          and(
            eq(withdrawalRequests.userId, transaction.userId),
            eq(withdrawalRequests.amount, transaction.amount),
            eq(withdrawalRequests.status, 'pending')
          )
        );
      
      // If the withdrawal is completed, deduct from user's balance
      if (newStatus === 'completed' && transaction.userId) {
        await db.update(users)
          .set({
            dgtWalletBalance: {
              decrement: numericAmount
            }
          })
          .where(eq(users.id, transaction.userId));
        
        logger.info(`User ${transaction.userId} debited ${numericAmount} DGT for withdrawal ${orderId}`);
      }
    }

    // Acknowledge receipt
    return res.status(200).json({ 
      status: 'success', 
      message: 'Webhook processed successfully' 
    });
  } catch (error) {
    logger.error('Error processing CCPayment webhook:', error);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router; 