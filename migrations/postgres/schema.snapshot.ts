import { pgTable, foreignKey, unique, serial, varchar, text, boolean, timestamp, uuid, jsonb, numeric, index, integer, bigint, inet, uniqueIndex, date, type AnyPgColumn, doublePrecision, real, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const adFormat = pgEnum("ad_format", ['banner_728x90', 'banner_300x250', 'banner_320x50', 'native_card', 'sponsored_post', 'video_overlay', 'popup_modal', 'inline_text'])
export const campaignStatus = pgEnum("campaign_status", ['draft', 'active', 'paused', 'completed', 'cancelled'])
export const campaignType = pgEnum("campaign_type", ['display_banner', 'sponsored_thread', 'forum_spotlight', 'user_reward', 'native_content'])
export const contentEditStatus = pgEnum("content_edit_status", ['draft', 'published', 'archived'])
export const contentVisibilityStatus = pgEnum("content_visibility_status", ['draft', 'published', 'hidden', 'shadowbanned', 'archived', 'deleted'])
export const cosmeticType = pgEnum("cosmetic_type", ['avatar_frame', 'badge', 'title', 'sticker', 'emoji_pack', 'profile_theme'])
export const cryptoCurrency = pgEnum("crypto_currency", ['DGT', 'USDT', 'BTC', 'ETH', 'USDC', 'BNB'])
export const eventType = pgEnum("event_type", ['rain_claimed', 'thread_created', 'post_created', 'cosmetic_unlocked', 'level_up', 'badge_earned', 'tip_sent', 'tip_received', 'xp_earned', 'referral_completed', 'product_purchased', 'mission_completed', 'airdrop_claimed'])
export const friendshipStatus = pgEnum("friendship_status", ['pending', 'accepted', 'blocked'])
export const interactionType = pgEnum("interaction_type", ['impression', 'click', 'conversion', 'dgt_reward', 'share', 'save', 'report'])
export const mentionSourceType = pgEnum("mention_source_type", ['post', 'thread', 'chat'])
export const mentionType = pgEnum("mention_type", ['thread', 'post', 'shoutbox', 'whisper'])
export const moderatorNoteType = pgEnum("moderator_note_type", ['thread', 'post', 'user'])
export const notificationType = pgEnum("notification_type", ['info', 'system', 'private_message', 'achievement', 'transaction', 'post_mention', 'thread_reply', 'reaction', 'quest_complete', 'badge_awarded', 'rain_received', 'level_up', 'tip_received', 'airdrop_received', 'referral_complete', 'cosmetic_unlocked', 'mission_complete'])
export const paymentMethod = pgEnum("payment_method", ['dgt_tokens', 'usdt', 'bitcoin', 'ethereum', 'stripe'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'processing', 'confirmed', 'failed', 'refunded', 'disputed'])
export const placementPosition = pgEnum("placement_position", ['header_banner', 'sidebar_top', 'sidebar_middle', 'sidebar_bottom', 'thread_header', 'thread_footer', 'between_posts', 'forum_header', 'zone_header', 'mobile_banner'])
export const promotionStatus = pgEnum("promotion_status", ['pending', 'approved', 'active', 'completed', 'rejected', 'cancelled', 'expired'])
export const promotionType = pgEnum("promotion_type", ['thread_boost', 'announcement_bar', 'pinned_shoutbox', 'profile_spotlight', 'achievement_highlight'])
export const reactionType = pgEnum("reaction_type", ['like', 'helpful'])
export const shoutboxPosition = pgEnum("shoutbox_position", ['sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating'])
export const slotPriority = pgEnum("slot_priority", ['premium', 'standard', 'economy'])
export const subscriptionStatus = pgEnum("subscription_status", ['active', 'expired', 'cancelled', 'lifetime'])
export const subscriptionType = pgEnum("subscription_type", ['vip_pass', 'degen_pass'])
export const ticketStatus = pgEnum("ticket_status", ['open', 'pending', 'resolved', 'closed', 'archived'])
export const tokenTypeAdminAirdrop = pgEnum("token_type_admin_airdrop", ['XP', 'DGT'])
export const transactionStatus = pgEnum("transaction_status", ['pending', 'confirmed', 'failed', 'reversed', 'disputed'])
export const transactionType = pgEnum("transaction_type", ['TIP', 'DEPOSIT', 'WITHDRAWAL', 'ADMIN_ADJUST', 'RAIN', 'AIRDROP', 'SHOP_PURCHASE', 'REWARD', 'REFERRAL_BONUS', 'FEE', 'VAULT_LOCK', 'VAULT_UNLOCK'])
export const userRole = pgEnum("user_role", ['user', 'mod', 'admin'])
export const vaultStatus = pgEnum("vault_status", ['locked', 'unlocked', 'pending_unlock'])
export const withdrawalStatus = pgEnum("withdrawal_status", ['pending', 'approved', 'rejected'])


export const siteSettings = pgTable("site_settings", {
	settingId: serial("setting_id").primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull(),
	value: text(),
	valueType: varchar("value_type", { length: 20 }).default('string').notNull(),
	group: varchar({ length: 100 }).default('general').notNull(),
	description: text(),
	isPublic: boolean("is_public").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "site_settings_updated_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("site_settings_key_unique").on(table.key),
]);

export const adminThemes = pgTable("admin_themes", {
	themeId: serial("theme_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	cssVars: jsonb("css_vars").default({}).notNull(),
	customCss: text("custom_css"),
	isActive: boolean("is_active").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "admin_themes_created_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("admin_themes_name_unique").on(table.name),
]);

export const siteTemplates = pgTable("site_templates", {
	templateId: serial("template_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	content: text().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "site_templates_created_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("site_templates_name_unique").on(table.name),
]);

export const featureFlags = pgTable("feature_flags", {
	flagId: serial("flag_id").primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	isEnabled: boolean("is_enabled").default(false).notNull(),
	config: jsonb().default({}).notNull(),
	accessCode: varchar("access_code", { length: 100 }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	rolloutPercentage: numeric("rollout_percentage", { precision: 5, scale:  2 }).default('100').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "feature_flags_created_by_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "feature_flags_updated_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("feature_flags_key_unique").on(table.key),
]);

export const seoMetadata = pgTable("seo_metadata", {
	metaId: serial("meta_id").primaryKey().notNull(),
	path: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }),
	description: text(),
	keywords: text(),
	ogImage: varchar("og_image", { length: 255 }),
	canonicalUrl: varchar("canonical_url", { length: 255 }),
	robots: varchar({ length: 100 }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "seo_metadata_updated_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("seo_metadata_path_unique").on(table.path),
]);

export const announcements = pgTable("announcements", {
	announcementId: serial("announcement_id").primaryKey().notNull(),
	content: text().notNull(),
	icon: varchar({ length: 50 }),
	type: varchar({ length: 30 }).default('info'),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	priority: integer().default(0),
	visibleTo: jsonb("visible_to").default(["all"]),
	tickerMode: boolean("ticker_mode").default(true),
	link: varchar({ length: 255 }),
	bgColor: varchar("bg_color", { length: 30 }),
	textColor: varchar("text_color", { length: 30 }),
}, (table) => [
	index("idx_announcements_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_announcements_created_by").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "announcements_created_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const scheduledTasks = pgTable("scheduled_tasks", {
	taskId: serial("task_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	taskType: varchar("task_type", { length: 50 }).notNull(),
	frequency: varchar({ length: 50 }).notNull(),
	cronExpression: varchar("cron_expression", { length: 100 }),
	isActive: boolean("is_active").default(true).notNull(),
	lastRunAt: timestamp("last_run_at", { mode: 'string' }),
	nextRunAt: timestamp("next_run_at", { mode: 'string' }),
	lastStatus: varchar("last_status", { length: 50 }),
	lastRunDetails: jsonb("last_run_details").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const uiAnalytics = pgTable("ui_analytics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	quoteId: uuid("quote_id").notNull(),
	eventType: text("event_type").notNull(),
	userId: uuid("user_id"),
	sessionId: text("session_id"),
	page: text(),
	position: text(),
	userAgent: text("user_agent"),
	metadata: jsonb().default({}),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [uiQuotes.id],
			name: "ui_analytics_quote_id_ui_quotes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "ui_analytics_user_id_users_user_id_fk"
		}).onDelete("set null"),
]);

export const uiCollections = pgTable("ui_collections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	type: text().notNull(),
	isActive: boolean("is_active").default(true),
	priority: integer().default(0),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	config: jsonb().default({}),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "ui_collections_created_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const uiQuotes = pgTable("ui_quotes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: text().notNull(),
	headline: text().notNull(),
	subheader: text(),
	tags: text().array().default([""]),
	intensity: integer().default(1),
	theme: text(),
	targetAudience: text("target_audience"),
	isActive: boolean("is_active").default(true),
	displayOrder: integer("display_order").default(0),
	weight: integer().default(1),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	impressions: integer().default(0),
	clicks: integer().default(0),
	variant: text(),
	metadata: jsonb().default({}),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "ui_quotes_created_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const uiThemes = pgTable("ui_themes", {
	themeId: serial("theme_id").primaryKey().notNull(),
	themeKey: text("theme_key").notNull(),
	icon: text(),
	color: text(),
	bgColor: text("bg_color"),
	borderColor: text("border_color"),
	label: text(),
	version: integer().default(1).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	gradient: text(),
	glow: text(),
	glowIntensity: text("glow_intensity"),
	rarityOverlay: text("rarity_overlay"),
}, (table) => [
	unique("ui_themes_theme_key_unique").on(table.themeKey),
]);

export const emailTemplates = pgTable("email_templates", {
	id: serial().primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 50 }).default('general').notNull(),
	subject: text().notNull(),
	bodyMarkdown: text("body_markdown").notNull(),
	bodyHtml: text("body_html"),
	bodyPlainText: text("body_plain_text"),
	variables: jsonb().default({}).notNull(),
	defaultValues: jsonb("default_values").default({}),
	isActive: boolean("is_active").default(true).notNull(),
	requiresApproval: boolean("requires_approval").default(false).notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	useCount: serial("use_count").notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	version: serial().notNull(),
	previousVersionId: serial("previous_version_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "email_templates_created_by_users_user_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "email_templates_updated_by_users_user_id_fk"
		}),
	unique("email_templates_key_unique").on(table.key),
]);

export const emailTemplateVersions = pgTable("email_template_versions", {
	id: serial().primaryKey().notNull(),
	templateId: serial("template_id").notNull(),
	version: serial().notNull(),
	subject: text().notNull(),
	bodyMarkdown: text("body_markdown").notNull(),
	bodyHtml: text("body_html"),
	variables: jsonb().default({}).notNull(),
	changeDescription: text("change_description"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [emailTemplates.id],
			name: "email_template_versions_template_id_email_templates_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "email_template_versions_created_by_users_user_id_fk"
		}),
]);

export const moderatorNotes = pgTable("moderator_notes", {
	id: serial().primaryKey().notNull(),
	type: moderatorNoteType().notNull(),
	itemId: varchar("item_id", { length: 255 }).notNull(),
	note: text().notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "moderator_notes_created_by_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const backupSchedules = pgTable("backup_schedules", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	cronExpression: varchar("cron_expression", { length: 100 }).notNull(),
	timezone: varchar({ length: 50 }).default('UTC'),
	backupType: varchar("backup_type", { length: 50 }).default('full').notNull(),
	backupFormat: varchar("backup_format", { length: 20 }).default('custom'),
	compressionType: varchar("compression_type", { length: 20 }).default('gzip'),
	includedTables: jsonb("included_tables").default([]),
	includedSchemas: jsonb("included_schemas").default(["public"]),
	excludedTables: jsonb("excluded_tables").default([]),
	retentionDays: integer("retention_days").default(30),
	maxBackups: integer("max_backups").default(10),
	isActive: boolean("is_active").default(true),
	lastRunAt: timestamp("last_run_at", { mode: 'string' }),
	nextRunAt: timestamp("next_run_at", { mode: 'string' }),
	lastBackupId: integer("last_backup_id"),
	consecutiveFailures: integer("consecutive_failures").default(0),
	lastError: text("last_error"),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	notifyOnSuccess: boolean("notify_on_success").default(false),
	notifyOnFailure: boolean("notify_on_failure").default(true),
	notificationEmails: jsonb("notification_emails").default([]),
}, (table) => [
	foreignKey({
			columns: [table.lastBackupId],
			foreignColumns: [adminBackups.id],
			name: "backup_schedules_last_backup_id_admin_backups_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "backup_schedules_created_by_users_user_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "backup_schedules_updated_by_users_user_id_fk"
		}),
]);

export const backupSettings = pgTable("backup_settings", {
	id: serial().primaryKey().notNull(),
	storageLocation: text("storage_location").default('/var/backups/degentalk').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	maxStorageSize: bigint("max_storage_size", { mode: "number" }).default(sql`'107374182400'`),
	compressionLevel: integer("compression_level").default(6),
	defaultRetentionDays: integer("default_retention_days").default(30),
	maxManualBackups: integer("max_manual_backups").default(50),
	maxScheduledBackups: integer("max_scheduled_backups").default(100),
	requireApprovalForRestore: boolean("require_approval_for_restore").default(true),
	allowedRestoreRoles: jsonb("allowed_restore_roles").default(["admin"]),
	allowedBackupRoles: jsonb("allowed_backup_roles").default(["admin","mod"]),
	defaultNotificationEmails: jsonb("default_notification_emails").default([]),
	notifyOnLargeBackups: boolean("notify_on_large_backups").default(true),
	largeBackupThresholdMb: integer("large_backup_threshold_mb").default(1000),
	connectionTimeout: integer("connection_timeout").default(30),
	commandTimeout: integer("command_timeout").default(3600),
	maxConcurrentOperations: integer("max_concurrent_operations").default(2),
	cleanupFrequency: varchar("cleanup_frequency", { length: 50 }).default('daily'),
	cleanupTime: varchar("cleanup_time", { length: 10 }).default('02:00'),
	autoCleanupEnabled: boolean("auto_cleanup_enabled").default(true),
	lastCleanupAt: timestamp("last_cleanup_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	diskUsage: bigint("disk_usage", { mode: "number" }).default(0),
	updatedBy: uuid("updated_by"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "backup_settings_updated_by_users_user_id_fk"
		}),
]);

export const restoreOperations = pgTable("restore_operations", {
	id: serial().primaryKey().notNull(),
	operationId: uuid("operation_id").defaultRandom().notNull(),
	displayName: varchar("display_name", { length: 255 }).notNull(),
	description: text(),
	sourceBackupId: integer("source_backup_id").notNull(),
	sourceFilename: varchar("source_filename", { length: 255 }).notNull(),
	restoreType: varchar("restore_type", { length: 50 }).default('full').notNull(),
	targetDatabase: varchar("target_database", { length: 100 }),
	preRestoreBackupId: integer("pre_restore_backup_id"),
	createPreBackup: boolean("create_pre_backup").default(true),
	includedTables: jsonb("included_tables").default([]),
	excludedTables: jsonb("excluded_tables").default([]),
	includeIndexes: boolean("include_indexes").default(true),
	includeConstraints: boolean("include_constraints").default(true),
	includeTriggers: boolean("include_triggers").default(true),
	status: varchar({ length: 20 }).default('pending').notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	preBackupCompletedAt: timestamp("pre_backup_completed_at", { mode: 'string' }),
	restoreStartedAt: timestamp("restore_started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	progressPercent: integer("progress_percent").default(0),
	currentStep: varchar("current_step", { length: 100 }),
	estimatedTimeRemaining: integer("estimated_time_remaining"),
	tablesRestored: integer("tables_restored").default(0),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	rowsRestored: bigint("rows_restored", { mode: "number" }).default(0),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dataSize: bigint("data_size", { mode: "number" }).default(0),
	errorMessage: text("error_message"),
	errorCode: varchar("error_code", { length: 50 }),
	errorStep: varchar("error_step", { length: 100 }),
	canRollback: boolean("can_rollback").default(true),
	initiatedBy: uuid("initiated_by").notNull(),
	approvedBy: uuid("approved_by"),
	confirmationToken: varchar("confirmation_token", { length: 100 }),
	confirmationExpiresAt: timestamp("confirmation_expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	validationWarnings: jsonb("validation_warnings").default([]),
	impactAssessment: jsonb("impact_assessment").default({}),
	metadata: jsonb().default({}),
}, (table) => [
	foreignKey({
			columns: [table.sourceBackupId],
			foreignColumns: [adminBackups.id],
			name: "restore_operations_source_backup_id_admin_backups_id_fk"
		}),
	foreignKey({
			columns: [table.preRestoreBackupId],
			foreignColumns: [adminBackups.id],
			name: "restore_operations_pre_restore_backup_id_admin_backups_id_fk"
		}),
	foreignKey({
			columns: [table.initiatedBy],
			foreignColumns: [users.userId],
			name: "restore_operations_initiated_by_users_user_id_fk"
		}),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.userId],
			name: "restore_operations_approved_by_users_user_id_fk"
		}),
	unique("restore_operations_operation_id_unique").on(table.operationId),
]);

