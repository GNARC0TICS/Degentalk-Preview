import { userService } from '@server/src/core/services/user.service';
/**
 * Admin UI Configuration Controller
 *
 * Handles API requests for UI configuration management (quotes, collections, analytics).
 */

import type { Request, Response } from 'express';
import { uiConfigService } from './ui-config.service.ts';
import { AdminError, AdminErrorCodes } from '../../admin.errors.ts';
import { getUserId } from '../../admin.middleware.ts';
import { adminController } from '../../admin.controller.ts';
import {
	CreateQuoteSchema,
	UpdateQuoteSchema,
	QuoteFiltersSchema,
	PaginationSchema,
	CreateCollectionSchema,
	UpdateCollectionSchema,
	ReorderQuotesSchema,
	BulkQuoteOperationSchema,
	ImportQuotesSchema,
	ExportQuotesSchema,
	AnalyticsRequestSchema,
	TrackEventSchema
} from './ui-config.validators.ts';
import { validateRequestBody, validateQueryParams } from '../../admin.validation.ts';

export class UiConfigController {
	// ==================== QUOTE OPERATIONS ====================

	/**
	 * Get quotes with filtering and pagination
	 * GET /api/admin/ui-config/quotes
	 */
	async getQuotes(req: Request, res: Response) {
		try {
			const pagination = validateQueryParams(req, res, PaginationSchema);
			if (!pagination) return;
			const filters = validateQueryParams(req, res, QuoteFiltersSchema);
			if (!filters) return;

			const result = await uiConfigService.getQuotes(filters, pagination);

			res.json(result);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to fetch quotes' });
		}
	}

