import { Router } from 'express';
import { DictionaryService, DictionaryStatus } from './dictionary.service';
import {
	isAuthenticated as requireAuth,
	isAdminOrModerator
} from '../auth/middleware/auth.middleware';
import { insertDictionaryEntrySchema } from '@schema';
import rateLimit from 'express-rate-limit';

const router = Router();

// GET /api/dictionary
router.get('/', async (req, res) => {
	try {
		const { page, limit, search, status, sort, tag, authorId } = req.query as any;
		const result = await DictionaryService.list({
			page: page ? Number(page) : undefined,
			limit: limit ? Number(limit) : undefined,
			search: search as string | undefined,
			status: status as string | undefined,
			sort: sort as any,
			tag: tag as string | undefined,
			authorId: authorId as string | undefined
		});
		return res.json(result);
	} catch (error) {
		console.error('Dictionary list error', error);
		return res.status(500).json({ error: 'Failed to fetch dictionary entries' });
	}
});

// GET /api/dictionary/:slug
router.get('/:slug', async (req, res) => {
	try {
		const entry = await DictionaryService.getBySlug(req.params.slug);
		if (!entry || entry.status !== DictionaryStatus.APPROVED) {
			return res.status(404).json({ error: 'Entry not found' });
		}
		return res.json(entry);
	} catch (error) {
		console.error('Dictionary entry fetch error', error);
		return res.status(500).json({ error: 'Failed to fetch entry' });
	}
});

// POST /api/dictionary (requires auth)
router.post(
	'/',
	rateLimit({ windowMs: 5 * 60 * 1000, max: 3 }), // TODO: add CAPTCHA / wallet-age check
	requireAuth,
	async (req: any, res) => {
		try {
			const data = insertDictionaryEntrySchema.parse(req.body);
			const created = await DictionaryService.create({ ...data, authorId: req.user.id });
			return res.status(201).json(created);
		} catch (error) {
			console.error('Entry submission error', error);
			return res.status(400).json({ error: 'Invalid submission' });
		}
	}
);

// PATCH /api/dictionary/:id (approve/reject) admin/moderator only
router.patch('/:id', requireAuth, isAdminOrModerator, async (req: any, res) => {
	try {
		const { status } = req.body;
		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}
		const updated = await DictionaryService.moderate(Number(req.params.id), status, req.user.id);
		return res.json(updated);
	} catch (error) {
		console.error('Moderation error', error);
		return res.status(500).json({ error: 'Failed to update entry' });
	}
});

// POST /api/dictionary/:id/upvote (toggle)
router.post('/:id/upvote', requireAuth, async (req: any, res) => {
	try {
		const result = await DictionaryService.toggleUpvote(Number(req.params.id), req.user.id);
		return res.json(result);
	} catch (error) {
		console.error('Upvote error', error);
		return res.status(500).json({ error: 'Failed to toggle upvote' });
	}
});

export default router;
