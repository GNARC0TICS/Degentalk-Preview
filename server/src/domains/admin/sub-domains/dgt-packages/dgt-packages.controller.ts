import type { Request, Response, NextFunction } from 'express';
import { dgtPackageService } from './dgt-packages.service';

export const listPackages = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const items = await dgtPackageService.list();
		res.json(items);
	} catch (err) {
		next(err);
	}
};

export const getPackageById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.packageId;
		const [item] = await dgtPackageService.list().then((r) => r.filter((p) => p.id === id));
		if (!item) return res.status(404).json({ error: 'Package not found' });
		res.json(item);
	} catch (err) {
		next(err);
	}
};

export const createPackage = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const created = await dgtPackageService.create(req.body);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
};

export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.packageId;
		const updated = await dgtPackageService.update(id, req.body);
		res.json(updated);
	} catch (err) {
		next(err);
	}
};

export const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.packageId;
		const result = await dgtPackageService.delete(id);
		res.json(result);
	} catch (err) {
		next(err);
	}
};