export const brandConfigurations = pgTable("brand_configurations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	version: text().default('1.0.0').notNull(),
	category: text().notNull(),
	themeKey: text("theme_key").notNull(),
	configData: jsonb("config_data").notNull(),
	isActive: boolean("is_active").default(false),
	isDefault: boolean("is_default").default(false),
	environment: text().default('dev'),
	variant: text(),
	weight: integer().default(100),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "brand_configurations_created_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const adminBackups = pgTable("admin_backups", {
	id: serial().primaryKey().notNull(),
	filename: varchar({ length: 255 }).notNull(),
	displayName: varchar("display_name", { length: 255 }).notNull(),
	description: text(),
	backupType: varchar("backup_type", { length: 50 }).default('full').notNull(),
	source: varchar({ length: 50 }).default('manual').notNull(),
	filePath: text("file_path").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }).default(0).notNull(),
	checksumMd5: varchar("checksum_md5", { length: 32 }),
	compressionType: varchar("compression_type", { length: 20 }).default('gzip'),
	databaseName: varchar("database_name", { length: 100 }).notNull(),
	postgresVersion: varchar("postgres_version", { length: 50 }),
	backupFormat: varchar("backup_format", { length: 20 }).default('custom'),
	includedTables: jsonb("included_tables").default([]),
	includedSchemas: jsonb("included_schemas").default(["public"]),
	excludedTables: jsonb("excluded_tables").default([]),
	status: varchar({ length: 20 }).default('pending').notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	errorMessage: text("error_message"),
	errorCode: varchar("error_code", { length: 50 }),
	retryCount: integer("retry_count").default(0),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isProtected: boolean("is_protected").default(false),
	tags: jsonb().default([]),
	metadata: jsonb().default({}),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "admin_backups_created_by_users_user_id_fk"
		}),
	unique("admin_backups_filename_unique").on(table.filename),
]);

export const userMissionProgress = pgTable("user_mission_progress", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	missionId: integer("mission_id").notNull(),
	currentCount: integer("current_count").default(0).notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	isRewardClaimed: boolean("is_reward_claimed").default(false).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	claimedAt: timestamp("claimed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_mission_progress_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.missionId],
			foreignColumns: [missions.id],
			name: "user_mission_progress_mission_id_missions_id_fk"
		}).onDelete("cascade"),
	unique("user_mission_idx").on(table.userId, table.missionId),
]);

export const missions = pgTable("missions", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	requiredAction: varchar("required_action", { length: 100 }).notNull(),
	requiredCount: integer("required_count").default(1).notNull(),
	xpReward: integer("xp_reward").notNull(),
	dgtReward: integer("dgt_reward"),
	badgeReward: varchar("badge_reward", { length: 100 }),
	icon: varchar({ length: 100 }),
	isDaily: boolean("is_daily").default(true).notNull(),
	isWeekly: boolean("is_weekly").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	minLevel: integer("min_level").default(1).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
});

export const leaderboardHistory = pgTable("leaderboard_history", {
	leaderboardId: serial("leaderboard_id").primaryKey().notNull(),
	weekStartDate: timestamp("week_start_date", { mode: 'string' }).notNull(),
	weekEndDate: timestamp("week_end_date", { mode: 'string' }).notNull(),
	leaderboardType: varchar("leaderboard_type", { length: 50 }).notNull(),
	leaderboardData: jsonb("leaderboard_data").default([]).notNull(),
	pathType: varchar("path_type", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const platformStatistics = pgTable("platform_statistics", {
	statId: serial("stat_id").primaryKey().notNull(),
	statKey: varchar("stat_key", { length: 100 }).notNull(),
	statValue: integer("stat_value").default(0).notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("platform_statistics_stat_key_unique").on(table.statKey),
]);

export const rateLimits = pgTable("rate_limits", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	endpoint: text().notNull(),
	count: integer().default(0).notNull(),
	resetAt: timestamp("reset_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const profileAnalytics = pgTable("profile_analytics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	profileUserId: uuid("profile_user_id").notNull(),
	viewerUserId: uuid("viewer_user_id"),
	sessionDuration: integer("session_duration").notNull(),
	tabSwitches: integer("tab_switches").default(0).notNull(),
	actionsPerformed: integer("actions_performed").default(0).notNull(),
	scrollDepth: numeric("scroll_depth", { precision: 3, scale:  2 }).default('0.00').notNull(),
	engagementScore: integer("engagement_score").default(0).notNull(),
	userAgent: text("user_agent"),
	ipAddress: inet("ip_address"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_profile_analytics_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_profile_analytics_engagement").using("btree", table.engagementScore.asc().nullsLast().op("int4_ops")),
	index("idx_profile_analytics_profile_user").using("btree", table.profileUserId.asc().nullsLast().op("uuid_ops")),
	index("idx_profile_analytics_viewer").using("btree", table.viewerUserId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.profileUserId],
			foreignColumns: [users.userId],
			name: "profile_analytics_profile_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.viewerUserId],
			foreignColumns: [users.userId],
			name: "profile_analytics_viewer_user_id_users_user_id_fk"
		}).onDelete("set null"),
]);

export const activityFeed = pgTable("activity_feed", {
	activityId: serial("activity_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	activityType: varchar("activity_type", { length: 50 }).notNull(),
	activityData: jsonb("activity_data").default({}).notNull(),
	isPublic: boolean("is_public").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "activity_feed_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const adminManualAirdropLogs = pgTable("admin_manual_airdrop_logs", {
	id: serial().primaryKey().notNull(),
	adminId: uuid("admin_id").notNull(),
	userId: uuid("user_id").notNull(),
	tokenType: tokenTypeAdminAirdrop("token_type").notNull(),
	amount: integer().notNull(),
	groupId: integer("group_id"),
	note: text(),
	airdropBatchId: uuid("airdrop_batch_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [users.userId],
			name: "admin_manual_airdrop_logs_admin_id_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "admin_manual_airdrop_logs_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [roles.roleId],
			name: "admin_manual_airdrop_logs_group_id_roles_role_id_fk"
		}).onDelete("set null"),
]);

export const userAbuseFlags = pgTable("user_abuse_flags", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	strikeCount: integer("strike_count").default(0).notNull(),
	lastStrikeAt: timestamp("last_strike_at", { mode: 'string' }),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_abuse_flags_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const cooldownState = pgTable("cooldown_state", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	actionKey: varchar("action_key", { length: 100 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "cooldown_state_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const analyticsEvents = pgTable("analytics_events", {
	eventId: serial("event_id").primaryKey().notNull(),
	userId: uuid("user_id"),
	sessionId: uuid("session_id"),
	eventType: varchar("event_type", { length: 100 }).notNull(),
	data: jsonb().default({}).notNull(),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_analytics_events_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_analytics_events_type").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("idx_analytics_events_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "analytics_events_user_id_users_user_id_fk"
		}).onDelete("set null"),
]);

export const mentionsIndex = pgTable("mentions_index", {
	id: serial().primaryKey().notNull(),
	sourceType: mentionSourceType("source_type").notNull(),
	sourceId: integer("source_id").notNull(),
	mentioningUserId: uuid("mentioning_user_id").notNull(),
	mentionedUserId: uuid("mentioned_user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_mentions_mentioned_user").using("btree", table.mentionedUserId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("idx_mentions_unique").using("btree", table.sourceType.asc().nullsLast().op("int4_ops"), table.sourceId.asc().nullsLast().op("uuid_ops"), table.mentionedUserId.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.mentioningUserId],
			foreignColumns: [users.userId],
			name: "mentions_index_mentioning_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mentionedUserId],
			foreignColumns: [users.userId],
			name: "mentions_index_mentioned_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const dictionaryEntries = pgTable("dictionary_entries", {
	id: serial().primaryKey().notNull(),
	slug: text().notNull(),
	word: text().notNull(),
	definition: text().notNull(),
	usageExample: text("usage_example"),
	tags: text().array().default([""]),
	authorId: uuid("author_id").notNull(),
	status: text().default('pending').notNull(),
	approverId: uuid("approver_id"),
	upvoteCount: integer("upvote_count").default(0).notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	featured: boolean().default(false).notNull(),
	metaDescription: text("meta_description"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.userId],
			name: "dictionary_entries_author_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.approverId],
			foreignColumns: [users.userId],
			name: "dictionary_entries_approver_id_users_user_id_fk"
		}).onDelete("set null"),
	unique("dictionary_entries_slug_unique").on(table.slug),
]);

export const referralSources = pgTable("referral_sources", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	metadata: jsonb().default({}),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "referral_sources_created_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("referral_sources_name_unique").on(table.name),
	unique("referral_sources_slug_unique").on(table.slug),
]);

export const economyConfigOverrides = pgTable("economy_config_overrides", {
	id: serial().primaryKey().notNull(),
	config: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const dictionaryUpvotes = pgTable("dictionary_upvotes", {
	id: serial().primaryKey().notNull(),
	entryId: integer("entry_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.entryId],
			foreignColumns: [dictionaryEntries.id],
			name: "dictionary_upvotes_entry_id_dictionary_entries_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "dictionary_upvotes_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("unique_dictionary_upvote").on(table.entryId, table.userId),
]);

export const userMentionPreferences = pgTable("user_mention_preferences", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	emailNotifications: boolean("email_notifications").default(true).notNull(),
	pushNotifications: boolean("push_notifications").default(true).notNull(),
	allowThreadMentions: boolean("allow_thread_mentions").default(true).notNull(),
	allowPostMentions: boolean("allow_post_mentions").default(true).notNull(),
	allowShoutboxMentions: boolean("allow_shoutbox_mentions").default(true).notNull(),
	allowWhisperMentions: boolean("allow_whisper_mentions").default(true).notNull(),
	onlyFriendsMention: boolean("only_friends_mention").default(false).notNull(),
	onlyFollowersMention: boolean("only_followers_mention").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_mention_preferences_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const userReferrals = pgTable("user_referrals", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	referredByUserId: uuid("referred_by_user_id"),
	referralSourceId: integer("referral_source_id"),
	bonusGranted: boolean("bonus_granted").default(false).notNull(),
	rewardMetadata: jsonb("reward_metadata").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_referrals_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.referredByUserId],
			foreignColumns: [users.userId],
			name: "user_referrals_referred_by_user_id_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.referralSourceId],
			foreignColumns: [referralSources.id],
			name: "user_referrals_referral_source_id_referral_sources_id_fk"
		}).onDelete("set null"),
	unique("user_referrals_user_unique").on(table.userId),
]);

export const mentions = pgTable("mentions", {
	id: serial().primaryKey().notNull(),
	mentionedUserId: uuid("mentioned_user_id").notNull(),
	mentioningUserId: uuid("mentioning_user_id").notNull(),
	type: mentionType().notNull(),
	threadId: integer("thread_id"),
	postId: integer("post_id"),
	messageId: varchar("message_id", { length: 255 }),
	mentionText: varchar("mention_text", { length: 100 }).notNull(),
	context: text(),
	isRead: boolean("is_read").default(false).notNull(),
	isNotified: boolean("is_notified").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.mentionedUserId],
			foreignColumns: [users.userId],
			name: "mentions_mentioned_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mentioningUserId],
			foreignColumns: [users.userId],
			name: "mentions_mentioning_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [threads.threadId],
			name: "mentions_thread_id_threads_thread_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.postId],
			name: "mentions_post_id_posts_post_id_fk"
		}).onDelete("cascade"),
]);

