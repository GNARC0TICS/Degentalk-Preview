/**
 * CCPayment Webhook Routes
 *
 * This file defines routes for CCPayment webhook integration.
 * Unlike most API routes, webhook endpoints don't require auth.
 */

import { Router } from 'express';
import { CCPaymentWebhookController } from './ccpayment-webhook.controller';
import { asyncHandler } from '@core/errors';
import { validateRequest } from '@server/middleware/validate-request';
import { webhookValidation } from './validation/webhook.validation';

const ccPaymentWebhookController = new CCPaymentWebhookController();

// Create router
const router = Router();

/**
 * @route POST /api/webhook/ccpayment
 * @desc CCPayment webhook endpoint for event notifications
 * @access Public (no auth - HMAC signature verification instead)
 */
router.post(
	'/ccpayment',
	validateRequest(webhookValidation.ccpaymentWebhook),
	asyncHandler(ccPaymentWebhookController.handleWebhook.bind(ccPaymentWebhookController))
);

export default router;
