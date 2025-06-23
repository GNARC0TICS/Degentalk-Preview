/**
 * Category Routes
 *
 * QUALITY IMPROVEMENT: Extracted from forum.routes.ts god object
 * Handles category-specific API endpoints with proper separation of concerns
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { forumService } from '../forum.service';
import { logger } from '@server/src/core/logger';

const router = Router();

// Get forum structure
router.get('/structure', async (req: Request, res: Response) => {
	try {
		const structure = await forumService.getForumStructure();

		res.json({
			success: true,
			data: structure
		});
	} catch (error) {
		logger.error('CategoryRoutes', 'Error in GET /structure', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch forum structure'
		});
	}
});

// Get categories list
router.get('/', async (req: Request, res: Response) => {
	try {
		const includeStats = req.query.includeStats !== 'false';
		const categories = await categoryService.getCategoriesWithStats();

		res.json({
			success: true,
			data: categories
		});
	} catch (error) {
		logger.error('CategoryRoutes', 'Error in GET /categories', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch categories'
		});
	}
});

// Get categories tree
router.get('/tree', async (req: Request, res: Response) => {
	try {
		const includeHidden = req.query.includeHidden === 'true';
		const includeEmptyStats = req.query.includeEmptyStats === 'true';

		const tree = await categoryService.getCategoriesTree({
			includeHidden,
			includeEmptyStats
		});

		res.json({
			success: true,
			data: tree
		});
	} catch (error) {
		logger.error('CategoryRoutes', 'Error in GET /categories/tree', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch categories tree'
		});
	}
});

// Get category by slug
router.get('/slug/:slug', async (req: Request, res: Response) => {
	try {
		const slug = req.params.slug;
		const category = await categoryService.getCategoryBySlug(slug);

		if (!category) {
			return res.status(404).json({
				success: false,
				error: 'Category not found'
			});
		}

		res.json({
			success: true,
			data: category
		});
	} catch (error) {
		logger.error('CategoryRoutes', 'Error in GET /categories/slug/:slug', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch category'
		});
	}
});

// Get category statistics
router.get('/:id/stats', async (req: Request, res: Response) => {
	try {
		const categoryId = parseInt(req.params.id);
		const stats = await categoryService.getCategoryStats(categoryId);

		res.json({
			success: true,
			data: stats
		});
	} catch (error) {
		logger.error('CategoryRoutes', 'Error in GET /categories/:id/stats', { error });
		res.status(500).json({
			success: false,
			error: 'Failed to fetch category statistics'
		});
	}
});

export default router;
