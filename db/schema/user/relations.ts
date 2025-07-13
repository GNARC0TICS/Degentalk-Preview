/**
 * User Domain Relations
 *
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { avatarFrames } from './avatarFrames';
import { userBans } from './bans';
import { featurePermissions } from './featurePermissions';
import { passwordResetTokens } from './passwordResetTokens';
import { permissions } from './permissions';
import { userSettings } from './preferences';
import { userRelationships } from './relationships';
import { rolePermissions } from './rolePermissions';
import { roles } from './roles';
import { userSessions } from './sessions';
import { userSettingsHistory } from './settingsHistory';
import { subscriptions } from './subscriptions';
import { userSocialPreferences } from './user-social-preferences';
import { userOwnedFrames } from './userOwnedFrames';
import { userRoles } from './userRoles';
import { users } from './users';
import { verificationTokens } from './verificationTokens';
import { xShares } from './xShares';
import { titles } from '../economy/titles';
import { badges } from '../economy/badges';
export const userBansRelations = relations(userBans, ({ one, many }) => ({
	liftedBy: one(users, {
		fields: [userBans.liftedBy],
		references: [users.id]
	})
}));
export const rolePermissionsRelations = relations(rolePermissions, ({ one, many }) => ({
	grantedBy: one(users, {
		fields: [rolePermissions.grantedBy],
		references: [users.id]
	})
}));
export const userOwnedFramesRelations = relations(userOwnedFrames, ({ one, many }) => ({
	user: one(users, {
		fields: [userOwnedFrames.userId],
		references: [users.id]
	}),
	frame: one(avatarFrames, {
		fields: [userOwnedFrames.frameId],
		references: [avatarFrames.id]
	})
}));
export const userRolesRelations = relations(userRoles, ({ one, many }) => ({
	grantedBy: one(users, {
		fields: [userRoles.grantedBy],
		references: [users.id]
	})
}));
export const usersRelations = relations(users, ({ one, many }) => ({
	activeFrame: one(avatarFrames, {
		fields: [users.activeFrameId],
		references: [avatarFrames.id]
	}),
	avatarFrame: one(avatarFrames, {
		fields: [users.avatarFrameId],
		references: [avatarFrames.id]
	}),
	primaryRole: one(roles, {
		fields: [users.primaryRoleId],
		references: [roles.id]
	}),
	activeTitle: one(titles, {
		fields: [users.activeTitleId],
		references: [titles.id]
	}),
	activeBadge: one(badges, {
		fields: [users.activeBadgeId],
		references: [badges.id]
	}),
	userBans: many(userBans),
	rolePermissions: many(rolePermissions),
	userOwnedFrames: many(userOwnedFrames),
	userRoles: many(userRoles)
}));
export const avatarFramesRelations = relations(avatarFrames, ({ one, many }) => ({
	userOwnedFrames: many(userOwnedFrames),
	users: many(users)
}));
export const rolesRelations = relations(roles, ({ one, many }) => ({
	users: many(users)
}));
