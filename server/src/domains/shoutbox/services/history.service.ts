/**
 * Message History Service
 *
 * Handles:
 * - Scalable message history with pagination
 * - Configurable retention policies
 * - Message archiving and cleanup
 * - Export functionality in multiple formats
 * - Performance-optimized queries
 */

import { db } from '@db';
import { shoutboxMessages, shoutboxConfig, chatRooms, users, shoutboxAnalytics } from '@schema';
import { eq, and, or, desc, asc, sql, gt, lt, gte, lte, isNull, inArray, not } from 'drizzle-orm';
import { logger } from '@server/src/core/logger';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import archiver from 'archiver';
import { format } from 'date-fns';

interface MessageHistoryOptions {
	roomId?: number;
	userId?: number;
	dateFrom?: Date;
	dateTo?: Date;
	includeDeleted?: boolean;
	limit?: number;
	offset?: number;
	cursor?: number;
	direction?: 'before' | 'after';
	sortOrder?: 'asc' | 'desc';
}

interface ExportOptions {
	format: 'json' | 'csv' | 'txt' | 'html';
	roomId?: number;
	dateFrom?: Date;
	dateTo?: Date;
	includeDeleted?: boolean;
	includeUserData?: boolean;
	compress?: boolean;
}

interface MessageWithUser {
	id: number;
	userId: number | null;
	roomId: number;
	content: string;
	createdAt: Date;
	editedAt: Date | null;
	isDeleted: boolean;
	isPinned: boolean;
	tipAmount: number | null;
	user?: {
		username: string;
		level: number;
		roles?: string[];
	};
	room?: {
		name: string;
	};
}

export class MessageHistoryService {
	private static readonly BATCH_SIZE = 1000;
	private static readonly MAX_EXPORT_SIZE = 1000000; // 1M messages max

	/**
	 * Get paginated message history with cursor-based pagination
	 */
	static async getMessageHistory(options: MessageHistoryOptions): Promise<{
		messages: MessageWithUser[];
		hasMore: boolean;
		nextCursor?: number;
		previousCursor?: number;
		totalCount?: number;
	}> {
		try {
			const {
				roomId,
				userId,
				dateFrom,
				dateTo,
				includeDeleted = false,
				limit = 50,
				cursor,
				direction = 'before',
				sortOrder = 'desc'
			} = options;

			// Build query conditions
			const conditions = [];

			if (roomId) {
				conditions.push(eq(shoutboxMessages.roomId, roomId));
			}

			if (userId) {
				conditions.push(eq(shoutboxMessages.userId, userId));
			}

			if (!includeDeleted) {
				conditions.push(eq(shoutboxMessages.isDeleted, false));
			}

			if (dateFrom) {
				conditions.push(gte(shoutboxMessages.createdAt, dateFrom));
			}

			if (dateTo) {
				conditions.push(lte(shoutboxMessages.createdAt, dateTo));
			}

			// Cursor-based pagination
			if (cursor) {
				if (direction === 'before') {
					conditions.push(lt(shoutboxMessages.id, cursor));
				} else {
					conditions.push(gt(shoutboxMessages.id, cursor));
				}
			}

			const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

			// Execute query with limit + 1 to check if there are more results
			const messages = await db
				.select({
					id: shoutboxMessages.id,
					userId: shoutboxMessages.userId,
					roomId: shoutboxMessages.roomId,
					content: shoutboxMessages.content,
					createdAt: shoutboxMessages.createdAt,
					editedAt: shoutboxMessages.editedAt,
					isDeleted: shoutboxMessages.isDeleted,
					isPinned: shoutboxMessages.isPinned,
					tipAmount: shoutboxMessages.tipAmount,
					username: users.username,
					userLevel: users.level,
					userRoles: users.roles,
					roomName: chatRooms.name
				})
				.from(shoutboxMessages)
				.leftJoin(users, eq(shoutboxMessages.userId, users.id))
				.leftJoin(chatRooms, eq(shoutboxMessages.roomId, chatRooms.id))
				.where(whereClause)
				.orderBy(sortOrder === 'desc' ? desc(shoutboxMessages.id) : asc(shoutboxMessages.id))
				.limit(limit + 1);

			// Check if there are more results
			const hasMore = messages.length > limit;
			const resultMessages = hasMore ? messages.slice(0, limit) : messages;

			// Format messages
			const formattedMessages: MessageWithUser[] = resultMessages.map((msg) => ({
				id: msg.id,
				userId: msg.userId,
				roomId: msg.roomId,
				content: msg.content,
				createdAt: msg.createdAt,
				editedAt: msg.editedAt,
				isDeleted: msg.isDeleted,
				isPinned: msg.isPinned,
				tipAmount: msg.tipAmount,
				user: msg.userId
					? {
							username: msg.username || 'Unknown',
							level: msg.userLevel || 1,
							roles: msg.userRoles
						}
					: undefined,
				room: {
					name: msg.roomName || 'Unknown Room'
				}
			}));

			// Determine cursors
			const nextCursor =
				hasMore && resultMessages.length > 0
					? resultMessages[resultMessages.length - 1].id
					: undefined;

			const previousCursor = cursor && resultMessages.length > 0 ? resultMessages[0].id : undefined;

			return {
				messages: formattedMessages,
				hasMore,
				nextCursor,
				previousCursor
			};
		} catch (error) {
			logger.error('MessageHistoryService', 'Error fetching message history', { error, options });
			throw error;
		}
	}

