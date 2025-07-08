import type { Request, Response } from 'express';
import { AdminPermissionsService } from './permissions.service';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

const service = new AdminPermissionsService();

export class AdminPermissionsController {
	async list(req: Request, res: Response) {
		try {
			const permissions = await service.list();
			sendSuccessResponse(res, permissions);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getByCategory(req: Request, res: Response) {
		try {
			const permissions = await service.getByCategory();
			sendSuccessResponse(res, permissions);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}
}
