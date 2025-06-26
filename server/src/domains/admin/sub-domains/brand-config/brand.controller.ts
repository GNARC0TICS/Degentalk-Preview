import type { Request, Response } from 'express';
import { brandService } from './brand.service.ts';

class BrandController {
	async getBrandConfig(_req: Request, res: Response) {
		const config = await brandService.getActiveConfig();
		return res.json(config);
	}

	async updateBrandConfig(req: Request, res: Response) {
		const updated = await brandService.updateConfig(req.body.id ?? null, req.body);
		return res.json(updated);
	}
}

export const brandController = new BrandController();