	/**
	 * Clean up old messages based on retention policy
	 */
	static async cleanupOldMessages(): Promise<{
		deletedCount: number;
		archivedCount: number;
	}> {
		try {
			// Get retention settings for each room
			const configs = await db.query.shoutboxConfig.findMany({
				where: eq(shoutboxConfig.enabled, true)
			});

			let totalDeleted = 0;
			let totalArchived = 0;

			for (const config of configs) {
				const retentionDays = config.messageRetentionDays || 365;
				const cutoffDate = new Date();
				cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

				// Archive messages before deletion (optional - could write to separate archive table)
				const messagesToDelete = await db
					.select({
						id: shoutboxMessages.id,
						content: shoutboxMessages.content,
						userId: shoutboxMessages.userId,
						roomId: shoutboxMessages.roomId,
						createdAt: shoutboxMessages.createdAt
					})
					.from(shoutboxMessages)
					.where(
						and(
							config.roomId ? eq(shoutboxMessages.roomId, parseInt(config.roomId)) : undefined,
							lt(shoutboxMessages.createdAt, cutoffDate),
							eq(shoutboxMessages.isDeleted, false)
						)
					)
					.limit(this.BATCH_SIZE);

				if (messagesToDelete.length > 0) {
					// Archive messages (implement actual archiving logic here)
					totalArchived += messagesToDelete.length;

					// Soft delete old messages
					await db
						.update(shoutboxMessages)
						.set({
							isDeleted: true,
							editedAt: new Date()
						})
						.where(
							and(
								inArray(
									shoutboxMessages.id,
									messagesToDelete.map((m) => m.id)
								)
							)
						);

					totalDeleted += messagesToDelete.length;

					logger.info('MessageHistoryService', 'Cleaned up old messages', {
						roomId: config.roomId,
						retentionDays,
						deletedCount: messagesToDelete.length
					});
				}
			}

			return {
				deletedCount: totalDeleted,
				archivedCount: totalArchived
			};
		} catch (error) {
			logger.error('MessageHistoryService', 'Error cleaning up old messages', { error });
			throw error;
		}
	}

