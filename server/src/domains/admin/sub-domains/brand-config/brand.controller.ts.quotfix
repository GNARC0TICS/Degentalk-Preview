import type { Request, Response } from 'express';
import { brandService } from './brand.service';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

class BrandController {
	async getBrandConfig(_req: Request, res: Response) {
		const config = await brandService.getActiveConfig();
		sendSuccessResponse(res, config);
	}

	async updateBrandConfig(req: Request, res: Response) {
		const updated = await brandService.updateConfig(req.body.id ?? null, req.body);
		sendSuccessResponse(res, updated);
	}
}

export const brandController = new BrandController();
