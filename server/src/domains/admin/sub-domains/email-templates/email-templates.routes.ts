/**
 * Email Template Routes
 *
 * Admin routes for managing email templates
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { emailTemplateController } from './email-templates.controller';
import { isAdminOrModerator } from '../../admin.middleware';

export const emailTemplateRoutes: RouterType = Router();

// All email template routes require admin or moderator role
emailTemplateRoutes.use(isAdminOrModerator);

// Template CRUD operations
emailTemplateRoutes.get('/', emailTemplateController.getAllTemplates.bind(emailTemplateController));
emailTemplateRoutes.get(
	'/categories',
	emailTemplateController.getCategories.bind(emailTemplateController)
);
emailTemplateRoutes.get('/:id', emailTemplateController.getTemplate.bind(emailTemplateController));
emailTemplateRoutes.post('/', emailTemplateController.createTemplate.bind(emailTemplateController));
emailTemplateRoutes.put(
	'/:id',
	emailTemplateController.updateTemplate.bind(emailTemplateController)
);
emailTemplateRoutes.delete(
	'/:id',
	emailTemplateController.deleteTemplate.bind(emailTemplateController)
);

// Template preview and testing
emailTemplateRoutes.post(
	'/preview',
	emailTemplateController.previewTemplate.bind(emailTemplateController)
);
emailTemplateRoutes.post('/send', emailTemplateController.sendEmail.bind(emailTemplateController));

// Version control
emailTemplateRoutes.get(
	'/:id/versions',
	emailTemplateController.getTemplateVersions.bind(emailTemplateController)
);
emailTemplateRoutes.post(
	'/:id/restore/:versionId',
	emailTemplateController.restoreVersion.bind(emailTemplateController)
);

// Analytics
emailTemplateRoutes.get(
	'/:id/stats',
	emailTemplateController.getTemplateStats.bind(emailTemplateController)
);
