import { pgEnum } from 'drizzle-orm/pg-core';

// Canonical user roles used across the entire platform
export const userRoleEnum = pgEnum('user_role', [
	'user',
	'super_admin',
	'admin',
	'moderator',
	'dev',
	'shoutbox_mod',
	'content_mod',
	'market_mod'
]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
