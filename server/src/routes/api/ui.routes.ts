import { Router } from 'express';
import zoneThemes from '../../../config/zoneThemes.config';

const router = Router();

/**
 * GET /api/ui/themes
 * Returns the zone theme configuration used by the frontend for navigation styling.
 */
router.get('/themes', async (_req, res) => {
  res.json(zoneThemes);
});

export default router; 