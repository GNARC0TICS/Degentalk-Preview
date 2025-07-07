import { Router } from 'express';
import { asyncHandler } from '../../admin.middleware';
import { shopCategoryService } from './shopCategory.service';
import type { EntityId } from '@shared/types';

const router = Router();

router.get(
	'/',
	asyncHandler(async (req, res) => {
		const list = await shopCategoryService.list();
		res.json(list);
	})
);

router.post(
	'/',
	asyncHandler(async (req, res) => {
		const created = await shopCategoryService.create(req.body);
		res.status(201).json(created);
	})
);

router.put(
	'/:id',
	asyncHandler(async (req, res) => {
		const id = req.params.id as EntityId;
		const updated = await shopCategoryService.update(id, req.body);
		res.json(updated);
	})
);

router.delete(
	'/:id',
	asyncHandler(async (req, res) => {
		const id = req.params.id as EntityId;
		const result = await shopCategoryService.delete(id);
		res.json(result);
	})
);

export default router;
