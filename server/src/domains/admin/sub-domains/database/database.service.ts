/**
 * Database Service
 *
 * Core service for database introspection, table browsing, and safe editing operations.
 * Implements security checks and validation to prevent dangerous operations.
 */

import { db } from '@degentalk/db';
import { logger } from '@core/logger';
import { sql, eq, like, asc, desc, count } from 'drizzle-orm';
import * as schema from '@schema';

// Configuration tables - should be edited through dedicated config panels, NOT live editor
const CONFIGURATION_TABLES = [
	// Core site configuration
	'site_settings',
	'feature_flags',
	'brand_configurations',
	'ui_quotes',
	'ui_collections',
	'ui_collection_quotes',
	'ui_analytics',
	'themes',
	'templates',
	'seo_metadata',

	// Economy configuration
	'xp_action_settings',
	'xp_reputation_settings',
	'treasury_settings',
	'airdrop_settings',
	'economy_settings',
	'economy_config_overrides',
	'dgt_packages',

	// Forum configuration
	'forum_categories', // Use sync:forums instead
	'forum_structure', // Use forumMap.config.ts instead
	'rules',
	'custom_emojis',
	'emoji_packs',
	'emoji_pack_items',
	'thread_feature_permissions',

	// Shop configuration
	'product_categories',
	'rarities',
	'cosmetic_categories',
	'animation_packs',
	'animation_pack_items',
	'signature_items',

	// User configuration
	'roles',
	'permissions',
	'role_permissions',
	'titles',
	'badges',
	'avatar_frames',

	// System configuration
	'scheduled_tasks',
	'announcements',
	'media_library'
];

// System/Security tables - completely blocked from access
const SYSTEM_BLACKLISTED_TABLES = [
	'pg_stat_activity',
	'pg_locks',
	'information_schema',
	'pg_catalog',
	'sessions', // Session data should not be directly edited
	'password_reset_tokens', // Security sensitive
	'verification_tokens', // Security sensitive
	'audit_logs', // Audit trail integrity
	'api_keys', // Security sensitive
	'webhooks', // Security sensitive
	'payment_config' // Security sensitive
];

// Read-only tables - can be viewed but not edited (monitoring/analytics)
const READ_ONLY_TABLES = [
	'audit_logs',
	'sessions',
	'password_reset_tokens',
	'verification_tokens',
	'analytics_events',
	'rate_limits',
	'ui_analytics',
	'event_logs',
	'cooldown_state',
	'platform_stats',
	'leaderboards'
];

// Editable tables - safe for live database editing (moderation, user data, content)
const EDITABLE_TABLES = [
	// User management
	'users',
	'user_groups',
	'user_roles',
	'user_titles',
	'user_badges',
	'user_inventory',
	'user_signature_items',
	'bans',
	'user_abuse_flags',

	// Forum content
	'threads',
	'posts',
	'post_likes',
	'post_reactions',
	'post_tips',
	'thread_bookmarks',
	'thread_tags',
	'tags',
	'polls',
	'poll_options',
	'poll_votes',
	'post_drafts',

	// Economy transactions
	'transactions',
	'wallets',
	'withdrawal_requests',
	'airdrop_records',
	'rain_events',
	'xp_logs',
	'xp_adjustment_logs',
	'user_reputation_log',
	'reputation_achievements',

	// Shop operations
	'orders',
	'order_items',
	'inventory_transactions',
	'dgt_purchase_orders',

	// Messaging
	'messages',
	'direct_messages',
	'conversations',
	'conversation_participants',
	'message_reads',
	'shoutbox_messages',
	'online_users',

	// System operations
	'notifications',
	'reports',
	'moderation_actions',
	'user_referrals',
	'referral_sources',
	'activity_feed',
	'mentions_index',

	// Gamification
	'missions',
	'user_mission_progress',
	'achievements',
	'vaults',

	// Dictionary
	'dictionary_entries',
	'dictionary_upvotes',

	// Collectibles
	'stickers',
	'user_sticker_inventory'
];

