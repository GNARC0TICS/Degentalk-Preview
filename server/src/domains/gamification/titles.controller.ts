import type { Request, Response } from 'express';
import { TitlesService } from './titles.service';
import { createTitleSchema, updateTitleSchema } from './titles.validators';
import { validateRequestBody } from '../admin/admin.validation';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const service = new TitlesService();

export class AdminTitlesController {
	async list(req: Request, res: Response) {
		try {
			const titles = await service.list();
			sendSuccessResponse(res, titles);
		} catch (error: any) {
			sendErrorResponse(res, error.message, 500);
		}
	}

	async getByRole(req: Request, res: Response) {
		try {
			const { roleId } = req.params;
			const titles = await service.getByRole(roleId);
			sendSuccessResponse(res, titles);
		} catch (error: any) {
			sendErrorResponse(res, error.message, 500);
		}
	}

	async getCustomTitles(req: Request, res: Response) {
		try {
			const titles = await service.getCustomTitles();
			sendSuccessResponse(res, titles);
		} catch (error: any) {
			sendErrorResponse(res, error.message, 500);
		}
	}

	async create(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, createTitleSchema);
			if (!data) return;
			const title = await service.create(data);
			sendSuccessResponse(res, title);
		} catch (error: any) {
			sendErrorResponse(res, error.message, 500);
		}
	}

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const titleId = id;
			if (isNaN(titleId)) {
				return sendErrorResponse(res, 'Invalid title ID', 400);
			}

			const data = validateRequestBody(req, res, updateTitleSchema);
			if (!data) return;

			const title = await service.update(titleId, data);
			sendSuccessResponse(res, title);
		} catch (error: any) {
			sendErrorResponse(res, error.message, 404);
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const titleId = id;
			if (isNaN(titleId)) {
				return sendErrorResponse(res, 'Invalid title ID', 400);
			}

			const result = await service.delete(titleId);
			sendSuccessResponse(res, result);
		} catch (error: any) {
			sendErrorResponse(res, error.message, 404);
		}
	}
}
