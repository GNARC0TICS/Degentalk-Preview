import type { Router } from 'express';

// Import domain fixtures
import { usersSettingsFixture } from './users/fixtures/usersSettings.fixture.js';
import { economySettingsFixture } from './economy/economySettings.fixture.js';
import { gamificationSettingsFixture } from './gamification/fixtures/gamificationSettings.fixture.js';
import { contentSettingsFixture } from './content/fixtures/contentSettings.fixture.js';
import { systemSettingsFixture } from './system/fixtures/systemSettings.fixture.js';

// Import routes
import gamificationRoutes from './gamification/gamification.routes';

export interface AdminDomain {
	name: string;
	description: string;
	routes?: Router;
	fixtures: any;
	permissions: {
		read: string[];
		write: string[];
		admin: string[];
	};
}

/**
 * Static registry of all admin domains
 * No runtime discovery - explicit registration only
 */
export const adminRegistry: Record<string, AdminDomain> = {
	users: {
		name: 'users',
		description: 'User management and administration',
		fixtures: usersSettingsFixture,
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin'],
			admin: ['admin']
		}
	},

	'access-control': {
		name: 'access-control',
		description: 'Roles, permissions, and access management',
		fixtures: {
			domain: 'access-control',
			settings: { permissions: { read: ['admin'], write: ['admin'], admin: ['admin'] } }
		},
		permissions: {
			read: ['admin'],
			write: ['admin'],
			admin: ['admin']
		}
	},

	economy: {
		name: 'economy',
		description: 'Economic system and treasury management',
		fixtures: economySettingsFixture,
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin'],
			admin: ['admin']
		}
	},

	gamification: {
		name: 'gamification',
		description: 'XP, reputation, and progression systems',
		routes: gamificationRoutes,
		fixtures: gamificationSettingsFixture,
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin'],
			admin: ['admin']
		}
	},

	content: {
		name: 'content',
		description: 'Content management and moderation',
		fixtures: contentSettingsFixture,
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin', 'moderator'],
			admin: ['admin']
		}
	},

	customization: {
		name: 'customization',
		description: 'UI, branding, and asset management',
		fixtures: {
			domain: 'customization',
			settings: { permissions: { read: ['admin'], write: ['admin'], admin: ['admin'] } }
		},
		permissions: {
			read: ['admin'],
			write: ['admin'],
			admin: ['admin']
		}
	},

	shop: {
		name: 'shop',
		description: 'Commerce and marketplace management',
		fixtures: {
			domain: 'shop',
			settings: { permissions: { read: ['admin'], write: ['admin'], admin: ['admin'] } }
		},
		permissions: {
			read: ['admin'],
			write: ['admin'],
			admin: ['admin']
		}
	},

	analytics: {
		name: 'analytics',
		description: 'Analytics and reporting',
		fixtures: {
			domain: 'analytics',
			settings: {
				permissions: { read: ['admin', 'moderator'], write: ['admin'], admin: ['admin'] }
			}
		},
		permissions: {
			read: ['admin', 'moderator'],
			write: ['admin'],
			admin: ['admin']
		}
	},

	system: {
		name: 'system',
		description: 'System management and configuration',
		fixtures: systemSettingsFixture,
		permissions: {
			read: ['admin'],
			write: ['admin'],
			admin: ['admin']
		}
	}
};

/**
 * Get domain by name
 */
export function getDomain(name: string): AdminDomain | undefined {
	return adminRegistry[name];
}

/**
 * Get all domain names
 */
export function getAllDomainNames(): string[] {
	return Object.keys(adminRegistry);
}

/**
 * Check if user has permission for domain action
 */
export function hasPermission(
	userRole: string,
	domain: string,
	action: 'read' | 'write' | 'admin'
): boolean {
	const domainConfig = adminRegistry[domain];
	if (!domainConfig) return false;

	return domainConfig.permissions[action].includes(userRole);
}

/**
 * Get all fixtures for database seeding
 */
export function getAllFixtures() {
	return Object.values(adminRegistry).map((domain) => domain.fixtures);
}
