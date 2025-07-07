import { Router } from 'express';
import { uiThemesService } from '../../domains/admin/sub-domains/ui-config/uiThemes.service';
import { logger } from "../../core/logger";

const router = Router();

/**
 * GET /api/ui/themes
 * Returns the zone theme configuration used by the frontend for navigation styling.
 */
router.get('/themes', async (_req, res) => {
	try {
		const themes = await uiThemesService.getAll();
		res.json(themes);
	} catch (err) {
		logger.error('Failed to fetch ui themes', err);
		res.status(500).json({ message: 'Failed to fetch themes' });
	}
});

export default router;
