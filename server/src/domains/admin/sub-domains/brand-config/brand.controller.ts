import type { Request, Response } from 'express';
import { brandService } from './brand.service.ts';

class BrandController {
	async getBrandConfig(_req: Request, res: Response) {
		const config = await brandService.getActiveConfig();
		return res.json(config);
	}

	async updateBrandConfig(req: Request, res: Response) {
		const { id } = req.params;
		const updated = await brandService.updateConfig(id, req.body);
		return res.json(updated);
	}
}

export const brandController = new BrandController();
