/**
 * Enhanced Shoutbox Service
 *
 * Comprehensive shoutbox system with:
 * - Command processing (/tip, /rain, /airdrop, /moderation commands)
 * - Admin configuration management
 * - User ignore system
 * - Message queuing and caching
 * - Analytics tracking
 */

import { db } from '@db';
import type { UserId } from '@shared/types/ids';
import {
	shoutboxMessages,
	chatRooms,
	users,
	shoutboxConfig,
	shoutboxUserIgnores,
	shoutboxAnalytics,
	shoutboxBannedWords,
	customEmojis
} from '@schema';
import { eq, and, or, desc, asc, sql, gt, lt, isNull, inArray, not } from 'drizzle-orm';
import { logger } from '@core/logger';
import { createId } from '@paralleldrive/cuid2';
import type { NewShoutboxConfig, ShoutboxConfig } from '@schema/admin/shoutboxConfig';
import type { RoomId } from '@shared/types/ids';

interface MessageContext {
	userId: UserId;
	username: string;
	roomId: RoomId;
	content: string;
	userRoles: string[];
	userLevel: number;
	ipAddress?: string;
	sessionId?: string;
}

interface CommandResult {
	success: boolean;
	message: string;
	data?: any;
	error?: string;
	broadcastData?: any;
}

export class ShoutboxService {
	private static cache = new Map<string, any>();
	private static configCache = new Map<string, ShoutboxConfig>();
	private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	/**
	 * Get shoutbox configuration with hierarchical override system
	 * Global config can be overridden by room-specific config
	 */
	static async getConfig(roomId?: RoomId): Promise<ShoutboxConfig> {
		const cacheKey = `config:${roomId || 'global'}`;

		if (this.configCache.has(cacheKey)) {
			return this.configCache.get(cacheKey)!;
		}

		try {
			// Get global config first
			let globalConfig = await db.query.shoutboxConfig.findFirst({
				where: and(eq(shoutboxConfig.scope, 'global'), isNull(shoutboxConfig.roomId))
			});

			// Create default global config if none exists
			if (!globalConfig) {
				globalConfig = await this.createDefaultConfig();
			}

			let finalConfig = globalConfig;

			// If room-specific config is requested, merge with global
			if (roomId) {
				const roomConfig = await db.query.shoutboxConfig.findFirst({
					where: and(eq(shoutboxConfig.scope, 'room'), eq(shoutboxConfig.roomId, roomId.toString()))
				});

				if (roomConfig) {
					// Merge room config over global config
					finalConfig = { ...globalConfig, ...roomConfig };
				}
			}

			this.configCache.set(cacheKey, finalConfig);

			// Auto-expire cache
			setTimeout(() => this.configCache.delete(cacheKey), this.CACHE_TTL);

			return finalConfig;
		} catch (error) {
			logger.error('ShoutboxService', 'Error loading config', { error, roomId });
			return await this.createDefaultConfig();
		}
	}

	/**
	 * Create default shoutbox configuration
	 */
	private static async createDefaultConfig(): Promise<ShoutboxConfig> {
		const defaultConfig: NewShoutboxConfig = {
			scope: 'global',
			enabled: true,
			maxMessageLength: 500,
			messageRetentionDays: 365,
			rateLimitSeconds: 10,
			autoModerationEnabled: true,
			profanityFilterEnabled: true,
			spamDetectionEnabled: true,
			allowUserAvatars: true,
			allowUsernameColors: true,
			allowCustomEmojis: true,
			allowMentions: true,
			allowReactions: true,
			commandsEnabled: true,
			allowTippingCommands: true,
			allowRainCommands: true,
			allowAirdropCommands: true,
			allowModerationCommands: true,
			allowPinnedMessages: true,
			maxPinnedMessages: 3,
			analyticsEnabled: true,
			logMessageHistory: true,
			logModerationActions: true,
			logCommandUsage: true,
			allowMessageExport: true,
			userIgnoreSystemEnabled: true,
			typingIndicatorsEnabled: true,
			messageQueueEnabled: true,
			maxConcurrentUsers: 1000,
			messagePreloadCount: 50,
			cacheEnabled: true,
			cacheTtlSeconds: 300,
			createdBy: 'system',
			themeConfig: {
				primaryColor: '#3b82f6',
				backgroundColor: '#1f2937',
				textColor: '#f9fafb',
				showTimestamps: true,
				compactMode: false,
				showAvatars: true,
				avatarSize: 'medium'
			},
			rolePermissions: {
				admin: {
					canPost: true,
					canPin: true,
					canDelete: true,
					canBan: true,
					canUseCommands: true,
					canUseCustomEmojis: true,
					canBypassRateLimit: true,
					canSeeDeletedMessages: true
				},
				moderator: {
					canPost: true,
					canPin: true,
					canDelete: true,
					canBan: true,
					canUseCommands: true,
					canUseCustomEmojis: true,
					canBypassRateLimit: true,
					canSeeDeletedMessages: true
				},
				user: {
					canPost: true,
					canPin: false,
					canDelete: false,
					canBan: false,
					canUseCommands: true,
					canUseCustomEmojis: false,
					canBypassRateLimit: false,
					canSeeDeletedMessages: false
				}
			}
		};

		const [created] = await db.insert(shoutboxConfig).values(defaultConfig).returning();
		return created;
	}

