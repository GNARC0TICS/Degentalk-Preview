/**
 * Email Template Service
 * 
 * Manages email templates with Markdown support, variable interpolation,
 * and version control for the admin panel
 */

import { db } from '@db';
import { emailTemplates, emailTemplateVersions, emailTemplateLogs } from '@schema';
import { eq, desc, and, ilike, or } from 'drizzle-orm';
import { marked } from 'marked';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { adminCacheService, AdminCacheKeys } from '../../shared/admin-cache.service';
import { z } from 'zod';

// Template variable schema
const templateVariableSchema = z.object({
	name: z.string().min(1).max(50),
	description: z.string().optional(),
	required: z.boolean().default(false),
	type: z.enum(['string', 'number', 'boolean', 'date']).default('string'),
	defaultValue: z.any().optional()
});

// Create/Update template schema
export const emailTemplateSchema = z.object({
	key: z.string().min(1).max(100).regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	category: z.enum(['auth', 'notification', 'marketing', 'transactional', 'general']).default('general'),
	subject: z.string().min(1),
	bodyMarkdown: z.string().min(1),
	variables: z.array(templateVariableSchema).default([]),
	defaultValues: z.record(z.any()).default({}),
	isActive: z.boolean().default(true),
	requiresApproval: z.boolean().default(false)
});

export type CreateEmailTemplateInput = z.infer<typeof emailTemplateSchema>;
export type UpdateEmailTemplateInput = Partial<CreateEmailTemplateInput>;