export const userFollows = pgTable("user_follows", {
	id: serial().primaryKey().notNull(),
	followerId: uuid("follower_id").notNull(),
	followeeId: uuid("followee_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("followee_idx").using("btree", table.followeeId.asc().nullsLast().op("uuid_ops")),
	index("follower_idx").using("btree", table.followerId.asc().nullsLast().op("uuid_ops")),
	index("follows_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.followerId],
			foreignColumns: [users.userId],
			name: "user_follows_follower_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followeeId],
			foreignColumns: [users.userId],
			name: "user_follows_followee_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("user_follows_follower_id_followee_id_unique").on(table.followerId, table.followeeId),
]);

export const friendGroupMembers = pgTable("friend_group_members", {
	id: serial().primaryKey().notNull(),
	groupId: integer("group_id").notNull(),
	friendshipId: integer("friendship_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [friendGroups.id],
			name: "friend_group_members_group_id_friend_groups_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.friendshipId],
			foreignColumns: [friendships.id],
			name: "friend_group_members_friendship_id_friendships_id_fk"
		}).onDelete("cascade"),
]);

export const friendships = pgTable("friendships", {
	id: serial().primaryKey().notNull(),
	requesterId: uuid("requester_id").notNull(),
	addresseeId: uuid("addressee_id").notNull(),
	status: friendshipStatus().default('pending').notNull(),
	requestMessage: text("request_message"),
	allowWhispers: boolean("allow_whispers").default(true).notNull(),
	allowProfileView: boolean("allow_profile_view").default(true).notNull(),
	allowActivityView: boolean("allow_activity_view").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.requesterId],
			foreignColumns: [users.userId],
			name: "friendships_requester_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.addresseeId],
			foreignColumns: [users.userId],
			name: "friendships_addressee_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const userFriendPreferences = pgTable("user_friend_preferences", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	allowAllFriendRequests: boolean("allow_all_friend_requests").default(true).notNull(),
	onlyMutualsCanRequest: boolean("only_mutuals_can_request").default(false).notNull(),
	requireMinLevel: boolean("require_min_level").default(false).notNull(),
	minLevelRequired: integer("min_level_required").default(1),
	autoAcceptFromFollowers: boolean("auto_accept_from_followers").default(false).notNull(),
	autoAcceptFromWhales: boolean("auto_accept_from_whales").default(false).notNull(),
	hideFriendsList: boolean("hide_friends_list").default(false).notNull(),
	hideFriendCount: boolean("hide_friend_count").default(false).notNull(),
	showOnlineStatus: boolean("show_online_status").default(true).notNull(),
	notifyOnFriendRequest: boolean("notify_on_friend_request").default(true).notNull(),
	notifyOnFriendAccept: boolean("notify_on_friend_accept").default(true).notNull(),
	emailOnFriendRequest: boolean("email_on_friend_request").default(false).notNull(),
	defaultAllowWhispers: boolean("default_allow_whispers").default(true).notNull(),
	defaultAllowProfileView: boolean("default_allow_profile_view").default(true).notNull(),
	defaultAllowActivityView: boolean("default_allow_activity_view").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_friend_preferences_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const depositRecords = pgTable("deposit_records", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	recordId: varchar("record_id", { length: 255 }).notNull(),
	coinId: integer("coin_id").notNull(),
	coinSymbol: varchar("coin_symbol", { length: 20 }).notNull(),
	chain: varchar({ length: 50 }).notNull(),
	contract: varchar({ length: 255 }),
	amount: numeric({ precision: 36, scale:  18 }).notNull(),
	serviceFee: numeric("service_fee", { precision: 36, scale:  18 }),
	coinUsdPrice: numeric("coin_usd_price", { precision: 18, scale:  8 }),
	usdtAmount: numeric("usdt_amount", { precision: 36, scale:  18 }),
	dgtAmount: numeric("dgt_amount", { precision: 36, scale:  18 }),
	conversionRate: numeric("conversion_rate", { precision: 10, scale:  4 }),
	originalToken: varchar("original_token", { length: 20 }),
	fromAddress: varchar("from_address", { length: 255 }),
	toAddress: varchar("to_address", { length: 255 }).notNull(),
	toMemo: varchar("to_memo", { length: 255 }),
	txId: varchar("tx_id", { length: 255 }),
	status: varchar({ length: 20 }).notNull(),
	isFlaggedRisky: boolean("is_flagged_risky").default(false),
	arrivedAt: timestamp("arrived_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_deposit_records_chain").using("btree", table.chain.asc().nullsLast().op("text_ops")),
	index("idx_deposit_records_coin_id").using("btree", table.coinId.asc().nullsLast().op("int4_ops")),
	index("idx_deposit_records_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_deposit_records_record_id").using("btree", table.recordId.asc().nullsLast().op("text_ops")),
	index("idx_deposit_records_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_deposit_records_tx_id").using("btree", table.txId.asc().nullsLast().op("text_ops")),
	index("idx_deposit_records_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "deposit_records_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("deposit_records_record_id_unique").on(table.recordId),
]);

export const withdrawalRecords = pgTable("withdrawal_records", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	recordId: varchar("record_id", { length: 255 }).notNull(),
	coinId: integer("coin_id").notNull(),
	coinSymbol: varchar("coin_symbol", { length: 20 }).notNull(),
	chain: varchar({ length: 50 }).notNull(),
	contract: varchar({ length: 255 }),
	amount: numeric({ precision: 36, scale:  18 }).notNull(),
	serviceFee: numeric("service_fee", { precision: 36, scale:  18 }),
	coinUsdPrice: numeric("coin_usd_price", { precision: 18, scale:  8 }),
	fromAddress: varchar("from_address", { length: 255 }),
	toAddress: varchar("to_address", { length: 255 }).notNull(),
	toMemo: varchar("to_memo", { length: 255 }),
	txId: varchar("tx_id", { length: 255 }),
	withdrawType: varchar("withdraw_type", { length: 20 }).notNull(),
	status: varchar({ length: 20 }).notNull(),
	failureReason: varchar("failure_reason", { length: 500 }),
	isFlaggedRisky: boolean("is_flagged_risky").default(false),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_withdrawal_records_chain").using("btree", table.chain.asc().nullsLast().op("text_ops")),
	index("idx_withdrawal_records_coin_id").using("btree", table.coinId.asc().nullsLast().op("int4_ops")),
	index("idx_withdrawal_records_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_withdrawal_records_record_id").using("btree", table.recordId.asc().nullsLast().op("text_ops")),
	index("idx_withdrawal_records_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_withdrawal_records_tx_id").using("btree", table.txId.asc().nullsLast().op("text_ops")),
	index("idx_withdrawal_records_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("idx_withdrawal_records_withdraw_type").using("btree", table.withdrawType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "withdrawal_records_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("withdrawal_records_record_id_unique").on(table.recordId),
]);

export const internalTransfers = pgTable("internal_transfers", {
	id: serial().primaryKey().notNull(),
	fromUserId: uuid("from_user_id").notNull(),
	toUserId: uuid("to_user_id").notNull(),
	recordId: varchar("record_id", { length: 255 }).notNull(),
	coinId: integer("coin_id").notNull(),
	coinSymbol: varchar("coin_symbol", { length: 20 }).notNull(),
	amount: numeric({ precision: 36, scale:  18 }).notNull(),
	serviceFee: numeric("service_fee", { precision: 36, scale:  18 }),
	coinUsdPrice: numeric("coin_usd_price", { precision: 18, scale:  8 }),
	status: varchar({ length: 20 }).notNull(),
	failureReason: varchar("failure_reason", { length: 500 }),
	note: varchar({ length: 1000 }),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_internal_transfers_coin_id").using("btree", table.coinId.asc().nullsLast().op("int4_ops")),
	index("idx_internal_transfers_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_internal_transfers_from_user_id").using("btree", table.fromUserId.asc().nullsLast().op("uuid_ops")),
	index("idx_internal_transfers_record_id").using("btree", table.recordId.asc().nullsLast().op("text_ops")),
	index("idx_internal_transfers_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_internal_transfers_to_user_id").using("btree", table.toUserId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.userId],
			name: "internal_transfers_from_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.toUserId],
			foreignColumns: [users.userId],
			name: "internal_transfers_to_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("internal_transfers_record_id_unique").on(table.recordId),
]);

export const friendGroups = pgTable("friend_groups", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: text(),
	color: varchar({ length: 7 }).default('#3b82f6'),
	isDefault: boolean("is_default").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "friend_groups_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const ccpaymentUsers = pgTable("ccpayment_users", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	ccpaymentUserId: varchar("ccpayment_user_id", { length: 64 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ccpayment_users_ccpayment_user_id").using("btree", table.ccpaymentUserId.asc().nullsLast().op("text_ops")),
	index("idx_ccpayment_users_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "ccpayment_users_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("ccpayment_users_ccpayment_user_id_unique").on(table.ccpaymentUserId),
]);

export const cryptoWallets = pgTable("crypto_wallets", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	ccpaymentUserId: varchar("ccpayment_user_id", { length: 64 }).notNull(),
	coinId: integer("coin_id").notNull(),
	coinSymbol: varchar("coin_symbol", { length: 20 }).notNull(),
	chain: varchar({ length: 50 }).notNull(),
	address: varchar({ length: 255 }).notNull(),
	memo: varchar({ length: 255 }),
	qrCodeUrl: text("qr_code_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_crypto_wallets_address").using("btree", table.address.asc().nullsLast().op("text_ops")),
	index("idx_crypto_wallets_ccpayment_user_id").using("btree", table.ccpaymentUserId.asc().nullsLast().op("text_ops")),
	index("idx_crypto_wallets_coin_chain").using("btree", table.coinId.asc().nullsLast().op("int4_ops"), table.chain.asc().nullsLast().op("int4_ops")),
	index("idx_crypto_wallets_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "crypto_wallets_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const webhookEvents = pgTable("webhook_events", {
	id: serial().primaryKey().notNull(),
	webhookId: varchar("webhook_id", { length: 255 }).notNull(),
	eventType: varchar("event_type", { length: 50 }).notNull(),
	status: varchar({ length: 20 }).notNull(),
	rawPayload: text("raw_payload").notNull(),
	signature: varchar({ length: 500 }),
	isProcessed: boolean("is_processed").default(false),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	processingError: text("processing_error"),
	retryCount: varchar("retry_count", { length: 10 }).default('0'),
	relatedRecordType: varchar("related_record_type", { length: 50 }),
	relatedRecordId: varchar("related_record_id", { length: 255 }),
	receivedAt: timestamp("received_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_webhook_events_event_type").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("idx_webhook_events_is_processed").using("btree", table.isProcessed.asc().nullsLast().op("bool_ops")),
	index("idx_webhook_events_received_at").using("btree", table.receivedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_webhook_events_related_record").using("btree", table.relatedRecordType.asc().nullsLast().op("text_ops"), table.relatedRecordId.asc().nullsLast().op("text_ops")),
	index("idx_webhook_events_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_webhook_events_webhook_id").using("btree", table.webhookId.asc().nullsLast().op("text_ops")),
	unique("webhook_events_webhook_id_unique").on(table.webhookId),
]);

export const supportedTokens = pgTable("supported_tokens", {
	id: serial().primaryKey().notNull(),
	coinId: integer("coin_id").notNull(),
	coinSymbol: varchar("coin_symbol", { length: 20 }).notNull(),
	coinName: varchar("coin_name", { length: 100 }).notNull(),
	chain: varchar({ length: 50 }).notNull(),
	contract: varchar({ length: 255 }),
	decimals: integer().default(18).notNull(),
	minDepositAmount: numeric("min_deposit_amount", { precision: 36, scale:  18 }),
	minWithdrawAmount: numeric("min_withdraw_amount", { precision: 36, scale:  18 }),
	withdrawFee: numeric("withdraw_fee", { precision: 36, scale:  18 }),
	isActive: boolean("is_active").default(true),
	supportsDeposit: boolean("supports_deposit").default(true),
	supportsWithdraw: boolean("supports_withdraw").default(true),
	supportsSwap: boolean("supports_swap").default(true),
	iconUrl: varchar("icon_url", { length: 500 }),
	explorerUrl: varchar("explorer_url", { length: 500 }),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_supported_tokens_chain").using("btree", table.chain.asc().nullsLast().op("text_ops")),
	index("idx_supported_tokens_coin_id").using("btree", table.coinId.asc().nullsLast().op("int4_ops")),
	index("idx_supported_tokens_coin_symbol").using("btree", table.coinSymbol.asc().nullsLast().op("text_ops")),
	index("idx_supported_tokens_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_supported_tokens_supports_deposit").using("btree", table.supportsDeposit.asc().nullsLast().op("bool_ops")),
	index("idx_supported_tokens_supports_swap").using("btree", table.supportsSwap.asc().nullsLast().op("bool_ops")),
	index("idx_supported_tokens_supports_withdraw").using("btree", table.supportsWithdraw.asc().nullsLast().op("bool_ops")),
	unique("supported_tokens_coin_id_unique").on(table.coinId),
]);

export const stickerUsage = pgTable("sticker_usage", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	stickerId: integer("sticker_id").notNull(),
	contextType: varchar("context_type", { length: 20 }).notNull(),
	contextId: varchar("context_id", { length: 50 }),
	usedAt: timestamp("used_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
}, (table) => [
	index("idx_sticker_usage_context_type").using("btree", table.contextType.asc().nullsLast().op("text_ops")),
	index("idx_sticker_usage_sticker_id").using("btree", table.stickerId.asc().nullsLast().op("int4_ops")),
	index("idx_sticker_usage_used_at").using("btree", table.usedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_sticker_usage_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "sticker_usage_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.stickerId],
			foreignColumns: [stickers.id],
			name: "sticker_usage_sticker_id_stickers_id_fk"
		}).onDelete("cascade"),
]);

export const userStickerInventory = pgTable("user_sticker_inventory", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	stickerId: integer("sticker_id").notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }).defaultNow().notNull(),
	unlockMethod: varchar("unlock_method", { length: 20 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pricePaid: bigint("price_paid", { mode: "number" }).default(0),
	isEquipped: boolean("is_equipped").default(false).notNull(),
	slotPosition: integer("slot_position"),
	usageCount: integer("usage_count").default(0).notNull(),
	lastUsed: timestamp("last_used", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_user_sticker_inventory_is_equipped").using("btree", table.isEquipped.asc().nullsLast().op("bool_ops")),
	index("idx_user_sticker_inventory_slot_position").using("btree", table.slotPosition.asc().nullsLast().op("int4_ops")),
	index("idx_user_sticker_inventory_sticker_id").using("btree", table.stickerId.asc().nullsLast().op("int4_ops")),
	index("idx_user_sticker_inventory_unique").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.stickerId.asc().nullsLast().op("uuid_ops")),
	index("idx_user_sticker_inventory_unlocked_at").using("btree", table.unlockedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_user_sticker_inventory_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_sticker_inventory_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.stickerId],
			foreignColumns: [stickers.id],
			name: "user_sticker_inventory_sticker_id_stickers_id_fk"
		}).onDelete("cascade"),
]);

export const swapRecords = pgTable("swap_records", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	recordId: varchar("record_id", { length: 255 }).notNull(),
	fromCoinId: integer("from_coin_id").notNull(),
	fromCoinSymbol: varchar("from_coin_symbol", { length: 20 }).notNull(),
	fromAmount: numeric("from_amount", { precision: 36, scale:  18 }).notNull(),
	fromCoinUsdPrice: numeric("from_coin_usd_price", { precision: 18, scale:  8 }),
	toCoinId: integer("to_coin_id").notNull(),
	toCoinSymbol: varchar("to_coin_symbol", { length: 20 }).notNull(),
	toAmount: numeric("to_amount", { precision: 36, scale:  18 }).notNull(),
	toCoinUsdPrice: numeric("to_coin_usd_price", { precision: 18, scale:  8 }),
	exchangeRate: numeric("exchange_rate", { precision: 36, scale:  18 }),
	serviceFee: numeric("service_fee", { precision: 36, scale:  18 }),
	status: varchar({ length: 20 }).notNull(),
	failureReason: varchar("failure_reason", { length: 500 }),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_swap_records_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_swap_records_from_coin_id").using("btree", table.fromCoinId.asc().nullsLast().op("int4_ops")),
	index("idx_swap_records_record_id").using("btree", table.recordId.asc().nullsLast().op("text_ops")),
	index("idx_swap_records_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_swap_records_to_coin_id").using("btree", table.toCoinId.asc().nullsLast().op("int4_ops")),
	index("idx_swap_records_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "swap_records_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("swap_records_record_id_unique").on(table.recordId),
]);

export const stickerPacks = pgTable("sticker_packs", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 150 }).notNull(),
	description: text(),
	coverUrl: varchar("cover_url", { length: 255 }),
	previewUrl: varchar("preview_url", { length: 255 }),
	theme: varchar({ length: 50 }),
	totalStickers: integer("total_stickers").default(0).notNull(),
	unlockType: varchar("unlock_type", { length: 20 }).default('shop').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	priceDgt: bigint("price_dgt", { mode: "number" }).default(0),
	requiredXp: integer("required_xp"),
	requiredLevel: integer("required_level"),
	isActive: boolean("is_active").default(true).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	isPromoted: boolean("is_promoted").default(false).notNull(),
	sortOrder: integer("sort_order").default(0),
	totalUnlocks: integer("total_unlocks").default(0).notNull(),
	popularityScore: integer("popularity_score").default(0).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	adminNotes: text("admin_notes"),
}, (table) => [
	index("idx_sticker_packs_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_sticker_packs_is_promoted").using("btree", table.isPromoted.asc().nullsLast().op("bool_ops")),
	index("idx_sticker_packs_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_sticker_packs_sort_order").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
	index("idx_sticker_packs_theme").using("btree", table.theme.asc().nullsLast().op("text_ops")),
	index("idx_sticker_packs_unlock_type").using("btree", table.unlockType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "sticker_packs_created_by_users_user_id_fk"
		}),
	unique("sticker_packs_name_unique").on(table.name),
]);

export const stickers = pgTable("stickers", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	displayName: varchar("display_name", { length: 100 }).notNull(),
	shortcode: varchar({ length: 30 }).notNull(),
	description: text(),
	staticUrl: varchar("static_url", { length: 255 }).notNull(),
	animatedUrl: varchar("animated_url", { length: 255 }),
	thumbnailUrl: varchar("thumbnail_url", { length: 255 }),
	width: integer().default(128),
	height: integer().default(128),
	staticFileSize: integer("static_file_size"),
	animatedFileSize: integer("animated_file_size"),
	format: varchar({ length: 15 }).default('webp'),
	rarity: varchar({ length: 20 }).default('common').notNull(),
	packId: integer("pack_id"),
	unlockType: varchar("unlock_type", { length: 20 }).default('shop').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	priceDgt: bigint("price_dgt", { mode: "number" }).default(0),
	requiredXp: integer("required_xp"),
	requiredLevel: integer("required_level"),
	isActive: boolean("is_active").default(true).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	isAnimated: boolean("is_animated").default(false).notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	totalUnlocks: integer("total_unlocks").default(0).notNull(),
	totalUsage: integer("total_usage").default(0).notNull(),
	popularityScore: integer("popularity_score").default(0).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	adminNotes: text("admin_notes"),
	tags: text(),
}, (table) => [
	index("idx_stickers_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_stickers_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_stickers_is_animated").using("btree", table.isAnimated.asc().nullsLast().op("bool_ops")),
	index("idx_stickers_is_visible").using("btree", table.isVisible.asc().nullsLast().op("bool_ops")),
	index("idx_stickers_pack_id").using("btree", table.packId.asc().nullsLast().op("int4_ops")),
	index("idx_stickers_popularity").using("btree", table.popularityScore.asc().nullsLast().op("int4_ops")),
	index("idx_stickers_rarity").using("btree", table.rarity.asc().nullsLast().op("text_ops")),
	index("idx_stickers_shortcode").using("btree", table.shortcode.asc().nullsLast().op("text_ops")),
	index("idx_stickers_unlock_type").using("btree", table.unlockType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.packId],
			foreignColumns: [stickerPacks.id],
			name: "stickers_pack_id_sticker_packs_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "stickers_created_by_users_user_id_fk"
		}),
	unique("stickers_name_unique").on(table.name),
	unique("stickers_shortcode_unique").on(table.shortcode),
]);

export const userStickerPacks = pgTable("user_sticker_packs", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	packId: integer("pack_id").notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }).defaultNow().notNull(),
	unlockMethod: varchar("unlock_method", { length: 20 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pricePaid: bigint("price_paid", { mode: "number" }).default(0),
	stickersUnlocked: integer("stickers_unlocked").default(0).notNull(),
	totalStickers: integer("total_stickers").default(0).notNull(),
	isComplete: boolean("is_complete").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_user_sticker_packs_pack_id").using("btree", table.packId.asc().nullsLast().op("int4_ops")),
	index("idx_user_sticker_packs_unique").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.packId.asc().nullsLast().op("uuid_ops")),
	index("idx_user_sticker_packs_unlocked_at").using("btree", table.unlockedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_user_sticker_packs_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_sticker_packs_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.packId],
			foreignColumns: [stickerPacks.id],
			name: "user_sticker_packs_pack_id_sticker_packs_id_fk"
		}).onDelete("cascade"),
]);

