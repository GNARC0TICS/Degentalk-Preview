/**
 * Forum Structure Routes
 *
 * Modern API endpoints for forum structure operations.
 * Replaces the old category routes with clearer terminology.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { forumStructureService } from '../services/structure.service';
import { forumService } from '../forum.service';
import { logger } from '@server/src/core/logger';

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

router.get('/structure', async (req: Request, res: Response) => {
	try {
		// Fetch all structures with statistics in a single query
		const allStructures = await forumStructureService.getStructuresWithStats();

		// Separate into zones and forums for the flat client payload
		const zones = allStructures.filter((s) => s.type === 'zone');
		const forums = allStructures.filter((s) => s.type === 'forum');

		res.json({ zones, forums });
	} catch (error) {
		logger.error('StructureRoutes', 'Error in GET /structure', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch forum structure'
		});
	}
});

// Alternative endpoint name for clarity
router.get('/hierarchy', async (req: Request, res: Response) => {
	try {
		const hierarchy = await forumStructureService.getForumHierarchy();
		res.json(hierarchy);
	} catch (error) {
		logger.error('StructureRoutes', 'Error in GET /hierarchy', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch forum hierarchy'
		});
	}
});

// Get structures list
router.get('/', async (req: Request, res: Response) => {
	try {
		const includeStats = req.query.includeStats !== 'false';
		const structures = await forumStructureService.getStructuresWithStats();

		res.json({
			success: true,
			data: structures
		});
	} catch (error) {
		logger.error('StructureRoutes', 'Error in GET /structures', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch forum structures'
		});
	}
});

// Get structure tree
router.get('/tree', async (req: Request, res: Response) => {
	try {
		const includeHidden = req.query.includeHidden === 'true';
		const includeEmptyStats = req.query.includeEmptyStats === 'true';

		const tree = await forumStructureService.getStructureTree({
			includeHidden,
			includeEmptyStats
		});

		res.json({
			success: true,
			data: tree
		});
	} catch (error) {
		logger.error('StructureRoutes', 'Error in GET /structure/tree', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch structure tree'
		});
	}
});

// Get structure by slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
	try {
		const slug = req.params.slug;
		const structure = await forumStructureService.getStructureBySlug(slug);

		if (!structure) {
			return res.status(404).json({
				success: false,
				error: 'Forum structure not found'
			});
		}

		res.json({
			success: true,
			data: structure
		});
	} catch (error) {
		logger.error('StructureRoutes', 'Error in GET /structure/slug/:slug', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch forum structure'
		});
	}
});

// Get structure statistics
router.get('/:id/stats', async (req: Request, res: Response) => {
	try {
		const structureId = parseInt(req.params.id);
		const stats = await forumStructureService.getStructureStats(structureId);

		res.json({
			success: true,
			data: stats
		});
	} catch (error) {
		logger.error('StructureRoutes', 'Error in GET /structure/:id/stats', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch structure statistics'
		});
	}
});

export default router;