	/**
	 * Export message history in various formats
	 */
	static async exportMessageHistory(options: ExportOptions): Promise<{
		filename: string;
		size: number;
		format: string;
	}> {
		try {
			const {
				format,
				roomId,
				dateFrom,
				dateTo,
				includeDeleted = false,
				includeUserData = true,
				compress = false
			} = options;

			// Build query conditions
			const conditions = [];

			if (roomId) {
				conditions.push(eq(shoutboxMessages.roomId, roomId));
			}

			if (!includeDeleted) {
				conditions.push(eq(shoutboxMessages.isDeleted, false));
			}

			if (dateFrom) {
				conditions.push(gte(shoutboxMessages.createdAt, dateFrom));
			}

			if (dateTo) {
				conditions.push(lte(shoutboxMessages.createdAt, dateTo));
			}

			const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

			// Generate filename
			const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
			const baseFilename = `shoutbox-export-${timestamp}`;
			const extension = compress ? 'zip' : format;
			const filename = `${baseFilename}.${extension}`;

			switch (format) {
				case 'json':
					return await this.exportAsJSON(whereClause, filename, includeUserData, compress);

				case 'csv':
					return await this.exportAsCSV(whereClause, filename, includeUserData, compress);

				case 'txt':
					return await this.exportAsText(whereClause, filename, includeUserData, compress);

				case 'html':
					return await this.exportAsHTML(whereClause, filename, includeUserData, compress);

				default:
					throw new Error(`Unsupported export format: ${format}`);
			}
		} catch (error) {
			logger.error('MessageHistoryService', 'Error exporting message history', { error, options });
			throw error;
		}
	}

	/**
	 * Export as JSON format
	 */
	private static async exportAsJSON(
		whereClause: any,
		filename: string,
		includeUserData: boolean,
		compress: boolean
	): Promise<{ filename: string; size: number; format: string }> {
		const outputPath = `/tmp/${filename}`;
		const writeStream = createWriteStream(outputPath);

		// Start JSON array
		writeStream.write('[\n');

		let offset = 0;
		let isFirst = true;
		let totalSize = 2; // For [ and ]

		while (offset < this.MAX_EXPORT_SIZE) {
			const batch = await db
				.select({
					id: shoutboxMessages.id,
					userId: shoutboxMessages.userId,
					roomId: shoutboxMessages.roomId,
					content: shoutboxMessages.content,
					createdAt: shoutboxMessages.createdAt,
					editedAt: shoutboxMessages.editedAt,
					isDeleted: shoutboxMessages.isDeleted,
					isPinned: shoutboxMessages.isPinned,
					tipAmount: shoutboxMessages.tipAmount,
					username: includeUserData ? users.username : sql<null>`NULL`,
					userLevel: includeUserData ? users.level : sql<null>`NULL`,
					roomName: chatRooms.name
				})
				.from(shoutboxMessages)
				.leftJoin(users, eq(shoutboxMessages.userId, users.id))
				.leftJoin(chatRooms, eq(shoutboxMessages.roomId, chatRooms.id))
				.where(whereClause)
				.orderBy(asc(shoutboxMessages.createdAt))
				.limit(this.BATCH_SIZE)
				.offset(offset);

			if (batch.length === 0) break;

			for (const message of batch) {
				const messageObj = {
					id: message.id,
					userId: message.userId,
					roomId: message.roomId,
					roomName: message.roomName,
					content: message.content,
					createdAt: message.createdAt,
					editedAt: message.editedAt,
					isDeleted: message.isDeleted,
					isPinned: message.isPinned,
					tipAmount: message.tipAmount
				};

				if (includeUserData && message.userId) {
					(messageObj as any).user = {
						username: message.username,
						level: message.userLevel
					};
				}

				const json = JSON.stringify(messageObj, null, 2);
				const entry = isFirst ? json : `,\n${json}`;
				writeStream.write(entry);
				totalSize += entry.length;
				isFirst = false;
			}

			offset += batch.length;

			if (batch.length < this.BATCH_SIZE) break;
		}

		// End JSON array
		writeStream.write('\n]');
		await new Promise((resolve) => writeStream.end(resolve));

		if (compress) {
			const compressedPath = await this.compressFile(outputPath, 'json');
			return {
				filename: `${filename}.zip`,
				size: totalSize,
				format: 'json'
			};
		}

		return {
			filename,
			size: totalSize,
			format: 'json'
		};
	}

