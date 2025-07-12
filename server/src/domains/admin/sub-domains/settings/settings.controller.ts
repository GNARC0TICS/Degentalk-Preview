/**
 * Admin Settings Controller
 *
 * Handles API requests for platform settings management.
 */

import type { Request, Response } from 'express';
import { adminSettingsService } from './settings.service.refactored';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { adminController } from '../../admin.controller';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { validateRequestBody, validateQueryParams } from '../../admin.validation';
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
			const filters = validateQueryParams(req, res, FilterSettingsSchema) || undefined;

			const settings = await adminSettingsService.getAllSettings(filters);
			return sendSuccessResponse(res, settings);
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to fetch settings', 400);
		}
	}

	async getSettingByKey(req: Request, res: Response) {
		try {
			const key = req.params.key;
			const setting = await adminSettingsService.getSettingByKey(key);
			return sendSuccessResponse(res, setting);
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to fetch setting', 400);
		}
	}

	async updateSetting(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, UpdateSettingSchema);
			if (!data) return;
			const setting = await adminSettingsService.updateSetting(data);
			await adminController.logAction(req, 'UPDATE_SETTING', 'setting', data.key, data);
			return sendSuccessResponse(res, setting, 'Setting updated successfully');
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to update setting', 400);
		}
	}

	async updateSettings(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, UpdateSettingsSchema);
			if (!data) return;
			const settings = await adminSettingsService.updateSettings(data);
			await adminController.logAction(req, 'BULK_UPDATE_SETTINGS', 'settings', 'multiple', {
				count: data.settings.length,
				keys: data.settings.map((s) => s.key)
			});
			return sendSuccessResponse(res, settings);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to update settings', 400);
		}
	}

	async getAllSettingGroups(req: Request, res: Response) {
		try {
			const groups = await adminSettingsService.getAllSettingGroups();
			return sendSuccessResponse(res, groups);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to fetch setting groups', 400);
		}
	}

	async createSettingGroup(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, SettingGroupSchema);
			if (!data) return;
			const group = await adminSettingsService.createSettingGroup(data);
			await adminController.logAction(
				req,
				'CREATE_SETTING_GROUP',
				'setting_group',
				group.key,
				data
			);
			return sendSuccessResponse(res, group);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to create setting group', 400);
		}
	}

	async updateSettingGroup(req: Request, res: Response) {
		try {
			const key = req.params.key;

			const data = validateRequestBody(req, res, SettingGroupSchema);
			if (!data) return;
			const group = await adminSettingsService.updateSettingGroup(key, data);
			await adminController.logAction(req, 'UPDATE_SETTING_GROUP', 'setting_group', key, {
				...data,
				originalKey: key
			});
			return sendSuccessResponse(res, group);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to update setting group', 400);
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
			return sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to delete setting group', 400);
		}
	}

	async createSetting(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, CreateSettingSchema);
			if (!data) return;
			const setting = await adminSettingsService.createSetting(data);
			await adminController.logAction(req, 'CREATE_SETTING', 'setting', setting.key, data);
			return sendSuccessResponse(res, setting);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to create setting', 400);
		}
	}

	async updateSettingMetadata(req: Request, res: Response) {
		try {
			const key = req.params.key;

			const data = validateRequestBody(req, res, UpdateSettingMetadataSchema);
			if (!data) return;
			const setting = await adminSettingsService.updateSettingMetadata(key, data);
			await adminController.logAction(req, 'UPDATE_SETTING_METADATA', 'setting', key, data);
			return sendSuccessResponse(res, setting);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to update setting metadata', 400);
		}
	}

	async deleteSetting(req: Request, res: Response) {
		try {
			const key = req.params.key;

			const result = await adminSettingsService.deleteSetting(key);
			await adminController.logAction(req, 'DELETE_SETTING', 'setting', key, {});
			return sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to delete setting', 400);
		}
	}

	async getFeatureFlags(req: Request, res: Response) {
		try {
			const flags = await adminSettingsService.getAllFeatureFlags();
			return sendSuccessResponse(res, flags);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to fetch feature flags', 400);
		}
	}

	async updateFeatureFlag(req: Request, res: Response) {
		try {
			const key = req.params.key;
			const data = validateRequestBody(req, res, ToggleFeatureFlagSchema);
			if (!data) return;
			const result = await adminSettingsService.updateFeatureFlag(data);
			await adminController.logAction(req, 'UPDATE_FEATURE_FLAG', 'feature_flag', key, data);
			return sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			return sendErrorResponse(res, 'Failed to update feature flag', 400);
		}
	}
}

export const adminSettingsController = new AdminSettingsController();
