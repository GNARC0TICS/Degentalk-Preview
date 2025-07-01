import {
	pgTable,
	serial,
	varchar,
	text,
	boolean,
	timestamp,
	jsonb,
	uuid
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from '../user/users';

export const emailTemplates = pgTable('email_templates', {
	id: uuid('id').primaryKey().defaultRandom(),
	key: varchar('key', { length: 100 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	category: varchar('category', { length: 50 }).notNull().default('general'),

	// Template content
	subject: text('subject').notNull(),
	bodyMarkdown: text('body_markdown').notNull(),
	bodyHtml: text('body_html'), // Generated from markdown
	bodyPlainText: text('body_plain_text'), // Fallback plain text

	// Template variables and metadata
	variables: jsonb('variables').default({}).notNull(), // { name: string, description: string, required: boolean }[]
	defaultValues: jsonb('default_values').default({}), // Default variable values for testing

	// Settings
	isActive: boolean('is_active').default(true).notNull(),
	requiresApproval: boolean('requires_approval').default(false).notNull(),

	// Tracking
	lastUsedAt: timestamp('last_used_at', { mode: 'string' }),
	useCount: serial('use_count').notNull(),

	// Audit
	createdBy: uuid('created_by').references(() => users.id),
	updatedBy: uuid('updated_by').references(() => users.id),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),

	// Version control
	version: serial('version').notNull(),
	previousVersionId: serial('previous_version_id')
});

export const emailTemplateVersions = pgTable('email_template_versions', {
	id: uuid('id').primaryKey().defaultRandom(),
	templateId: serial('template_id')
		.notNull()
		.references(() => emailTemplates.id),
	version: serial('version').notNull(),

	// Snapshot of template at this version
	subject: text('subject').notNull(),
	bodyMarkdown: text('body_markdown').notNull(),
	bodyHtml: text('body_html'),
	variables: jsonb('variables').default({}).notNull(),

	// Version metadata
	changeDescription: text('change_description'),
	createdBy: uuid('created_by').references(() => users.id),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull()
});

export const emailTemplateLogs = pgTable('email_template_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	templateId: serial('template_id')
		.notNull()
		.references(() => emailTemplates.id),
	recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
	recipientUserId: uuid('recipient_user_id').references(() => users.id),

	// Email details
	subject: text('subject').notNull(),
	variablesUsed: jsonb('variables_used').default({}),

	// Status
	status: varchar('status', { length: 20 }).notNull().default('sent'), // sent, failed, bounced, opened
	errorMessage: text('error_message'),

	// Tracking
	sentAt: timestamp('sent_at', { mode: 'string' }).defaultNow().notNull(),
	openedAt: timestamp('opened_at', { mode: 'string' }),
	clickedAt: timestamp('clicked_at', { mode: 'string' })
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailTemplateVersion = typeof emailTemplateVersions.$inferSelect;
export type EmailTemplateLog = typeof emailTemplateLogs.$inferSelect;