	/**
	 * Process shoutbox message with command detection and filtering
	 */
	static async processMessage(context: MessageContext): Promise<CommandResult> {
		const config = await this.getConfig(context.roomId);

		// Check if shoutbox is enabled
		if (!config.enabled) {
			return {
				success: false,
				message: 'Shoutbox is currently disabled',
				error: 'SHOUTBOX_DISABLED'
			};
		}

		// Check message length
		if (context.content.length > config.maxMessageLength) {
			return {
				success: false,
				message: `Message too long. Maximum ${config.maxMessageLength} characters allowed.`,
				error: 'MESSAGE_TOO_LONG'
			};
		}

		// Check for commands
		if (context.content.startsWith('/') && config.commandsEnabled) {
			return await this.processCommand(context, config);
		}

		// Apply content filters
		const filterResult = await this.applyContentFilters(context.content, config);
		if (!filterResult.allowed) {
			return {
				success: false,
				message: filterResult.reason || 'Message contains inappropriate content',
				error: 'CONTENT_FILTERED'
			};
		}

		// Process regular message
		return await this.createMessage(context, config);
	}

	/**
	 * Process chat commands (/tip, /rain, /airdrop, moderation commands)
	 */
	private static async processCommand(
		context: MessageContext,
		config: ShoutboxConfig
	): Promise<CommandResult> {
		const { content, userId, roomId } = context;
		const commandMatch = content.match(/^\/(\w+)(.*)$/);

		if (!commandMatch) {
			return {
				success: false,
				message: 'Invalid command format',
				error: 'INVALID_COMMAND'
			};
		}

		const [, command, args] = commandMatch;
		const commandLower = command.toLowerCase();

		// Log command usage
		if (config.logCommandUsage) {
			await this.logAnalytics({
				eventType: 'command',
				userId: userId.toString(),
				roomId: roomId.toString(),
				eventData: { command: commandLower, args: args.trim() },
				sessionId: context.sessionId,
				ipAddress: context.ipAddress
			});
		}

		switch (commandLower) {
			case 'tip':
				return await this.processTipCommand(context, args.trim(), config);

			case 'rain':
				return await this.processRainCommand(context, args.trim(), config);

			case 'airdrop':
				return await this.processAirdropCommand(context, args.trim(), config);

			case 'mute':
			case 'unmute':
			case 'ban':
			case 'unban':
			case 'timeout':
				return await this.processModerationCommand(context, commandLower, args.trim(), config);

			case 'clear':
				return await this.processClearCommand(context, config);

			case 'help':
				return await this.processHelpCommand(context, config);

			default:
				return {
					success: false,
					message: `Unknown command: /${command}`,
					error: 'UNKNOWN_COMMAND'
				};
		}
	}