export interface TableInfo {
	name: string;
	schema: string;
	rowCount: number;
	lastModified: string | null;
	comment: string | null;
	isEditable: boolean;
	hasData: boolean;
	accessInfo: {
		canView: boolean;
		canEdit: boolean;
		isConfig: boolean;
		configRoute?: string;
		reason?: string;
	};
}

export interface ColumnInfo {
	name: string;
	type: string;
	nullable: boolean;
	defaultValue: string | null;
	isPrimaryKey: boolean;
	isForeignKey: boolean;
	foreignKeyTable: string | null;
	foreignKeyColumn: string | null;
	comment: string | null;
}

export interface TableSchema {
	tableName: string;
	columns: ColumnInfo[];
	primaryKey: string[];
	foreignKeys: ForeignKeyInfo[];
	indexes: IndexInfo[];
	constraints: ConstraintInfo[];
}

export interface ForeignKeyInfo {
	columnName: string;
	referencedTable: string;
	referencedColumn: string;
	constraintName: string;
}

export interface IndexInfo {
	name: string;
	columns: string[];
	isUnique: boolean;
	isPrimary: boolean;
}

export interface ConstraintInfo {
	name: string;
	type: string;
	columns: string[];
	definition: string;
}

export interface TableDataResult {
	rows: any[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

export class DatabaseService {
	/**
	 * Get list of all user tables with metadata
	 */
	async getTables(): Promise<TableInfo[]> {
		try {
			const query = sql`
				SELECT 
					t.table_name as name,
					t.table_schema as schema,
					COALESCE(s.n_tup_ins + s.n_tup_upd + s.n_tup_del, 0) as row_count,
					obj_description(c.oid) as comment,
					GREATEST(
						pg_stat_get_last_autoanalyze_time(c.oid),
						pg_stat_get_last_autovacuum_time(c.oid)
					) as last_modified
				FROM information_schema.tables t
				LEFT JOIN pg_class c ON c.relname = t.table_name AND c.relkind = 'r'
				LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
				WHERE t.table_schema = 'public' 
					AND t.table_type = 'BASE TABLE'
					AND t.table_name NOT IN (${sql.join(
						SYSTEM_BLACKLISTED_TABLES.map((table) => sql`${table}`),
						sql`, `
					)})
				ORDER BY t.table_name
			`;

			const result = await db.execute(query);

			const tables: TableInfo[] = [];
			for (const row of result.rows) {
				const tableName = row.name as string;
				const rowCount = await this.getTableRowCount(tableName);
				const accessInfo = await this.getTableAccessInfo(tableName);

				tables.push({
					name: tableName,
					schema: row.schema as string,
					rowCount,
					lastModified: row.last_modified as string | null,
					comment: row.comment as string | null,
					isEditable: accessInfo.canEdit,
					hasData: rowCount > 0,
					accessInfo: {
						canView: accessInfo.canView,
						canEdit: accessInfo.canEdit,
						isConfig: accessInfo.isConfig,
						configRoute: accessInfo.configRoute,
						reason: accessInfo.reason
					}
				});
			}

			return tables;
		} catch (error: any) {
			logger.error('DatabaseService', 'Error getting tables', { error: error.message });
			throw new Error('Failed to retrieve database tables');
		}
	}

	/**
	 * Get detailed schema information for a table
	 */
	async getTableSchema(tableName: string): Promise<TableSchema> {
		try {
			// Validate table name
			if (!this.isValidTableName(tableName)) {
				throw new Error('Invalid table name');
			}

			// Get column information
			const columnsQuery = sql`
				SELECT 
					c.column_name as name,
					c.data_type as type,
					c.is_nullable as nullable,
					c.column_default as default_value,
					c.character_maximum_length as max_length,
					c.numeric_precision,
					c.numeric_scale,
					col_description(pgc.oid, c.ordinal_position) as comment,
					CASE 
						WHEN pk.column_name IS NOT NULL THEN true 
						ELSE false 
					END as is_primary_key,
					CASE 
						WHEN fk.column_name IS NOT NULL THEN true 
						ELSE false 
					END as is_foreign_key,
					fk.foreign_table_name,
					fk.foreign_column_name
				FROM information_schema.columns c
				LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
				LEFT JOIN (
					SELECT ku.column_name
					FROM information_schema.table_constraints tc
					JOIN information_schema.key_column_usage ku 
						ON tc.constraint_name = ku.constraint_name
					WHERE tc.table_name = ${tableName}
						AND tc.constraint_type = 'PRIMARY KEY'
				) pk ON pk.column_name = c.column_name
				LEFT JOIN (
					SELECT 
						ku.column_name,
						ccu.table_name as foreign_table_name,
						ccu.column_name as foreign_column_name
					FROM information_schema.table_constraints tc
					JOIN information_schema.key_column_usage ku 
						ON tc.constraint_name = ku.constraint_name
					JOIN information_schema.constraint_column_usage ccu 
						ON tc.constraint_name = ccu.constraint_name
					WHERE tc.table_name = ${tableName}
						AND tc.constraint_type = 'FOREIGN KEY'
				) fk ON fk.column_name = c.column_name
				WHERE c.table_name = ${tableName}
				ORDER BY c.ordinal_position
			`;

			const columnsResult = await db.execute(columnsQuery);

			const columns: ColumnInfo[] = columnsResult.rows.map((row: any) => ({
				name: row.name,
				type: row.type,
				nullable: row.nullable === 'YES',
				defaultValue: row.default_value,
				isPrimaryKey: row.is_primary_key,
				isForeignKey: row.is_foreign_key,
				foreignKeyTable: row.foreign_table_name,
				foreignKeyColumn: row.foreign_column_name,
				comment: row.comment
			}));

			// Get foreign keys
			const foreignKeys = await this.getTableForeignKeys(tableName);

			// Get indexes
			const indexes = await this.getTableIndexes(tableName);

			// Get constraints
			const constraints = await this.getTableConstraints(tableName);

			return {
				tableName,
				columns,
				primaryKey: columns.filter((c) => c.isPrimaryKey).map((c) => c.name),
				foreignKeys,
				indexes,
				constraints
			};
		} catch (error: any) {
			logger.error('DatabaseService', 'Error getting table schema', {
				error: error.message,
				tableName
			});
			throw new Error(`Failed to retrieve schema for table: ${tableName}`);
		}
	}

	/**
	 * Get table data with pagination, filtering, and sorting
	 */
	async getTableData(
		tableName: string,
		options: {
			page: number;
			limit: number;
			search?: string;
			sortField?: string;
			sortOrder: 'asc' | 'desc';
		}
	): Promise<TableDataResult> {
		try {
			// Validate table name
			if (!this.isValidTableName(tableName)) {
				throw new Error('Invalid table name');
			}

			const { page, limit, search, sortField, sortOrder } = options;
			const offset = (page - 1) * limit;

			// Build base query
			let query = `SELECT * FROM "${tableName}"`;
			const params: any[] = [];
			let paramIndex = 1;

			// Add search filter if provided
			if (search) {
				const schema = await this.getTableSchema(tableName);
				const searchableColumns = schema.columns
					.filter((col) =>
						['text', 'varchar', 'character varying'].includes(col.type.toLowerCase())
					)
					.map((col) => `"${col.name}"::text ILIKE $${paramIndex++}`)
					.join(' OR ');

				if (searchableColumns) {
					query += ` WHERE ${searchableColumns}`;
					params.push(`%${search}%`);
				}
			}

			// Add sorting
			if (sortField) {
				query += ` ORDER BY "${sortField}" ${sortOrder.toUpperCase()}`;
			}

			// Add pagination
			query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
			params.push(limit, offset);

			// Execute data query
			const dataResult = await db.execute(sql.raw(query, params));

			// Get total count
			let countQuery = `SELECT COUNT(*) as total FROM "${tableName}"`;
			const countParams: any[] = [];

			if (search) {
				const schema = await this.getTableSchema(tableName);
				const searchableColumns = schema.columns
					.filter((col) =>
						['text', 'varchar', 'character varying'].includes(col.type.toLowerCase())
					)
					.map((col) => `"${col.name}"::text ILIKE $1`)
					.join(' OR ');

				if (searchableColumns) {
					countQuery += ` WHERE ${searchableColumns}`;
					countParams.push(`%${search}%`);
				}
			}

			const countResult = await db.execute(sql.raw(countQuery, countParams));
			const total = parseInt(countResult.rows[0].total as string);

			return {
				rows: dataResult.rows,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			};
		} catch (error: any) {
			logger.error('DatabaseService', 'Error getting table data', {
				error: error.message,
				tableName
			});
			throw new Error(`Failed to retrieve data from table: ${tableName}`);
		}
	}

	/**
	 * Update a single row in a table
	 */
	async updateRow(
		tableName: string,
		rowId: string | number,
		data: Record<string, any>
	): Promise<any> {
		try {
			// Validate table and permissions
			if (!this.isTableEditable(tableName)) {
				throw new Error('Table is not editable');
			}

			const schema = await this.getTableSchema(tableName);
			const primaryKeyColumn = schema.primaryKey[0];

			if (!primaryKeyColumn) {
				throw new Error('Table must have a primary key for updates');
			}

			// Build update query
			const setClause = Object.keys(data)
				.map((key, index) => `"${key}" = $${index + 2}`)
				.join(', ');

			const query = `UPDATE "${tableName}" SET ${setClause} WHERE "${primaryKeyColumn}" = $1 RETURNING *`;
			const params = [rowId, ...Object.values(data)];

			const result = await db.execute(sql.raw(query, params));

			if (result.rows.length === 0) {
				throw new Error('Row not found');
			}

			return result.rows[0];
		} catch (error: any) {
			logger.error('DatabaseService', 'Error updating row', {
				error: error.message,
				tableName,
				rowId
			});
			throw new Error(`Failed to update row in table: ${tableName}`);
		}
	}

	/**
	 * Create a new row in a table
	 */
	async createRow(tableName: string, data: Record<string, any>): Promise<any> {
		try {
			// Validate table and permissions
			if (!this.isTableEditable(tableName)) {
				throw new Error('Table is not editable');
			}

			// Build insert query
			const columns = Object.keys(data)
				.map((key) => `"${key}"`)
				.join(', ');
			const values = Object.keys(data)
				.map((_, index) => `$${index + 1}`)
				.join(', ');

			const query = `INSERT INTO "${tableName}" (${columns}) VALUES (${values}) RETURNING *`;
			const params = Object.values(data);

			const result = await db.execute(sql.raw(query, params));
			return result.rows[0];
		} catch (error: any) {
			logger.error('DatabaseService', 'Error creating row', {
				error: error.message,
				tableName
			});
			throw new Error(`Failed to create row in table: ${tableName}`);
		}
	}

	/**
	 * Delete a row from a table
	 */
	async deleteRow(tableName: string, rowId: string | number): Promise<boolean> {
		try {
			// Validate table and permissions
			if (!this.isTableEditable(tableName)) {
				throw new Error('Table is not editable');
			}

			const schema = await this.getTableSchema(tableName);
			const primaryKeyColumn = schema.primaryKey[0];

			if (!primaryKeyColumn) {
				throw new Error('Table must have a primary key for deletions');
			}

			const query = `DELETE FROM "${tableName}" WHERE "${primaryKeyColumn}" = $1`;
			const result = await db.execute(sql.raw(query, [rowId]));

			return result.rowCount > 0;
		} catch (error: any) {
			logger.error('DatabaseService', 'Error deleting row', {
				error: error.message,
				tableName,
				rowId
			});
			throw new Error(`Failed to delete row from table: ${tableName}`);
		}
	}

	/**
	 * Get a single row by ID
	 */
	async getRowById(tableName: string, rowId: string | number): Promise<any | null> {
		try {
			if (!this.isValidTableName(tableName)) {
				throw new Error('Invalid table name');
			}

			const schema = await this.getTableSchema(tableName);
			const primaryKeyColumn = schema.primaryKey[0];

			if (!primaryKeyColumn) {
				throw new Error('Table must have a primary key');
			}

			const query = `SELECT * FROM "${tableName}" WHERE "${primaryKeyColumn}" = $1`;
			const result = await db.execute(sql.raw(query, [rowId]));

			return result.rows[0] || null;
		} catch (error: any) {
			logger.error('DatabaseService', 'Error getting row by ID', {
				error: error.message,
				tableName,
				rowId
			});
			return null;
		}
	}

	/**
	 * Perform bulk operations on multiple rows
	 */
	async bulkOperation(
		tableName: string,
		operation: 'update' | 'delete',
		rowIds: (string | number)[],
		data?: Record<string, any>
	): Promise<{ affected: number }> {
		try {
			// Validate table and permissions
			if (!this.isTableEditable(tableName)) {
				throw new Error('Table is not editable');
			}

			const schema = await this.getTableSchema(tableName);
			const primaryKeyColumn = schema.primaryKey[0];

			if (!primaryKeyColumn) {
				throw new Error('Table must have a primary key for bulk operations');
			}

			let query: string;
			let params: any[];

			if (operation === 'delete') {
				const placeholders = rowIds.map((_, index) => `$${index + 1}`).join(', ');
				query = `DELETE FROM "${tableName}" WHERE "${primaryKeyColumn}" IN (${placeholders})`;
				params = rowIds;
			} else if (operation === 'update' && data) {
				const setClause = Object.keys(data)
					.map((key, index) => `"${key}" = $${index + 1}`)
					.join(', ');
				const placeholders = rowIds
					.map((_, index) => `$${Object.keys(data).length + index + 1}`)
					.join(', ');
				query = `UPDATE "${tableName}" SET ${setClause} WHERE "${primaryKeyColumn}" IN (${placeholders})`;
				params = [...Object.values(data), ...rowIds];
			} else {
				throw new Error('Invalid bulk operation');
			}

			const result = await db.execute(sql.raw(query, params));
			return { affected: result.rowCount };
		} catch (error: any) {
			logger.error('DatabaseService', 'Error performing bulk operation', {
				error: error.message,
				tableName,
				operation
			});
			throw new Error(`Failed to perform bulk ${operation} on table: ${tableName}`);
		}
	}

	/**
	 * Export table data as CSV
	 */
	async exportTableAsCSV(tableName: string): Promise<string> {
		try {
			if (!this.isValidTableName(tableName)) {
				throw new Error('Invalid table name');
			}

			const query = `SELECT * FROM "${tableName}"`;
			const result = await db.execute(sql.raw(query));

			if (result.rows.length === 0) {
				return '';
			}

			// Generate CSV headers
			const headers = Object.keys(result.rows[0]).join(',');

			// Generate CSV rows
			const rows = result.rows.map((row) =>
				Object.values(row)
					.map((value) => {
						// Escape CSV values
						if (value === null || value === undefined) return '';
						const stringValue = String(value);
						if (
							stringValue.includes(',') ||
							stringValue.includes('"') ||
							stringValue.includes('\n')
						) {
							return `"${stringValue.replace(/"/g, '""')}"`;
						}
						return stringValue;
					})
					.join(',')
			);

			return [headers, ...rows].join('\n');
		} catch (error: any) {
			logger.error('DatabaseService', 'Error exporting table as CSV', {
				error: error.message,
				tableName
			});
			throw new Error(`Failed to export table: ${tableName}`);
		}
	}

	/**
	 * Get table relationships (foreign keys)
	 */
	async getTableRelationships(tableName: string): Promise<ForeignKeyInfo[]> {
		try {
			return await this.getTableForeignKeys(tableName);
		} catch (error: any) {
			logger.error('DatabaseService', 'Error getting table relationships', {
				error: error.message,
				tableName
			});
			throw new Error(`Failed to get relationships for table: ${tableName}`);
		}
	}

	/**
	 * Get database statistics
	 */
	async getDatabaseStats(): Promise<any> {
		try {
			const statsQuery = sql`
				SELECT 
					schemaname,
					tablename,
					attname as column_name,
					n_distinct,
					most_common_vals,
					most_common_freqs,
					histogram_bounds
				FROM pg_stats 
				WHERE schemaname = 'public'
				ORDER BY tablename, attname
			`;

			const sizeQuery = sql`
				SELECT 
					pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
					pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
					pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
					tablename
				FROM pg_tables 
				WHERE schemaname = 'public'
				ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
			`;

			const [statsResult, sizeResult] = await Promise.all([
				db.execute(statsQuery),
				db.execute(sizeQuery)
			]);

			return {
				columnStats: statsResult.rows,
				tableSizes: sizeResult.rows,
				timestamp: new Date().toISOString()
			};
		} catch (error: any) {
			logger.error('DatabaseService', 'Error getting database stats', { error: error.message });
			throw new Error('Failed to retrieve database statistics');
		}
	}

	/**
	 * Validate row data against table schema
	 */
	async validateRowData(tableName: string, data: Record<string, any>): Promise<ValidationResult> {
		try {
			const schema = await this.getTableSchema(tableName);
			const errors: string[] = [];

			for (const column of schema.columns) {
				const value = data[column.name];

				// Check required fields
				if (!column.nullable && !column.defaultValue && (value === null || value === undefined)) {
					errors.push(`Column '${column.name}' is required`);
				}

				// Type validation (basic)
				if (value !== null && value !== undefined) {
					if (column.type.includes('int') && !Number.isInteger(Number(value))) {
						errors.push(`Column '${column.name}' must be an integer`);
					}
					if (column.type.includes('bool') && typeof value !== 'boolean') {
						errors.push(`Column '${column.name}' must be a boolean`);
					}
				}
			}

			return {
				valid: errors.length === 0,
				errors
			};
		} catch (error: any) {
			logger.error('DatabaseService', 'Error validating row data', {
				error: error.message,
				tableName
			});
			return {
				valid: false,
				errors: ['Validation failed due to schema error']
			};
		}
	}

	/**
	 * Check if a table is editable through the live database interface
	 */
	async isTableEditable(tableName: string): Promise<boolean> {
		return EDITABLE_TABLES.includes(tableName) && this.isValidTableName(tableName);
	}

	/**
	 * Check if a table is a configuration table that should use dedicated config panels
	 */
	async isConfigurationTable(tableName: string): Promise<boolean> {
		return CONFIGURATION_TABLES.includes(tableName);
	}

	/**
	 * Get the appropriate config panel route for a configuration table
	 */
	async getConfigPanelRoute(tableName: string): Promise<string | null> {
		const configRoutes: Record<string, string> = {
			// Core configuration
			site_settings: '/admin/settings',
			feature_flags: '/admin/settings/features',
			brand_configurations: '/admin/config/brand',
			ui_quotes: '/admin/config/ui',
			ui_collections: '/admin/config/ui',

			// Economy configuration
			xp_action_settings: '/admin/config/xp',
			xp_reputation_settings: '/admin/config/xp',
			treasury_settings: '/admin/config/economy',
			airdrop_settings: '/admin/config/economy',
			economy_settings: '/admin/config/economy',
			economy_config_overrides: '/admin/config/economy',
			dgt_packages: '/admin/shop-management/dgt-packages',

			// Forum configuration
			forum_categories: '/admin/config/zones',
			forum_structure: '/admin/config/zones',
			rules: '/admin/forum/rules',
			custom_emojis: '/admin/emojis',
			emoji_packs: '/admin/emojis',

			// Shop configuration
			product_categories: '/admin/shop-management/categories',
			rarities: '/admin/shop-management/rarities',
			animation_packs: '/admin/animation-packs',
			signature_items: '/admin/shop-management/signature-items',

			// User configuration
			roles: '/admin/roles',
			permissions: '/admin/permissions',
			titles: '/admin/titles',
			badges: '/admin/shop-management/badges',
			avatar_frames: '/admin/avatar-frames',

			// System configuration
			announcements: '/admin/announcements',
			media_library: '/admin/media'
		};

		return configRoutes[tableName] || null;
	}

	/**
	 * Get table access status and appropriate guidance
	 */
	async getTableAccessInfo(tableName: string): Promise<{
		canView: boolean;
		canEdit: boolean;
		isConfig: boolean;
		blocked: boolean;
		configRoute?: string;
		reason?: string;
	}> {
		// System blacklisted tables
		if (SYSTEM_BLACKLISTED_TABLES.includes(tableName)) {
			return {
				canView: false,
				canEdit: false,
				isConfig: false,
				blocked: true,
				reason: 'System table access is restricted for security'
			};
		}

		// Configuration tables
		if (CONFIGURATION_TABLES.includes(tableName)) {
			const configRoute = await this.getConfigPanelRoute(tableName);
			return {
				canView: true,
				canEdit: false,
				isConfig: true,
				blocked: false,
				configRoute,
				reason: 'Configuration table - use dedicated config panel'
			};
		}

		// Read-only tables
		if (READ_ONLY_TABLES.includes(tableName)) {
			return {
				canView: true,
				canEdit: false,
				isConfig: false,
				blocked: false,
				reason: 'Read-only table for data integrity'
			};
		}

		// Editable tables
		if (EDITABLE_TABLES.includes(tableName)) {
			return {
				canView: true,
				canEdit: true,
				isConfig: false,
				blocked: false
			};
		}

		// Unknown tables - default to blocked
		return {
			canView: false,
			canEdit: false,
			isConfig: false,
			blocked: true,
			reason: 'Table not in allowed list'
		};
	}

	// Private helper methods

	private isValidTableName(tableName: string): boolean {
		// Basic SQL injection prevention
		return (
			/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName) && !SYSTEM_BLACKLISTED_TABLES.includes(tableName)
		);
	}

	async getTableRowCount(tableName: string): Promise<number> {
		try {
			const query = sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`;
			const result = await db.execute(query);
			return parseInt(result.rows[0].count as string);
		} catch (error) {
			return 0;
		}
	}

	private async getTableForeignKeys(tableName: string): Promise<ForeignKeyInfo[]> {
		const query = sql`
			SELECT 
				kcu.column_name,
				ccu.table_name as referenced_table,
				ccu.column_name as referenced_column,
				tc.constraint_name
			FROM information_schema.table_constraints tc
			JOIN information_schema.key_column_usage kcu 
				ON tc.constraint_name = kcu.constraint_name
			JOIN information_schema.constraint_column_usage ccu 
				ON tc.constraint_name = ccu.constraint_name
			WHERE tc.table_name = ${tableName}
				AND tc.constraint_type = 'FOREIGN KEY'
		`;

		const result = await db.execute(query);
		return result.rows.map((row: any) => ({
			columnName: row.column_name,
			referencedTable: row.referenced_table,
			referencedColumn: row.referenced_column,
			constraintName: row.constraint_name
		}));
	}

	private async getTableIndexes(tableName: string): Promise<IndexInfo[]> {
		const query = sql`
			SELECT 
				i.relname as index_name,
				array_agg(a.attname ORDER BY c.ordinality) as columns,
				ix.indisunique as is_unique,
				ix.indisprimary as is_primary
			FROM pg_class i
			JOIN pg_index ix ON ix.indexrelid = i.oid
			JOIN pg_class t ON ix.indrelid = t.oid
			JOIN unnest(ix.indkey) WITH ORDINALITY AS c(attnum, ordinality) ON true
			JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = c.attnum
			WHERE t.relname = ${tableName}
				AND i.relkind = 'i'
			GROUP BY i.relname, ix.indisunique, ix.indisprimary
		`;

		const result = await db.execute(query);
		return result.rows.map((row: any) => ({
			name: row.index_name,
			columns: row.columns,
			isUnique: row.is_unique,
			isPrimary: row.is_primary
		}));
	}

	private async getTableConstraints(tableName: string): Promise<ConstraintInfo[]> {
		const query = sql`
			SELECT 
				tc.constraint_name as name,
				tc.constraint_type as type,
				array_agg(kcu.column_name) as columns,
				cc.check_clause as definition
			FROM information_schema.table_constraints tc
			LEFT JOIN information_schema.key_column_usage kcu 
				ON tc.constraint_name = kcu.constraint_name
			LEFT JOIN information_schema.check_constraints cc 
				ON tc.constraint_name = cc.constraint_name
			WHERE tc.table_name = ${tableName}
			GROUP BY tc.constraint_name, tc.constraint_type, cc.check_clause
		`;

		const result = await db.execute(query);
		return result.rows.map((row: any) => ({
			name: row.name,
			type: row.type,
			columns: row.columns || [],
			definition: row.definition || ''
		}));
	}
}