	/**
	 * Export as CSV format
	 */
	private static async exportAsCSV(
		whereClause: any,
		filename: string,
		includeUserData: boolean,
		compress: boolean
	): Promise<{ filename: string; size: number; format: string }> {
		const outputPath = `/tmp/${filename}`;
		const writeStream = createWriteStream(outputPath);

		// Write CSV header
		const headers = [
			'ID',
			'Room ID',
			'Room Name',
			'Content',
			'Created At',
			'Is Deleted',
			'Is Pinned',
			'Tip Amount'
		];

		if (includeUserData) {
			headers.push('User ID', 'Username', 'User Level');
		}

		writeStream.write(headers.join(',') + '\n');
		let totalSize = headers.join(',').length + 1;

		let offset = 0;

		while (offset < this.MAX_EXPORT_SIZE) {
			const batch = await db
				.select({
					id: shoutboxMessages.id,
					userId: shoutboxMessages.userId,
					roomId: shoutboxMessages.roomId,
					content: shoutboxMessages.content,
					createdAt: shoutboxMessages.createdAt,
					isDeleted: shoutboxMessages.isDeleted,
					isPinned: shoutboxMessages.isPinned,
					tipAmount: shoutboxMessages.tipAmount,
					username: includeUserData ? users.username : sql<null>`NULL`,
					userLevel: includeUserData ? users.level : sql<null>`NULL`,
					roomName: chatRooms.name
				})
				.from(shoutboxMessages)
				.leftJoin(users, eq(shoutboxMessages.userId, users.id))
				.leftJoin(chatRooms, eq(shoutboxMessages.roomId, chatRooms.id))
				.where(whereClause)
				.orderBy(asc(shoutboxMessages.createdAt))
				.limit(this.BATCH_SIZE)
				.offset(offset);

			if (batch.length === 0) break;

			for (const message of batch) {
				const row = [
					message.id,
					message.roomId,
					message.roomName || '',
					`"${(message.content || '').replace(/"/g, '""')}"`,
					message.createdAt.toISOString(),
					message.isDeleted,
					message.isPinned,
					message.tipAmount || ''
				];

				if (includeUserData) {
					row.push(
						message.userId?.toString() || '',
						message.username || '',
						message.userLevel?.toString() || ''
					);
				}

				const line = row.join(',') + '\n';
				writeStream.write(line);
				totalSize += line.length;
			}

			offset += batch.length;

			if (batch.length < this.BATCH_SIZE) break;
		}

		await new Promise((resolve) => writeStream.end(resolve));

		if (compress) {
			const compressedPath = await this.compressFile(outputPath, 'csv');
			return {
				filename: `${filename}.zip`,
				size: totalSize,
				format: 'csv'
			};
		}

		return {
			filename,
			size: totalSize,
			format: 'csv'
		};
	}

	/**
	 * Export as plain text format
	 */
	private static async exportAsText(
		whereClause: any,
		filename: string,
		includeUserData: boolean,
		compress: boolean
	): Promise<{ filename: string; size: number; format: string }> {
		const outputPath = `/tmp/${filename}`;
		const writeStream = createWriteStream(outputPath);

		// Write header
		const header =
			'DEGENTALK SHOUTBOX EXPORT\n' +
			'========================\n' +
			`Generated: ${new Date().toISOString()}\n\n`;
		writeStream.write(header);
		let totalSize = header.length;

		let offset = 0;
		let currentRoom = '';

		while (offset < this.MAX_EXPORT_SIZE) {
			const batch = await db
				.select({
					id: shoutboxMessages.id,
					userId: shoutboxMessages.userId,
					roomId: shoutboxMessages.roomId,
					content: shoutboxMessages.content,
					createdAt: shoutboxMessages.createdAt,
					username: includeUserData ? users.username : sql<null>`NULL`,
					roomName: chatRooms.name
				})
				.from(shoutboxMessages)
				.leftJoin(users, eq(shoutboxMessages.userId, users.id))
				.leftJoin(chatRooms, eq(shoutboxMessages.roomId, chatRooms.id))
				.where(whereClause)
				.orderBy(asc(shoutboxMessages.roomId), asc(shoutboxMessages.createdAt))
				.limit(this.BATCH_SIZE)
				.offset(offset);

			if (batch.length === 0) break;

			for (const message of batch) {
				// Add room header if room changed
				if (message.roomName && message.roomName !== currentRoom) {
					currentRoom = message.roomName;
					const roomHeader = `\n--- ${currentRoom} ---\n\n`;
					writeStream.write(roomHeader);
					totalSize += roomHeader.length;
				}

				const timestamp = format(message.createdAt, 'yyyy-MM-dd HH:mm:ss');
				const username = message.username || 'Unknown';
				const line = `[${timestamp}] ${username}: ${message.content}\n`;

				writeStream.write(line);
				totalSize += line.length;
			}

			offset += batch.length;

			if (batch.length < this.BATCH_SIZE) break;
		}

		await new Promise((resolve) => writeStream.end(resolve));

		if (compress) {
			const compressedPath = await this.compressFile(outputPath, 'txt');
			return {
				filename: `${filename}.zip`,
				size: totalSize,
				format: 'txt'
			};
		}

		return {
			filename,
			size: totalSize,
			format: 'txt'
		};
	}

