import type { Request, Response, NextFunction } from 'express';
import { loadEconomyConfig, saveEconomyOverrides } from '@server-utils/economy-loader';
import { economyConfig as canonicalEconomyConfig } from '@shared/economy/economy.config';
import { z } from 'zod';
import { validateRequestBody } from '../../admin.validation';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

/**
 * GET /api/admin/economy/config
 * Returns merged economy config along with `hasOverrides` boolean.
 */
export const getEconomyConfig = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const mergedConfig = await loadEconomyConfig();
		const hasOverrides = JSON.stringify(mergedConfig) !== JSON.stringify(canonicalEconomyConfig);
		sendSuccessResponse(res, { config: mergedConfig, hasOverrides });
	} catch (err) {
		next(err);
	}
};

/**
 * PUT /api/admin/economy/config
 * Accepts partial override JSON and persists it.
 */
export const updateEconomyConfig = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const partialSchema = z.record(z.any()); // Accept arbitrary keys but ensure object type
		const partialOverride = validateRequestBody(req, res, partialSchema);
		if (!partialOverride) return; // Error handled inside validateRequestBody
		await saveEconomyOverrides(partialOverride);
		const mergedConfig = await loadEconomyConfig();
		sendSuccessResponse(res, { config: mergedConfig, hasOverrides: true });
	} catch (err) {
		next(err);
	}
};

/**
 * DELETE /api/admin/economy/config
 * Removes any existing overrides, restoring defaults.
 */
export const resetEconomyConfig = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await saveEconomyOverrides(null);
		const mergedConfig = await loadEconomyConfig();
		sendSuccessResponse(res, { config: mergedConfig, hasOverrides: false });
	} catch (err) {
		next(err);
	}
};
