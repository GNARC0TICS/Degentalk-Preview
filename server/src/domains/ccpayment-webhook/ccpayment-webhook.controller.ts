/**
 * CCPayment Webhook Controller
 * 
 * This controller handles webhook requests from CCPayment.
 * It verifies the webhook signature and passes verified events to the service.
 */

import { Request, Response } from 'express';
import { logger } from '../../core/logger';
import { ccpaymentService } from '../wallet/ccpayment.service';
import { ccpaymentWebhookService } from './ccpayment-webhook.service';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../core/errors';
import crypto from 'crypto';

/**
 * CCPayment webhook controller
 */
export class CCPaymentWebhookController {
  /**
   * Handle webhook POST request from CCPayment
   * @param req Express request
   * @param res Express response
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Received CCPayment webhook', {
        headers: {
          signature: req.header('X-Signature') ? 'present' : 'missing',
          timestamp: req.header('X-Timestamp') || 'missing',
          appId: req.header('X-App-Id') || 'missing'
        }
      });
      
      // Extract signature headers
      const signature = req.header('X-Signature');
      const timestamp = req.header('X-Timestamp');
      const appId = req.header('X-App-Id');
      
      // Verify required headers are present
      if (!signature || !timestamp || !appId) {
        logger.warn('Missing required webhook headers');
        res.status(400).json({
          success: false,
          message: 'Missing required webhook headers'
        });
        return;
      }
      
      // Verify webhook signature
      const isValid = ccpaymentService.verifyWebhookSignature(
        req.body,
        signature,
        timestamp
      );
      
      if (!isValid) {
        logger.warn('Invalid webhook signature');
        res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
        return;
      }
      
      // Process the webhook event
      const webhookEvent = req.body;
      
      // Log the webhook event
      logger.info('Processing verified webhook event', {
        eventType: webhookEvent.eventType,
        orderId: webhookEvent.orderId,
        merchantOrderId: webhookEvent.merchantOrderId,
        status: webhookEvent.status
      });
      
      // Process the event (asynchronously, but don't wait for completion)
      // This allows us to respond quickly to CCPayment while processing in the background
      const processPromise = ccpaymentWebhookService.processWebhookEvent(webhookEvent);
      
      // Immediately respond to the webhook
      res.status(200).json({
        success: true,
        message: 'Webhook received and validated'
      });
      
      // Wait for processing to complete (for logging purposes)
      const result = await processPromise;
      logger.info('Webhook processing completed', result);
    } catch (error) {
      logger.error('Error handling webhook', error);
      
      // Still respond with 200 to CCPayment to prevent retries
      // CCPayment expects 200 OK even if processing fails
      res.status(200).json({
        success: false,
        message: 'Webhook received but processing failed'
      });
    }
  }
}

// Export a singleton instance
export const ccpaymentWebhookController = new CCPaymentWebhookController(); 