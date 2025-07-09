import type { Request, Response, NextFunction } from 'express';
import { dgtPackageService } from './dgt-packages.service';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

export const listPackages = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const items = await dgtPackageService.list();
		sendSuccessResponse(res, items);
	} catch (err) {
		next(err);
	}
};

export const getPackageById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.packageId;
		const [item] = await dgtPackageService.list().then((r) => r.filter((p) => p.id === id));
		if (!item) return sendErrorResponse(res, 'Package not found', 404);
		sendSuccessResponse(res, item);
	} catch (err) {
		next(err);
	}
};

export const createPackage = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const created = await dgtPackageService.create(req.body);
		sendSuccessResponse(res, created);
	} catch (err) {
		next(err);
	}
};

export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.packageId;
		const updated = await dgtPackageService.update(id, req.body);
		sendSuccessResponse(res, updated);
	} catch (err) {
		next(err);
	}
};

export const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.packageId;
		const result = await dgtPackageService.delete(id);
		sendSuccessResponse(res, result);
	} catch (err) {
		next(err);
	}
};
