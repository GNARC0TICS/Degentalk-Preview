import type { Request, Response } from 'express';
import { AdminTitlesService } from './titles.service';
import { createTitleSchema, updateTitleSchema } from './titles.validators';
import { validateRequestBody } from '../../admin.validation';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

const service = new AdminTitlesService();

export class AdminTitlesController {
	async list(req: Request, res: Response) {
		try {
			const titles = await service.list();
			sendSuccessResponse(res, titles);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getByRole(req: Request, res: Response) {
		try {
			const { roleId } = req.params;
			const titles = await service.getByRole(roleId);
			sendSuccessResponse(res, titles);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getCustomTitles(req: Request, res: Response) {
		try {
			const titles = await service.getCustomTitles();
			sendSuccessResponse(res, titles);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async create(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, createTitleSchema);
			if (!data) return;
			const title = await service.create(data);
			res.status(201).json(title);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const titleId = id;
			if (isNaN(titleId)) {
				return res.status(400).json({ error: 'Invalid title ID' });
			}

			const data = validateRequestBody(req, res, updateTitleSchema);
			if (!data) return;

			const title = await service.update(titleId, data);
			sendSuccessResponse(res, title);
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const titleId = id;
			if (isNaN(titleId)) {
				return res.status(400).json({ error: 'Invalid title ID' });
			}

			const result = await service.delete(titleId);
			sendSuccessResponse(res, result);
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	}
}