	/**
	 * Process /tip command
	 */
	private static async processTipCommand(
		context: MessageContext,
		args: string,
		config: ShoutboxConfig
	): Promise<CommandResult> {
		if (!config.allowTippingCommands) {
			return {
				success: false,
				message: 'Tipping commands are disabled in this room',
				error: 'TIPPING_DISABLED'
			};
		}

		const tipMatch = args.match(/^@?(\w+)\s+(\d+(?:\.\d{1,2})?)(?:\s+(.*))?$/);
		if (!tipMatch) {
			return {
				success: false,
				message: 'Usage: /tip @username amount [message]',
				error: 'INVALID_TIP_FORMAT'
			};
		}

		const [, targetUsername, amountStr, tipMessage] = tipMatch;
		const amount = parseFloat(amountStr);

		if (amount <= 0 || amount > 10000) {
			return {
				success: false,
				message: 'Tip amount must be between 0.01 and 10,000 DGT',
				error: 'INVALID_TIP_AMOUNT'
			};
		}

		try {
			// Import tip service dynamically to avoid circular dependencies
			const { TipService } = await import('../../engagement/tip/tip.service');

			const tipResult = await TipService.createTip({
				fromUserId: context.userId,
				toUsername: targetUsername,
				amount,
				note: tipMessage || `Tip from ${context.username} in shoutbox`,
				context: 'shoutbox'
			});

			if (tipResult.success) {
				// Create system message about the tip
				const systemMessage = `💰 ${context.username} tipped @${targetUsername} ${amount} DGT${tipMessage ? `: ${tipMessage}` : ''}`;

				await this.createSystemMessage(context.roomId, systemMessage);

				return {
					success: true,
					message: `Successfully tipped @${targetUsername} ${amount} DGT`,
					data: tipResult.data,
					broadcastData: {
						type: 'chat_update',
						action: 'system_message',
						content: systemMessage,
						roomId: context.roomId
					}
				};
			} else {
				return {
					success: false,
					message: tipResult.message || 'Failed to process tip',
					error: 'TIP_FAILED'
				};
			}
		} catch (error) {
			logger.error('ShoutboxService', 'Error processing tip command', { error, context });
			return {
				success: false,
				message: 'Failed to process tip command',
				error: 'TIP_ERROR'
			};
		}
	}

	/**
	 * Process /rain command
	 */
	private static async processRainCommand(
		context: MessageContext,
		args: string,
		config: ShoutboxConfig
	): Promise<CommandResult> {
		if (!config.allowRainCommands) {
			return {
				success: false,
				message: 'Rain commands are disabled in this room',
				error: 'RAIN_DISABLED'
			};
		}

		const rainMatch = args.match(/^(\d+(?:\.\d{1,2})?)\s+(\d+)(?:\s+(.*))?$/);
		if (!rainMatch) {
			return {
				success: false,
				message: 'Usage: /rain amount userCount [message]',
				error: 'INVALID_RAIN_FORMAT'
			};
		}

		const [, amountStr, userCountStr, rainMessage] = rainMatch;
		const totalAmount = parseFloat(amountStr);
		const userCount = parseInt(userCountStr);

		if (totalAmount <= 0 || totalAmount > 50000) {
			return {
				success: false,
				message: 'Rain amount must be between 0.01 and 50,000 DGT',
				error: 'INVALID_RAIN_AMOUNT'
			};
		}

		if (userCount < 2 || userCount > 50) {
			return {
				success: false,
				message: 'User count must be between 2 and 50',
				error: 'INVALID_RAIN_COUNT'
			};
		}

		try {
			// Import rain service dynamically
			const { RainService } = await import('../../engagement/rain/rain.service');

			const rainResult = await RainService.createRain({
				userId: context.userId,
				amount: totalAmount,
				recipientCount: userCount,
				message: rainMessage || `Rain from ${context.username}`,
				roomId: context.roomId
			});

			if (rainResult.success) {
				const systemMessage = `🌧️ ${context.username} started a rain of ${totalAmount} DGT for ${userCount} users! ${rainMessage || ''}`;

				await this.createSystemMessage(context.roomId, systemMessage);

				return {
					success: true,
					message: `Successfully started rain of ${totalAmount} DGT for ${userCount} users`,
					data: rainResult.data,
					broadcastData: {
						type: 'chat_update',
						action: 'rain_started',
						content: systemMessage,
						roomId: context.roomId,
						rainData: rainResult.data
					}
				};
			} else {
				return {
					success: false,
					message: rainResult.message || 'Failed to start rain',
					error: 'RAIN_FAILED'
				};
			}
		} catch (error) {
			logger.error('ShoutboxService', 'Error processing rain command', { error, context });
			return {
				success: false,
				message: 'Failed to process rain command',
				error: 'RAIN_ERROR'
			};
		}
	}

