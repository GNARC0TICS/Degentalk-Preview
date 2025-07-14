/**
 * Database Admin Routes
 *
 * Routes for database browsing, editing, and query functionality.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { asyncHandler, isAdmin } from '../../admin.middleware';
import * as databaseController from './database.controller';
import * as queryController from './query.controller';
import * as bulkController from './bulk-operations.controller';

const router: RouterType = Router();

// Apply admin middleware to all routes
router.use(isAdmin);

// Database introspection routes
router.get('/tables', asyncHandler(databaseController.getTables));
router.get('/tables/:table/schema', asyncHandler(databaseController.getTableSchema));
router.get('/tables/:table/data', asyncHandler(databaseController.getTableData));
router.get('/tables/:table/relationships', asyncHandler(databaseController.getTableRelationships));
router.get('/stats', asyncHandler(databaseController.getDatabaseStats));

// Table data manipulation routes
router.post('/tables/rows/create', asyncHandler(databaseController.createRow));
router.put('/tables/rows/update', asyncHandler(databaseController.updateRow));
router.delete('/tables/rows/delete', asyncHandler(databaseController.deleteRow));
router.post('/tables/rows/bulk', asyncHandler(databaseController.bulkOperation));

// Data export routes
router.get('/tables/:table/export/csv', asyncHandler(databaseController.exportTableCSV));

// SQL query execution routes
router.post('/query/execute', asyncHandler(queryController.executeQuery));
router.post('/query/validate', asyncHandler(queryController.validateQuery));
router.get('/query/history', asyncHandler(queryController.getQueryHistory));
router.delete('/query/history', asyncHandler(queryController.clearQueryHistory));
router.get('/query/suggestions', asyncHandler(queryController.getSuggestedQueries));
router.post('/query/export', asyncHandler(queryController.exportQueryResults));
router.get('/query/metrics', asyncHandler(queryController.getQueryMetrics));

// Bulk operations routes
router.post('/bulk/import', asyncHandler(bulkController.importCSV));
router.get('/bulk/templates/:table', asyncHandler(bulkController.getImportTemplate));
router.post('/bulk/validate', asyncHandler(bulkController.validateImportData));

export default router;
