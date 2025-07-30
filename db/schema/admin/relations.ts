/**
 * Admin Domain Relations
 *
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { announcements } from './announcements';
import { auditLogs } from './auditLogs';
import { adminBackups } from './backups';
import { brandConfigurations } from './brandConfig';
import { emailTemplates } from './emailTemplates';
import { featureFlags } from './featureFlags';
import { mediaLibrary } from './mediaLibrary';
import { contentModerationActions } from './moderationActions';
import { moderatorNotes } from './moderator-notes';
import { reportedContent } from './reports';
import { scheduledTasks } from './scheduledTasks';
import { seoMetadata } from './seoMetadata';
import { shoutboxConfig } from './shoutboxConfig';
import { siteSettings } from './siteSettings';
import { siteTemplates } from './templates';
import { adminThemes } from './themes';
import { uiQuotes } from './uiConfig';
import { uiThemes } from './uiThemes';
import { users } from '../user/users';
export const announcementsRelations = relations(announcements, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [announcements.createdBy],
		references: [users.id]
	})
}));
export const auditLogsRelations = relations(auditLogs, ({ one, many }) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	})
}));
export const adminBackupsRelations = relations(adminBackups, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [adminBackups.createdBy],
		references: [users.id]
	})
}));
export const brandConfigurationsRelations = relations(brandConfigurations, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [brandConfigurations.createdBy],
		references: [users.id]
	})
}));
export const emailTemplatesRelations = relations(emailTemplates, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [emailTemplates.createdBy],
		references: [users.id]
	}),
	updatedBy: one(users, {
		fields: [emailTemplates.updatedBy],
		references: [users.id]
	}),
	previousVersion: one(emailTemplates, {
		fields: [emailTemplates.previousVersionId],
		references: [emailTemplates.id]
	})
}));
export const featureFlagsRelations = relations(featureFlags, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [featureFlags.createdBy],
		references: [users.id]
	}),
	updatedBy: one(users, {
		fields: [featureFlags.updatedBy],
		references: [users.id]
	})
}));
export const mediaLibraryRelations = relations(mediaLibrary, ({ one, many }) => ({
	user: one(users, {
		fields: [mediaLibrary.userId],
		references: [users.id]
	}),
	deletedBy: one(users, {
		fields: [mediaLibrary.deletedBy],
		references: [users.id]
	})
}));
export const reportedContentRelations = relations(reportedContent, ({ one, many }) => ({
	resolvedBy: one(users, {
		fields: [reportedContent.resolvedBy],
		references: [users.id]
	})
}));
export const seoMetadataRelations = relations(seoMetadata, ({ one, many }) => ({
	updatedBy: one(users, {
		fields: [seoMetadata.updatedBy],
		references: [users.id]
	})
}));
export const shoutboxConfigRelations = relations(shoutboxConfig, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [shoutboxConfig.createdBy],
		references: [users.id]
	}),
	updatedBy: one(users, {
		fields: [shoutboxConfig.updatedBy],
		references: [users.id]
	})
}));
export const siteSettingsRelations = relations(siteSettings, ({ one, many }) => ({
	updatedBy: one(users, {
		fields: [siteSettings.updatedBy],
		references: [users.id]
	})
}));
export const siteTemplatesRelations = relations(siteTemplates, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [siteTemplates.createdBy],
		references: [users.id]
	})
}));
export const adminThemesRelations = relations(adminThemes, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [adminThemes.createdBy],
		references: [users.id]
	})
}));
export const uiQuotesRelations = relations(uiQuotes, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [uiQuotes.createdBy],
		references: [users.id]
	})
}));
