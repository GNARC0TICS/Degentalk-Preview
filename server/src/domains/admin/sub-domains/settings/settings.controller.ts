/**
 * Admin Settings Controller
 *
 * Handles API requests for platform settings management.
 */

import type { Request, Response } from 'express';
import { adminSettingsService } from './settings.service.refactored';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { adminController } from '../../admin.controller';
import { sendSuccess, sendError, sendValidationError } from '../../admin.response';
import {
	UpdateSettingSchema,
	UpdateSettingsSchema,
	SettingGroupSchema,
	CreateSettingSchema,
	UpdateSettingMetadataSchema,
	FilterSettingsSchema
} from './settings.validators';
import { ToggleFeatureFlagSchema } from '@shared/validators/admin';

export class AdminSettingsController {
	async getAllSettings(req: Request, res: Response) {
		try {
			const validation = FilterSettingsSchema.safeParse(req.query);
			const filters = validation.success ? validation.data : undefined;

			const settings = await adminSettingsService.getAllSettings(filters);
			return sendSuccess(res, settings);
		} catch (error) {
			if (error instanceof AdminError) {
				return sendError(res, error.message, error.httpStatus, error.code);
			}
			return sendError(res, 'Failed to fetch settings');
		}
	}

	async getSettingByKey(req: Request, res: Response) {
		try {
			const key = req.params.key;
			const setting = await adminSettingsService.getSettingByKey(key);
			return sendSuccess(res, setting);
		} catch (error) {
			if (error instanceof AdminError) {
				return sendError(res, error.message, error.httpStatus, error.code);
			}
			return sendError(res, 'Failed to fetch setting');
		}
	}

	async updateSetting(req: Request, res: Response) {
		try {
			const validation = UpdateSettingSchema.safeParse(req.body);
			if (!validation.success) {
				return sendValidationError(res, 'Invalid setting data', validation.error.format());
			}

			const setting = await adminSettingsService.updateSetting(validation.data);
			await adminController.logAction(
				req,
				'UPDATE_SETTING',
				'setting',
				validation.data.key,
				validation.data
			);
			return sendSuccess(res, setting, 'Setting updated successfully');
		} catch (error) {
			if (error instanceof AdminError) {
				return sendError(res, error.message, error.httpStatus, error.code);
			}
			return sendError(res, 'Failed to update setting');
		}
	}

	async updateSettings(req: Request, res: Response) {
		try {
			const validation = UpdateSettingsSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid settings data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const settings = await adminSettingsService.updateSettings(validation.data);
			await adminController.logAction(req, 'BULK_UPDATE_SETTINGS', 'settings', 'multiple', {
				count: validation.data.settings.length,
				keys: validation.data.settings.map((s) => s.key)
			});
			res.json(settings);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to update settings' });
		}
	}

	async getAllSettingGroups(req: Request, res: Response) {
		try {
			const groups = await adminSettingsService.getAllSettingGroups();
			res.json(groups);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch setting groups' });
		}
	}

	async createSettingGroup(req: Request, res: Response) {
		try {
			const validation = SettingGroupSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid setting group data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const group = await adminSettingsService.createSettingGroup(validation.data);
			await adminController.logAction(
				req,
				'CREATE_SETTING_GROUP',
				'setting_group',
				group.key,
				validation.data
			);
			res.status(201).json(group);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to create setting group' });
		}
	}

	async updateSettingGroup(req: Request, res: Response) {
		try {
			const key = req.params.key;

			const validation = SettingGroupSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid setting group data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const group = await adminSettingsService.updateSettingGroup(key, validation.data);
			await adminController.logAction(req, 'UPDATE_SETTING_GROUP', 'setting_group', key, {
				...validation.data,
				originalKey: key
			});
			res.json(group);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to update setting group' });
		}
	}

	async deleteSettingGroup(req: Request, res: Response) {
		try {
			const key = req.params.key;
			const newGroupKey = req.query.newGroupKey as string | undefined;

			const result = await adminSettingsService.deleteSettingGroup(key, newGroupKey);
			await adminController.logAction(req, 'DELETE_SETTING_GROUP', 'setting_group', key, {
				newGroupKey,
				reassignedSettings: result.reassignedSettings
			});
			res.json(result);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to delete setting group' });
		}
	}

	async createSetting(req: Request, res: Response) {
		try {
			const validation = CreateSettingSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid setting data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const setting = await adminSettingsService.createSetting(validation.data);
			await adminController.logAction(
				req,
				'CREATE_SETTING',
				'setting',
				setting.key,
				validation.data
			);
			res.status(201).json(setting);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to create setting' });
		}
	}

	async updateSettingMetadata(req: Request, res: Response) {
		try {
			const key = req.params.key;

			const validation = UpdateSettingMetadataSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid setting metadata',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const setting = await adminSettingsService.updateSettingMetadata(key, validation.data);
			await adminController.logAction(
				req,
				'UPDATE_SETTING_METADATA',
				'setting',
				key,
				validation.data
			);
			res.json(setting);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to update setting metadata' });
		}
	}

	async deleteSetting(req: Request, res: Response) {
		try {
			const key = req.params.key;

			const result = await adminSettingsService.deleteSetting(key);
			await adminController.logAction(req, 'DELETE_SETTING', 'setting', key, {});
			res.json(result);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to delete setting' });
		}
	}

	async getFeatureFlags(req: Request, res: Response) {
		try {
			const flags = await adminSettingsService.getAllFeatureFlags();
			res.json(flags);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch feature flags' });
		}
	}

	async updateFeatureFlag(req: Request, res: Response) {
		try {
			const key = req.params.key;
			const validation = ToggleFeatureFlagSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid feature flag data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}

			const updated = await adminSettingsService.updateFeatureFlag({ key, ...validation.data });
			await adminController.logAction(
				req,
				'UPDATE_FEATURE_FLAG',
				'feature_flag',
				key,
				validation.data
			);
			res.json(updated);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to update feature flag' });
		}
	}
}

export const adminSettingsController = new AdminSettingsController();