	/**
	 * Export as HTML format
	 */
	private static async exportAsHTML(
		whereClause: any,
		filename: string,
		includeUserData: boolean,
		compress: boolean
	): Promise<{ filename: string; size: number; format: string }> {
		const outputPath = `/tmp/${filename}`;
		const writeStream = createWriteStream(outputPath);

		// Write HTML header
		const htmlHeader = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Degentalk Shoutbox Export - ${new Date().toISOString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .room { margin-bottom: 40px; }
    .room-header { background: #f0f0f0; padding: 10px; font-weight: bold; }
    .message { margin: 10px 0; padding: 10px; border-left: 3px solid #ddd; }
    .message.pinned { background: #fffacd; border-left-color: #ffd700; }
    .message.deleted { opacity: 0.5; }
    .meta { color: #666; font-size: 0.9em; }
    .content { margin-top: 5px; }
  </style>
</head>
<body>
<h1>Degentalk Shoutbox Export</h1>
<p>Generated: ${new Date().toISOString()}</p>
`;

		writeStream.write(htmlHeader);
		let totalSize = htmlHeader.length;

		let offset = 0;
		let currentRoom = '';
		let roomOpen = false;

		while (offset < this.MAX_EXPORT_SIZE) {
			const batch = await db
				.select({
					id: shoutboxMessages.id,
					userId: shoutboxMessages.userId,
					roomId: shoutboxMessages.roomId,
					content: shoutboxMessages.content,
					createdAt: shoutboxMessages.createdAt,
					isDeleted: shoutboxMessages.isDeleted,
					isPinned: shoutboxMessages.isPinned,
					username: includeUserData ? users.username : sql<null>`NULL`,
					userLevel: includeUserData ? users.level : sql<null>`NULL`,
					roomName: chatRooms.name
				})
				.from(shoutboxMessages)
				.leftJoin(users, eq(shoutboxMessages.userId, users.id))
				.leftJoin(chatRooms, eq(shoutboxMessages.roomId, chatRooms.id))
				.where(whereClause)
				.orderBy(asc(shoutboxMessages.roomId), asc(shoutboxMessages.createdAt))
				.limit(this.BATCH_SIZE)
				.offset(offset);

			if (batch.length === 0) break;

			for (const message of batch) {
				// Add room section if room changed
				if (message.roomName && message.roomName !== currentRoom) {
					if (roomOpen) {
						writeStream.write('</div>\n');
						totalSize += 7;
					}

					currentRoom = message.roomName;
					const roomSection = `<div class="room">
<div class="room-header">${currentRoom}</div>\n`;
					writeStream.write(roomSection);
					totalSize += roomSection.length;
					roomOpen = true;
				}

				const timestamp = format(message.createdAt, 'yyyy-MM-dd HH:mm:ss');
				const username = message.username || 'Unknown';
				const level = message.userLevel || 1;

				let messageClass = 'message';
				if (message.isPinned) messageClass += ' pinned';
				if (message.isDeleted) messageClass += ' deleted';

				const messageHtml = `<div class="${messageClass}">
  <div class="meta">
    <strong>${this.escapeHtml(username)}</strong> (Level ${level})
    - ${timestamp}
    ${message.isPinned ? '<span style="color: gold;">📌 Pinned</span>' : ''}
  </div>
  <div class="content">${this.escapeHtml(message.content)}</div>
</div>\n`;

				writeStream.write(messageHtml);
				totalSize += messageHtml.length;
			}

			offset += batch.length;

			if (batch.length < this.BATCH_SIZE) break;
		}

		// Close open room div
		if (roomOpen) {
			writeStream.write('</div>\n');
			totalSize += 7;
		}

		// Write HTML footer
		const htmlFooter = '</body>\n</html>';
		writeStream.write(htmlFooter);
		totalSize += htmlFooter.length;

		await new Promise((resolve) => writeStream.end(resolve));

		if (compress) {
			const compressedPath = await this.compressFile(outputPath, 'html');
			return {
				filename: `${filename}.zip`,
				size: totalSize,
				format: 'html'
			};
		}

		return {
			filename,
			size: totalSize,
			format: 'html'
		};
	}

	/**
	 * Compress file using archiver
	 */
	private static async compressFile(filePath: string, format: string): Promise<string> {
		const archive = archiver('zip', { zlib: { level: 9 } });
		const outputPath = `${filePath}.zip`;
		const output = createWriteStream(outputPath);

		archive.pipe(output);
		archive.file(filePath, { name: `shoutbox-export.${format}` });

		await archive.finalize();

		return outputPath;
	}

	/**
	 * Escape HTML special characters
	 */
	private static escapeHtml(text: string): string {
		const map: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};

		return text.replace(/[&<>"']/g, (m) => map[m]);
	}

	/**
	 * Get message statistics for analytics
	 */
	static async getMessageStatistics(options: {
		roomId?: number;
		dateFrom?: Date;
		dateTo?: Date;
		groupBy?: 'hour' | 'day' | 'week' | 'month';
	}): Promise<any> {
		try {
			const { roomId, dateFrom, dateTo, groupBy = 'day' } = options;

			const conditions = [];

			if (roomId) {
				conditions.push(eq(shoutboxMessages.roomId, roomId));
			}

			if (dateFrom) {
				conditions.push(gte(shoutboxMessages.createdAt, dateFrom));
			}

			if (dateTo) {
				conditions.push(lte(shoutboxMessages.createdAt, dateTo));
			}

			conditions.push(eq(shoutboxMessages.isDeleted, false));

			const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

			// Group by time period
			let dateFormat: any;
			switch (groupBy) {
				case 'hour':
					dateFormat = sql`to_char(${shoutboxMessages.createdAt}, 'YYYY-MM-DD HH24:00')`;
					break;
				case 'week':
					dateFormat = sql`to_char(date_trunc('week', ${shoutboxMessages.createdAt}), 'YYYY-MM-DD')`;
					break;
				case 'month':
					dateFormat = sql`to_char(${shoutboxMessages.createdAt}, 'YYYY-MM')`;
					break;
				default:
					dateFormat = sql`to_char(${shoutboxMessages.createdAt}, 'YYYY-MM-DD')`;
			}

			const stats = await db
				.select({
					period: dateFormat,
					messageCount: sql<number>`COUNT(*)`,
					uniqueUsers: sql<number>`COUNT(DISTINCT ${shoutboxMessages.userId})`,
					avgMessagesPerUser: sql<number>`COUNT(*)::float / NULLIF(COUNT(DISTINCT ${shoutboxMessages.userId}), 0)`
				})
				.from(shoutboxMessages)
				.where(whereClause)
				.groupBy(dateFormat)
				.orderBy(asc(dateFormat));

			return stats;
		} catch (error) {
			logger.error('MessageHistoryService', 'Error getting message statistics', { error, options });
			throw error;
		}
	}
}
