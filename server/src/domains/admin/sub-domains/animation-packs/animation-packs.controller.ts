import type { Request, Response, NextFunction } from 'express';
import { animationPackService } from './animation-packs.service';

export const listPacks = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const data = await animationPackService.list();
		res.json(data);
	} catch (err) {
		next(err);
	}
};

export const createPack = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const pack = await animationPackService.create(req.body);
		res.status(201).json(pack);
	} catch (err) {
		next(err);
	}
};

export const updatePack = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = Number(req.params.id);
		const pack = await animationPackService.update(id, req.body);
		res.json(pack);
	} catch (err) {
		next(err);
	}
};

export const deletePack = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = Number(req.params.id);
		await animationPackService.delete(id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};
