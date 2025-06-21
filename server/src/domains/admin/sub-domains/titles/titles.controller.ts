import type { Request, Response } from 'express';
import { AdminTitlesService } from './titles.service';
import { createTitleSchema, updateTitleSchema } from './titles.validators';

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
			const parsed = createTitleSchema.safeParse(req.body);
			if (!parsed.success) {
				return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
			}
			const title = await service.create(parsed.data);
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

			const parsed = updateTitleSchema.safeParse(req.body);
			if (!parsed.success) {
				return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
			}

			const title = await service.update(titleId, parsed.data);
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
