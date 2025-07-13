import { Router } from 'express';
import { db } from '@db';

const router: Router = Router();

router.get('/', async (req, res) => {
	try {
		// Simple DB check (can be improved for more advanced checks)
		await db.execute('SELECT 1');
		res.status(200).json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
	} catch (err) {
		res.status(500).json({ status: 'error', db: 'unreachable', error: err.message });
	}
});

export default router;
