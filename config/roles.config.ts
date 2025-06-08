import { z } from 'zod';

/**
 * Roles and permissions configuration for DegenTalk.
 */

// -------------------- Permission Section --------------------
/**
 * Permission definition.
 */
export const PermissionSchema = z.object({
    /** Permission name (unique key) */
    name: z.string(),
    /** Description of the permission */
    description: z.string(),
    /** Category (optional) */
    category: z.string().optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;

// -------------------- Role Section --------------------
/**
 * Role definition and permission mapping.
 */
export const RoleSchema = z.object({
    /** Role name (unique key) */
    name: z.string(),
    /** Description of the role */
    description: z.string(),
    /** Is this a system role? */
    isSystemRole: z.boolean(),
    /** Permissions granted to this role */
    permissions: z.array(z.string()),
});

export type Role = z.infer<typeof RoleSchema>;

// -------------------- Main Roles Config --------------------
export const RolesConfigSchema = z.object({
    /** All permissions in the system */
    permissions: z.record(z.string(), PermissionSchema),
    /** All roles in the system */
    roles: z.record(z.string(), RoleSchema),
    /** Default role for new users */
    defaultRole: z.string(),
    /** System role color overrides (for cosmetics, etc.) */
    systemRoleColors: z.record(z.string(), z.string()),
});

/**
 * Default roles config reflecting current hardcoded values and DB schema.
 */
export const rolesConfig = {
    permissions: {
        'editAllPosts': { name: 'editAllPosts', description: 'Edit any post', category: 'moderation' },
        'banUsers': { name: 'banUsers', description: 'Ban users from the platform', category: 'moderation' },
        'awardXP': { name: 'awardXP', description: 'Award XP to users', category: 'gamification' },
        'deletePosts': { name: 'deletePosts', description: 'Delete any post', category: 'moderation' },
        'muteUsers': { name: 'muteUsers', description: 'Mute users in chat', category: 'moderation' },
        'accessVipLounge': { name: 'accessVipLounge', description: 'Access VIP-only forums', category: 'access' },
        'postUnlimitedImages': { name: 'postUnlimitedImages', description: 'Post unlimited images', category: 'content' },
        'createThreads': { name: 'createThreads', description: 'Create new threads', category: 'content' },
        'reply': { name: 'reply', description: 'Reply to threads', category: 'content' },
        // TODO: Add all permissions from permissions.ts and user-groups UI
    },
    roles: {
        admin: {
            name: 'admin',
            description: 'Administrator with full access',
            isSystemRole: true,
            permissions: ['editAllPosts', 'banUsers', 'awardXP', 'deletePosts', 'muteUsers', 'accessVipLounge', 'postUnlimitedImages', 'createThreads', 'reply'],
        },
        mod: {
            name: 'mod',
            description: 'Moderator with elevated privileges',
            isSystemRole: true,
            permissions: ['editAllPosts', 'deletePosts', 'muteUsers', 'createThreads', 'reply'],
        },
        vip: {
            name: 'vip',
            description: 'VIP user with special access',
            isSystemRole: false,
            permissions: ['accessVipLounge', 'postUnlimitedImages', 'createThreads', 'reply'],
        },
        user: {
            name: 'user',
            description: 'Default user role',
            isSystemRole: false,
            permissions: ['createThreads', 'reply'],
        },
        // TODO: Add more roles as needed (dev, guest, etc.)
    },
    defaultRole: 'user',
    systemRoleColors: {
        admin: '#D72638',
        mod: '#1E88E5',
        dev: '#8E24AA',
        // TODO: Add more system roles/colors as needed
    },
} as const; 