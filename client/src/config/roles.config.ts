import { z } from 'zod';

/**
 * Roles and permissions configuration for DegenTalk.
 */

// -------------------- Permission Section --------------------
/**
 * Permission definition.
 */
export const PermissionSchema = z.object({
    /** Permission unique key (e.g., 'canLogin', 'editAllPosts') */
    key: z.string(),
    /** Display label for the permission */
    label: z.string(),
    /** Description of the permission */
    description: z.string(),
    /** Category for grouping permissions (e.g., 'General', 'Forum', 'Moderation') */
    category: z.string(),
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
    /** Whether this role bypasses command cooldowns (optional) */
    bypassCooldowns: z.boolean().optional(),
});

export type Role = z.infer<typeof RoleSchema>;

// -------------------- Main Roles Config --------------------
export const RolesConfigSchema = z.object({
    /** All permissions in the system, keyed by permission.key */
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
        // General
        canLogin: { key: 'canLogin', label: 'Can Login', description: 'Allows users to log into the platform', category: 'General' },
        canViewProfile: { key: 'canViewProfile', label: 'View Profiles', description: 'Can view user profiles', category: 'General' },
        canEditProfile: { key: 'canEditProfile', label: 'Edit Own Profile', description: 'Can edit their own profile', category: 'General' },
        canUseChat: { key: 'canUseChat', label: 'Use Chat', description: 'Can use the chat functionality', category: 'General' },

        // Forum
        canCreateThread: { key: 'canCreateThread', label: 'Create Thread', description: 'Can create new forum threads', category: 'Forum' },
        canReplyToThread: { key: 'canReplyToThread', label: 'Reply to Thread', description: 'Can reply to existing threads', category: 'Forum' },
        canEditOwnPost: { key: 'canEditOwnPost', label: 'Edit Own Posts', description: 'Can edit their own posts', category: 'Forum' },
        canDeleteOwnPost: { key: 'canDeleteOwnPost', label: 'Delete Own Posts', description: 'Can delete their own posts', category: 'Forum' },
        canReportContent: { key: 'canReportContent', label: 'Report Content', description: 'Can report inappropriate content', category: 'Forum' },
        canUsePoll: { key: 'canUsePoll', label: 'Use Polls', description: 'Can create and vote in polls', category: 'Forum' },
        canUseForumSearch: { key: 'canUseForumSearch', label: 'Use Forum Search', description: 'Can use forum search functionality', category: 'Forum' },

        // Moderation
        canModerateContent: { key: 'canModerateContent', label: 'Moderate Content', description: 'Can moderate user-generated content', category: 'Moderation' },
        canEditAnyPost: { key: 'canEditAnyPost', label: 'Edit Any Post', description: 'Can edit any user\'s posts', category: 'Moderation' },
        canDeleteAnyPost: { key: 'canDeleteAnyPost', label: 'Delete Any Post', description: 'Can delete any user\'s posts', category: 'Moderation' },
        canLockThread: { key: 'canLockThread', label: 'Lock Thread', description: 'Can lock threads to prevent new replies', category: 'Moderation' },
        canPinThread: { key: 'canPinThread', label: 'Pin Thread', description: 'Can pin threads to the top of forums', category: 'Moderation' },
        canMoveThread: { key: 'canMoveThread', label: 'Move Thread', description: 'Can move threads between categories', category: 'Moderation' },
        canBanUser: { key: 'canBanUser', label: 'Ban User', description: 'Can ban users from the platform', category: 'Moderation' },
        muteUsers: { key: 'muteUsers', label: 'Mute Users', description: 'Mute users in chat', category: 'Moderation' },

        // Administration
        canAccessAdminPanel: { key: 'canAccessAdminPanel', label: 'Access Admin Panel', description: 'Can access the admin control panel', category: 'Administration' },
        canManageUsers: { key: 'canManageUsers', label: 'Manage Users', description: 'Can manage user accounts', category: 'Administration' },
        canManageGroups: { key: 'canManageGroups', label: 'Manage Groups', description: 'Can manage user groups', category: 'Administration' },
        canManageSettings: { key: 'canManageSettings', label: 'Manage Settings', description: 'Can manage site settings', category: 'Administration' },
        canViewAuditLogs: { key: 'canViewAuditLogs', label: 'View Audit Logs', description: 'Can view system audit logs', category: 'Administration' },
        canEditConfig: { key: 'canEditConfig', label: 'Edit Configuration', description: 'Can edit site configuration files', category: 'Administration' },
        canViewStats: { key: 'canViewStats', label: 'View Statistics', description: 'Can view site statistics', category: 'Administration' },

        // Shop & Economy
        canUseShop: { key: 'canUseShop', label: 'Use Shop', description: 'Can make purchases in the shop', category: 'Shop & Economy' },
        canManageShop: { key: 'canManageShop', label: 'Manage Shop', description: 'Can manage the shop functionality', category: 'Shop & Economy' },
        canManageProducts: { key: 'canManageProducts', label: 'Manage Products', description: 'Can manage shop products', category: 'Shop & Economy' },
        canTransferFunds: { key: 'canTransferFunds', label: 'Transfer Funds', description: 'Can transfer funds between users', category: 'Shop & Economy' },
        canManageEconomy: { key: 'canManageEconomy', label: 'Manage Economy', description: 'Can manage site economy settings', category: 'Shop & Economy' },
        canViewTransactions: { key: 'canViewTransactions', label: 'View Transactions', description: 'Can view transaction history', category: 'Shop & Economy' },

        // Other existing permissions (ensure they fit the new schema)
        awardXP: { key: 'awardXP', label: 'Award XP', description: 'Award XP to users', category: 'Gamification' },
        accessVipLounge: { key: 'accessVipLounge', label: 'Access VIP Lounge', description: 'Access VIP-only forums', category: 'Access' },
        postUnlimitedImages: { key: 'postUnlimitedImages', label: 'Post Unlimited Images', description: 'Post unlimited images', category: 'Content' },
    },
    roles: {
        admin: {
            name: 'admin',
            description: 'Administrator with full access',
            isSystemRole: true,
            permissions: [
                'canLogin', 'canViewProfile', 'canEditProfile', 'canUseChat',
                'canCreateThread', 'canReplyToThread', 'canEditOwnPost', 'canDeleteOwnPost',
                'canReportContent', 'canUsePoll', 'canUseForumSearch',
                'canModerateContent', 'canEditAnyPost', 'canDeleteAnyPost', 'canLockThread',
                'canPinThread', 'canMoveThread', 'canBanUser', 'muteUsers',
                'canAccessAdminPanel', 'canManageUsers', 'canManageGroups', 'canManageSettings',
                'canViewAuditLogs', 'canEditConfig', 'canViewStats',
                'canUseShop', 'canManageShop', 'canManageProducts', 'canTransferFunds',
                'canManageEconomy', 'canViewTransactions',
                'awardXP', 'accessVipLounge', 'postUnlimitedImages',
            ],
            bypassCooldowns: true,
        },
        mod: {
            name: 'mod',
            description: 'Moderator with elevated privileges',
            isSystemRole: true,
            permissions: [
                'canLogin', 'canViewProfile', 'canEditProfile', 'canUseChat',
                'canCreateThread', 'canReplyToThread', 'canEditOwnPost', 'canDeleteOwnPost',
                'canReportContent', 'canUsePoll', 'canUseForumSearch',
                'canModerateContent', 'canEditAnyPost', 'canDeleteAnyPost', 'canLockThread',
                'canPinThread', 'canMoveThread', 'muteUsers',
            ],
            bypassCooldowns: true,
        },
        vip: {
            name: 'vip',
            description: 'VIP user with special access',
            isSystemRole: false,
            permissions: [
                'canLogin', 'canViewProfile', 'canEditProfile', 'canUseChat',
                'canCreateThread', 'canReplyToThread', 'canEditOwnPost',
                'canReportContent', 'canUsePoll', 'canUseForumSearch',
                'accessVipLounge', 'postUnlimitedImages',
            ],
        },
        user: {
            name: 'user',
            description: 'Default user role',
            isSystemRole: false,
            permissions: [
                'canLogin', 'canViewProfile', 'canEditProfile', 'canUseChat',
                'canCreateThread', 'canReplyToThread', 'canEditOwnPost',
                'canReportContent', 'canUsePoll', 'canUseForumSearch',
            ],
        },
    },
    defaultRole: 'user',
    systemRoleColors: {
        admin: '#D72638',
        mod: '#1E88E5',
        dev: '#8E24AA',
    },
} as const;
