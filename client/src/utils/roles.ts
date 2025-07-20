/**
 * Client-side role utilities
 * 
 * Re-exports from the unified shared Role types.
 * All role definitions come from @shared/types.
 */

export type { Role, BasicRole } from '@shared/types/index';

export {
	roleHierarchy,
	roleAliases,
	getCanonicalRole,
	hasRoleAtLeast,
	isRole,
	isValidRole,
	canModerateShoutbox,
	canAccessAdminPanel,
	canModerateContent,
	canModerateMarket,
	isAdmin,
	isSuperAdmin,
	isModerator,
	isAdminOrModerator,
	getUserPermissions,
	hasRoleOrHigher
} from '@shared/types/index';