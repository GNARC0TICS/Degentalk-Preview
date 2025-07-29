import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import { z } from 'zod';
import { emailTemplateService, emailTemplateSchema } from './email-templates.service';
import { formatAdminResponse, AdminOperationBoundary } from '../../admin/shared';
import { AdminError, AdminErrorCodes } from '../../admin/admin.errors';

// Query parameters schema for filtering
const filterTemplatesSchema = z.object({
	category: z.enum(['auth', 'notification', 'marketing', 'transactional', 'general']).optional(),
	isActive: z.coerce.boolean().optional(),
	search: z.string().optional(),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20)
});

const previewTemplateSchema = z
	.object({
		variables: z.record(z.any()).default({}),
		templateId: z.coerce.number().optional(),
		templateKey: z.string().optional()
	})
	.refine((data) => data.templateId || data.templateKey, {
		message: 'Either templateId or templateKey must be provided'
	});

const sendEmailSchema = z.object({
	templateKey: z.string().min(1),
	recipientEmail: z.string().email(),
	variables: z.record(z.any()).default({}),
	recipientUserId: z.string().uuid().optional()
});

export class EmailTemplateController {
	/**
	 * GET /api/admin/email-templates
	 * Get all email templates with filtering
	 */
	async getAllTemplates(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'FETCH_EMAIL_TEMPLATES',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const filters = filterTemplatesSchema.parse(req.query);

			const templates = await emailTemplateService.getAllTemplates({
				category: filters.category,
				isActive: filters.isActive,
				search: filters.search
			});

			// Pagination
			const startIndex = (filters.page - 1) * filters.limit;
			const endIndex = startIndex + filters.limit;
			const paginatedTemplates = templates.slice(startIndex, endIndex);

			return formatAdminResponse(
				{
					templates: paginatedTemplates,
					pagination: {
						page: filters.page,
						limit: filters.limit,
						total: templates.length,
						totalPages: Math.ceil(templates.length / filters.limit)
					}
				},
				'FETCH_EMAIL_TEMPLATES',
				'emailTemplate'
			);
		});
	}

	/**
	 * GET /api/admin/email-templates/:id
	 * Get a single email template by ID or key
	 */
	async getTemplate(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'FETCH_EMAIL_TEMPLATE',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const { id } = req.params;
			const templateId = isNaN(id) ? id : id;

			const template = await emailTemplateService.getTemplate(templateId);

			return formatAdminResponse({ template }, 'FETCH_EMAIL_TEMPLATE', 'emailTemplate');
		});
	}

	/**
	 * POST /api/admin/email-templates
	 * Create a new email template
	 */
	async createTemplate(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CREATE_EMAIL_TEMPLATE',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});

		return boundary.execute(async () => {
			const templateData = emailTemplateSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const template = await emailTemplateService.createTemplate(templateData, adminId);

			return formatAdminResponse({ template }, 'CREATE_EMAIL_TEMPLATE', 'emailTemplate');
		});
	}

	/**
	 * PUT /api/admin/email-templates/:id
	 * Update an email template
	 */
	async updateTemplate(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'EMAIL_TEMPLATE_OPERATION',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});
		return boundary.execute(async () => {
			const { id } = req.params;
			const templateId = id;
			const updateData = emailTemplateSchema.partial().parse(req.body);
			const { changeDescription } = req.body;
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			if (isNaN(templateId)) {
				throw new AdminError('Invalid template ID', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const template = await emailTemplateService.updateTemplate(
				templateId,
				updateData,
				adminId,
				changeDescription
			);

			return formatAdminResponse({ template }, 'UPDATE_EMAIL_TEMPLATE', 'emailTemplate');
		});
	}

	/**
	 * DELETE /api/admin/email-templates/:id
	 * Delete (deactivate) an email template
	 */
	async deleteTemplate(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'EMAIL_TEMPLATE_OPERATION',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});
		return boundary.execute(async () => {
			const { id } = req.params;
			const templateId = id;
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			if (isNaN(templateId)) {
				throw new AdminError('Invalid template ID', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const result = await emailTemplateService.deleteTemplate(templateId, adminId);

			return formatAdminResponse(result, 'DELETE_EMAIL_TEMPLATE', 'emailTemplate');
		});
	}

	/**
	 * POST /api/admin/email-templates/preview
	 * Preview template with sample data
	 */
	async previewTemplate(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'EMAIL_TEMPLATE_OPERATION',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});
		return boundary.execute(async () => {
			const { variables, templateId, templateKey } = previewTemplateSchema.parse(req.body);

			const identifier = templateId || templateKey;
			if (!identifier) {
				throw new AdminError('Template ID or key required', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const preview = await emailTemplateService.previewTemplate(identifier, variables);

			return formatAdminResponse(preview, 'PREVIEW_EMAIL_TEMPLATE', 'emailTemplate');
		});
	}

	/**
	 * GET /api/admin/email-templates/:id/versions
	 * Get template version history
	 */
	async getTemplateVersions(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'EMAIL_TEMPLATE_OPERATION',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});
		return boundary.execute(async () => {
			const { id } = req.params;
			const templateId = id;

			if (isNaN(templateId)) {
				throw new AdminError('Invalid template ID', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const versions = await emailTemplateService.getTemplateVersions(templateId);

			return formatAdminResponse({ versions }, 'FETCH_EMAIL_TEMPLATE_VERSIONS', 'emailTemplate');
		});
	}

	/**
	 * POST /api/admin/email-templates/:id/restore/:versionId
	 * Restore a previous template version
	 */
	async restoreVersion(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'EMAIL_TEMPLATE_OPERATION',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});
		return boundary.execute(async () => {
			const { id, versionId } = req.params;
			const templateId = id;
			const versionNumber = versionId;
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			if (isNaN(templateId) || isNaN(versionNumber)) {
				throw new AdminError(
					'Invalid template or version ID',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			const template = await emailTemplateService.restoreVersion(
				templateId,
				versionNumber,
				adminId
			);

			return formatAdminResponse({ template }, 'RESTORE_EMAIL_TEMPLATE_VERSION', 'emailTemplate');
		});
	}

	/**
	 * GET /api/admin/email-templates/:id/stats
	 * Get template usage statistics
	 */
	async getTemplateStats(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'EMAIL_TEMPLATE_OPERATION',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});
		return boundary.execute(async () => {
			const { id } = req.params;
			const { days } = req.query;
			const templateId = id;
			const statsDays = days ? Number(days) : 30;

			if (isNaN(templateId)) {
				throw new AdminError('Invalid template ID', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const stats = await emailTemplateService.getTemplateStats(templateId, statsDays);

			return formatAdminResponse({ stats }, 'FETCH_EMAIL_TEMPLATE_STATS', 'emailTemplate');
		});
	}

	/**
	 * POST /api/admin/email-templates/send
	 * Send email using template (for testing)
	 */
	async sendEmail(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'EMAIL_TEMPLATE_OPERATION',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});
		return boundary.execute(async () => {
			const emailData = sendEmailSchema.parse(req.body);

			const result = await emailTemplateService.sendEmail(
				emailData.templateKey,
				emailData.recipientEmail,
				emailData.variables,
				emailData.recipientUserId
			);

			return formatAdminResponse(result, 'SEND_EMAIL_TEMPLATE', 'emailTemplate');
		});
	}

	/**
	 * GET /api/admin/email-templates/categories
	 * Get available template categories
	 */
	async getCategories(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'EMAIL_TEMPLATE_OPERATION',
			entityType: 'emailTemplate',
			timestamp: new Date()
		});
		return boundary.execute(async () => {
			const categories = [
				{
					value: 'auth',
					label: 'Authentication',
					description: 'Login, registration, password reset emails'
				},
				{
					value: 'notification',
					label: 'Notifications',
					description: 'System notifications and alerts'
				},
				{ value: 'marketing', label: 'Marketing', description: 'Promotional emails and campaigns' },
				{
					value: 'transactional',
					label: 'Transactional',
					description: 'Purchase confirmations, receipts'
				},
				{ value: 'general', label: 'General', description: 'Miscellaneous email templates' }
			];

			return formatAdminResponse(
				{ categories },
				'FETCH_EMAIL_TEMPLATE_CATEGORIES',
				'emailTemplate'
			);
		});
	}
}

// Export controller instance
export const emailTemplateController = new EmailTemplateController();
