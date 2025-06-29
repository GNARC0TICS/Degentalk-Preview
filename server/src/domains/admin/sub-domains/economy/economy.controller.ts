import type { Request, Response, NextFunction } from 'express';
import { loadEconomyConfig, saveEconomyOverrides } from '@server/src/utils/economy-loader';
import { economyConfig as canonicalEconomyConfig } from '@shared/economy/economy.config';
import { z } from 'zod';
import { validateRequestBody } from '../../admin.validation.ts';

/**
 * GET /api/admin/economy/config
 * Returns merged economy config along with `hasOverrides` boolean.
 */
export const getEconomyConfig = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const mergedConfig = await loadEconomyConfig();
		const hasOverrides = JSON.stringify(mergedConfig) !== JSON.stringify(canonicalEconomyConfig);
		res.json({ config: mergedConfig, hasOverrides });
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
		res.json({ config: mergedConfig, hasOverrides: true });
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
		res.json({ config: mergedConfig, hasOverrides: false });
	} catch (err) {
		next(err);
	}
};
