/**
 * Admin UI Configuration Routes
 *
 * Defines REST API endpoints for UI configuration management
 */

import { Router } from 'express';
import { uiConfigController } from './ui-config.controller';
import { asyncHandler } from '../../admin.middleware';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

// Create router instance
const router = Router();

// ==================== QUOTE ROUTES ====================

/**
 * @route GET /api/admin/ui-config/quotes
 * @desc Get quotes with filtering and pagination
 * @access Admin
 */
router.get('/quotes', asyncHandler(uiConfigController.getQuotes.bind(uiConfigController)));

/**
 * @route GET /api/admin/ui-config/quotes/:id
 * @desc Get a single quote by ID
 * @access Admin
 */
router.get('/quotes/:id', asyncHandler(uiConfigController.getQuoteById.bind(uiConfigController)));

/**
 * @route POST /api/admin/ui-config/quotes
 * @desc Create a new quote
 * @access Admin
 */
router.post('/quotes', asyncHandler(uiConfigController.createQuote.bind(uiConfigController)));

/**
 * @route PUT /api/admin/ui-config/quotes/:id
 * @desc Update an existing quote
 * @access Admin
 */
router.put('/quotes/:id', asyncHandler(uiConfigController.updateQuote.bind(uiConfigController)));

/**
 * @route DELETE /api/admin/ui-config/quotes/:id
 * @desc Delete a quote
 * @access Admin
 */
router.delete('/quotes/:id', asyncHandler(uiConfigController.deleteQuote.bind(uiConfigController)));

/**
 * @route POST /api/admin/ui-config/quotes/reorder
 * @desc Reorder multiple quotes
 * @access Admin
 */
router.post(
	'/quotes/reorder',
	asyncHandler(uiConfigController.reorderQuotes.bind(uiConfigController))
);

/**
 * @route POST /api/admin/ui-config/quotes/bulk
 * @desc Perform bulk operations on quotes
 * @access Admin
 */
router.post(
	'/quotes/bulk',
	asyncHandler(uiConfigController.bulkUpdateQuotes.bind(uiConfigController))
);

/**
 * @route POST /api/admin/ui-config/quotes/import
 * @desc Import quotes from file
 * @access Admin
 */
router.post(
	'/quotes/import',
	asyncHandler(uiConfigController.importQuotes.bind(uiConfigController))
);

/**
 * @route POST /api/admin/ui-config/quotes/export
 * @desc Export quotes to file
 * @access Admin
 */
router.post(
	'/quotes/export',
	asyncHandler(uiConfigController.exportQuotes.bind(uiConfigController))
);

// ==================== COLLECTION ROUTES ====================

/**
 * @route GET /api/admin/ui-config/collections
 * @desc Get all collections
 * @access Admin
 */
router.get(
	'/collections',
	asyncHandler(uiConfigController.getCollections.bind(uiConfigController))
);

/**
 * @route POST /api/admin/ui-config/collections
 * @desc Create a new collection
 * @access Admin
 */
router.post(
	'/collections',
	asyncHandler(uiConfigController.createCollection.bind(uiConfigController))
);

/**
 * @route PUT /api/admin/ui-config/collections/:id
 * @desc Update an existing collection
 * @access Admin
 */
router.put(
	'/collections/:id',
	asyncHandler(uiConfigController.updateCollection.bind(uiConfigController))
);

/**
 * @route DELETE /api/admin/ui-config/collections/:id
 * @desc Delete a collection
 * @access Admin
 */
router.delete(
	'/collections/:id',
	asyncHandler(uiConfigController.deleteCollection.bind(uiConfigController))
);

// ==================== ANALYTICS ROUTES ====================

/**
 * @route POST /api/admin/ui-config/analytics/track
 * @desc Track a quote event (impression, click, etc.)
 * @access Admin
 */
router.post(
	'/analytics/track',
	asyncHandler(uiConfigController.trackEvent.bind(uiConfigController))
);

/**
 * @route GET /api/admin/ui-config/analytics/quotes/:quoteId
 * @desc Get analytics for a specific quote
 * @access Admin
 */
router.get(
	'/analytics/quotes/:quoteId',
	asyncHandler(uiConfigController.getQuoteAnalytics.bind(uiConfigController))
);

// ==================== HEALTH CHECK ====================

/**
 * @route GET /api/admin/ui-config/health
 * @desc Health check endpoint for UI config service
 * @access Admin
 */
router.get('/health', (req, res) => {
	sendSuccessResponse(res, {
    		service: 'ui-config',
    		status: 'healthy',
    		timestamp: new Date().toISOString()
    	});
});

// Export the router
export default router;
