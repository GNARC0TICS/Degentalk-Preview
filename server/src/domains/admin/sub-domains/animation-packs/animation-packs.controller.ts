import type { Request, Response, NextFunction } from 'express';
import { animationPackService } from './animation-packs.service';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

export const listPacks = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const data = await animationPackService.list();
		sendSuccessResponse(res, data);
	} catch (err) {
		next(err);
	}
};

export const createPack = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const pack = await animationPackService.create(req.body);
		sendSuccessResponse(res, pack);
	} catch (err) {
		next(err);
	}
};

export const updatePack = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const pack = await animationPackService.update(id, req.body);
		sendSuccessResponse(res, pack);
	} catch (err) {
		next(err);
	}
};

export const deletePack = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		await animationPackService.delete(id);
		sendSuccessResponse(res, { success: true });
	} catch (err) {
		next(err);
	}
};