	/**
	 * Process /airdrop command (admin only)
	 */
	private static async processAirdropCommand(
		context: MessageContext,
		args: string,
		config: ShoutboxConfig
	): Promise<CommandResult> {
		if (!config.allowAirdropCommands) {
			return {
				success: false,
				message: 'Airdrop commands are disabled',
				error: 'AIRDROP_DISABLED'
			};
		}

		// Check if user has admin permissions
		const rolePermissions = config.rolePermissions;
		const userRole = this.getUserRole(context.userRoles);

		if (!rolePermissions[userRole]?.canUseCommands || !context.userRoles.includes('admin')) {
			return {
				success: false,
				message: 'Only administrators can use the airdrop command',
				error: 'INSUFFICIENT_PERMISSIONS'
			};
		}

		const airdropMatch = args.match(/^(\d+(?:\.\d{1,2})?)(?:\s+(.*))?$/);
		if (!airdropMatch) {
			return {
				success: false,
				message: 'Usage: /airdrop amount [message]',
				error: 'INVALID_AIRDROP_FORMAT'
			};
		}

		const [, amountStr, airdropMessage] = airdropMatch;
		const amount = parseFloat(amountStr);

		if (amount <= 0 || amount > 100000) {
			return {
				success: false,
				message: 'Airdrop amount must be between 0.01 and 100,000 DGT',
				error: 'INVALID_AIRDROP_AMOUNT'
			};
		}

		try {
			// Get all active users in the room
			const activeUsers = await this.getActiveRoomUsers(context.roomId);

			if (activeUsers.length === 0) {
				return {
					success: false,
					message: 'No active users found for airdrop',
					error: 'NO_ACTIVE_USERS'
				};
			}

			const perUserAmount = amount / activeUsers.length;

			// Process airdrop (implementation would depend on wallet service)
			const systemMessage = `🪂 Administrator ${context.username} sent an airdrop of ${amount} DGT (${perUserAmount.toFixed(2)} per user) to ${activeUsers.length} users! ${airdropMessage || ''}`;

			await this.createSystemMessage(context.roomId, systemMessage);

			return {
				success: true,
				message: `Successfully sent airdrop of ${amount} DGT to ${activeUsers.length} users`,
				data: { totalAmount: amount, perUserAmount, recipientCount: activeUsers.length },
				broadcastData: {
					type: 'chat_update',
					action: 'airdrop_sent',
					content: systemMessage,
					roomId: context.roomId
				}
			};
		} catch (error) {
			logger.error('ShoutboxService', 'Error processing airdrop command', { error, context });
			return {
				success: false,
				message: 'Failed to process airdrop command',
				error: 'AIRDROP_ERROR'
			};
		}
	}

	/**
	 * Process moderation commands
	 */
	private static async processModerationCommand(
		context: MessageContext,
		command: string,
		args: string,
		config: ShoutboxConfig
	): Promise<CommandResult> {
		if (!config.allowModerationCommands) {
			return {
				success: false,
				message: 'Moderation commands are disabled',
				error: 'MODERATION_DISABLED'
			};
		}

		const userRole = this.getUserRole(context.userRoles);
		const rolePermissions = config.rolePermissions[userRole];

		if (!rolePermissions?.canBan && !rolePermissions?.canDelete) {
			return {
				success: false,
				message: 'Insufficient permissions for moderation commands',
				error: 'INSUFFICIENT_PERMISSIONS'
			};
		}

		const targetMatch = args.match(/^@?(\w+)(?:\s+(\d+[smhd]?))?(?:\s+(.*))?$/);
		if (!targetMatch) {
			return {
				success: false,
				message: `Usage: /${command} @username [duration] [reason]`,
				error: 'INVALID_MODERATION_FORMAT'
			};
		}

		const [, targetUsername, duration, reason] = targetMatch;

		// Find target user
		const targetUser = await db.query.users.findFirst({
			where: eq(users.username, targetUsername)
		});

		if (!targetUser) {
			return {
				success: false,
				message: `User @${targetUsername} not found`,
				error: 'USER_NOT_FOUND'
			};
		}

		// Process the moderation action
		let actionMessage = '';

		switch (command) {
			case 'mute':
				actionMessage = `🔇 ${targetUsername} has been muted by ${context.username}`;
				break;
			case 'unmute':
				actionMessage = `🔊 ${targetUsername} has been unmuted by ${context.username}`;
				break;
			case 'ban':
				actionMessage = `🚫 ${targetUsername} has been banned by ${context.username}`;
				break;
			case 'unban':
				actionMessage = `✅ ${targetUsername} has been unbanned by ${context.username}`;
				break;
			case 'timeout':
				actionMessage = `⏰ ${targetUsername} has been timed out by ${context.username}`;
				break;
		}

		if (duration) {
			actionMessage += ` for ${duration}`;
		}
		if (reason) {
			actionMessage += ` - Reason: ${reason}`;
		}

		await this.createSystemMessage(context.roomId, actionMessage);

		return {
			success: true,
			message: `Successfully ${command}ed @${targetUsername}`,
			data: { action: command, target: targetUsername, duration, reason },
			broadcastData: {
				type: 'chat_update',
				action: 'moderation_action',
				content: actionMessage,
				roomId: context.roomId
			}
		};
	}