	/**
	 * Get a single quote by ID
	 * GET /api/admin/ui-config/quotes/:id
	 */
	async getQuoteById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new AdminError('Quote ID is required', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const quote = await uiConfigService.getQuoteById(id);
			if (!quote) {
				throw new AdminError('Quote not found', 404, AdminErrorCodes.RESOURCE_NOT_FOUND);
			}

			res.json(quote);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
			}
			res.status(500).json({ error: 'Failed to fetch quote' });
		}
	}

	/**
	 * Create a new quote
	 * POST /api/admin/ui-config/quotes
	 */
	async createQuote(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, CreateQuoteSchema);
			if (!data) return;
			const userId = userService.getUserFromRequest(req);
			const quote = await uiConfigService.createQuote(data, userId);

			// Log admin action
			await adminController.logAction(req, 'CREATE_UI_QUOTE', 'ui_quote', quote.id, data);

			res.status(201).json(quote);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to create quote' });
		}
	}

	/**
	 * Update an existing quote
	 * PUT /api/admin/ui-config/quotes/:id
	 */
	async updateQuote(req: Request, res: Response) {
		try {
			const { id } = req.params;
			// augment body with id for validation
			(req as any).body = { ...req.body, id };
			const dataUpdate = validateRequestBody(req, res, UpdateQuoteSchema);
			if (!dataUpdate) return;
			const userId = userService.getUserFromRequest(req);
			const quote = await uiConfigService.updateQuote(dataUpdate, userId);

			// Log admin action
			await adminController.logAction(req, 'UPDATE_UI_QUOTE', 'ui_quote', id, dataUpdate);

			res.json(quote);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to update quote' });
		}
	}

	/**
	 * Delete a quote
	 * DELETE /api/admin/ui-config/quotes/:id
	 */
	async deleteQuote(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new AdminError('Quote ID is required', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const success = await uiConfigService.deleteQuote(id);
			if (!success) {
				throw new AdminError('Quote not found', 404, AdminErrorCodes.RESOURCE_NOT_FOUND);
			}

			// Log admin action
			await adminController.logAction(req, 'DELETE_UI_QUOTE', 'ui_quote', id, {});

			res.status(204).send();
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
			}
			res.status(500).json({ error: 'Failed to delete quote' });
		}
	}

	/**
	 * Reorder multiple quotes
	 * POST /api/admin/ui-config/quotes/reorder
	 */
	async reorderQuotes(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, ReorderQuotesSchema);
			if (!data) return;
			const success = await uiConfigService.reorderQuotes(data);

			// Log admin action
			await adminController.logAction(req, 'REORDER_UI_QUOTES', 'ui_quote', 'multiple', {
				count: data.quoteOrders.length
			});

			res.json({ success: true });
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to reorder quotes' });
		}
	}

	// ==================== COLLECTION OPERATIONS ====================

	/**
	 * Get all collections
	 * GET /api/admin/ui-config/collections
	 */
	async getCollections(req: Request, res: Response) {
		try {
			const collections = await uiConfigService.getCollections();
			res.json(collections);
		} catch (error) {
			res.status(500).json({ error: 'Failed to fetch collections' });
		}
	}

	/**
	 * Create a new collection
	 * POST /api/admin/ui-config/collections
	 */
	async createCollection(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, CreateCollectionSchema);
			if (!data) return;
			const userId = userService.getUserFromRequest(req);
			const collection = await uiConfigService.createCollection(data, userId);

			// Log admin action
			await adminController.logAction(
				req,
				'CREATE_UI_COLLECTION',
				'ui_collection',
				collection.id,
				data
			);

			res.status(201).json(collection);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to create collection' });
		}
	}

	/**
	 * Update an existing collection
	 * PUT /api/admin/ui-config/collections/:id
	 */
	async updateCollection(req: Request, res: Response) {
		try {
			const { id } = req.params;
			// augment body with id for validation
			(req as any).body = { ...req.body, id };
			const dataUpdate = validateRequestBody(req, res, UpdateCollectionSchema);
			if (!dataUpdate) return;
			const userId = userService.getUserFromRequest(req);
			const collection = await uiConfigService.updateCollection(dataUpdate, userId);

			// Log admin action
			await adminController.logAction(req, 'UPDATE_UI_COLLECTION', 'ui_collection', id, dataUpdate);

			res.json(collection);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to update collection' });
		}
	}

	/**
	 * Delete a collection
	 * DELETE /api/admin/ui-config/collections/:id
	 */
	async deleteCollection(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new AdminError('Collection ID is required', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const success = await uiConfigService.deleteCollection(id);
			if (!success) {
				throw new AdminError('Collection not found', 404, AdminErrorCodes.RESOURCE_NOT_FOUND);
			}

			// Log admin action
			await adminController.logAction(req, 'DELETE_UI_COLLECTION', 'ui_collection', id, {});

			res.status(204).send();
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
			}
			res.status(500).json({ error: 'Failed to delete collection' });
		}
	}

	// ==================== ANALYTICS OPERATIONS ====================

	/**
	 * Track a quote event
	 * POST /api/admin/ui-config/analytics/track
	 */
	async trackEvent(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, TrackEventSchema);
			if (!data) return;
			const { quoteId, eventType, context } = data;

			await uiConfigService.trackQuoteEvent(quoteId, eventType, context);

			res.status(204).send();
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to track event' });
		}
	}

	/**
	 * Get quote analytics
	 * GET /api/admin/ui-config/analytics/quotes/:quoteId
	 */
	async getQuoteAnalytics(req: Request, res: Response) {
		try {
			const { quoteId } = req.params;
			// augment query with quoteId for validation
			(req as any).query = { ...req.query, quoteId };
			const queryAnalytics = validateQueryParams(req, res, AnalyticsRequestSchema);
			if (!queryAnalytics) return;

			const result = await uiConfigService.getQuoteAnalytics(queryAnalytics);
			res.json(result);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to fetch analytics' });
		}
	}

	// ==================== BULK OPERATIONS ====================

	/**
	 * Perform bulk operations on quotes
	 * POST /api/admin/ui-config/quotes/bulk
	 */
	async bulkUpdateQuotes(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, BulkQuoteOperationSchema);
			if (!data) return;
			const success = await uiConfigService.bulkUpdateQuotes(data);

			// Log admin action
			await adminController.logAction(req, 'BULK_UPDATE_UI_QUOTES', 'ui_quote', 'multiple', {
				action: data.action,
				count: data.quoteIds.length
			});

			res.json({ success: true });
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to perform bulk operation' });
		}
	}

	// ==================== IMPORT/EXPORT OPERATIONS ====================

	/**
	 * Import quotes from file
	 * POST /api/admin/ui-config/quotes/import
	 */
	async importQuotes(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, ImportQuotesSchema);
			if (!data) return;
			const userId = userService.getUserFromRequest(req);
			const result = await uiConfigService.importQuotes(data, userId);

			// Log admin action
			await adminController.logAction(req, 'IMPORT_UI_QUOTES', 'ui_quote', 'multiple', {
				imported: result.imported,
				skipped: result.skipped,
				total: data.quotes.length
			});

			res.json(result);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to import quotes' });
		}
	}

	/**
	 * Export quotes to file
	 * POST /api/admin/ui-config/quotes/export
	 */
	async exportQuotes(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, ExportQuotesSchema);
			if (!data) return;
			const result = await uiConfigService.exportQuotes(data);
			const format = data.format || 'json';

			// Set appropriate headers
			if (format === 'csv') {
				res.setHeader('Content-Type', 'text/csv');
				res.setHeader('Content-Disposition', 'attachment; filename="ui-quotes.csv"');
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.setHeader('Content-Disposition', 'attachment; filename="ui-quotes.json"');
			}

			// Log admin action
			await adminController.logAction(req, 'EXPORT_UI_QUOTES', 'ui_quote', 'multiple', {
				format,
				includeAnalytics: data.includeAnalytics
			});

			res.send(result);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code,
					details: error.details
				});
			}
			res.status(500).json({ error: 'Failed to export quotes' });
		}
	}
}

// Export singleton instance
export const uiConfigController = new UiConfigController();
