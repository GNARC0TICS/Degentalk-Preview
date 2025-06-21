import type { Request, Response } from 'express';
import { AdminPermissionsService } from './permissions.service';

const service = new AdminPermissionsService();

export class AdminPermissionsController {
	async list(req: Request, res: Response) {
		try {
			const permissions = await service.list();
			res.json(permissions);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getByCategory(req: Request, res: Response) {
		try {
			const permissions = await service.getByCategory();
			res.json(permissions);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}
}