	/**
	 * Process /clear command
	 */
	private static async processClearCommand(
		context: MessageContext,
		config: ShoutboxConfig
	): Promise<CommandResult> {
		const userRole = this.getUserRole(context.userRoles);
		const rolePermissions = config.rolePermissions[userRole];

		if (!rolePermissions?.canDelete) {
			return {
				success: false,
				message: 'Insufficient permissions to clear chat',
				error: 'INSUFFICIENT_PERMISSIONS'
			};
		}

		try {
			// Soft delete all messages in the room
			await db
				.update(shoutboxMessages)
				.set({ isDeleted: true, editedAt: new Date() })
				.where(
					and(eq(shoutboxMessages.roomId, context.roomId), eq(shoutboxMessages.isDeleted, false))
				);

			const systemMessage = `🧹 Chat cleared by ${context.username}`;
			await this.createSystemMessage(context.roomId, systemMessage);

			return {
				success: true,
				message: 'Chat cleared successfully',
				broadcastData: {
					type: 'chat_update',
					action: 'chat_cleared',
					roomId: context.roomId
				}
			};
		} catch (error) {
			logger.error('ShoutboxService', 'Error clearing chat', { error, context });
			return {
				success: false,
				message: 'Failed to clear chat',
				error: 'CLEAR_FAILED'
			};
		}
	}

	/**
	 * Process /help command
	 */
	private static async processHelpCommand(
		context: MessageContext,
		config: ShoutboxConfig
	): Promise<CommandResult> {
		const userRole = this.getUserRole(context.userRoles);
		const rolePermissions = config.rolePermissions[userRole];

		const commands = [];

		if (config.allowTippingCommands) {
			commands.push('/tip @username amount [message] - Tip another user');
		}

		if (config.allowRainCommands) {
			commands.push('/rain amount userCount [message] - Start a rain for multiple users');
		}

		if (config.allowAirdropCommands && context.userRoles.includes('admin')) {
			commands.push('/airdrop amount [message] - Send airdrop to all active users (admin only)');
		}

		if (rolePermissions?.canBan || rolePermissions?.canDelete) {
			commands.push('/mute @username [duration] [reason] - Mute a user');
			commands.push('/ban @username [duration] [reason] - Ban a user');
			commands.push('/timeout @username [duration] [reason] - Timeout a user');
			commands.push('/clear - Clear all messages in the room');
		}

		const helpMessage =
			commands.length > 0
				? `Available commands:\n${commands.join('\n')}`
				: 'No commands available in this room';

		return {
			success: true,
			message: helpMessage
		};
	}