export class EmailTemplateService {
	/**
	 * Get all email templates with filtering
	 */
	async getAllTemplates(filters?: {
		category?: string;
		isActive?: boolean;
		search?: string;
	}) {
		try {
			let query = db.select().from(emailTemplates);

			if (filters) {
				const conditions = [];

				if (filters.category) {
					conditions.push(eq(emailTemplates.category, filters.category));
				}

				if (filters.isActive !== undefined) {
					conditions.push(eq(emailTemplates.isActive, filters.isActive));
				}

				if (filters.search) {
					conditions.push(
						or(
							ilike(emailTemplates.name, `%${filters.search}%`),
							ilike(emailTemplates.key, `%${filters.search}%`),
							ilike(emailTemplates.description, `%${filters.search}%`)
						)
					);
				}

				if (conditions.length > 0) {
					query = query.where(and(...conditions));
				}
			}

			const templates = await query.orderBy(desc(emailTemplates.updatedAt));

			return templates;
		} catch (error) {
			throw new AdminError('Failed to fetch email templates', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get a single template by ID or key
	 */
	async getTemplate(idOrKey: number | string) {
		try {
			const isId = typeof idOrKey === 'number';
			
			const [template] = await db
				.select()
				.from(emailTemplates)
				.where(
					isId 
						? eq(emailTemplates.id, idOrKey)
						: eq(emailTemplates.key, idOrKey as string)
				);

			if (!template) {
				throw new AdminError(
					`Email template not found: ${idOrKey}`,
					404,
					AdminErrorCodes.NOT_FOUND
				);
			}

			return template;
		} catch (error) {
			if (error instanceof AdminError) throw error;
			
			throw new AdminError('Failed to fetch email template', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Create a new email template
	 */
	async createTemplate(data: CreateEmailTemplateInput, adminId: string) {
		try {
			// Check if key already exists
			const [existing] = await db
				.select()
				.from(emailTemplates)
				.where(eq(emailTemplates.key, data.key));

			if (existing) {
				throw new AdminError(
					`Template with key '${data.key}' already exists`,
					400,
					AdminErrorCodes.DUPLICATE_ENTRY
				);
			}

			// Generate HTML from markdown
			const bodyHtml = await this.renderMarkdown(data.bodyMarkdown);
			const bodyPlainText = this.stripHtml(bodyHtml);

			// Create template
			const [template] = await db
				.insert(emailTemplates)
				.values({
					...data,
					bodyHtml,
					bodyPlainText,
					createdBy: adminId,
					updatedBy: adminId
				})
				.returning();

			// Invalidate cache
			await adminCacheService.invalidateEntity('emailTemplate');

			return template;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to create email template', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Update an email template with version control
	 */
	async updateTemplate(
		id: number, 
		data: UpdateEmailTemplateInput, 
		adminId: string,
		changeDescription?: string
	) {
		try {
			// Get current template
			const currentTemplate = await this.getTemplate(id);

			// If body changed, regenerate HTML
			let bodyHtml = currentTemplate.bodyHtml;
			let bodyPlainText = currentTemplate.bodyPlainText;
			
			if (data.bodyMarkdown) {
				bodyHtml = await this.renderMarkdown(data.bodyMarkdown);
				bodyPlainText = this.stripHtml(bodyHtml);
			}

			// Create version history if content changed
			if (
				data.subject && data.subject !== currentTemplate.subject ||
				data.bodyMarkdown && data.bodyMarkdown !== currentTemplate.bodyMarkdown ||
				data.variables && JSON.stringify(data.variables) !== JSON.stringify(currentTemplate.variables)
			) {
				await db.insert(emailTemplateVersions).values({
					templateId: id,
					version: currentTemplate.version,
					subject: currentTemplate.subject,
					bodyMarkdown: currentTemplate.bodyMarkdown,
					bodyHtml: currentTemplate.bodyHtml,
					variables: currentTemplate.variables,
					changeDescription: changeDescription || 'Template updated',
					createdBy: adminId
				});
			}

			// Update template
			const [updatedTemplate] = await db
				.update(emailTemplates)
				.set({
					...data,
					...(data.bodyMarkdown && { bodyHtml, bodyPlainText }),
					version: currentTemplate.version + 1,
					updatedBy: adminId,
					updatedAt: new Date()
				})
				.where(eq(emailTemplates.id, id))
				.returning();

			// Invalidate cache
			await adminCacheService.invalidateEntity('emailTemplate');

			return updatedTemplate;
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to update email template', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Delete an email template (soft delete by deactivating)
	 */
	async deleteTemplate(id: number, adminId: string) {
		try {
			const template = await this.getTemplate(id);

			// Instead of hard delete, deactivate it
			await db
				.update(emailTemplates)
				.set({
					isActive: false,
					updatedBy: adminId,
					updatedAt: new Date()
				})
				.where(eq(emailTemplates.id, id));

			// Invalidate cache
			await adminCacheService.invalidateEntity('emailTemplate');

			return { success: true };
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to delete email template', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Preview template with sample data
	 */
	async previewTemplate(
		idOrKey: number | string,
		sampleData: Record<string, any> = {}
	) {
		try {
			const template = await this.getTemplate(idOrKey);
			
			// Merge with default values
			const variables = {
				...template.defaultValues,
				...sampleData
			};

			// Interpolate variables
			const subject = this.interpolateVariables(template.subject, variables);
			const bodyHtml = this.interpolateVariables(template.bodyHtml || '', variables);
			const bodyPlainText = this.interpolateVariables(template.bodyPlainText || '', variables);

			return {
				template,
				preview: {
					subject,
					bodyHtml,
					bodyPlainText,
					variables
				}
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to preview email template', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get template version history
	 */
	async getTemplateVersions(templateId: number) {
		try {
			const versions = await db
				.select()
				.from(emailTemplateVersions)
				.where(eq(emailTemplateVersions.templateId, templateId))
				.orderBy(desc(emailTemplateVersions.version));

			return versions;
		} catch (error) {
			throw new AdminError('Failed to fetch template versions', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Restore a previous version
	 */
	async restoreVersion(templateId: number, versionId: number, adminId: string) {
		try {
			// Get the version to restore
			const [version] = await db
				.select()
				.from(emailTemplateVersions)
				.where(
					and(
						eq(emailTemplateVersions.id, versionId),
						eq(emailTemplateVersions.templateId, templateId)
					)
				);

			if (!version) {
				throw new AdminError('Template version not found', 404, AdminErrorCodes.NOT_FOUND);
			}

			// Update template with version data
			return await this.updateTemplate(
				templateId,
				{
					subject: version.subject,
					bodyMarkdown: version.bodyMarkdown,
					variables: version.variables as any
				},
				adminId,
				`Restored to version ${version.version}`
			);
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to restore template version', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get template usage statistics
	 */
	async getTemplateStats(templateId: number, days: number = 30) {
		try {
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const logs = await db
				.select()
				.from(emailTemplateLogs)
				.where(
					and(
						eq(emailTemplateLogs.templateId, templateId),
						eq(emailTemplateLogs.sentAt, startDate.toISOString())
					)
				);

			const stats = {
				totalSent: logs.length,
				successful: logs.filter(l => l.status === 'sent').length,
				failed: logs.filter(l => l.status === 'failed').length,
				bounced: logs.filter(l => l.status === 'bounced').length,
				opened: logs.filter(l => l.openedAt).length,
				clicked: logs.filter(l => l.clickedAt).length,
				openRate: 0,
				clickRate: 0
			};

			if (stats.totalSent > 0) {
				stats.openRate = (stats.opened / stats.totalSent) * 100;
				stats.clickRate = (stats.clicked / stats.totalSent) * 100;
			}

			return stats;
		} catch (error) {
			throw new AdminError('Failed to fetch template statistics', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	// Private helper methods

	private async renderMarkdown(markdown: string): Promise<string> {
		// Configure marked for security
		marked.setOptions({
			breaks: true,
			gfm: true,
			sanitize: false // We'll sanitize on the frontend
		});

		return marked(markdown);
	}

	private stripHtml(html: string): string {
		return html.replace(/<[^>]*>?/gm, '');
	}

	private interpolateVariables(text: string, variables: Record<string, any>): string {
		return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
			return variables[key] !== undefined ? String(variables[key]) : match;
		});
	}

	/**
	 * Send email using template (integrate with your email service)
	 */
	async sendEmail(
		templateKey: string,
		recipientEmail: string,
		variables: Record<string, any>,
		recipientUserId?: string
	) {
		try {
			const template = await this.getTemplate(templateKey);

			if (!template.isActive) {
				throw new AdminError('Template is not active', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			// Interpolate variables
			const subject = this.interpolateVariables(template.subject, variables);
			const bodyHtml = this.interpolateVariables(template.bodyHtml || '', variables);
			const bodyPlainText = this.interpolateVariables(template.bodyPlainText || '', variables);

			// TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
			// For now, just log it
			console.log('Sending email:', {
				to: recipientEmail,
				subject,
				template: templateKey
			});

			// Log email send
			await db.insert(emailTemplateLogs).values({
				templateId: template.id,
				recipientEmail,
				recipientUserId,
				subject,
				variablesUsed: variables,
				status: 'sent'
			});

			// Update template usage
			await db
				.update(emailTemplates)
				.set({
					lastUsedAt: new Date(),
					useCount: template.useCount + 1
				})
				.where(eq(emailTemplates.id, template.id));

			return { success: true, subject, preview: bodyPlainText.substring(0, 100) };
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to send email', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}
}

// Export singleton instance
export const emailTemplateService = new EmailTemplateService();