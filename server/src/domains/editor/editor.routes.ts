/**
 * Editor Routes
 *
 * Defines API routes for editor functionality including Giphy integration.
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { IStorage } from '../../../../storage';

/**
 * Initialize editor routes
 */
const router = Router();

// Check if Giphy is enabled
router.get('/giphy-status', async (req: Request, res: Response) => {
	try {
		const storage = req.app.get('storage') as IStorage;
		const settings = await storage.getSiteSettings();

		// Find giphy settings
		const giphyApiKey = process.env.GIPHY_API_KEY;
		const giphyEnabled = settings.find((s) => s.key === 'giphy_enabled')?.value === 'true';

		// If no API key, Giphy is not available regardless of settings
		if (!giphyApiKey) {
			return res.json({ enabled: false });
		}

		return res.json({
			enabled: giphyEnabled
		});
	} catch (error) {
		console.error('Error checking Giphy status:', error);
		res.status(500).json({ error: 'Failed to check Giphy status' });
	}
});

// Get trending GIFs
router.get('/giphy-trending', async (req: Request, res: Response) => {
	try {
		const storage = req.app.get('storage') as IStorage;
		const settings = await storage.getSiteSettings();

		// Find giphy settings
		const giphyApiKey = process.env.GIPHY_API_KEY;
		const giphyEnabled = settings.find((s) => s.key === 'giphy_enabled')?.value === 'true';

		// If not enabled or no API key, return error
		if (!giphyEnabled || !giphyApiKey) {
			return res.status(403).json({ error: 'Giphy integration is not enabled' });
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

		res.json(response.data);
	} catch (error) {
		console.error('Error fetching trending GIFs:', error);
		res.status(500).json({ error: 'Failed to fetch trending GIFs' });
	}
});

// Search GIFs
router.post('/giphy-search', async (req: Request, res: Response) => {
	try {
		const { query } = req.body;

		if (!query) {
			return res.status(400).json({ error: 'Search query is required' });
		}

		const storage = req.app.get('storage') as IStorage;
		const settings = await storage.getSiteSettings();

		// Find giphy settings
		const giphyApiKey = process.env.GIPHY_API_KEY;
		const giphyEnabled = settings.find((s) => s.key === 'giphy_enabled')?.value === 'true';

		// If not enabled or no API key, return error
		if (!giphyEnabled || !giphyApiKey) {
			return res.status(403).json({ error: 'Giphy integration is not enabled' });
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

		res.json(response.data);
	} catch (error) {
		console.error('Error searching GIFs:', error);
		res.status(500).json({ error: 'Failed to search GIFs' });
	}
});

export default router;
