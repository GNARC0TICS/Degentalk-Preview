/**
 * Forum Structure Routes
 *
 * Modern API endpoints for forum structure operations.
 * Replaces the old category routes with clearer terminology.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { forumStructureService } from '../services/structure.service';
import { logger } from '@server/src/core/logger';
import { asyncHandler } from '@server/src/core/errors';
import { ForumTransformer } from '../transformers/forum.transformer';
import { 
	sendSuccessResponse,
	sendErrorResponse
} from '@server/src/core/utils/transformer.helpers';

const router = Router();

// -------------------------------------------------------------
// FLAT STRUCTURE ENDPOINT  ✨
//
// `categories` layer has been deprecated.  The frontend now expects a
// flat payload of the form `{ zones: ZoneEntity[], forums: ForumEntity[] }`.
// We derive this directly from `getStructuresWithStats()` and split on the
// `type` field.  The previous nested hierarchy response is still available
// via `/hierarchy` for legacy consumers.
// -------------------------------------------------------------

router.get(
	'/structure',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			// Fetch all structures with statistics in a single query
			const allStructures = await forumStructureService.getStructuresWithStats();

			// Separate into zones and forums for the flat client payload
			const zones = allStructures.filter((s) => s.type === 'zone');
			const forums = allStructures.filter((s) => s.type === 'forum');

			sendSuccessResponse(res, {
				zones: zones.map(z => ForumTransformer.toPublicForumStructure(z)), 
				forums: forums.map(f => ForumTransformer.toPublicForumStructure(f)) 
			});
		} catch (error) {
			logger.error('StructureRoutes', 'Error in GET /structure', { error });
			return sendErrorResponse(res, 'Failed to fetch forum structure', 500);
		}
	})
);

// Alternative endpoint name for clarity
router.get(
	'/hierarchy',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const hierarchy = await forumStructureService.getForumHierarchy();
			const transformedHierarchy = Array.isArray(hierarchy) 
				? hierarchy.map(item => ForumTransformer.toPublicForumStructure(item))
				: ForumTransformer.toPublicForumStructure(hierarchy);
			sendSuccessResponse(res, transformedHierarchy);
		} catch (error) {
			logger.error('StructureRoutes', 'Error in GET /hierarchy', { error });
			return sendErrorResponse(res, 'Failed to fetch forum hierarchy', 500);
		}
	})
);

// Get structures list
router.get(
	'/',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const includeStats = req.query.includeStats !== 'false';
			const structures = await forumStructureService.getStructuresWithStats();

			sendSuccessResponse(res, structures.map(s => ForumTransformer.toPublicForumStructure(s)));
		} catch (error) {
			logger.error('StructureRoutes', 'Error in GET /structures', { error });
			return sendErrorResponse(res, 'Failed to fetch forum structures', 500);
		}
	})
);

// Get structure tree
router.get(
	'/tree',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const includeHidden = req.query.includeHidden === 'true';
			const includeEmptyStats = req.query.includeEmptyStats === 'true';

			const tree = await forumStructureService.getStructureTree({
				includeHidden,
				includeEmptyStats
			});

			sendSuccessResponse(res, Array.isArray(tree) 
				? tree.map(item => ForumTransformer.toPublicForumStructure(item))
				: ForumTransformer.toPublicForumStructure(tree));
		} catch (error) {
			logger.error('StructureRoutes', 'Error in GET /structure/tree', { error });
			return sendErrorResponse(res, 'Failed to fetch structure tree', 500);
		}
	})
);

// Get structure by slug
router.get(
	'/slug/:slug',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const slug = req.params.slug;
			const structure = await forumStructureService.getStructureBySlug(slug);

			if (!structure) {
				return sendErrorResponse(res, 'Forum structure not found', 404);
			}

			sendSuccessResponse(res, ForumTransformer.toPublicForumStructure(structure));
		} catch (error) {
			logger.error('StructureRoutes', 'Error in GET /structure/slug/:slug', { error });
			return sendErrorResponse(res, 'Failed to fetch forum structure', 500);
		}
	})
);

// Get structure statistics
router.get(
	'/:id/stats',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const structureId = req.params.id; // Note: Consider adding StructureId type if needed
			const stats = await forumStructureService.getStructureStats(structureId);

			sendSuccessResponse(res, stats);
		} catch (error) {
			logger.error('StructureRoutes', 'Error in GET /structure/:id/stats', { error });
			return sendErrorResponse(res, 'Failed to fetch structure statistics', 500);
		}
	})
);

export default router;
