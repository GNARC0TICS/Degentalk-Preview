import type { Request, Response } from 'express';
import { AdminTitlesService } from './titles.service';
import { createTitleSchema, updateTitleSchema } from './titles.validators';
import { validateRequestBody } from '../../admin.validation.ts';

const service = new AdminTitlesService();

export class AdminTitlesController {
	async list(req: Request, res: Response) {
		try {
			const titles = await service.list();
			res.json(titles);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getByRole(req: Request, res: Response) {
		try {
			const { roleId } = req.params;
			const titles = await service.getByRole(roleId);
			res.json(titles);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}

	async getCustomTitles(req: Request, res: Response) {
		try {
			const titles = await service.getCustomTitles();
			res.json(titles);
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
			const titleId = parseInt(id);
			if (isNaN(titleId)) {
				return res.status(400).json({ error: 'Invalid title ID' });
			}

			const data = validateRequestBody(req, res, updateTitleSchema);
			if (!data) return;

			const title = await service.update(titleId, data);
			res.json(title);
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const titleId = parseInt(id);
			if (isNaN(titleId)) {
				return res.status(400).json({ error: 'Invalid title ID' });
			}

			const result = await service.delete(titleId);
			res.json(result);
		} catch (error: any) {
			res.status(404).json({ error: error.message });
		}
	}
}