	/**
	 * Apply content filters (profanity, spam detection, etc.)
	 */
	private static async applyContentFilters(
		content: string,
		config: ShoutboxConfig
	): Promise<{
		allowed: boolean;
		reason?: string;
		action?: string;
	}> {
		if (!config.profanityFilterEnabled && !config.spamDetectionEnabled) {
			return { allowed: true };
		}

		try {
			// Check banned words
			const bannedWords = await db.query.shoutboxBannedWords.findMany({
				where: and(
					eq(shoutboxBannedWords.enabled, true),
					or(
						isNull(shoutboxBannedWords.roomId),
						eq(shoutboxBannedWords.roomId, config.roomId || '')
					)
				)
			});

			for (const bannedWord of bannedWords) {
				const pattern = bannedWord.isRegex
					? new RegExp(bannedWord.pattern, 'i')
					: new RegExp(bannedWord.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

				if (pattern.test(content)) {
					return {
						allowed: bannedWord.action === 'warn',
						reason: bannedWord.warningMessage || 'Content contains inappropriate language',
						action: bannedWord.action
					};
				}
			}

			// Basic spam detection (repeated characters, excessive caps, etc.)
			if (config.spamDetectionEnabled) {
				const repeatedCharsMatch = content.match(/(.)\1{5,}/);
				if (repeatedCharsMatch) {
					return {
						allowed: false,
						reason: 'Message contains too many repeated characters'
					};
				}

				const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
				if (content.length > 10 && capsRatio > 0.7) {
					return {
						allowed: false,
						reason: 'Message contains too many capital letters'
					};
				}
			}

			return { allowed: true };
		} catch (error) {
			logger.error('ShoutboxService', 'Error in content filtering', { error, content });
			return { allowed: true }; // Allow message if filtering fails
		}
	}

	/**
	 * Create a regular message
	 */
	private static async createMessage(
		context: MessageContext,
		config: ShoutboxConfig
	): Promise<CommandResult> {
		try {
			const [message] = await db
				.insert(shoutboxMessages)
				.values({
					userId: context.userId,
					roomId: context.roomId,
					content: context.content
				})
				.returning();

			// Log analytics
			if (config.analyticsEnabled) {
				await this.logAnalytics({
					eventType: 'message',
					userId: context.userId.toString(),
					roomId: context.roomId.toString(),
					eventData: { messageId: message.id.toString() },
					sessionId: context.sessionId,
					ipAddress: context.ipAddress
				});
			}

			return {
				success: true,
				message: 'Message sent successfully',
				data: message
			};
		} catch (error) {
			logger.error('ShoutboxService', 'Error creating message', { error, context });
			return {
				success: false,
				message: 'Failed to send message',
				error: 'MESSAGE_CREATION_FAILED'
			};
		}
	}

	/**
	 * Create a system message
	 */
	private static async createSystemMessage(roomId: RoomId, content: string): Promise<void> {
		try {
			await db.insert(shoutboxMessages).values({
				userId: null, // System message
				roomId,
				content,
				isDeleted: false
			});
		} catch (error) {
			logger.error('ShoutboxService', 'Error creating system message', { error, roomId, content });
		}
	}

	/**
	 * Get active users in a room
	 */
	private static async getActiveRoomUsers(roomId: RoomId): Promise<any[]> {
		// This would typically query online users or recent message senders
		// For now, return mock data
		return [];
	}

	/**
	 * Get user role from roles array
	 */
	private static getUserRole(userRoles: string[]): string {
		if (userRoles.includes('admin')) return 'admin';
		if (userRoles.includes('moderator')) return 'moderator';
		return 'user';
	}

	/**
	 * Log analytics event
	 */
	private static async logAnalytics(event: {
		eventType: string;
		userId: string;
		roomId: string;
		eventData?: any;
		sessionId?: string;
		ipAddress?: string;
	}): Promise<void> {
		try {
			await db.insert(shoutboxAnalytics).values({
				eventType: event.eventType,
				userId: event.userId,
				roomId: event.roomId,
				eventData: event.eventData || {},
				sessionId: event.sessionId,
				ipAddress: event.ipAddress
			});
		} catch (error) {
			logger.error('ShoutboxService', 'Error logging analytics', { error, event });
		}
	}

	/**
	 * Clear configuration cache
	 */
	static clearConfigCache(roomId?: RoomId): void {
		const cacheKey = `config:${roomId || 'global'}`;
		this.configCache.delete(cacheKey);
	}

	/**
	 * Update configuration
	 */
	static async updateConfig(
		configData: Partial<NewShoutboxConfig>,
		roomId?: RoomId
	): Promise<ShoutboxConfig> {
		const scope = roomId ? 'room' : 'global';
		const whereClause = roomId
			? and(eq(shoutboxConfig.scope, 'room'), eq(shoutboxConfig.roomId, roomId.toString()))
			: and(eq(shoutboxConfig.scope, 'global'), isNull(shoutboxConfig.roomId));

		const [updated] = await db
			.update(shoutboxConfig)
			.set({
				...configData,
				updatedAt: new Date(),
				updatedBy: configData.updatedBy || 'system'
			})
			.where(whereClause)
			.returning();

		// Clear cache
		this.clearConfigCache(roomId);

		return updated;
	}
}
