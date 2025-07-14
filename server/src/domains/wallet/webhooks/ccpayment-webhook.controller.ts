/**
 * CCPayment Webhook Controller (v2)
 *
 * This controller is the entry point for all incoming webhook requests from CCPayment.
 * It is configured to use a raw body parser, as the raw payload is required for
 * accurate signature verification.
 */

import type { Request, Response } from 'express';
import { logger } from '@core/logger';
import { ccpaymentWebhookService } from './ccpayment-webhook.service';
import { sendSuccessResponse } from '@core/utils/transformer.helpers';

export class CCPaymentWebhookController {
	/**
	 * Handles the raw POST request from CCPayment.
	 * @param req Express request object, with `req.rawBody` attached by middleware.
	 * @param res Express response object.
	 */
	async handleWebhook(req: Request, res: Response): Promise<void> {
		// The raw body is essential for signature verification.
		// This requires `express.raw({ type: 'application/json' })` middleware to be set up for this route.
		const rawPayload = (req as any).rawBody;

		if (!rawPayload) {
			logger.error('CCPaymentWebhookController', 'Raw body missing from request. Ensure raw body parser is configured for this route.');
			// Still send a 200 to prevent CCPayment from retrying on a configuration error.
			res.status(200).send('Error: Missing raw body');
			return;
		}

		const headers = {
			appid: req.header('Appid'),
			sign: req.header('Sign'),
			timestamp: req.header('Timestamp'),
		};

		logger.info('CCPaymentWebhookController', 'Received webhook, beginning processing.', { headers });

		// Acknowledge the webhook immediately to prevent CCPayment from retrying.
		// The actual processing will happen asynchronously.
		sendSuccessResponse(res, { message: 'Webhook received' });

		// Process the webhook in the background.
		// We don't await this call because we've already sent the response.
		ccpaymentWebhookService.processWebhook(rawPayload.toString('utf-8'), headers)
			.then(result => {
				if (result.success) {
					logger.info('CCPaymentWebhookController', 'Webhook processed successfully.', { result });
				} else {
					logger.warn('CCPaymentWebhookController', 'Webhook processing failed.', { result });
				}
			})
			.catch(error => {
				logger.error('CCPaymentWebhookController', 'Unhandled exception during webhook processing.', { error });
			});
	}
}

export const ccpaymentWebhookController = new CCPaymentWebhookController();