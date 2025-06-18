import { Router } from 'express';
import { asyncHandler } from '../../admin.middleware';
import { rarityService } from './rarity.service';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
	const list = await rarityService.list();
	res.json(list);
}));

router.post('/', asyncHandler(async (req, res) => {
	const created = await rarityService.create(req.body);
	res.status(201).json(created);
}));

router.put('/:id', asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id);
	const updated = await rarityService.update(id, req.body);
	res.json(updated);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
	const id = parseInt(req.params.id);
	const result = await rarityService.delete(id);
	res.json(result);
}));

export default router; 