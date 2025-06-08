import { economyConfig } from '@/config/economy.config.ts';
import { forumRulesConfig } from '@/config/forumRules.config.ts';
import { rolesConfig } from '@/config/roles.config.ts';
import { cosmeticsConfig } from '@/config/cosmetics.config.ts';

/**
 * Get the XP reward for a given event type.
 * @param event - The event key (e.g., 'newThread', 'newPost')
 */
export function getXPRewardFor(event: keyof typeof economyConfig.xp): number {
    return economyConfig.xp[event];
}

/**
 * Get the forum rules config for a given forum/zone ID.
 * @param forumId - The forum/zone key
 */
export function getForumRules(forumId: string) {
    return forumRulesConfig.forums[forumId];
}

/**
 * Get a cosmetic item by its ID.
 * @param id - The cosmetic item ID
 */
export function getCosmeticById(id: string) {
    return cosmeticsConfig.items[id];
}

/**
 * Get the permissions for a given role.
 * @param role - The role key
 */
export function getPermissionsForRole(role: string): string[] {
    return rolesConfig.roles[role]?.permissions || [];
}

/**
 * Get the system role color for a given role.
 * @param role - The role key
 */
export function getSystemRoleColor(role: string): string | undefined {
    return cosmeticsConfig.systemRoleColors[role];
} 