export const campaigns = pgTable("campaigns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	advertiserUserId: uuid("advertiser_user_id").notNull(),
	type: campaignType().notNull(),
	status: campaignStatus().default('draft').notNull(),
	totalBudget: numeric("total_budget", { precision: 12, scale:  2 }),
	dailyBudget: numeric("daily_budget", { precision: 10, scale:  2 }),
	spentAmount: numeric("spent_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	paymentMethod: paymentMethod("payment_method").notNull(),
	pricingModel: varchar("pricing_model", { length: 10 }).notNull(),
	bidAmount: numeric("bid_amount", { precision: 8, scale:  4 }),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	targetingRules: jsonb("targeting_rules").default({}).notNull(),
	placementRules: jsonb("placement_rules").default({}).notNull(),
	frequencyCap: jsonb("frequency_cap").default({}).notNull(),
	creativeAssets: jsonb("creative_assets").default([]).notNull(),
	optimizationGoal: varchar("optimization_goal", { length: 50 }),
	qualityScore: numeric("quality_score", { precision: 3, scale:  2 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.advertiserUserId],
			foreignColumns: [users.userId],
			name: "campaigns_advertiser_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const campaignRules = pgTable("campaign_rules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 500 }),
	campaignId: uuid("campaign_id"),
	ruleType: varchar("rule_type", { length: 50 }).notNull(),
	conditions: jsonb().notNull(),
	actions: jsonb().notNull(),
	priority: integer().default(1).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	validFrom: timestamp("valid_from", { mode: 'string' }),
	validUntil: timestamp("valid_until", { mode: 'string' }),
	executionCount: integer("execution_count").default(0).notNull(),
	lastExecutedAt: timestamp("last_executed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const adPlacements = pgTable("ad_placements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	position: placementPosition().notNull(),
	forumZoneSlug: varchar("forum_zone_slug", { length: 100 }),
	forumSlug: varchar("forum_slug", { length: 100 }),
	allowedFormats: jsonb("allowed_formats").default([]).notNull(),
	dimensions: varchar({ length: 20 }),
	maxFileSize: integer("max_file_size").default(2097152),
	floorPriceCpm: numeric("floor_price_cpm", { precision: 6, scale:  2 }).default('0.50').notNull(),
	maxDailyImpressions: integer("max_daily_impressions"),
	priority: integer().default(1).notNull(),
	targetingConstraints: jsonb("targeting_constraints").default({}).notNull(),
	displayRules: jsonb("display_rules").default({}).notNull(),
	averageCtr: numeric("average_ctr", { precision: 5, scale:  4 }).default('0.0'),
	totalImpressions: integer("total_impressions").default(0).notNull(),
	totalClicks: integer("total_clicks").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	requiresApproval: boolean("requires_approval").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("ad_placements_slug_unique").on(table.slug),
]);

export const adGovernanceVotes = pgTable("ad_governance_votes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	proposalId: uuid("proposal_id").notNull(),
	voterUserId: uuid("voter_user_id").notNull(),
	vote: varchar({ length: 10 }).notNull(),
	votingPower: numeric("voting_power", { precision: 18, scale:  2 }).notNull(),
	voteReason: text("vote_reason"),
	delegatedFrom: uuid("delegated_from"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.proposalId],
			foreignColumns: [adGovernanceProposals.id],
			name: "ad_governance_votes_proposal_id_ad_governance_proposals_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.voterUserId],
			foreignColumns: [users.userId],
			name: "ad_governance_votes_voter_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const cryptoPayments = pgTable("crypto_payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	paymentHash: varchar("payment_hash", { length: 64 }).notNull(),
	campaignId: uuid("campaign_id").notNull(),
	payerUserId: uuid("payer_user_id").notNull(),
	currency: cryptoCurrency().notNull(),
	amount: numeric({ precision: 18, scale:  8 }).notNull(),
	usdValue: numeric("usd_value", { precision: 12, scale:  2 }),
	transactionHash: varchar("transaction_hash", { length: 66 }),
	blockNumber: integer("block_number"),
	blockchainNetwork: varchar("blockchain_network", { length: 50 }),
	fromAddress: varchar("from_address", { length: 42 }),
	toAddress: varchar("to_address", { length: 42 }),
	status: paymentStatus().default('pending').notNull(),
	confirmations: integer().default(0),
	requiredConfirmations: integer("required_confirmations").default(3),
	networkFee: numeric("network_fee", { precision: 18, scale:  8 }),
	platformFee: numeric("platform_fee", { precision: 12, scale:  2 }),
	processingFee: numeric("processing_fee", { precision: 12, scale:  2 }),
	paymentMetadata: jsonb("payment_metadata").default({}),
	failureReason: text("failure_reason"),
	initiatedAt: timestamp("initiated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	confirmedAt: timestamp("confirmed_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [campaigns.id],
			name: "crypto_payments_campaign_id_campaigns_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.payerUserId],
			foreignColumns: [users.userId],
			name: "crypto_payments_payer_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("crypto_payments_payment_hash_unique").on(table.paymentHash),
]);

export const announcementSlots = pgTable("announcement_slots", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slotNumber: integer("slot_number").notNull(),
	priority: slotPriority().default('standard').notNull(),
	date: date().notNull(),
	hourStart: integer("hour_start").notNull(),
	hourEnd: integer("hour_end").notNull(),
	userPromotionId: uuid("user_promotion_id"),
	bookedByUserId: uuid("booked_by_user_id"),
	isBooked: boolean("is_booked").default(false).notNull(),
	bookedAt: timestamp("booked_at", { mode: 'string' }),
	basePrice: numeric("base_price", { precision: 10, scale:  2 }).notNull(),
	currentPrice: numeric("current_price", { precision: 10, scale:  2 }).notNull(),
	demandMultiplier: numeric("demand_multiplier", { precision: 3, scale:  2 }).default('1.0').notNull(),
	maxContentLength: integer("max_content_length").default(200).notNull(),
	allowImages: boolean("allow_images").default(true).notNull(),
	allowLinks: boolean("allow_links").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userPromotionId],
			foreignColumns: [userPromotions.id],
			name: "announcement_slots_user_promotion_id_user_promotions_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.bookedByUserId],
			foreignColumns: [users.userId],
			name: "announcement_slots_booked_by_user_id_users_user_id_fk"
		}),
]);

