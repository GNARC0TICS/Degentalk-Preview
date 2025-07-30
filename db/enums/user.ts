import { pgEnum } from 'drizzle-orm/pg-core';
import { UserRole } from '@shared/types/enums/user.enums';

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

// Export the shared type instead of a local one
export type { UserRole };
