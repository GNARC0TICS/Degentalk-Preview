/**
 * Editor Routes
 *
 * Defines API routes for editor functionality including Giphy integration.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';
import { isAuthenticated } from '@server/domains/auth/middleware/auth.middleware';
import { db } from '@core/db';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

/**
 * Initialize editor routes
 */
const router = Router();

// Check if Giphy is enabled
// sendErrorResponse(res, 'Server error', 500);

// Get trending GIFs
router.get('/giphy-trending', async (req: Request, res: Response) => {
	try {
		const settings = await db.query.siteSettings.findMany();

		// Find giphy settings
		const giphyApiKey = process.env.GIPHY_API_KEY;
		const giphyEnabled = settings.find((s) => s.key === 'giphy_enabled')?.value === 'true';

		// If not enabled or no API key, return error
		if (!giphyEnabled || !giphyApiKey) {
			return sendErrorResponse(res, 'Giphy integration is not enabled', 403);
		}

		// Get limit and rating from settings
		const limit = parseInt(settings.find((s) => s.key === 'giphy_result_limit')?.value || '10');
		const rating = settings.find((s) => s.key === 'giphy_rating')?.value || 'g';

		// Call Giphy API
		const response = await axios.get(`https://api.giphy.com/v1/gifs/trending`, {
			params: {
				api_key: giphyApiKey,
				limit,
				rating
			}
		});

		sendSuccessResponse(res, response.data);
	} catch (error) {
		logger.error('Error fetching trending GIFs:', error);
		sendErrorResponse(res, 'Failed to fetch trending GIFs', 500);
	}
});

// Search GIFs
router.post('/giphy-search', async (req: Request, res: Response) => {
	try {
		const { query } = req.body;

		if (!query) {
			return sendErrorResponse(res, 'Search query is required', 400);
		}

		const settings = await db.query.siteSettings.findMany();

		// Find giphy settings
		const giphyApiKey = process.env.GIPHY_API_KEY;
		const giphyEnabled = settings.find((s) => s.key === 'giphy_enabled')?.value === 'true';

		// If not enabled or no API key, return error
		if (!giphyEnabled || !giphyApiKey) {
			return sendErrorResponse(res, 'Giphy integration is not enabled', 403);
		}

		// Get limit and rating from settings
		const limit = parseInt(settings.find((s) => s.key === 'giphy_result_limit')?.value || '10');
		const rating = settings.find((s) => s.key === 'giphy_rating')?.value || 'g';

		// Call Giphy API
		const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
			params: {
				api_key: giphyApiKey,
				q: query,
				limit,
				rating
			}
		});

		sendSuccessResponse(res, response.data);
	} catch (error) {
		logger.error('Error searching GIFs:', error);
		sendErrorResponse(res, 'Failed to search GIFs', 500);
	}
});

export default router;
