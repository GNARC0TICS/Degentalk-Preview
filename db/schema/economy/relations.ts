/**
 * Economy Domain Relations
 * 
 * Auto-generated Drizzle relations for type-safe joins
 */

import { relations } from 'drizzle-orm';
import { airdropRecords } from './airdropRecords';
import { airdropSettings } from './airdropSettings';
import { badges } from './badges';
import { cloutAchievements } from './cloutAchievements';
import { dgtPackages } from './dgtPackages';
import { dgtPurchaseOrders } from './dgtPurchaseOrders';
import { levels } from './levels';
import { postTips } from './postTips';
import { rainEvents } from './rainEvents';
import { dgtEconomyParameters } from './dgtEconomyParameters';
import { tipSettings } from './tipSettings';
import { rainSettings } from './rainSettings';
import { cooldownSettings } from './cooldownSettings';
import { xpCloutSettings } from './settings';
import { economySettings } from './economySettings';
import { titles } from './titles';
import { transactions } from './transactions';
import { platformTreasurySettings } from './platformTreasurySettings';
import { userBadges } from './userBadges';
import { userCloutLog } from './userCloutLog';
import { userCommands } from './userCommands';
import { userTitles } from './userTitles';
import { vaults } from './vaults';
import { wallets } from './wallets';
import { withdrawalRequests } from './withdrawalRequests';
import { xpActionSettings } from './xpActionSettings';
import { xpAdjustmentLogs } from './xpAdjustmentLogs';
import { xpLogs } from './xpLogs';
import { users } from '../user';

export const airdropRecordsRelations = relations(airdropRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [airdropRecords.userId],
    references: [users.id]
  }),
}));

export const levelsRelations = relations(levels, ({ one, many }) => ({
  rewardTitle: one(titles, {
    fields: [levels.rewardTitleId],
    references: [titles.id]
  }),
  rewardBadge: one(badges, {
    fields: [levels.rewardBadgeId],
    references: [badges.id]
  }),
}));

export const dgtEconomyParametersRelations = relations(dgtEconomyParameters, ({ one, many }) => ({
  updatedBy: one(users, {
    fields: [dgtEconomyParameters.updatedBy],
    references: [users.id]
  }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id]
  }),
  fromUser: one(users, {
    fields: [transactions.fromUserId],
    references: [users.id]
  }),
  toUser: one(users, {
    fields: [transactions.toUserId],
    references: [users.id]
  }),
}));

export const platformTreasurySettingsRelations = relations(platformTreasurySettings, ({ one, many }) => ({
  updatedBy: one(users, {
    fields: [platformTreasurySettings.updatedBy],
    references: [users.id]
  }),
}));

export const userCloutLogRelations = relations(userCloutLog, ({ one, many }) => ({
  achievement: one(cloutAchievements, {
    fields: [userCloutLog.achievementId],
    references: [cloutAchievements.id]
  }),
}));

export const vaultsRelations = relations(vaults, ({ one, many }) => ({
  lockTransaction: one(transactions, {
    fields: [vaults.lockTransactionId],
    references: [transactions.id]
  }),
  unlockTransaction: one(transactions, {
    fields: [vaults.unlockTransactionId],
    references: [transactions.id]
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  deletedBy: one(users, {
    fields: [wallets.deletedBy],
    references: [users.id]
  }),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one, many }) => ({
  transaction: one(transactions, {
    fields: [withdrawalRequests.transactionId],
    references: [transactions.id]
  }),
  processedBy: one(users, {
    fields: [withdrawalRequests.processedBy],
    references: [users.id]
  }),
}));

export const titlesRelations = relations(titles, ({ one, many }) => ({
  levels: many(levels),
}));

export const badgesRelations = relations(badges, ({ one, many }) => ({
  levels: many(levels),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  transactions: many(transactions),
}));

export const cloutAchievementsRelations = relations(cloutAchievements, ({ one, many }) => ({
  userCloutLog: many(userCloutLog),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  vaults: many(vaults),
  vaults: many(vaults),
  withdrawalRequests: many(withdrawalRequests),
}));