export const threadBoosts = pgTable("thread_boosts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userPromotionId: uuid("user_promotion_id").notNull(),
	threadId: uuid("thread_id").notNull(),
	userId: uuid("user_id").notNull(),
	boostMultiplier: numeric("boost_multiplier", { precision: 3, scale:  2 }).default('2.0').notNull(),
	priorityLevel: integer("priority_level").default(1).notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	extraViews: integer("extra_views").default(0).notNull(),
	extraEngagement: integer("extra_engagement").default(0).notNull(),
	positionImprovement: integer("position_improvement").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userPromotionId],
			foreignColumns: [userPromotions.id],
			name: "thread_boosts_user_promotion_id_user_promotions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "thread_boosts_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const promotionPricingConfig = pgTable("promotion_pricing_config", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	promotionType: promotionType("promotion_type").notNull(),
	duration: varchar({ length: 50 }).notNull(),
	basePriceDgt: numeric("base_price_dgt", { precision: 10, scale:  2 }).notNull(),
	demandMultiplier: numeric("demand_multiplier", { precision: 3, scale:  2 }).default('1.0').notNull(),
	timeMultiplier: numeric("time_multiplier", { precision: 3, scale:  2 }).default('1.0').notNull(),
	weekendMultiplier: numeric("weekend_multiplier", { precision: 3, scale:  2 }).default('1.2').notNull(),
	peakHours: text("peak_hours").default('[18,19,20,21]'),
	peakMultiplier: numeric("peak_multiplier", { precision: 3, scale:  2 }).default('1.5').notNull(),
	minPrice: numeric("min_price", { precision: 10, scale:  2 }).notNull(),
	maxPrice: numeric("max_price", { precision: 10, scale:  2 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const shoutboxPins = pgTable("shoutbox_pins", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userPromotionId: uuid("user_promotion_id").notNull(),
	userId: uuid("user_id").notNull(),
	content: text().notNull(),
	imageUrl: varchar("image_url", { length: 500 }),
	linkUrl: varchar("link_url", { length: 500 }),
	backgroundColor: varchar("background_color", { length: 20 }).default('#fbbf24'),
	textColor: varchar("text_color", { length: 20 }).default('#000000'),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	clicks: integer().default(0).notNull(),
	dismissals: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	messageId: integer("message_id"),
}, (table) => [
	foreignKey({
			columns: [table.userPromotionId],
			foreignColumns: [userPromotions.id],
			name: "shoutbox_pins_user_promotion_id_user_promotions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [shoutboxMessages.messageId],
			name: "shoutbox_pins_message_id_shoutbox_messages_message_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "shoutbox_pins_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const adImpressions = pgTable("ad_impressions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	campaignId: uuid("campaign_id").notNull(),
	placementId: uuid("placement_id").notNull(),
	userHash: varchar("user_hash", { length: 64 }),
	sessionId: varchar("session_id", { length: 64 }),
	interactionType: interactionType("interaction_type").notNull(),
	timestamp: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	bidPrice: numeric("bid_price", { precision: 8, scale:  4 }),
	paidPrice: numeric("paid_price", { precision: 8, scale:  4 }),
	revenue: numeric({ precision: 10, scale:  6 }),
	currency: varchar({ length: 10 }).default('DGT'),
	forumSlug: varchar("forum_slug", { length: 100 }),
	threadId: uuid("thread_id"),
	deviceInfo: jsonb("device_info"),
	geoData: jsonb("geo_data"),
	userAgent: varchar("user_agent", { length: 500 }),
	referrer: varchar({ length: 500 }),
	viewDuration: integer("view_duration"),
	scrollDepth: numeric("scroll_depth", { precision: 3, scale:  2 }),
	dgtRewardAmount: numeric("dgt_reward_amount", { precision: 10, scale:  2 }),
	xpAwarded: integer("xp_awarded").default(0),
	fraudScore: numeric("fraud_score", { precision: 3, scale:  2 }).default('0.0'),
	qualityScore: numeric("quality_score", { precision: 3, scale:  2 }).default('1.0'),
}, (table) => [
	index("idx_impressions_campaign_placement").using("btree", table.campaignId.asc().nullsLast().op("uuid_ops"), table.placementId.asc().nullsLast().op("uuid_ops")),
	index("idx_impressions_revenue_timestamp").using("btree", table.revenue.asc().nullsLast().op("timestamp_ops"), table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("idx_impressions_timestamp_campaign").using("btree", table.timestamp.asc().nullsLast().op("uuid_ops"), table.campaignId.asc().nullsLast().op("uuid_ops")),
	index("idx_impressions_user_timestamp").using("btree", table.userHash.asc().nullsLast().op("text_ops"), table.timestamp.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [campaigns.id],
			name: "ad_impressions_campaign_id_campaigns_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.placementId],
			foreignColumns: [adPlacements.id],
			name: "ad_impressions_placement_id_ad_placements_id_fk"
		}).onDelete("cascade"),
]);

export const campaignMetrics = pgTable("campaign_metrics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	campaignId: uuid("campaign_id").notNull(),
	dateHour: timestamp("date_hour", { mode: 'string' }).notNull(),
	impressions: integer().default(0).notNull(),
	clicks: integer().default(0).notNull(),
	conversions: integer().default(0).notNull(),
	spend: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	revenue: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	dgtRewards: numeric("dgt_rewards", { precision: 12, scale:  2 }).default('0').notNull(),
	ctr: numeric({ precision: 5, scale:  4 }).default('0'),
	cpm: numeric({ precision: 8, scale:  2 }).default('0'),
	cpc: numeric({ precision: 8, scale:  4 }).default('0'),
	roas: numeric({ precision: 5, scale:  2 }).default('0'),
	avgQualityScore: numeric("avg_quality_score", { precision: 3, scale:  2 }).default('1.0'),
	fraudDetections: integer("fraud_detections").default(0),
	uniqueUsers: integer("unique_users").default(0),
	avgViewDuration: integer("avg_view_duration").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [campaigns.id],
			name: "campaign_metrics_campaign_id_campaigns_id_fk"
		}).onDelete("cascade"),
]);

export const adGovernanceProposals = pgTable("ad_governance_proposals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	proposerUserId: uuid("proposer_user_id").notNull(),
	proposalType: varchar("proposal_type", { length: 50 }).notNull(),
	proposedChanges: jsonb("proposed_changes").notNull(),
	currentConfiguration: jsonb("current_configuration"),
	votingStartAt: timestamp("voting_start_at", { mode: 'string' }).notNull(),
	votingEndAt: timestamp("voting_end_at", { mode: 'string' }).notNull(),
	requiredQuorum: integer("required_quorum").default(1000),
	votesFor: integer("votes_for").default(0),
	votesAgainst: integer("votes_against").default(0),
	totalVotingPower: numeric("total_voting_power", { precision: 18, scale:  2 }).default('0'),
	status: varchar({ length: 20 }).default('draft'),
	executedAt: timestamp("executed_at", { mode: 'string' }),
	executionResult: jsonb("execution_result"),
	discussionThreadId: uuid("discussion_thread_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.proposerUserId],
			foreignColumns: [users.userId],
			name: "ad_governance_proposals_proposer_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const profileSpotlights = pgTable("profile_spotlights", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userPromotionId: uuid("user_promotion_id").notNull(),
	userId: uuid("user_id").notNull(),
	spotlightMessage: text("spotlight_message").notNull(),
	highlightedAchievement: varchar("highlighted_achievement", { length: 255 }),
	customBadgeUrl: varchar("custom_badge_url", { length: 500 }),
	displayLocation: varchar("display_location", { length: 100 }).default('sidebar').notNull(),
	displayOrder: integer("display_order").default(1).notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	profileViews: integer("profile_views").default(0).notNull(),
	followsGained: integer("follows_gained").default(0).notNull(),
	interactionIncrease: numeric("interaction_increase", { precision: 5, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userPromotionId],
			foreignColumns: [userPromotions.id],
			name: "profile_spotlights_user_promotion_id_user_promotions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "profile_spotlights_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const userPromotionAnalytics = pgTable("user_promotion_analytics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userPromotionId: uuid("user_promotion_id").notNull(),
	date: date().notNull(),
	hour: integer(),
	impressions: integer().default(0).notNull(),
	clicks: integer().default(0).notNull(),
	conversions: integer().default(0).notNull(),
	uniqueViews: integer("unique_views").default(0).notNull(),
	averageViewDuration: integer("average_view_duration").default(0),
	bounceRate: numeric("bounce_rate", { precision: 5, scale:  4 }).default('0'),
	engagementScore: numeric("engagement_score", { precision: 5, scale:  2 }).default('0'),
	dgtSpent: numeric("dgt_spent", { precision: 10, scale:  2 }).default('0').notNull(),
	costPerClick: numeric("cost_per_click", { precision: 10, scale:  4 }).default('0'),
	costPerConversion: numeric("cost_per_conversion", { precision: 10, scale:  4 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userPromotionId],
			foreignColumns: [userPromotions.id],
			name: "user_promotion_analytics_user_promotion_id_user_promotions_id_f"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	eventType: notificationType("event_type").notNull(),
	eventLogId: uuid("event_log_id"),
	title: varchar({ length: 255 }).notNull(),
	body: text(),
	data: jsonb(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_notifications_user_created").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("uuid_ops")),
	index("idx_notifications_user_read").using("btree", table.userId.asc().nullsLast().op("bool_ops"), table.isRead.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "notifications_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.eventLogId],
			foreignColumns: [eventLogs.id],
			name: "notifications_event_log_id_event_logs_id_fk"
		}),
]);

export const eventLogs = pgTable("event_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	eventType: eventType("event_type").notNull(),
	relatedId: uuid("related_id"),
	meta: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_event_logs_type_created").using("btree", table.eventType.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("enum_ops")),
	index("idx_event_logs_user_created").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "event_logs_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const avatarFrames = pgTable("avatar_frames", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	imageUrl: text("image_url").notNull(),
	rarity: text().default('common'),
	animated: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const posts = pgTable("posts", {
	postId: serial("post_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	threadId: integer("thread_id").notNull(),
	userId: uuid("user_id").notNull(),
	replyToPostId: integer("reply_to_post_id"),
	content: text().notNull(),
	editorState: jsonb("editor_state"),
	likeCount: integer("like_count").default(0).notNull(),
	tipCount: integer("tip_count").default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalTips: bigint("total_tips", { mode: "number" }).default(0).notNull(),
	isFirstPost: boolean("is_first_post").default(false).notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	deletedBy: uuid("deleted_by"),
	isEdited: boolean("is_edited").default(false).notNull(),
	editedAt: timestamp("edited_at", { mode: 'string' }),
	editedBy: uuid("edited_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	quarantineData: jsonb("quarantine_data"),
	pluginData: jsonb("plugin_data").default({}),
	visibilityStatus: contentVisibilityStatus("visibility_status").default('published').notNull(),
	moderationReason: varchar("moderation_reason", { length: 255 }),
	depth: integer().default(0).notNull(),
}, (table) => [
	index("idx_posts_reply_to").using("btree", table.replyToPostId.asc().nullsLast().op("int4_ops")),
	index("idx_posts_thread_id").using("btree", table.threadId.asc().nullsLast().op("int4_ops")),
	index("idx_posts_total_tips").using("btree", table.totalTips.asc().nullsLast().op("int8_ops")),
	index("idx_posts_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [threads.threadId],
			name: "posts_thread_id_threads_thread_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "posts_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.replyToPostId],
			foreignColumns: [table.postId],
			name: "posts_reply_to_post_id_posts_post_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.deletedBy],
			foreignColumns: [users.userId],
			name: "posts_deleted_by_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.editedBy],
			foreignColumns: [users.userId],
			name: "posts_edited_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const platformTreasurySettings = pgTable("platform_treasury_settings", {
	id: serial().primaryKey().notNull(),
	currency: text().notNull(),
	balance: numeric({ precision: 18, scale:  2 }).default('0').notNull(),
	hotWalletAddress: varchar("hot_wallet_address", { length: 255 }),
	coldWalletAddress: varchar("cold_wallet_address", { length: 255 }),
	minDepositAmount: numeric("min_deposit_amount", { precision: 18, scale:  2 }).default('0'),
	maxDepositAmount: numeric("max_deposit_amount", { precision: 18, scale:  2 }),
	minWithdrawalAmount: numeric("min_withdrawal_amount", { precision: 18, scale:  2 }).default('0'),
	maxWithdrawalAmount: numeric("max_withdrawal_amount", { precision: 18, scale:  2 }),
	depositFeePercent: doublePrecision("deposit_fee_percent").default(0),
	withdrawalFeePercent: doublePrecision("withdrawal_fee_percent").default(0),
	isEnabled: boolean("is_enabled").default(true).notNull(),
	notes: text(),
	lastAuditedAt: timestamp("last_audited_at", { withTimezone: true, mode: 'string' }),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "platform_treasury_settings_updated_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("platform_treasury_settings_currency_unique").on(table.currency),
]);

export const products = pgTable("products", {
	productId: serial("product_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	richDescription: text("rich_description"),
	price: doublePrecision().default(0).notNull(),
	discountPrice: doublePrecision("discount_price"),
	costPrice: doublePrecision("cost_price"),
	sku: varchar({ length: 100 }),
	barcode: varchar({ length: 100 }),
	stock: integer().default(0).notNull(),
	weight: doublePrecision(),
	dimensions: jsonb().default({}),
	categoryId: integer("category_id"),
	featuredImageId: integer("featured_image_id"),
	status: varchar({ length: 50 }).default('draft').notNull(),
	pluginReward: jsonb("plugin_reward").default({}),
	isDigital: boolean("is_digital").default(false).notNull(),
	digitalFileId: integer("digital_file_id"),
	pointsPrice: integer("points_price"),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	availableFrom: timestamp("available_from", { mode: 'string' }),
	availableUntil: timestamp("available_until", { mode: 'string' }),
	stockLimit: integer("stock_limit"),
	featuredUntil: timestamp("featured_until", { mode: 'string' }),
	promotionLabel: varchar("promotion_label", { length: 100 }),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	metadata: jsonb().default({}),
	frameId: integer("frame_id"),
}, (table) => [
	index("idx_products_available_from").using("btree", table.availableFrom.asc().nullsLast().op("timestamp_ops")),
	index("idx_products_available_until").using("btree", table.availableUntil.asc().nullsLast().op("timestamp_ops")),
	index("idx_products_category_id").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("idx_products_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_products_featured_until").using("btree", table.featuredUntil.asc().nullsLast().op("timestamp_ops")),
	index("idx_products_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [productCategories.categoryId],
			name: "products_category_id_product_categories_category_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.featuredImageId],
			foreignColumns: [mediaLibrary.mediaId],
			name: "products_featured_image_id_media_library_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.digitalFileId],
			foreignColumns: [mediaLibrary.mediaId],
			name: "products_digital_file_id_media_library_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.frameId],
			foreignColumns: [avatarFrames.id],
			name: "products_frame_id_avatar_frames_id_fk"
		}).onDelete("set null"),
	unique("products_slug_unique").on(table.slug),
]);

export const mediaLibrary = pgTable("media_library", {
	mediaId: serial("media_id").primaryKey().notNull(),
	userId: uuid("user_id"),
	type: varchar({ length: 50 }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	path: varchar({ length: 255 }).notNull(),
	url: varchar({ length: 255 }).notNull(),
	thumbnailUrl: varchar("thumbnail_url", { length: 255 }),
	isPublic: boolean("is_public").default(true).notNull(),
	metadata: jsonb().default({}),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	deletedBy: uuid("deleted_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_media_library_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_media_library_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_media_library_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "media_library_user_id_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.deletedBy],
			foreignColumns: [users.userId],
			name: "media_library_deleted_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const inventoryTransactionLinks = pgTable("inventory_transaction_links", {
	id: serial().primaryKey().notNull(),
	inventoryId: integer("inventory_id").notNull(),
	transactionType: text("transaction_type").notNull(),
	quantityChange: integer("quantity_change").notNull(),
	relatedTransactionId: integer("related_transaction_id"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	dgtTransactionId: integer("dgt_transaction_id"),
}, (table) => [
	foreignKey({
			columns: [table.inventoryId],
			foreignColumns: [userInventory.id],
			name: "inventory_transaction_links_inventory_id_user_inventory_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dgtTransactionId],
			foreignColumns: [transactions.transactionId],
			name: "inventory_transaction_links_dgt_transaction_id_transactions_tra"
		}).onDelete("set null"),
]);

export const animationPackItems = pgTable("animation_pack_items", {
	id: serial().primaryKey().notNull(),
	packId: integer("pack_id").notNull(),
	mediaId: integer("media_id").notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.packId],
			foreignColumns: [animationPacks.id],
			name: "animation_pack_items_pack_id_animation_packs_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [mediaLibrary.mediaId],
			name: "animation_pack_items_media_id_media_library_media_id_fk"
		}).onDelete("cascade"),
]);

export const uiCollectionQuotes = pgTable("ui_collection_quotes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	collectionId: uuid("collection_id").notNull(),
	quoteId: uuid("quote_id").notNull(),
	orderInCollection: integer("order_in_collection").default(0),
	weight: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.collectionId],
			foreignColumns: [uiCollections.id],
			name: "ui_collection_quotes_collection_id_ui_collections_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.quoteId],
			foreignColumns: [uiQuotes.id],
			name: "ui_collection_quotes_quote_id_ui_quotes_id_fk"
		}).onDelete("cascade"),
]);

export const emailTemplateLogs = pgTable("email_template_logs", {
	id: serial().primaryKey().notNull(),
	templateId: serial("template_id").notNull(),
	recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
	recipientUserId: uuid("recipient_user_id"),
	subject: text().notNull(),
	variablesUsed: jsonb("variables_used").default({}),
	status: varchar({ length: 20 }).default('sent').notNull(),
	errorMessage: text("error_message"),
	sentAt: timestamp("sent_at", { mode: 'string' }).defaultNow().notNull(),
	openedAt: timestamp("opened_at", { mode: 'string' }),
	clickedAt: timestamp("clicked_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [emailTemplates.id],
			name: "email_template_logs_template_id_email_templates_id_fk"
		}),
	foreignKey({
			columns: [table.recipientUserId],
			foreignColumns: [users.userId],
			name: "email_template_logs_recipient_user_id_users_user_id_fk"
		}),
]);

export const achievements = pgTable("achievements", {
	achievementId: serial("achievement_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	iconUrl: varchar("icon_url", { length: 255 }),
	rewardXp: integer("reward_xp").default(0).notNull(),
	rewardPoints: integer("reward_points").default(0).notNull(),
	requirement: jsonb().default({}).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("achievements_name_unique").on(table.name),
]);

export const userPromotions = pgTable("user_promotions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: promotionType().notNull(),
	contentId: uuid("content_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	imageUrl: varchar("image_url", { length: 500 }),
	linkUrl: varchar("link_url", { length: 500 }),
	targetPlacement: varchar("target_placement", { length: 100 }),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	duration: integer().notNull(),
	dgtCost: numeric("dgt_cost", { precision: 12, scale:  2 }).notNull(),
	dgtSpent: numeric("dgt_spent", { precision: 12, scale:  2 }).default('0').notNull(),
	status: promotionStatus().default('pending').notNull(),
	moderatorId: uuid("moderator_id"),
	moderatorNotes: text("moderator_notes"),
	rejectionReason: text("rejection_reason"),
	impressions: integer().default(0).notNull(),
	clicks: integer().default(0).notNull(),
	conversions: integer().default(0).notNull(),
	uniqueViews: integer("unique_views").default(0).notNull(),
	engagementRate: numeric("engagement_rate", { precision: 5, scale:  4 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	activatedAt: timestamp("activated_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	autoRenew: boolean("auto_renew").default(false).notNull(),
	maxDailySpend: numeric("max_daily_spend", { precision: 10, scale:  2 }),
	targetAudience: text("target_audience"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_promotions_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [users.userId],
			name: "user_promotions_moderator_id_users_user_id_fk"
		}),
]);

export const users = pgTable("users", {
	userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	bio: text(),
	signature: text(),
	avatarUrl: varchar("avatar_url", { length: 255 }),
	activeAvatarUrl: varchar("active_avatar_url", { length: 255 }),
	profileBannerUrl: varchar("profile_banner_url", { length: 255 }),
	activeFrameId: integer("active_frame_id"),
	avatarFrameId: integer("avatar_frame_id"),
	primaryRoleId: integer("primary_role_id"),
	discordHandle: varchar("discord_handle", { length: 255 }),
	twitterHandle: varchar("twitter_handle", { length: 255 }),
	website: varchar({ length: 255 }),
	telegramHandle: varchar("telegram_handle", { length: 255 }),
	xAccountId: varchar("x_account_id", { length: 255 }),
	xAccessToken: text("x_access_token"),
	xRefreshToken: text("x_refresh_token"),
	xTokenExpiresAt: timestamp("x_token_expires_at", { mode: 'string' }),
	xLinkedAt: timestamp("x_linked_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	isBanned: boolean("is_banned").default(false).notNull(),
	isShadowbanned: boolean("is_shadowbanned").default(false).notNull(),
	subscribedToNewsletter: boolean("subscribed_to_newsletter").default(false).notNull(),
	lastSeenAt: timestamp("last_seen_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	referrerId: uuid("referrer_id"),
	referralLevel: integer("referral_level"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	xp: bigint({ mode: "number" }).default(0).notNull(),
	level: integer().default(1).notNull(),
	clout: integer().default(0).notNull(),
	activeTitleId: integer("active_title_id"),
	activeBadgeId: integer("active_badge_id"),
	dgtPoints: integer("dgt_points").default(0).notNull(),
	dgtWalletBalance: integer("dgt_wallet_balance").default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dgtBalance: bigint("dgt_balance", { mode: "number" }).default(0).notNull(),
	reputation: integer().default(0).notNull(),
	totalPosts: integer("total_posts").default(0).notNull(),
	totalThreads: integer("total_threads").default(0).notNull(),
	totalLikes: integer("total_likes").default(0).notNull(),
	totalTips: integer("total_tips").default(0).notNull(),
	nextLevelXp: integer("next_level_xp").default(100).notNull(),
	pointsVersion: integer("points_version").default(1).notNull(),
	dailyXpGained: integer("daily_xp_gained").default(0).notNull(),
	lastXpGainDate: timestamp("last_xp_gain_date", { mode: 'string' }),
	friendRequestsSent: integer("friend_requests_sent").default(0).notNull(),
	friendRequestsReceived: integer("friend_requests_received").default(0).notNull(),
	isStaff: boolean("is_staff").default(false).notNull(),
	isModerator: boolean("is_moderator").default(false).notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	role: userRole().default('user'),
	walletAddress: varchar("wallet_address", { length: 255 }),
	encryptedPrivateKey: varchar("encrypted_private_key", { length: 512 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walletBalanceUsdt: bigint("wallet_balance_usdt", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	walletPendingWithdrawals: bigint("wallet_pending_withdrawals", { mode: "number" }).default(0).notNull(),
	ccpaymentAccountId: varchar("ccpayment_account_id", { length: 100 }),
	verifyToken: varchar("verify_token", { length: 255 }),
	resetToken: varchar("reset_token", { length: 255 }),
	resetTokenExpiresAt: timestamp("reset_token_expires_at", { mode: 'string' }),
	gdprConsentedAt: timestamp("gdpr_consented_at", { mode: 'string' }),
	tosAgreedAt: timestamp("tos_agreed_at", { mode: 'string' }),
	privacyAgreedAt: timestamp("privacy_agreed_at", { mode: 'string' }),
	pathXp: jsonb("path_xp").default({}),
	pathMultipliers: jsonb("path_multipliers").default({}),
	pluginData: jsonb("plugin_data").default({}),
	statusLine: text("status_line"),
	pinnedPostId: integer("pinned_post_id"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	groupId: integer("group_id"),
}, (table) => [
	foreignKey({
			columns: [table.activeFrameId],
			foreignColumns: [avatarFrames.id],
			name: "users_active_frame_id_avatar_frames_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.avatarFrameId],
			foreignColumns: [avatarFrames.id],
			name: "users_avatar_frame_id_avatar_frames_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.primaryRoleId],
			foreignColumns: [roles.roleId],
			name: "users_primary_role_id_roles_role_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.referrerId],
			foreignColumns: [table.userId],
			name: "users_referrer_id_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.activeTitleId],
			foreignColumns: [titles.titleId],
			name: "users_active_title_id_titles_title_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.activeBadgeId],
			foreignColumns: [badges.badgeId],
			name: "users_active_badge_id_badges_badge_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.pinnedPostId],
			foreignColumns: [posts.postId],
			name: "users_pinned_post_id_posts_post_id_fk"
		}).onDelete("set null"),
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const roles = pgTable("roles", {
	roleId: serial("role_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	rank: integer().default(0).notNull(),
	description: text(),
	badgeImage: varchar("badge_image", { length: 255 }),
	textColor: varchar("text_color", { length: 25 }),
	backgroundColor: varchar("background_color", { length: 25 }),
	isStaff: boolean("is_staff").default(false).notNull(),
	isModerator: boolean("is_moderator").default(false).notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	permissions: jsonb().default({}).notNull(),
	xpMultiplier: doublePrecision("xp_multiplier").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	pluginData: jsonb("plugin_data").default({}),
}, (table) => [
	unique("roles_name_unique").on(table.name),
	unique("roles_slug_unique").on(table.slug),
]);

export const displayPreferences = pgTable("display_preferences", {
	userId: uuid("user_id").primaryKey().notNull(),
	theme: varchar({ length: 40 }).default('system').notNull(),
	fontSize: varchar("font_size", { length: 20 }).default('medium').notNull(),
	threadDisplayMode: varchar("thread_display_mode", { length: 20 }).default('card').notNull(),
	reducedMotion: boolean("reduced_motion").default(false).notNull(),
	hideNsfw: boolean("hide_nsfw").default(true).notNull(),
	showMatureContent: boolean("show_mature_content").default(false).notNull(),
	showOfflineUsers: boolean("show_offline_users").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_display_preferences_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "display_preferences_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const notificationSettings = pgTable("notification_settings", {
	userId: uuid("user_id").primaryKey().notNull(),
	receiveMentionNotifications: boolean("receive_mention_notifications").default(true).notNull(),
	receiveReplyNotifications: boolean("receive_reply_notifications").default(true).notNull(),
	receivePmNotifications: boolean("receive_pm_notifications").default(true).notNull(),
	receiveFriendNotifications: boolean("receive_friend_notifications").default(true).notNull(),
	receiveFollowNotifications: boolean("receive_follow_notifications").default(true).notNull(),
	receiveShopNotifications: boolean("receive_shop_notifications").default(true).notNull(),
	receiveSystemNotifications: boolean("receive_system_notifications").default(true).notNull(),
	receiveEmailNotifications: boolean("receive_email_notifications").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "notification_settings_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const userSettings = pgTable("user_settings", {
	userId: uuid("user_id").primaryKey().notNull(),
	theme: varchar({ length: 40 }).default('auto'),
	sidebarState: jsonb("sidebar_state").default({}),
	notificationPrefs: jsonb("notification_prefs").default({}),
	profileVisibility: varchar("profile_visibility", { length: 20 }).default('public'),
	timezone: varchar({ length: 50 }),
	language: varchar({ length: 20 }).default('en'),
	shoutboxPosition: varchar("shoutbox_position", { length: 20 }).default('sidebar-top'),
}, (table) => [
	index("idx_user_settings_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_settings_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const permissions = pgTable("permissions", {
	permId: serial("perm_id").primaryKey().notNull(),
	permName: varchar("perm_name", { length: 100 }).notNull(),
	description: text(),
	category: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("permissions_perm_name_unique").on(table.permName),
]);

export const userBans = pgTable("user_bans", {
	banId: serial("ban_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	bannedBy: uuid("banned_by").notNull(),
	reason: text().notNull(),
	banType: varchar("ban_type", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	liftedAt: timestamp("lifted_at", { mode: 'string' }),
	liftedBy: uuid("lifted_by"),
	liftingReason: text("lifting_reason"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_bans_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.bannedBy],
			foreignColumns: [users.userId],
			name: "user_bans_banned_by_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.liftedBy],
			foreignColumns: [users.userId],
			name: "user_bans_lifted_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const userSessions = pgTable("user_sessions", {
	sid: text().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
});

export const userOwnedFrames = pgTable("user_owned_frames", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	frameId: integer("frame_id").notNull(),
	source: varchar({ length: 20 }).default('shop').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_owned_frames_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.frameId],
			foreignColumns: [avatarFrames.id],
			name: "user_owned_frames_frame_id_avatar_frames_id_fk"
		}).onDelete("cascade"),
]);

export const userRelationships = pgTable("user_relationships", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	targetUserId: uuid("target_user_id").notNull(),
	type: varchar({ length: 20 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	followerId: uuid("follower_id").notNull(),
	followingId: uuid("following_id").notNull(),
	relationshipType: varchar("relationship_type", { length: 50 }).notNull(),
	isAccepted: boolean("is_accepted"),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }),
}, (table) => [
	index("idx_user_relationships_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_user_relationships_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_user_relationships_target_type").using("btree", table.targetUserId.asc().nullsLast().op("uuid_ops"), table.type.asc().nullsLast().op("text_ops")),
	index("idx_user_relationships_user_type").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_relationships_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.targetUserId],
			foreignColumns: [users.userId],
			name: "user_relationships_target_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followerId],
			foreignColumns: [users.userId],
			name: "user_relationships_follower_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followingId],
			foreignColumns: [users.userId],
			name: "user_relationships_following_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("user_relationships_user_target_type_unique").on(table.userId, table.targetUserId, table.type),
	unique("user_relationships_follower_following_type_unique").on(table.followerId, table.followingId, table.relationshipType),
]);

export const subscriptions = pgTable("subscriptions", {
	subscriptionId: serial("subscription_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: subscriptionType().notNull(),
	status: subscriptionStatus().default('active').notNull(),
	pricePaid: integer("price_paid").notNull(),
	currency: varchar({ length: 10 }).default('DGT').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).defaultNow().notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
	nextBillingDate: timestamp("next_billing_date", { mode: 'string' }),
	lastPaymentDate: timestamp("last_payment_date", { mode: 'string' }).defaultNow().notNull(),
	autoRenew: boolean("auto_renew").default(true).notNull(),
	lastCosmeticDrop: timestamp("last_cosmetic_drop", { mode: 'string' }),
	totalCosmeticValue: integer("total_cosmetic_value").default(0).notNull(),
	purchaseTransactionId: integer("purchase_transaction_id"),
	benefits: jsonb().default({}),
	metadata: jsonb().default({}),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "subscriptions_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const subscriptionBenefits = pgTable("subscription_benefits", {
	benefitId: serial("benefit_id").primaryKey().notNull(),
	subscriptionType: subscriptionType("subscription_type").notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	benefitKey: varchar("benefit_key", { length: 50 }).notNull(),
	value: integer(),
	config: jsonb().default({}),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const featurePermissions = pgTable("feature_permissions", {
	id: serial().primaryKey().notNull(),
	feature: varchar({ length: 100 }).notNull(),
	groupId: integer("group_id"),
	allow: boolean().default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [roles.roleId],
			name: "feature_permissions_group_id_roles_role_id_fk"
		}),
]);

export const verificationTokens = pgTable("verification_tokens", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: varchar({ length: 64 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "verification_tokens_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	tokenId: serial("token_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	isUsed: boolean("is_used").default(false).notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }),
	ipRequested: varchar("ip_requested", { length: 50 }),
	ipUsed: varchar("ip_used", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_password_reset_tokens_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("idx_password_reset_tokens_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "password_reset_tokens_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("password_reset_tokens_token_unique").on(table.token),
]);

export const userSettingsHistory = pgTable("user_settings_history", {
	historyId: serial("history_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	changedField: varchar("changed_field", { length: 100 }).notNull(),
	oldValue: text("old_value"),
	newValue: text("new_value"),
	changedAt: timestamp("changed_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_settings_history_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const userSocialPreferences = pgTable("user_social_preferences", {
	userId: uuid("user_id").primaryKey().notNull(),
	allowMentions: boolean("allow_mentions").default(true).notNull(),
	mentionPermissions: varchar("mention_permissions", { length: 20 }).default('everyone').notNull(),
	mentionNotifications: boolean("mention_notifications").default(true).notNull(),
	mentionEmailNotifications: boolean("mention_email_notifications").default(false).notNull(),
	allowFollowers: boolean("allow_followers").default(true).notNull(),
	followerApprovalRequired: boolean("follower_approval_required").default(false).notNull(),
	hideFollowerCount: boolean("hide_follower_count").default(false).notNull(),
	hideFollowingCount: boolean("hide_following_count").default(false).notNull(),
	allowWhaleDesignation: boolean("allow_whale_designation").default(true).notNull(),
	allowFriendRequests: boolean("allow_friend_requests").default(true).notNull(),
	friendRequestPermissions: varchar("friend_request_permissions", { length: 20 }).default('everyone').notNull(),
	autoAcceptMutualFollows: boolean("auto_accept_mutual_follows").default(false).notNull(),
	hideOnlineStatus: boolean("hide_online_status").default(false).notNull(),
	hideFriendsList: boolean("hide_friends_list").default(false).notNull(),
	showSocialActivity: boolean("show_social_activity").default(true).notNull(),
	allowDirectMessages: varchar("allow_direct_messages", { length: 20 }).default('friends').notNull(),
	showProfileToPublic: boolean("show_profile_to_public").default(true).notNull(),
	allowSocialDiscovery: boolean("allow_social_discovery").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_social_preferences_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const cosmeticDrops = pgTable("cosmetic_drops", {
	dropId: serial("drop_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subscriptionId: integer("subscription_id").notNull(),
	dropMonth: integer("drop_month").notNull(),
	dropYear: integer("drop_year").notNull(),
	cosmeticType: cosmeticType("cosmetic_type").notNull(),
	cosmeticId: integer("cosmetic_id").notNull(),
	cosmeticName: varchar("cosmetic_name", { length: 100 }).notNull(),
	cosmeticValue: integer("cosmetic_value").default(120).notNull(),
	claimed: boolean().default(false).notNull(),
	claimedAt: timestamp("claimed_at", { mode: 'string' }),
	metadata: jsonb().default({}),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "cosmetic_drops_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [subscriptions.subscriptionId],
			name: "cosmetic_drops_subscription_id_subscriptions_subscription_id_fk"
		}).onDelete("cascade"),
]);

export const threads = pgTable("threads", {
	threadId: serial("thread_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	structureId: integer("structure_id").notNull(),
	userId: uuid("user_id").notNull(),
	prefixId: integer("prefix_id"),
	isSticky: boolean("is_sticky").default(false).notNull(),
	isLocked: boolean("is_locked").default(false).notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	featuredAt: timestamp("featured_at", { mode: 'string' }),
	featuredBy: uuid("featured_by"),
	featuredExpiresAt: timestamp("featured_expires_at", { mode: 'string' }),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	deletedBy: uuid("deleted_by"),
	viewCount: integer("view_count").default(0).notNull(),
	postCount: integer("post_count").default(0).notNull(),
	firstPostLikeCount: integer("first_post_like_count").default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dgtStaked: bigint("dgt_staked", { mode: "number" }).default(0).notNull(),
	hotScore: real("hot_score").default(0).notNull(),
	isBoosted: boolean("is_boosted").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	boostAmountDgt: bigint("boost_amount_dgt", { mode: "number" }).default(0),
	boostExpiresAt: timestamp("boost_expires_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lastPostId: bigint("last_post_id", { mode: "number" }),
	lastPostAt: timestamp("last_post_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	isArchived: boolean("is_archived").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pollId: bigint("poll_id", { mode: "number" }),
	isSolved: boolean("is_solved").default(false).notNull(),
	solvingPostId: integer("solving_post_id"),
	pluginData: jsonb("plugin_data").default({}),
	visibilityStatus: contentVisibilityStatus("visibility_status").default('published').notNull(),
	moderationReason: varchar("moderation_reason", { length: 255 }),
	xpMultiplier: real("xp_multiplier").default(1).notNull(),
	rewardRules: jsonb("reward_rules").default({}),
}, (table) => [
	index("idx_threads_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_threads_hot_score").using("btree", table.hotScore.asc().nullsLast().op("float4_ops")),
	index("idx_threads_is_boosted").using("btree", table.isBoosted.asc().nullsLast().op("bool_ops")),
	index("idx_threads_structure_id").using("btree", table.structureId.asc().nullsLast().op("int4_ops")),
	index("idx_threads_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.structureId],
			foreignColumns: [forumStructure.id],
			name: "threads_structure_id_forum_structure_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "threads_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.prefixId],
			foreignColumns: [threadPrefixes.prefixId],
			name: "threads_prefix_id_thread_prefixes_prefix_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.featuredBy],
			foreignColumns: [users.userId],
			name: "threads_featured_by_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.deletedBy],
			foreignColumns: [users.userId],
			name: "threads_deleted_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("threads_slug_visible_unique").on(table.slug),
]);

export const threadPrefixes = pgTable("thread_prefixes", {
	prefixId: serial("prefix_id").primaryKey().notNull(),
	name: varchar({ length: 30 }).notNull(),
	color: varchar({ length: 20 }),
	isActive: boolean("is_active").default(true).notNull(),
	position: integer().default(0).notNull(),
	structureId: integer("structure_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.structureId],
			foreignColumns: [forumStructure.id],
			name: "thread_prefixes_structure_id_forum_structure_id_fk"
		}).onDelete("set null"),
	unique("thread_prefixes_name_unique").on(table.name),
]);

export const forumStructure = pgTable("forum_structure", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	parentForumSlug: text("parent_forum_slug"),
	parentId: integer("parent_id"),
	type: text().default('forum').notNull(),
	position: integer().default(0).notNull(),
	isVip: boolean("is_vip").default(false).notNull(),
	isLocked: boolean("is_locked").default(false).notNull(),
	minXp: integer("min_xp").default(0).notNull(),
	isHidden: boolean("is_hidden").default(false).notNull(),
	minGroupIdRequired: integer("min_group_id_required"),
	color: text().default('gray').notNull(),
	icon: text().default('hash').notNull(),
	colorTheme: text("color_theme"),
	tippingEnabled: boolean("tipping_enabled").default(false).notNull(),
	xpMultiplier: real("xp_multiplier").default(1).notNull(),
	pluginData: jsonb("plugin_data").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "forum_structure_parent_id_forum_structure_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.minGroupIdRequired],
			foreignColumns: [roles.roleId],
			name: "forum_structure_min_group_id_required_roles_role_id_fk"
		}).onDelete("set null"),
	unique("forum_structure_slug_unique").on(table.slug),
]);

export const threadDrafts = pgTable("thread_drafts", {
	draftId: serial("draft_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	userId: uuid("user_id").notNull(),
	structureId: integer("structure_id"),
	prefixId: integer("prefix_id"),
	title: varchar({ length: 255 }),
	content: text(),
	editorState: jsonb("editor_state"),
	tags: jsonb(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "thread_drafts_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.structureId],
			foreignColumns: [forumStructure.id],
			name: "thread_drafts_structure_id_forum_structure_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.prefixId],
			foreignColumns: [threadPrefixes.prefixId],
			name: "thread_drafts_prefix_id_thread_prefixes_prefix_id_fk"
		}).onDelete("set null"),
]);

export const tags = pgTable("tags", {
	tagId: serial("tag_id").primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("tags_name_unique").on(table.name),
	unique("tags_slug_unique").on(table.slug),
]);

export const postDrafts = pgTable("post_drafts", {
	draftId: serial("draft_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	threadId: integer("thread_id"),
	userId: uuid("user_id").notNull(),
	content: text(),
	editorState: jsonb("editor_state"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [threads.threadId],
			name: "post_drafts_thread_id_threads_thread_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "post_drafts_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const postLikes = pgTable("post_likes", {
	id: serial().primaryKey().notNull(),
	postId: integer("post_id").notNull(),
	likedByUserId: uuid("liked_by_user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.postId],
			name: "post_likes_post_id_posts_post_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.likedByUserId],
			foreignColumns: [users.userId],
			name: "post_likes_liked_by_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("unique_post_like").on(table.postId, table.likedByUserId),
]);

export const polls = pgTable("polls", {
	pollId: serial("poll_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	threadId: integer("thread_id").notNull(),
	question: text().notNull(),
	allowsMultipleChoices: boolean("allows_multiple_choices").default(false).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [threads.threadId],
			name: "polls_thread_id_threads_thread_id_fk"
		}).onDelete("cascade"),
]);

export const pollOptions = pgTable("poll_options", {
	optionId: serial("option_id").primaryKey().notNull(),
	pollId: integer("poll_id").notNull(),
	optionText: text("option_text").notNull(),
	voteCount: integer("vote_count").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.pollId],
			foreignColumns: [polls.pollId],
			name: "poll_options_poll_id_polls_poll_id_fk"
		}).onDelete("cascade"),
]);

export const pollVotes = pgTable("poll_votes", {
	voteId: serial("vote_id").primaryKey().notNull(),
	optionId: integer("option_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.optionId],
			foreignColumns: [pollOptions.optionId],
			name: "poll_votes_option_id_poll_options_option_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "poll_votes_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const emojiPackItems = pgTable("emoji_pack_items", {
	id: serial().primaryKey().notNull(),
	packId: integer("pack_id").notNull(),
	emojiId: integer("emoji_id").notNull(),
	position: integer().default(0).notNull(),
}, (table) => [
	index("idx_pack_emoji_unique").using("btree", table.packId.asc().nullsLast().op("int4_ops"), table.emojiId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.packId],
			foreignColumns: [emojiPacks.packId],
			name: "emoji_pack_items_pack_id_emoji_packs_pack_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.emojiId],
			foreignColumns: [customEmojis.emojiId],
			name: "emoji_pack_items_emoji_id_custom_emojis_emoji_id_fk"
		}).onDelete("cascade"),
]);

export const forumRules = pgTable("forum_rules", {
	ruleId: serial("rule_id").primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	contentHtml: text("content_html"),
	section: varchar({ length: 100 }).default('general').notNull(),
	position: integer().default(0).notNull(),
	status: contentEditStatus().default('published').notNull(),
	isRequired: boolean("is_required").default(false).notNull(),
	lastAgreedVersionHash: varchar("last_agreed_version_hash", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
}, (table) => [
	index("idx_forum_rules_section").using("btree", table.section.asc().nullsLast().op("text_ops")),
	index("idx_forum_rules_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "forum_rules_created_by_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "forum_rules_updated_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const customEmojis = pgTable("custom_emojis", {
	emojiId: serial("emoji_id").primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	type: varchar({ length: 20 }).default('static').notNull(),
	url: varchar({ length: 255 }).notNull(),
	previewUrl: varchar("preview_url", { length: 255 }),
	category: varchar({ length: 50 }).default('standard'),
	isLocked: boolean("is_locked").default(true).notNull(),
	unlockType: varchar("unlock_type", { length: 20 }).default('free'),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	priceDgt: bigint("price_dgt", { mode: "number" }),
	requiredPath: varchar("required_path", { length: 50 }),
	requiredPathXp: integer("required_path_xp"),
	xpValue: integer("xp_value").default(0).notNull(),
	cloutValue: integer("clout_value").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("idx_custom_emojis_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_custom_emojis_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_custom_emojis_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_custom_emojis_unlock_type").using("btree", table.unlockType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "custom_emojis_created_by_users_user_id_fk"
		}).onDelete("set null"),
	unique("custom_emojis_name_unique").on(table.name),
]);

export const threadFeaturePermissions = pgTable("thread_feature_permissions", {
	id: serial().primaryKey().notNull(),
	threadId: integer("thread_id").notNull(),
	feature: text().notNull(),
	allowed: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [threads.threadId],
			name: "thread_feature_permissions_thread_id_threads_thread_id_fk"
		}).onDelete("cascade"),
]);

export const emojiPacks = pgTable("emoji_packs", {
	packId: serial("pack_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	iconUrl: varchar("icon_url", { length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	priceDgt: bigint("price_dgt", { mode: "number" }),
	isFeatured: boolean("is_featured").default(false).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_emoji_packs_featured").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	index("idx_emoji_packs_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "emoji_packs_created_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const levels = pgTable("levels", {
	level: integer().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	minXp: bigint("min_xp", { mode: "number" }).default(0).notNull(),
	name: varchar({ length: 100 }),
	iconUrl: varchar("icon_url", { length: 255 }),
	rarity: varchar({ length: 10 }).default('common'),
	frameUrl: varchar("frame_url", { length: 255 }),
	colorTheme: varchar("color_theme", { length: 25 }),
	animationEffect: varchar("animation_effect", { length: 30 }),
	unlocks: jsonb(),
	rewardDgt: integer("reward_dgt").default(0),
	rewardTitleId: integer("reward_title_id"),
	rewardBadgeId: integer("reward_badge_id"),
}, (table) => [
	foreignKey({
			columns: [table.rewardTitleId],
			foreignColumns: [titles.titleId],
			name: "levels_reward_title_id_titles_title_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.rewardBadgeId],
			foreignColumns: [badges.badgeId],
			name: "levels_reward_badge_id_badges_badge_id_fk"
		}).onDelete("set null"),
]);

export const xpAdjustmentLogs = pgTable("xp_adjustment_logs", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	adminId: uuid("admin_id").notNull(),
	adjustmentType: text("adjustment_type").notNull(),
	amount: integer().notNull(),
	reason: text().notNull(),
	oldXp: integer("old_xp").notNull(),
	newXp: integer("new_xp").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_xp_adjustment_logs_admin_id").using("btree", table.adminId.asc().nullsLast().op("uuid_ops")),
	index("idx_xp_adjustment_logs_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_xp_adjustment_logs_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "xp_adjustment_logs_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [users.userId],
			name: "xp_adjustment_logs_admin_id_users_user_id_fk"
		}).onDelete("set null"),
]);

export const xpActionSettings = pgTable("xp_action_settings", {
	action: text().primaryKey().notNull(),
	baseValue: integer("base_value").notNull(),
	description: text().notNull(),
	maxPerDay: integer("max_per_day"),
	cooldownSec: integer("cooldown_sec"),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const badges = pgTable("badges", {
	badgeId: serial("badge_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	iconUrl: varchar("icon_url", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const userEmojiPacks = pgTable("user_emoji_packs", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	emojiPackId: integer("emoji_pack_id").notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }).defaultNow().notNull(),
	unlockType: text("unlock_type").default('shop').notNull(),
	pricePaid: integer("price_paid"),
}, (table) => [
	index("idx_user_pack_unique").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.emojiPackId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_emoji_packs_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.emojiPackId],
			foreignColumns: [emojiPacks.packId],
			name: "user_emoji_packs_emoji_pack_id_emoji_packs_pack_id_fk"
		}).onDelete("cascade"),
]);

export const titles = pgTable("titles", {
	titleId: serial("title_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	iconUrl: varchar("icon_url", { length: 255 }),
	rarity: varchar({ length: 50 }).default('common'),
	emoji: varchar({ length: 10 }),
	fontFamily: varchar("font_family", { length: 100 }),
	fontSize: integer("font_size"),
	fontWeight: varchar("font_weight", { length: 20 }),
	textColor: varchar("text_color", { length: 25 }),
	backgroundColor: varchar("background_color", { length: 25 }),
	borderColor: varchar("border_color", { length: 25 }),
	borderWidth: integer("border_width"),
	borderStyle: varchar("border_style", { length: 20 }),
	borderRadius: integer("border_radius"),
	glowColor: varchar("glow_color", { length: 25 }),
	glowIntensity: integer("glow_intensity"),
	shadowColor: varchar("shadow_color", { length: 25 }),
	shadowBlur: integer("shadow_blur"),
	shadowOffsetX: integer("shadow_offset_x"),
	shadowOffsetY: integer("shadow_offset_y"),
	gradientStart: varchar("gradient_start", { length: 25 }),
	gradientEnd: varchar("gradient_end", { length: 25 }),
	gradientDirection: varchar("gradient_direction", { length: 30 }),
	animation: varchar({ length: 20 }),
	animationDuration: doublePrecision("animation_duration"),
	roleId: varchar("role_id", { length: 50 }),
	isShopItem: boolean("is_shop_item").default(false),
	isUnlockable: boolean("is_unlockable").default(false),
	unlockConditions: jsonb("unlock_conditions"),
	shopPrice: doublePrecision("shop_price"),
	shopCurrency: varchar("shop_currency", { length: 10 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const wallets = pgTable("wallets", {
	walletId: serial("wallet_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	balance: doublePrecision().default(0).notNull(),
	lastTransaction: timestamp("last_transaction", { mode: 'string' }),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	deletedBy: uuid("deleted_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_wallets_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "wallets_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.deletedBy],
			foreignColumns: [users.userId],
			name: "wallets_deleted_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const transactions = pgTable("transactions", {
	transactionId: serial("transaction_id").primaryKey().notNull(),
	userId: uuid("user_id"),
	walletId: integer("wallet_id"),
	fromUserId: uuid("from_user_id"),
	toUserId: uuid("to_user_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).notNull(),
	type: transactionType().notNull(),
	status: transactionStatus().default('pending').notNull(),
	description: text(),
	metadata: jsonb().default({}),
	blockchainTxId: varchar("blockchain_tx_id", { length: 255 }),
	fromWalletAddress: varchar("from_wallet_address", { length: 255 }),
	toWalletAddress: varchar("to_wallet_address", { length: 255 }),
	isTreasuryTransaction: boolean("is_treasury_transaction").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_transactions_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_transactions_from_user_id").using("btree", table.fromUserId.asc().nullsLast().op("uuid_ops")),
	index("idx_transactions_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_transactions_to_user_id").using("btree", table.toUserId.asc().nullsLast().op("uuid_ops")),
	index("idx_transactions_type").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	index("idx_transactions_type_status").using("btree", table.type.asc().nullsLast().op("enum_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_transactions_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("idx_transactions_wallet_id").using("btree", table.walletId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "transactions_user_id_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.walletId],
			foreignColumns: [wallets.walletId],
			name: "transactions_wallet_id_wallets_wallet_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [users.userId],
			name: "transactions_from_user_id_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.toUserId],
			foreignColumns: [users.userId],
			name: "transactions_to_user_id_users_user_id_fk"
		}).onDelete("set null"),
]);

export const vaults = pgTable("vaults", {
	vaultId: serial("vault_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
	amount: doublePrecision().notNull(),
	initialAmount: doublePrecision("initial_amount").notNull(),
	lockedAt: timestamp("locked_at", { mode: 'string' }).defaultNow().notNull(),
	unlockTime: timestamp("unlock_time", { mode: 'string' }),
	status: vaultStatus().default('locked').notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }),
	lockTransactionId: integer("lock_transaction_id"),
	unlockTransactionId: integer("unlock_transaction_id"),
	blockchainTxId: varchar("blockchain_tx_id", { length: 255 }),
	unlockBlockchainTxId: varchar("unlock_blockchain_tx_id", { length: 255 }),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	notes: text(),
}, (table) => [
	index("idx_vaults_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_vaults_unlock_time").using("btree", table.unlockTime.asc().nullsLast().op("timestamp_ops")),
	index("idx_vaults_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("idx_vaults_wallet_address").using("btree", table.walletAddress.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "vaults_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lockTransactionId],
			foreignColumns: [transactions.transactionId],
			name: "vaults_lock_transaction_id_transactions_transaction_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.unlockTransactionId],
			foreignColumns: [transactions.transactionId],
			name: "vaults_unlock_transaction_id_transactions_transaction_id_fk"
		}).onDelete("set null"),
]);

export const rainEvents = pgTable("rain_events", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).notNull(),
	currency: varchar({ length: 10 }).default('DGT').notNull(),
	recipientCount: integer("recipient_count").notNull(),
	transactionId: integer("transaction_id"),
	source: varchar({ length: 50 }).default('shoutbox'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	metadata: jsonb().default({}),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "rain_events_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transactions.transactionId],
			name: "rain_events_transaction_id_transactions_transaction_id_fk"
		}).onDelete("set null"),
]);

export const postTips = pgTable("post_tips", {
	id: serial().primaryKey().notNull(),
	postId: integer("post_id").notNull(),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.postId],
			name: "post_tips_post_id_posts_post_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "post_tips_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const dgtPackages = pgTable("dgt_packages", {
	packageId: serial("package_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dgtAmount: bigint("dgt_amount", { mode: "number" }).notNull(),
	usdPrice: numeric("usd_price", { precision: 10, scale:  2 }).notNull(),
	discountPercentage: integer("discount_percentage"),
	isFeatured: boolean("is_featured").default(false).notNull(),
	imageUrl: varchar("image_url", { length: 255 }),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_dgt_packages_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_dgt_packages_featured").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	index("idx_dgt_packages_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const dgtEconomyParameters = pgTable("dgt_economy_parameters", {
	settingId: serial("setting_id").primaryKey().notNull(),
	treasuryWalletAddress: varchar("treasury_wallet_address", { length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dgtTreasuryBalance: bigint("dgt_treasury_balance", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	minWithdrawalAmount: bigint("min_withdrawal_amount", { mode: "number" }).default(5000000).notNull(),
	withdrawalFeePercent: doublePrecision("withdrawal_fee_percent").default(0).notNull(),
	rewardDistributionDelayHours: integer("reward_distribution_delay_hours").default(24).notNull(),
	tipBurnPercent: integer("tip_burn_percent").default(10).notNull(),
	tipRecipientPercent: integer("tip_recipient_percent").default(90).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	minTipAmount: bigint("min_tip_amount", { mode: "number" }).default(1000000).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	maxTipAmount: bigint("max_tip_amount", { mode: "number" }).default(1000000000).notNull(),
	enableLikes: boolean("enable_likes").default(true).notNull(),
	enableTips: boolean("enable_tips").default(true).notNull(),
	likesGiveXp: boolean("likes_give_xp").default(true).notNull(),
	tipsGiveXp: boolean("tips_give_xp").default(true).notNull(),
	likeXpAmount: integer("like_xp_amount").default(5).notNull(),
	tipXpMultiplier: doublePrecision("tip_xp_multiplier").default(0.1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	updatedBy: uuid("updated_by"),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.userId],
			name: "dgt_economy_parameters_updated_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const cooldownSettings = pgTable("cooldown_settings", {
	id: serial().primaryKey().notNull(),
	tipCooldownSeconds: integer("tip_cooldown_seconds").default(10).notNull(),
	rainCooldownSeconds: integer("rain_cooldown_seconds").default(60).notNull(),
	moderatorBypassCooldown: boolean("moderator_bypass_cooldown").default(true).notNull(),
	adminBypassCooldown: boolean("admin_bypass_cooldown").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const economySettings = pgTable("economy_settings", {
	key: text().primaryKey().notNull(),
	value: integer().notNull(),
});

export const rainSettings = pgTable("rain_settings", {
	settingId: serial("setting_id").primaryKey().notNull(),
	enabled: boolean().default(true).notNull(),
	minAmountDgt: doublePrecision("min_amount_dgt").default(10).notNull(),
	minAmountUsdt: doublePrecision("min_amount_usdt").default(1).notNull(),
	maxRecipients: integer("max_recipients").default(15).notNull(),
	cooldownSeconds: integer("cooldown_seconds").default(60).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const tipSettings = pgTable("tip_settings", {
	settingId: serial("setting_id").primaryKey().notNull(),
	enabled: boolean().default(true).notNull(),
	minAmountDgt: doublePrecision("min_amount_dgt").default(10).notNull(),
	minAmountUsdt: doublePrecision("min_amount_usdt").default(0.1).notNull(),
	maxAmountDgt: doublePrecision("max_amount_dgt").default(1000).notNull(),
	maxAmountUsdt: doublePrecision("max_amount_usdt").default(100).notNull(),
	burnPercentage: doublePrecision("burn_percentage").default(5).notNull(),
	processingFeePercentage: doublePrecision("processing_fee_percentage").default(2.5).notNull(),
	cooldownSeconds: integer("cooldown_seconds").default(60).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
	requestId: serial("request_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).notNull(),
	status: withdrawalStatus().default('pending').notNull(),
	walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
	transactionId: integer("transaction_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	processingFee: bigint("processing_fee", { mode: "number" }).default(0).notNull(),
	requestNotes: text("request_notes"),
	adminNotes: text("admin_notes"),
	processed: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	fulfilledAt: timestamp("fulfilled_at", { mode: 'string' }),
	processedBy: uuid("processed_by"),
}, (table) => [
	index("idx_withdrawal_requests_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_withdrawal_requests_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_withdrawal_requests_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "withdrawal_requests_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.processedBy],
			foreignColumns: [users.userId],
			name: "withdrawal_requests_processed_by_users_user_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transactions.transactionId],
			name: "withdrawal_requests_transaction_id_transactions_transaction_id_"
		}).onDelete("set null"),
]);

export const userCommands = pgTable("user_commands", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	commandType: text("command_type").notNull(),
	executedAt: timestamp("executed_at", { mode: 'string' }).defaultNow().notNull(),
	metadata: jsonb().default({}),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_commands_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const dgtPurchaseOrders = pgTable("dgt_purchase_orders", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dgtAmountRequested: bigint("dgt_amount_requested", { mode: "number" }).notNull(),
	cryptoAmountExpected: numeric("crypto_amount_expected", { precision: 18, scale:  8 }).notNull(),
	cryptoCurrencyExpected: varchar("crypto_currency_expected", { length: 10 }).notNull(),
	ccpaymentReference: varchar("ccpayment_reference", { length: 255 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_dgt_purchase_orders_ccpayment_ref").using("btree", table.ccpaymentReference.asc().nullsLast().op("text_ops")),
	index("idx_dgt_purchase_orders_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_dgt_purchase_orders_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_dgt_purchase_orders_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "dgt_purchase_orders_user_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const xpCloutSettings = pgTable("xp_clout_settings", {
	actionKey: varchar("action_key", { length: 100 }).primaryKey().notNull(),
	xpValue: integer("xp_value").default(0).notNull(),
	cloutValue: integer("clout_value").default(0).notNull(),
	description: text(),
});

export const userCloutLog = pgTable("user_clout_log", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	achievementId: integer("achievement_id"),
	cloutEarned: integer("clout_earned").notNull(),
	reason: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_clout").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_clout_log_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.achievementId],
			foreignColumns: [cloutAchievements.id],
			name: "user_clout_log_achievement_id_clout_achievements_id_fk"
		}).onDelete("set null"),
]);

export const airdropSettings = pgTable("airdrop_settings", {
	id: serial().primaryKey().notNull(),
	tokenType: varchar("token_type", { length: 50 }).notNull(),
	amount: integer().notNull(),
	interval: varchar({ length: 50 }).default('daily'),
	targetGroupId: integer("target_group_id"),
	enabled: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.targetGroupId],
			foreignColumns: [roles.roleId],
			name: "airdrop_settings_target_group_id_roles_role_id_fk"
		}),
]);

export const productMedia = pgTable("product_media", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	mediaId: integer("media_id").notNull(),
	position: integer().default(0).notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_product_media_product_id").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "product_media_product_id_products_product_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [mediaLibrary.mediaId],
			name: "product_media_media_id_media_library_media_id_fk"
		}).onDelete("cascade"),
	unique("product_media_unique").on(table.productId, table.mediaId),
]);

export const cloutAchievements = pgTable("clout_achievements", {
	id: serial().primaryKey().notNull(),
	achievementKey: varchar("achievement_key", { length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	cloutReward: integer("clout_reward").default(0).notNull(),
	criteriaType: varchar("criteria_type", { length: 50 }),
	criteriaValue: integer("criteria_value"),
	enabled: boolean().default(true).notNull(),
	iconUrl: varchar("icon_url", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("clout_achievements_achievement_key_unique").on(table.achievementKey),
]);

export const airdropRecords = pgTable("airdrop_records", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id"),
	tokenType: varchar("token_type", { length: 50 }),
	amount: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "airdrop_records_user_id_users_user_id_fk"
		}),
]);

export const xpLogs = pgTable("xp_logs", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	date: date().notNull(),
	xpGained: integer("xp_gained").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_xp_logs_user_date").using("btree", table.userId.asc().nullsLast().op("date_ops"), table.date.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "xp_logs_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	unique("xp_logs_user_date_unique").on(table.userId, table.date),
]);

export const productCategories = pgTable("product_categories", {
	categoryId: serial("category_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	imageId: integer("image_id"),
	parentId: integer("parent_id"),
	position: integer().default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_product_categories_parent_id").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.imageId],
			foreignColumns: [mediaLibrary.mediaId],
			name: "product_categories_image_id_media_library_media_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.categoryId],
			name: "product_categories_parent_id_product_categories_category_id_fk"
		}).onDelete("set null"),
	unique("product_categories_slug_unique").on(table.slug),
]);

export const orderItems = pgTable("order_items", {
	itemId: serial("item_id").primaryKey().notNull(),
	orderId: integer("order_id").notNull(),
	productId: integer("product_id"),
	productName: varchar("product_name", { length: 255 }).notNull(),
	quantity: integer().default(1).notNull(),
	price: doublePrecision().notNull(),
	total: doublePrecision().notNull(),
	isPointsUsed: boolean("is_points_used").default(false).notNull(),
	pointsUsed: integer("points_used").default(0),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_order_items_order_id").using("btree", table.orderId.asc().nullsLast().op("int4_ops")),
	index("idx_order_items_product_id").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.orderId],
			name: "order_items_order_id_orders_order_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "order_items_product_id_products_product_id_fk"
		}).onDelete("set null"),
]);

export const userInventory = pgTable("user_inventory", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: integer("product_id").notNull(),
	quantity: integer().default(1).notNull(),
	equipped: boolean().default(false).notNull(),
	acquiredAt: timestamp("acquired_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	transactionId: integer("transaction_id"),
	metadata: jsonb().default({}),
}, (table) => [
	uniqueIndex("user_product_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.productId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_inventory_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "user_inventory_product_id_products_product_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transactions.transactionId],
			name: "user_inventory_transaction_id_transactions_transaction_id_fk"
		}).onDelete("set null"),
]);

export const inventoryTransactions = pgTable("inventory_transactions", {
	transactionId: serial("transaction_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: integer("product_id").notNull(),
	transactionType: varchar("transaction_type", { length: 50 }).notNull(),
	amount: integer().default(1).notNull(),
	currency: varchar({ length: 10 }).notNull(),
	currencyAmount: doublePrecision("currency_amount").notNull(),
	status: varchar({ length: 20 }).default('completed').notNull(),
	metadata: jsonb().default({}),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_inventory_transactions_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_inventory_transactions_product_id").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("idx_inventory_transactions_transaction_type").using("btree", table.transactionType.asc().nullsLast().op("text_ops")),
	index("idx_inventory_transactions_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "inventory_transactions_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "inventory_transactions_product_id_products_product_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "inventory_transactions_created_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const userSignatureItems = pgTable("user_signature_items", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	signatureItemId: integer("signature_item_id").notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_signature_items_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.signatureItemId],
			foreignColumns: [signatureShopItems.id],
			name: "user_signature_items_signature_item_id_signature_shop_items_id_"
		}).onDelete("cascade"),
	unique("user_signature_items_user_item_unique").on(table.userId, table.signatureItemId),
]);

export const signatureShopItems = pgTable("signature_shop_items", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	effectKey: text("effect_key").notNull(),
	price: integer().notNull(),
	requiredLevel: integer("required_level").default(1),
	rarity: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const cosmeticCategories = pgTable("cosmetic_categories", {
	categoryId: serial("category_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	bgColor: varchar("bg_color", { length: 10 }),
	textColor: varchar("text_color", { length: 10 }),
	iconUrl: varchar("icon_url", { length: 255 }),
	allowedRarities: jsonb("allowed_rarities").default([]),
	position: integer().default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	pluginData: jsonb("plugin_data").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_cosmetic_categories_slug").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("cosmetic_categories_slug_unique").on(table.slug),
]);

export const rarities = pgTable("rarities", {
	rarityId: serial("rarity_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	hexColor: varchar("hex_color", { length: 10 }).notNull(),
	rarityScore: integer("rarity_score").notNull(),
	isGlow: boolean("is_glow").default(false).notNull(),
	isAnimated: boolean("is_animated").default(false).notNull(),
	flags: jsonb().default({}),
	pluginData: jsonb("plugin_data").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_rarities_rarity_score").using("btree", table.rarityScore.asc().nullsLast().op("int4_ops")),
	unique("rarities_slug_unique").on(table.slug),
]);

export const orders = pgTable("orders", {
	orderId: serial("order_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	userId: uuid("user_id"),
	status: varchar({ length: 50 }).default('pending').notNull(),
	total: doublePrecision().default(0).notNull(),
	subtotal: doublePrecision().default(0).notNull(),
	tax: doublePrecision().default(0),
	shipping: doublePrecision().default(0),
	discount: doublePrecision().default(0),
	paymentMethod: varchar("payment_method", { length: 100 }),
	paymentId: varchar("payment_id", { length: 255 }),
	billingAddress: jsonb("billing_address").default({}),
	shippingAddress: jsonb("shipping_address").default({}),
	customerNotes: text("customer_notes"),
	adminNotes: text("admin_notes"),
	isPointsUsed: boolean("is_points_used").default(false).notNull(),
	pointsUsed: integer("points_used").default(0),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	index("idx_orders_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_orders_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_orders_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "orders_user_id_users_user_id_fk"
		}).onDelete("set null"),
]);

export const conversations = pgTable("conversations", {
	conversationId: serial("conversation_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	title: varchar({ length: 255 }),
	isGroup: boolean("is_group").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by").notNull(),
	isArchived: boolean("is_archived").default(false).notNull(),
}, (table) => [
	index("idx_conversations_created_by").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("idx_conversations_updated_at").using("btree", table.updatedAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "conversations_created_by_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const chatRooms = pgTable("chat_rooms", {
	roomId: serial("room_id").primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	isPrivate: boolean("is_private").default(false).notNull(),
	minGroupIdRequired: integer("min_group_id_required"),
	minXpRequired: integer("min_xp_required").default(0),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	order: integer().default(0).notNull(),
}, (table) => [
	index("idx_chat_rooms_is_private").using("btree", table.isPrivate.asc().nullsLast().op("bool_ops")),
	index("idx_chat_rooms_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_chat_rooms_order").using("btree", table.order.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.minGroupIdRequired],
			foreignColumns: [roles.roleId],
			name: "chat_rooms_min_group_id_required_roles_role_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "chat_rooms_created_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const shoutboxMessages = pgTable("shoutbox_messages", {
	messageId: serial("message_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	roomId: integer("room_id"),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	editedAt: timestamp("edited_at", { mode: 'string' }),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	isPinned: boolean("is_pinned").default(false).notNull(),
	tipAmount: integer("tip_amount"),
}, (table) => [
	index("idx_shoutbox_messages_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_shoutbox_messages_room_id").using("btree", table.roomId.asc().nullsLast().op("int4_ops")),
	index("idx_shoutbox_messages_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "shoutbox_messages_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.roomId],
			name: "shoutbox_messages_room_id_chat_rooms_room_id_fk"
		}).onDelete("cascade"),
]);

export const onlineUsers = pgTable("online_users", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	roomId: integer("room_id"),
	lastActive: timestamp("last_active", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	metadata: jsonb().default({}),
}, (table) => [
	index("idx_online_users_last_active").using("btree", table.lastActive.asc().nullsLast().op("timestamp_ops")),
	index("idx_online_users_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "online_users_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [chatRooms.roomId],
			name: "online_users_room_id_chat_rooms_room_id_fk"
		}).onDelete("set null"),
	unique("unique_online_user").on(table.userId),
]);

export const animationPacks = pgTable("animation_packs", {
	id: serial().primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	rarity: varchar({ length: 20 }).default('cope').notNull(),
	priceDgt: doublePrecision("price_dgt"),
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("animation_packs_slug_unique").on(table.slug),
]);

export const conversationParticipants = pgTable("conversation_participants", {
	participantId: serial("participant_id").primaryKey().notNull(),
	conversationId: integer("conversation_id").notNull(),
	userId: uuid("user_id").notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
	lastReadAt: timestamp("last_read_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	isMuted: boolean("is_muted").default(false).notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
}, (table) => [
	index("idx_conversation_participants_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("int4_ops")),
	index("idx_conversation_participants_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "conversation_participants_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.conversationId],
			name: "conversation_participants_conversation_id_conversations_convers"
		}).onDelete("cascade"),
	unique("conversation_user_unique").on(table.conversationId, table.userId),
]);

export const messages = pgTable("messages", {
	messageId: serial("message_id").primaryKey().notNull(),
	uuid: uuid().defaultRandom().notNull(),
	conversationId: integer("conversation_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	content: text().notNull(),
	attachmentUrl: varchar("attachment_url", { length: 255 }),
	attachmentType: varchar("attachment_type", { length: 50 }),
	isEdited: boolean("is_edited").default(false).notNull(),
	editedAt: timestamp("edited_at", { mode: 'string' }),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	systemMessageType: varchar("system_message_type", { length: 50 }),
	editorState: jsonb("editor_state"),
}, (table) => [
	index("idx_messages_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("int4_ops")),
	index("idx_messages_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_messages_sender_id").using("btree", table.senderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.conversationId],
			name: "messages_conversation_id_conversations_conversation_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.userId],
			name: "messages_sender_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const directMessages = pgTable("direct_messages", {
	messageId: serial("message_id").primaryKey().notNull(),
	senderId: uuid("sender_id").notNull(),
	recipientId: uuid("recipient_id").notNull(),
	content: text().notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	index("idx_direct_messages_recipient_id").using("btree", table.recipientId.asc().nullsLast().op("uuid_ops")),
	index("idx_direct_messages_sender_id").using("btree", table.senderId.asc().nullsLast().op("uuid_ops")),
	index("idx_direct_messages_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.userId],
			name: "direct_messages_sender_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [users.userId],
			name: "direct_messages_recipient_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const auditLogs = pgTable("audit_logs", {
	logId: serial("log_id").primaryKey().notNull(),
	userId: uuid("user_id"),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar("entity_type", { length: 100 }).notNull(),
	entityId: varchar("entity_id", { length: 100 }),
	before: jsonb(),
	after: jsonb(),
	details: jsonb().default({}),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_audit_logs_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_audit_logs_entity_type").using("btree", table.entityType.asc().nullsLast().op("text_ops")),
	index("idx_audit_logs_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "audit_logs_user_id_users_user_id_fk"
		}).onDelete("set null"),
]);

export const reportedContent = pgTable("reported_content", {
	reportId: serial("report_id").primaryKey().notNull(),
	reporterId: uuid("reporter_id").notNull(),
	contentType: varchar("content_type", { length: 50 }).notNull(),
	contentId: integer("content_id").notNull(),
	reason: varchar({ length: 100 }).notNull(),
	details: text(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	resolvedBy: uuid("resolved_by"),
	resolutionNotes: text("resolution_notes"),
}, (table) => [
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [users.userId],
			name: "reported_content_reporter_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.userId],
			name: "reported_content_resolved_by_users_user_id_fk"
		}).onDelete("set null"),
]);

export const contentModerationActions = pgTable("content_moderation_actions", {
	actionId: serial("action_id").primaryKey().notNull(),
	moderatorId: uuid("moderator_id").notNull(),
	contentType: varchar("content_type", { length: 50 }).notNull(),
	contentId: integer("content_id").notNull(),
	actionType: varchar("action_type", { length: 50 }).notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	additionalData: jsonb("additional_data").default({}),
}, (table) => [
	foreignKey({
			columns: [table.moderatorId],
			foreignColumns: [users.userId],
			name: "content_moderation_actions_moderator_id_users_user_id_fk"
		}).onDelete("cascade"),
]);

export const threadTags = pgTable("thread_tags", {
	threadId: integer("thread_id").notNull(),
	tagId: integer("tag_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [threads.threadId],
			name: "thread_tags_thread_id_threads_thread_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.tagId],
			name: "thread_tags_tag_id_tags_tag_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.threadId, table.tagId], name: "thread_tags_thread_id_tag_id_pk"}),
]);

export const userThreadBookmarks = pgTable("user_thread_bookmarks", {
	userId: uuid("user_id").notNull(),
	threadId: integer("thread_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_thread_bookmarks_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_thread_bookmarks_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.threadId],
			foreignColumns: [threads.threadId],
			name: "user_thread_bookmarks_thread_id_threads_thread_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.threadId], name: "user_thread_bookmarks_user_id_thread_id_pk"}),
]);

export const userTitles = pgTable("user_titles", {
	userId: uuid("user_id").notNull(),
	titleId: integer("title_id").notNull(),
	awardedAt: timestamp("awarded_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_titles_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.titleId],
			foreignColumns: [titles.titleId],
			name: "user_titles_title_id_titles_title_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.titleId], name: "user_titles_user_id_title_id_pk"}),
]);

export const userBadges = pgTable("user_badges", {
	userId: uuid("user_id").notNull(),
	badgeId: integer("badge_id").notNull(),
	awardedAt: timestamp("awarded_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_badges_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.badgeId],
			foreignColumns: [badges.badgeId],
			name: "user_badges_badge_id_badges_badge_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.badgeId], name: "user_badges_user_id_badge_id_pk"}),
]);

export const messageReads = pgTable("message_reads", {
	messageId: integer("message_id").notNull(),
	userId: uuid("user_id").notNull(),
	readAt: timestamp("read_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_message_reads_message_id").using("btree", table.messageId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.messageId],
			name: "message_reads_message_id_messages_message_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "message_reads_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.messageId, table.userId], name: "message_reads_message_id_user_id_pk"}),
]);

export const userAchievements = pgTable("user_achievements", {
	userId: uuid("user_id").notNull(),
	achievementId: integer("achievement_id").notNull(),
	awardedAt: timestamp("awarded_at", { mode: 'string' }).defaultNow().notNull(),
	progress: jsonb().default({}).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_achievements_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.achievementId],
			foreignColumns: [achievements.achievementId],
			name: "user_achievements_achievement_id_achievements_achievement_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.achievementId], name: "user_achievements_user_id_achievement_id_pk"}),
]);

export const rolePermissions = pgTable("role_permissions", {
	roleId: integer("role_id").notNull(),
	permId: integer("perm_id").notNull(),
	grantedAt: timestamp("granted_at", { mode: 'string' }).defaultNow().notNull(),
	grantedBy: uuid("granted_by"),
}, (table) => [
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.roleId],
			name: "role_permissions_role_id_roles_role_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permId],
			foreignColumns: [permissions.permId],
			name: "role_permissions_perm_id_permissions_perm_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.grantedBy],
			foreignColumns: [users.userId],
			name: "role_permissions_granted_by_users_user_id_fk"
		}).onDelete("set null"),
	primaryKey({ columns: [table.roleId, table.permId], name: "role_permissions_role_id_perm_id_pk"}),
]);

export const postReactions = pgTable("post_reactions", {
	userId: uuid("user_id").notNull(),
	postId: integer("post_id").notNull(),
	reactionType: reactionType("reaction_type").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_post_reactions_post_id").using("btree", table.postId.asc().nullsLast().op("int4_ops")),
	index("idx_post_reactions_reaction_type").using("btree", table.reactionType.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "post_reactions_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.postId],
			name: "post_reactions_post_id_posts_post_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.postId, table.reactionType], name: "post_reactions_user_id_post_id_reaction_type_pk"}),
]);

export const userRulesAgreements = pgTable("user_rules_agreements", {
	userId: uuid("user_id").notNull(),
	ruleId: integer("rule_id").notNull(),
	versionHash: varchar("version_hash", { length: 255 }).notNull(),
	agreedAt: timestamp("agreed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_rules_agreements_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_rules_agreements_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ruleId],
			foreignColumns: [forumRules.ruleId],
			name: "user_rules_agreements_rule_id_forum_rules_rule_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.ruleId], name: "user_rules_agreements_user_id_rule_id_pk"}),
]);

export const userRoles = pgTable("user_roles", {
	userId: uuid("user_id").notNull(),
	roleId: integer("role_id").notNull(),
	grantedAt: timestamp("granted_at", { mode: 'string' }).defaultNow().notNull(),
	grantedBy: uuid("granted_by"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "user_roles_user_id_users_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.roleId],
			name: "user_roles_role_id_roles_role_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.grantedBy],
			foreignColumns: [users.userId],
			name: "user_roles_granted_by_users_user_id_fk"
		}).onDelete("set null"),
	primaryKey({ columns: [table.userId, table.roleId], name: "user_roles_user_id_role_id_pk"}),
]);
