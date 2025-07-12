import { db } from '@db';
import { permissions as permissionsTable } from '@schema';
import { asc } from 'drizzle-orm';

// Define comprehensive permission set for the platform
const DEFAULT_PERMISSIONS = [
	// Core System Permissions
	{ name: 'admin.full', description: 'Full administrative access', category: 'system' },
	{ name: 'admin.panel', description: 'Access admin panel', category: 'system' },
	{ name: 'system.maintenance', description: 'Put site in maintenance mode', category: 'system' },
	{ name: 'system.config', description: 'Modify system configuration', category: 'system' },

	// User Management
	{ name: 'users.view', description: 'View user profiles and data', category: 'users' },
	{ name: 'users.edit', description: 'Edit user profiles and settings', category: 'users' },
	{ name: 'users.ban', description: 'Ban and unban users', category: 'users' },
	{ name: 'users.impersonate', description: 'Login as other users', category: 'users' },
	{ name: 'users.delete', description: 'Delete user accounts', category: 'users' },

	// Role & Permission Management
	{ name: 'roles.view', description: 'View roles and permissions', category: 'roles' },
	{ name: 'roles.create', description: 'Create new roles', category: 'roles' },
	{ name: 'roles.edit', description: 'Edit existing roles', category: 'roles' },
	{ name: 'roles.delete', description: 'Delete roles', category: 'roles' },
	{ name: 'roles.assign', description: 'Assign roles to users', category: 'roles' },

	// Title Management
	{ name: 'titles.view', description: 'View titles', category: 'titles' },
	{ name: 'titles.create', description: 'Create new titles', category: 'titles' },
	{ name: 'titles.edit', description: 'Edit existing titles', category: 'titles' },
	{ name: 'titles.delete', description: 'Delete titles', category: 'titles' },
	{ name: 'titles.assign', description: 'Assign titles to users', category: 'titles' },

	// Forum Global Moderation
	{ name: 'forum.moderate.global', description: 'Moderate all forums', category: 'moderation' },
	{ name: 'forum.create', description: 'Create new forums', category: 'moderation' },
	{ name: 'forum.edit', description: 'Edit forum settings', category: 'moderation' },
	{ name: 'forum.delete', description: 'Delete forums', category: 'moderation' },

	// Thread Moderation
	{
		name: 'threads.moderate.global',
		description: 'Moderate threads in all forums',
		category: 'moderation'
	},
	{ name: 'threads.pin', description: 'Pin and unpin threads', category: 'moderation' },
	{ name: 'threads.lock', description: 'Lock and unlock threads', category: 'moderation' },
	{ name: 'threads.move', description: 'Move threads between forums', category: 'moderation' },
	{ name: 'threads.delete', description: 'Delete threads', category: 'moderation' },
	{ name: 'threads.edit.any', description: "Edit any user's threads", category: 'moderation' },
	{ name: 'threads.solve', description: 'Mark threads as solved', category: 'moderation' },

	// Post Moderation
	{
		name: 'posts.moderate.global',
		description: 'Moderate posts in all forums',
		category: 'moderation'
	},
	{ name: 'posts.edit.any', description: "Edit any user's posts", category: 'moderation' },
	{ name: 'posts.delete.any', description: "Delete any user's posts", category: 'moderation' },
	{ name: 'posts.approve', description: 'Approve pending posts', category: 'moderation' },

	// Prefix Management
	{ name: 'prefixes.create', description: 'Create thread prefixes', category: 'moderation' },
	{ name: 'prefixes.edit', description: 'Edit thread prefixes', category: 'moderation' },
	{ name: 'prefixes.delete', description: 'Delete thread prefixes', category: 'moderation' },
	{ name: 'prefixes.assign', description: 'Assign prefixes to threads', category: 'moderation' },

	// Zone-Specific Permissions (examples)
	{ name: 'zone.crypto.moderate', description: 'Moderate Crypto zone', category: 'zones' },
	{ name: 'zone.trading.moderate', description: 'Moderate Trading zone', category: 'zones' },
	{ name: 'zone.general.moderate', description: 'Moderate General zone', category: 'zones' },
	{
		name: 'zone.announcements.moderate',
		description: 'Moderate Announcements zone',
		category: 'zones'
	},

	// Shoutbox
	{ name: 'shoutbox.moderate', description: 'Moderate shoutbox messages', category: 'messaging' },
	{
		name: 'shoutbox.delete.any',
		description: 'Delete any shoutbox message',
		category: 'messaging'
	},
	{ name: 'shoutbox.ban', description: 'Ban users from shoutbox', category: 'messaging' },

	// Direct Messages
	{ name: 'messages.view.any', description: "View any user's messages", category: 'messaging' },
	{ name: 'messages.moderate', description: 'Moderate private messages', category: 'messaging' },

	// Economy & Shop
	{ name: 'economy.view', description: 'View economy settings', category: 'economy' },
	{ name: 'economy.edit', description: 'Edit economy settings', category: 'economy' },
	{ name: 'economy.grant.dgt', description: 'Grant DGT to users', category: 'economy' },
	{ name: 'economy.grant.xp', description: 'Grant XP to users', category: 'economy' },
	{ name: 'shop.manage', description: 'Manage shop items', category: 'economy' },
	{ name: 'shop.orders.view', description: 'View all shop orders', category: 'economy' },

	// Reports & Analytics
	{ name: 'reports.view', description: 'View user reports', category: 'reports' },
	{ name: 'reports.resolve', description: 'Resolve user reports', category: 'reports' },
	{ name: 'analytics.view', description: 'View platform analytics', category: 'analytics' },

	// Content Management
	{
		name: 'content.announcements',
		description: 'Create and manage announcements',
		category: 'content'
	},
	{ name: 'content.pages', description: 'Create and edit static pages', category: 'content' },
	{ name: 'content.media', description: 'Manage media uploads', category: 'content' },

	// Development & Tools
	{ name: 'dev.database', description: 'Access database tools', category: 'development' },
	{ name: 'dev.logs', description: 'View system logs', category: 'development' },
	{ name: 'dev.cache', description: 'Clear system cache', category: 'development' },
	{ name: 'dev.seeding', description: 'Run database seeding', category: 'development' }
];

export class AdminPermissionsService {
	async list() {
		// First, ensure all default permissions exist in database
		await this.ensureDefaultPermissions();

		// Return all permissions from database
		return db
			.select()
			.from(permissionsTable)
			.orderBy(asc(permissionsTable.category), asc(permissionsTable.name));
	}

	async getByCategory() {
		const permissions = await this.list();
		const grouped: Record<string, any[]> = {};

		permissions.forEach((permission) => {
			const category = permission.category || 'uncategorized';
			if (!grouped[category]) {
				grouped[category] = [];
			}
			grouped[category].push(permission);
		});

		return grouped;
	}

	private async ensureDefaultPermissions() {
		// Get existing permissions
		const existing = await db.select().from(permissionsTable);
		const existingNames = new Set(existing.map((p) => p.name));

		// Insert missing permissions
		const missing = DEFAULT_PERMISSIONS.filter((p) => !existingNames.has(p.name));

		if (missing.length > 0) {
			await db.insert(permissionsTable).values(missing);
		}
	}
}
