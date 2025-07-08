import { Router } from 'express';
import { asyncHandler } from '../../admin.middleware';
import { rarityService } from './rarity.service';
import type { EntityId } from '@shared/types/ids';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

const router = Router();

router.get(
	'/',
	asyncHandler(async (req, res) => {
		const list = await rarityService.list();
		sendSuccessResponse(res, list);
	})
);

router.post(
	'/',
	asyncHandler(async (req, res) => {
		const created = await rarityService.create(req.body);
		res.status(201).json(created);
	})
);

router.put(
	'/:id',
	asyncHandler(async (req, res) => {
		const id = req.params.id as EntityId;
		const updated = await rarityService.update(id, req.body);
		sendSuccessResponse(res, updated);
	})
);

router.delete(
	'/:id',
	asyncHandler(async (req, res) => {
		const id = req.params.id as EntityId;
		const result = await rarityService.delete(id);
		sendSuccessResponse(res, result);
	})
);

export default router;
