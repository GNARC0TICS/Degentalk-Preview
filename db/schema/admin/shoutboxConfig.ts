import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import {
	pgTable,
	varchar,
	boolean,
	integer,
	timestamp,
	jsonb,
	text,
	unique,
	uuid
} from 'drizzle-orm/pg-core';
import { users } from '../user/users';
import { customEmojis } from '../forum/customEmojis';
/**
 * Comprehensive shoutbox configuration settings for admin panel
 * Supports room-specific and global settings with hierarchical override system
 */
export const shoutboxConfig = pgTable(
	'shoutbox_config',
	{
		id: varchar('id', { length: 128 })
			.primaryKey()
			.$defaultFn(() => createId()),
		// Configuration scope - either 'global' or room-specific
		scope: varchar('scope', { length: 20 }).notNull().default('global'), // 'global' | 'room'
		roomId: varchar('room_id', { length: 128 }), // null for global settings
		// Basic Configuration
		enabled: boolean('enabled').notNull().default(true),
		maxMessageLength: integer('max_message_length').notNull().default(500),
		messageRetentionDays: integer('message_retention_days').notNull().default(365), // Configurable history retention
		rateLimitSeconds: integer('rate_limit_seconds').notNull().default(10),
		// Moderation Settings
		autoModerationEnabled: boolean('auto_moderation_enabled').notNull().default(true),
		profanityFilterEnabled: boolean('profanity_filter_enabled').notNull().default(true),
		spamDetectionEnabled: boolean('spam_detection_enabled').notNull().default(true),
		linkModerationEnabled: boolean('link_moderation_enabled').notNull().default(false),
		// User Features
		allowUserAvatars: boolean('allow_user_avatars').notNull().default(true),
		allowUsernameColors: boolean('allow_username_colors').notNull().default(true),
		allowCustomEmojis: boolean('allow_custom_emojis').notNull().default(true),
		allowMentions: boolean('allow_mentions').notNull().default(true),
		allowReactions: boolean('allow_reactions').notNull().default(true),
		// Command System
		commandsEnabled: boolean('commands_enabled').notNull().default(true),
		allowTippingCommands: boolean('allow_tipping_commands').notNull().default(true),
		allowRainCommands: boolean('allow_rain_commands').notNull().default(true),
		allowAirdropCommands: boolean('allow_airdrop_commands').notNull().default(true),
		allowModerationCommands: boolean('allow_moderation_commands').notNull().default(true),
		// Theme & Appearance
		themeConfig: jsonb('theme_config')
			.$type<{
				primaryColor?: string;
				backgroundColor?: string;
				textColor?: string;
				accentColor?: string;
				borderRadius?: number;
				fontSize?: 'small' | 'medium' | 'large';
				showTimestamps?: boolean;
				compactMode?: boolean;
				showAvatars?: boolean;
				avatarSize?: 'small' | 'medium' | 'large';
			}>()
			.default({}),
		// Pinned Messages
		allowPinnedMessages: boolean('allow_pinned_messages').notNull().default(true),
		maxPinnedMessages: integer('max_pinned_messages').notNull().default(3),
		pinnedMessageDuration: integer('pinned_message_duration').default(86400), // seconds, null = permanent
		// Role-based Permissions
		rolePermissions: jsonb('role_permissions')
			.$type<{
				[roleKey: string]: {
					canPost?: boolean;
					canPin?: boolean;
					canDelete?: boolean;
					canBan?: boolean;
					canUseCommands?: boolean;
					canUseCustomEmojis?: boolean;
					canBypassRateLimit?: boolean;
					canSeeDeletedMessages?: boolean;
				};
			}>()
			.default({}),
		// Analytics & Logging
		analyticsEnabled: boolean('analytics_enabled').notNull().default(true),
		logMessageHistory: boolean('log_message_history').notNull().default(true),
		logModerationActions: boolean('log_moderation_actions').notNull().default(true),
		logCommandUsage: boolean('log_command_usage').notNull().default(true),
		// Export Settings
		allowMessageExport: boolean('allow_message_export').notNull().default(true),
		exportFormats: jsonb('export_formats').$type<string[]>().default(['json', 'csv', 'txt']),
		// AI Moderation (Future-proofing)
		aiModerationEnabled: boolean('ai_moderation_enabled').notNull().default(false),
		aiModerationConfig: jsonb('ai_moderation_config')
			.$type<{
				provider?: 'openai' | 'anthropic' | 'local';
				model?: string;
				confidenceThreshold?: number;
				autoActionThreshold?: number;
				enabledChecks?: string[];
			}>()
			.default({}),
		// Advanced Features
		messageSearchEnabled: boolean('message_search_enabled').notNull().default(false), // Staff only
		userIgnoreSystemEnabled: boolean('user_ignore_system_enabled').notNull().default(true),
		typingIndicatorsEnabled: boolean('typing_indicators_enabled').notNull().default(true),
		messageQueueEnabled: boolean('message_queue_enabled').notNull().default(true),
		// Performance Settings
		maxConcurrentUsers: integer('max_concurrent_users').default(1000),
		messagePreloadCount: integer('message_preload_count').notNull().default(50),
		cacheEnabled: boolean('cache_enabled').notNull().default(true),
		cacheTtlSeconds: integer('cache_ttl_seconds').notNull().default(300),
		// Metadata
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id, { onDelete: 'set null' }),
		updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
		// Configuration version for migrations
		configVersion: varchar('config_version', { length: 10 }).notNull().default('1.0')
	},
	(table) => ({
		// Ensure only one global config and one config per room
		uniqueScopeRoom: unique().on(table.scope, table.roomId)
	})
);
/**
 * Banned words/phrases for auto-moderation
 * Supports pattern matching and severity levels
 */
