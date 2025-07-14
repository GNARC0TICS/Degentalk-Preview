import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { asyncHandler } from '../../admin.middleware';
import { shopCategoryService } from './shopCategory.service';
import type { EntityId } from '@shared/types/ids';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router: RouterType = Router();

router.get(
	'/',
	asyncHandler(async (req, res) => {
		const list = await shopCategoryService.list();
		sendSuccessResponse(res, list);
	})
);

router.post(
	'/',
	asyncHandler(async (req, res) => {
		const created = await shopCategoryService.create(req.body);
		sendSuccessResponse(res, created);
	})
);

router.put(
	'/:id',
	asyncHandler(async (req, res) => {
		const id = req.params.id as EntityId;
		const updated = await shopCategoryService.update(id, req.body);
		sendSuccessResponse(res, updated);
	})
);

router.delete(
	'/:id',
	asyncHandler(async (req, res) => {
		const id = req.params.id as EntityId;
		const result = await shopCategoryService.delete(id);
		sendSuccessResponse(res, result);
	})
);

export default router;
