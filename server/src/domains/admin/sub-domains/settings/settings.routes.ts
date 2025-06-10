/**
 * Admin Settings Routes
 *
 * Defines API routes for platform settings management.
 */

import { Router } from 'express';
import { adminSettingsController } from './settings.controller';
import { asyncHandler } from '../../admin.middleware';

const router = Router();

// Settings management
router.get('/', asyncHandler(adminSettingsController.getAllSettings.bind(adminSettingsController)));
router.get(
	'/:key',
	asyncHandler(adminSettingsController.getSettingByKey.bind(adminSettingsController))
);
router.put(
	'/:key',
	asyncHandler(adminSettingsController.updateSetting.bind(adminSettingsController))
);
router.put('/', asyncHandler(adminSettingsController.updateSettings.bind(adminSettingsController)));
router.post('/', asyncHandler(adminSettingsController.createSetting.bind(adminSettingsController)));
router.put(
	'/:key/metadata',
	asyncHandler(adminSettingsController.updateSettingMetadata.bind(adminSettingsController))
);
router.delete(
	'/:key',
	asyncHandler(adminSettingsController.deleteSetting.bind(adminSettingsController))
);

// Settings groups management
router.get(
	'/groups/all',
	asyncHandler(adminSettingsController.getAllSettingGroups.bind(adminSettingsController))
);
router.post(
	'/groups',
	asyncHandler(adminSettingsController.createSettingGroup.bind(adminSettingsController))
);
router.put(
	'/groups/:key',
	asyncHandler(adminSettingsController.updateSettingGroup.bind(adminSettingsController))
);
router.delete(
	'/groups/:key',
	asyncHandler(adminSettingsController.deleteSettingGroup.bind(adminSettingsController))
);

export default router;