export const shoutboxBannedWords = pgTable('shoutbox_banned_words', {
	id: varchar('id', { length: 128 })
		.primaryKey()
		.$defaultFn(() => createId()),
	pattern: varchar('pattern', { length: 255 }).notNull(),
	isRegex: boolean('is_regex').notNull().default(false),
	severity: varchar('severity', { length: 20 }).notNull().default('medium'), // 'low' | 'medium' | 'high' | 'critical'
	action: varchar('action', { length: 20 }).notNull().default('filter'), // 'filter' | 'warn' | 'timeout' | 'ban'
	// Auto-action settings
	timeoutDuration: integer('timeout_duration'), // seconds
	warningMessage: text('warning_message'),
	// Scope
	roomId: varchar('room_id', { length: 128 }), // null = global
	enabled: boolean('enabled').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' })
});
/**
 * User ignore/block list for chat
 */
export const shoutboxUserIgnores = pgTable(
	'shoutbox_user_ignores',
	{
		id: varchar('id', { length: 128 })
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		ignoredUserId: uuid('ignored_user_id')
			.notNull()
			.references(() => users.id),
		// Ignore settings
		hideMessages: boolean('hide_messages').notNull().default(true),
		hideCommands: boolean('hide_commands').notNull().default(true),
		hideMentions: boolean('hide_mentions').notNull().default(true),
		// Scope (can ignore in specific rooms only)
		roomId: varchar('room_id', { length: 128 }), // null = global ignore
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => ({
		// Unique ignore relationship per room/global
		uniqueUserIgnore: unique().on(table.userId, table.ignoredUserId, table.roomId)
	})
);
/**
 * Custom emoji permissions for shoutbox
 */
export const shoutboxEmojiPermissions = pgTable('shoutbox_emoji_permissions', {
	id: varchar('id', { length: 128 })
		.primaryKey()
		.$defaultFn(() => createId()),
	emojiId: uuid('emoji_id')
		.notNull()
		.references(() => customEmojis.id, { onDelete: 'cascade' }),
	roomId: varchar('room_id', { length: 128 }), // null = global
	// Role-based access
	requiredRole: varchar('required_role', { length: 50 }), // null = all users
	requiredLevel: integer('required_level'), // null = no level requirement
	enabled: boolean('enabled').notNull().default(true),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id)
});
/**
 * Shoutbox analytics events
 */
export const shoutboxAnalytics = pgTable('shoutbox_analytics', {
	id: varchar('id', { length: 128 })
		.primaryKey()
		.$defaultFn(() => createId()),
	eventType: varchar('event_type', { length: 50 }).notNull(), // 'message', 'command', 'reaction', 'join', 'leave'
	userId: uuid('user_id').references(() => users.id),
	roomId: varchar('room_id', { length: 128 }).notNull(),
	// Event data
	eventData: jsonb('event_data')
		.$type<{
			messageId?: string;
			command?: string;
			reaction?: string;
			targetUserId?: string;
			metadata?: Record<string, any>;
		}>()
		.default({}),
	// Session tracking
	sessionId: varchar('session_id', { length: 128 }),
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: text('user_agent'),
	timestamp: timestamp('timestamp').notNull().defaultNow(),
	// Aggregation helper fields
	dateKey: varchar('date_key', { length: 10 })
		.notNull()
		.$defaultFn(() => sql`to_char(now(), 'YYYY-MM-DD')`),
	hourKey: integer('hour_key')
		.notNull()
		.$defaultFn(() => sql`extract(hour from now())`)
});
export type ShoutboxConfig = typeof shoutboxConfig.$inferSelect;
export type NewShoutboxConfig = typeof shoutboxConfig.$inferInsert;
export type ShoutboxBannedWord = typeof shoutboxBannedWords.$inferSelect;
export type ShoutboxUserIgnore = typeof shoutboxUserIgnores.$inferSelect;
export type ShoutboxEmojiPermission = typeof shoutboxEmojiPermissions.$inferSelect;
export type ShoutboxAnalyticsEvent = typeof shoutboxAnalytics.$inferSelect;
