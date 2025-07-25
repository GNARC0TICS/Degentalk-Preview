import { relations } from "drizzle-orm/relations";
import { users, siteSettings, adminThemes, siteTemplates, featureFlags, seoMetadata, announcements, uiQuotes, uiAnalytics, uiCollections, emailTemplates, emailTemplateVersions, moderatorNotes, adminBackups, backupSchedules, backupSettings, restoreOperations, brandConfigurations, profileAnalytics, activityFeed, adminManualAirdropLogs, roles, userAbuseFlags, cooldownState, analyticsEvents, mentionsIndex, dictionaryEntries, referralSources, dictionaryUpvotes, userMentionPreferences, userReferrals, mentions, threads, posts, userFollows, friendGroups, friendGroupMembers, friendships, userFriendPreferences, depositRecords, withdrawalRecords, internalTransfers, ccpaymentUsers, cryptoWallets, stickerUsage, stickers, userStickerInventory, swapRecords, stickerPacks, userStickerPacks, campaigns, adGovernanceProposals, adGovernanceVotes, cryptoPayments, userPromotions, announcementSlots, threadBoosts, shoutboxPins, shoutboxMessages, adImpressions, adPlacements, campaignMetrics, profileSpotlights, userPromotionAnalytics, notifications, eventLogs, platformTreasurySettings, productCategories, products, mediaLibrary, avatarFrames, userInventory, inventoryTransactionLinks, transactions, animationPacks, animationPackItems, uiCollectionQuotes, emailTemplateLogs, titles, badges, displayPreferences, notificationSettings, userSettings, userBans, userOwnedFrames, userRelationships, subscriptions, featurePermissions, verificationTokens, passwordResetTokens, userSettingsHistory, userSocialPreferences, cosmeticDrops, forumStructure, threadPrefixes, threadDrafts, postDrafts, postLikes, polls, pollOptions, pollVotes, emojiPacks, emojiPackItems, customEmojis, forumRules, threadFeaturePermissions, levels, xpAdjustmentLogs, userEmojiPacks, wallets, vaults, rainEvents, postTips, dgtEconomyParameters, withdrawalRequests, userCommands, dgtPurchaseOrders, userCloutLog, cloutAchievements, airdropSettings, productMedia, airdropRecords, xpLogs, orders, orderItems, inventoryTransactions, userSignatureItems, signatureShopItems, conversations, chatRooms, onlineUsers, conversationParticipants, messages, directMessages, auditLogs, reportedContent, contentModerationActions, threadTags, tags, userThreadBookmarks, userTitles, userBadges, messageReads, userAchievements, achievements, rolePermissions, permissions, postReactions, userRulesAgreements, userRoles } from "./schema";

export const siteSettingsRelations = relations(siteSettings, ({one}) => ({
	user: one(users, {
		fields: [siteSettings.updatedBy],
		references: [users.userId]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	siteSettings: many(siteSettings),
	adminThemes: many(adminThemes),
	siteTemplates: many(siteTemplates),
	featureFlags_createdBy: many(featureFlags, {
		relationName: "featureFlags_createdBy_users_userId"
	}),
	featureFlags_updatedBy: many(featureFlags, {
		relationName: "featureFlags_updatedBy_users_userId"
	}),
	seoMetadata: many(seoMetadata),
	announcements: many(announcements),
	uiAnalytics: many(uiAnalytics),
	uiCollections: many(uiCollections),
	uiQuotes: many(uiQuotes),
	emailTemplates_createdBy: many(emailTemplates, {
		relationName: "emailTemplates_createdBy_users_userId"
	}),
	emailTemplates_updatedBy: many(emailTemplates, {
		relationName: "emailTemplates_updatedBy_users_userId"
	}),
	emailTemplateVersions: many(emailTemplateVersions),
	moderatorNotes: many(moderatorNotes),
	backupSchedules_createdBy: many(backupSchedules, {
		relationName: "backupSchedules_createdBy_users_userId"
	}),
	backupSchedules_updatedBy: many(backupSchedules, {
		relationName: "backupSchedules_updatedBy_users_userId"
	}),
	backupSettings: many(backupSettings),
	restoreOperations_initiatedBy: many(restoreOperations, {
		relationName: "restoreOperations_initiatedBy_users_userId"
	}),
	restoreOperations_approvedBy: many(restoreOperations, {
		relationName: "restoreOperations_approvedBy_users_userId"
	}),
	brandConfigurations: many(brandConfigurations),
	adminBackups: many(adminBackups),
	profileAnalytics_profileUserId: many(profileAnalytics, {
		relationName: "profileAnalytics_profileUserId_users_userId"
	}),
	profileAnalytics_viewerUserId: many(profileAnalytics, {
		relationName: "profileAnalytics_viewerUserId_users_userId"
	}),
	activityFeeds: many(activityFeed),
	adminManualAirdropLogs_adminId: many(adminManualAirdropLogs, {
		relationName: "adminManualAirdropLogs_adminId_users_userId"
	}),
	adminManualAirdropLogs_userId: many(adminManualAirdropLogs, {
		relationName: "adminManualAirdropLogs_userId_users_userId"
	}),
	userAbuseFlags: many(userAbuseFlags),
	cooldownStates: many(cooldownState),
	analyticsEvents: many(analyticsEvents),
	mentionsIndices_mentioningUserId: many(mentionsIndex, {
		relationName: "mentionsIndex_mentioningUserId_users_userId"
	}),
	mentionsIndices_mentionedUserId: many(mentionsIndex, {
		relationName: "mentionsIndex_mentionedUserId_users_userId"
	}),
	dictionaryEntries_authorId: many(dictionaryEntries, {
		relationName: "dictionaryEntries_authorId_users_userId"
	}),
	dictionaryEntries_approverId: many(dictionaryEntries, {
		relationName: "dictionaryEntries_approverId_users_userId"
	}),
	referralSources: many(referralSources),
	dictionaryUpvotes: many(dictionaryUpvotes),
	userMentionPreferences: many(userMentionPreferences),
	userReferrals_userId: many(userReferrals, {
		relationName: "userReferrals_userId_users_userId"
	}),
	userReferrals_referredByUserId: many(userReferrals, {
		relationName: "userReferrals_referredByUserId_users_userId"
	}),
	mentions_mentionedUserId: many(mentions, {
		relationName: "mentions_mentionedUserId_users_userId"
	}),
	mentions_mentioningUserId: many(mentions, {
		relationName: "mentions_mentioningUserId_users_userId"
	}),
	userFollows_followerId: many(userFollows, {
		relationName: "userFollows_followerId_users_userId"
	}),
	userFollows_followeeId: many(userFollows, {
		relationName: "userFollows_followeeId_users_userId"
	}),
	friendships_requesterId: many(friendships, {
		relationName: "friendships_requesterId_users_userId"
	}),
	friendships_addresseeId: many(friendships, {
		relationName: "friendships_addresseeId_users_userId"
	}),
	userFriendPreferences: many(userFriendPreferences),
	depositRecords: many(depositRecords),
	withdrawalRecords: many(withdrawalRecords),
	internalTransfers_fromUserId: many(internalTransfers, {
		relationName: "internalTransfers_fromUserId_users_userId"
	}),
	internalTransfers_toUserId: many(internalTransfers, {
		relationName: "internalTransfers_toUserId_users_userId"
	}),
	friendGroups: many(friendGroups),
	ccpaymentUsers: many(ccpaymentUsers),
	cryptoWallets: many(cryptoWallets),
	stickerUsages: many(stickerUsage),
	userStickerInventories: many(userStickerInventory),
	swapRecords: many(swapRecords),
	stickerPacks: many(stickerPacks),
	stickers: many(stickers),
	userStickerPacks: many(userStickerPacks),
	campaigns: many(campaigns),
	adGovernanceVotes: many(adGovernanceVotes),
	cryptoPayments: many(cryptoPayments),
	announcementSlots: many(announcementSlots),
	threadBoosts: many(threadBoosts),
	shoutboxPins: many(shoutboxPins),
	adGovernanceProposals: many(adGovernanceProposals),
	profileSpotlights: many(profileSpotlights),
	notifications: many(notifications),
	eventLogs: many(eventLogs),
	posts_userId: many(posts, {
		relationName: "posts_userId_users_userId"
	}),
	posts_deletedBy: many(posts, {
		relationName: "posts_deletedBy_users_userId"
	}),
	posts_editedBy: many(posts, {
		relationName: "posts_editedBy_users_userId"
	}),
	platformTreasurySettings: many(platformTreasurySettings),
	mediaLibraries_userId: many(mediaLibrary, {
		relationName: "mediaLibrary_userId_users_userId"
	}),
	mediaLibraries_deletedBy: many(mediaLibrary, {
		relationName: "mediaLibrary_deletedBy_users_userId"
	}),
	emailTemplateLogs: many(emailTemplateLogs),
	userPromotions_userId: many(userPromotions, {
		relationName: "userPromotions_userId_users_userId"
	}),
	userPromotions_moderatorId: many(userPromotions, {
		relationName: "userPromotions_moderatorId_users_userId"
	}),
	avatarFrame_activeFrameId: one(avatarFrames, {
		fields: [users.activeFrameId],
		references: [avatarFrames.id],
		relationName: "users_activeFrameId_avatarFrames_id"
	}),
	avatarFrame_avatarFrameId: one(avatarFrames, {
		fields: [users.avatarFrameId],
		references: [avatarFrames.id],
		relationName: "users_avatarFrameId_avatarFrames_id"
	}),
	role: one(roles, {
		fields: [users.primaryRoleId],
		references: [roles.roleId]
	}),
	user: one(users, {
		fields: [users.referrerId],
		references: [users.userId],
		relationName: "users_referrerId_users_userId"
	}),
	users: many(users, {
		relationName: "users_referrerId_users_userId"
	}),
	title: one(titles, {
		fields: [users.activeTitleId],
		references: [titles.titleId]
	}),
	badge: one(badges, {
		fields: [users.activeBadgeId],
		references: [badges.badgeId]
	}),
	post: one(posts, {
		fields: [users.pinnedPostId],
		references: [posts.postId],
		relationName: "users_pinnedPostId_posts_postId"
	}),
	displayPreferences: many(displayPreferences),
	notificationSettings: many(notificationSettings),
	userSettings: many(userSettings),
	userBans_userId: many(userBans, {
		relationName: "userBans_userId_users_userId"
	}),
	userBans_bannedBy: many(userBans, {
		relationName: "userBans_bannedBy_users_userId"
	}),
	userBans_liftedBy: many(userBans, {
		relationName: "userBans_liftedBy_users_userId"
	}),
	userOwnedFrames: many(userOwnedFrames),
	userRelationships_userId: many(userRelationships, {
		relationName: "userRelationships_userId_users_userId"
	}),
	userRelationships_targetUserId: many(userRelationships, {
		relationName: "userRelationships_targetUserId_users_userId"
	}),
	userRelationships_followerId: many(userRelationships, {
		relationName: "userRelationships_followerId_users_userId"
	}),
	userRelationships_followingId: many(userRelationships, {
		relationName: "userRelationships_followingId_users_userId"
	}),
	subscriptions: many(subscriptions),
	verificationTokens: many(verificationTokens),
	passwordResetTokens: many(passwordResetTokens),
	userSettingsHistories: many(userSettingsHistory),
	userSocialPreferences: many(userSocialPreferences),
	cosmeticDrops: many(cosmeticDrops),
	threads_userId: many(threads, {
		relationName: "threads_userId_users_userId"
	}),
	threads_featuredBy: many(threads, {
		relationName: "threads_featuredBy_users_userId"
	}),
	threads_deletedBy: many(threads, {
		relationName: "threads_deletedBy_users_userId"
	}),
	threadDrafts: many(threadDrafts),
	postDrafts: many(postDrafts),
	postLikes: many(postLikes),
	pollVotes: many(pollVotes),
	forumRules_createdBy: many(forumRules, {
		relationName: "forumRules_createdBy_users_userId"
	}),
	forumRules_updatedBy: many(forumRules, {
		relationName: "forumRules_updatedBy_users_userId"
	}),
	customEmojis: many(customEmojis),
	emojiPacks: many(emojiPacks),
	xpAdjustmentLogs_userId: many(xpAdjustmentLogs, {
		relationName: "xpAdjustmentLogs_userId_users_userId"
	}),
	xpAdjustmentLogs_adminId: many(xpAdjustmentLogs, {
		relationName: "xpAdjustmentLogs_adminId_users_userId"
	}),
	userEmojiPacks: many(userEmojiPacks),
	wallets_userId: many(wallets, {
		relationName: "wallets_userId_users_userId"
	}),
	wallets_deletedBy: many(wallets, {
		relationName: "wallets_deletedBy_users_userId"
	}),
	transactions_userId: many(transactions, {
		relationName: "transactions_userId_users_userId"
	}),
	transactions_fromUserId: many(transactions, {
		relationName: "transactions_fromUserId_users_userId"
	}),
	transactions_toUserId: many(transactions, {
		relationName: "transactions_toUserId_users_userId"
	}),
	vaults: many(vaults),
	rainEvents: many(rainEvents),
	postTips: many(postTips),
	dgtEconomyParameters: many(dgtEconomyParameters),
	withdrawalRequests_userId: many(withdrawalRequests, {
		relationName: "withdrawalRequests_userId_users_userId"
	}),
	withdrawalRequests_processedBy: many(withdrawalRequests, {
		relationName: "withdrawalRequests_processedBy_users_userId"
	}),
	userCommands: many(userCommands),
	dgtPurchaseOrders: many(dgtPurchaseOrders),
	userCloutLogs: many(userCloutLog),
	airdropRecords: many(airdropRecords),
	xpLogs: many(xpLogs),
	userInventories: many(userInventory),
	inventoryTransactions_userId: many(inventoryTransactions, {
		relationName: "inventoryTransactions_userId_users_userId"
	}),
	inventoryTransactions_createdBy: many(inventoryTransactions, {
		relationName: "inventoryTransactions_createdBy_users_userId"
	}),
	userSignatureItems: many(userSignatureItems),
	orders: many(orders),
	conversations: many(conversations),
	chatRooms: many(chatRooms),
	shoutboxMessages: many(shoutboxMessages),
	onlineUsers: many(onlineUsers),
	conversationParticipants: many(conversationParticipants),
	messages: many(messages),
	directMessages_senderId: many(directMessages, {
		relationName: "directMessages_senderId_users_userId"
	}),
	directMessages_recipientId: many(directMessages, {
		relationName: "directMessages_recipientId_users_userId"
	}),
	auditLogs: many(auditLogs),
	reportedContents_reporterId: many(reportedContent, {
		relationName: "reportedContent_reporterId_users_userId"
	}),
	reportedContents_resolvedBy: many(reportedContent, {
		relationName: "reportedContent_resolvedBy_users_userId"
	}),
	contentModerationActions: many(contentModerationActions),
	userThreadBookmarks: many(userThreadBookmarks),
	userTitles: many(userTitles),
	userBadges: many(userBadges),
	messageReads: many(messageReads),
	userAchievements: many(userAchievements),
	rolePermissions: many(rolePermissions),
	postReactions: many(postReactions),
	userRulesAgreements: many(userRulesAgreements),
	userRoles_userId: many(userRoles, {
		relationName: "userRoles_userId_users_userId"
	}),
	userRoles_grantedBy: many(userRoles, {
		relationName: "userRoles_grantedBy_users_userId"
	}),
}));

export const adminThemesRelations = relations(adminThemes, ({one}) => ({
	user: one(users, {
		fields: [adminThemes.createdBy],
		references: [users.userId]
	}),
}));

export const siteTemplatesRelations = relations(siteTemplates, ({one}) => ({
	user: one(users, {
		fields: [siteTemplates.createdBy],
		references: [users.userId]
	}),
}));

export const featureFlagsRelations = relations(featureFlags, ({one}) => ({
	user_createdBy: one(users, {
		fields: [featureFlags.createdBy],
		references: [users.userId],
		relationName: "featureFlags_createdBy_users_userId"
	}),
	user_updatedBy: one(users, {
		fields: [featureFlags.updatedBy],
		references: [users.userId],
		relationName: "featureFlags_updatedBy_users_userId"
	}),
}));

export const seoMetadataRelations = relations(seoMetadata, ({one}) => ({
	user: one(users, {
		fields: [seoMetadata.updatedBy],
		references: [users.userId]
	}),
}));

export const announcementsRelations = relations(announcements, ({one}) => ({
	user: one(users, {
		fields: [announcements.createdBy],
		references: [users.userId]
	}),
}));

export const uiAnalyticsRelations = relations(uiAnalytics, ({one}) => ({
	uiQuote: one(uiQuotes, {
		fields: [uiAnalytics.quoteId],
		references: [uiQuotes.id]
	}),
	user: one(users, {
		fields: [uiAnalytics.userId],
		references: [users.userId]
	}),
}));

export const uiQuotesRelations = relations(uiQuotes, ({one, many}) => ({
	uiAnalytics: many(uiAnalytics),
	user: one(users, {
		fields: [uiQuotes.createdBy],
		references: [users.userId]
	}),
	uiCollectionQuotes: many(uiCollectionQuotes),
}));

export const uiCollectionsRelations = relations(uiCollections, ({one, many}) => ({
	user: one(users, {
		fields: [uiCollections.createdBy],
		references: [users.userId]
	}),
	uiCollectionQuotes: many(uiCollectionQuotes),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [emailTemplates.createdBy],
		references: [users.userId],
		relationName: "emailTemplates_createdBy_users_userId"
	}),
	user_updatedBy: one(users, {
		fields: [emailTemplates.updatedBy],
		references: [users.userId],
		relationName: "emailTemplates_updatedBy_users_userId"
	}),
	emailTemplateVersions: many(emailTemplateVersions),
	emailTemplateLogs: many(emailTemplateLogs),
}));

export const emailTemplateVersionsRelations = relations(emailTemplateVersions, ({one}) => ({
	emailTemplate: one(emailTemplates, {
		fields: [emailTemplateVersions.templateId],
		references: [emailTemplates.id]
	}),
	user: one(users, {
		fields: [emailTemplateVersions.createdBy],
		references: [users.userId]
	}),
}));

export const moderatorNotesRelations = relations(moderatorNotes, ({one}) => ({
	user: one(users, {
		fields: [moderatorNotes.createdBy],
		references: [users.userId]
	}),
}));

export const backupSchedulesRelations = relations(backupSchedules, ({one}) => ({
	adminBackup: one(adminBackups, {
		fields: [backupSchedules.lastBackupId],
		references: [adminBackups.id]
	}),
	user_createdBy: one(users, {
		fields: [backupSchedules.createdBy],
		references: [users.userId],
		relationName: "backupSchedules_createdBy_users_userId"
	}),
	user_updatedBy: one(users, {
		fields: [backupSchedules.updatedBy],
		references: [users.userId],
		relationName: "backupSchedules_updatedBy_users_userId"
	}),
}));

export const adminBackupsRelations = relations(adminBackups, ({one, many}) => ({
	backupSchedules: many(backupSchedules),
	restoreOperations_sourceBackupId: many(restoreOperations, {
		relationName: "restoreOperations_sourceBackupId_adminBackups_id"
	}),
	restoreOperations_preRestoreBackupId: many(restoreOperations, {
		relationName: "restoreOperations_preRestoreBackupId_adminBackups_id"
	}),
	user: one(users, {
		fields: [adminBackups.createdBy],
		references: [users.userId]
	}),
}));

export const backupSettingsRelations = relations(backupSettings, ({one}) => ({
	user: one(users, {
		fields: [backupSettings.updatedBy],
		references: [users.userId]
	}),
}));

export const restoreOperationsRelations = relations(restoreOperations, ({one}) => ({
	adminBackup_sourceBackupId: one(adminBackups, {
		fields: [restoreOperations.sourceBackupId],
		references: [adminBackups.id],
		relationName: "restoreOperations_sourceBackupId_adminBackups_id"
	}),
	adminBackup_preRestoreBackupId: one(adminBackups, {
		fields: [restoreOperations.preRestoreBackupId],
		references: [adminBackups.id],
		relationName: "restoreOperations_preRestoreBackupId_adminBackups_id"
	}),
	user_initiatedBy: one(users, {
		fields: [restoreOperations.initiatedBy],
		references: [users.userId],
		relationName: "restoreOperations_initiatedBy_users_userId"
	}),
	user_approvedBy: one(users, {
		fields: [restoreOperations.approvedBy],
		references: [users.userId],
		relationName: "restoreOperations_approvedBy_users_userId"
	}),
}));

export const brandConfigurationsRelations = relations(brandConfigurations, ({one}) => ({
	user: one(users, {
		fields: [brandConfigurations.createdBy],
		references: [users.userId]
	}),
}));


export const profileAnalyticsRelations = relations(profileAnalytics, ({one}) => ({
	user_profileUserId: one(users, {
		fields: [profileAnalytics.profileUserId],
		references: [users.userId],
		relationName: "profileAnalytics_profileUserId_users_userId"
	}),
	user_viewerUserId: one(users, {
		fields: [profileAnalytics.viewerUserId],
		references: [users.userId],
		relationName: "profileAnalytics_viewerUserId_users_userId"
	}),
}));

export const activityFeedRelations = relations(activityFeed, ({one}) => ({
	user: one(users, {
		fields: [activityFeed.userId],
		references: [users.userId]
	}),
}));

export const adminManualAirdropLogsRelations = relations(adminManualAirdropLogs, ({one}) => ({
	user_adminId: one(users, {
		fields: [adminManualAirdropLogs.adminId],
		references: [users.userId],
		relationName: "adminManualAirdropLogs_adminId_users_userId"
	}),
	user_userId: one(users, {
		fields: [adminManualAirdropLogs.userId],
		references: [users.userId],
		relationName: "adminManualAirdropLogs_userId_users_userId"
	}),
	role: one(roles, {
		fields: [adminManualAirdropLogs.groupId],
		references: [roles.roleId]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	adminManualAirdropLogs: many(adminManualAirdropLogs),
	users: many(users),
	featurePermissions: many(featurePermissions),
	forumStructures: many(forumStructure),
	airdropSettings: many(airdropSettings),
	chatRooms: many(chatRooms),
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
}));

export const userAbuseFlagsRelations = relations(userAbuseFlags, ({one}) => ({
	user: one(users, {
		fields: [userAbuseFlags.userId],
		references: [users.userId]
	}),
}));

export const cooldownStateRelations = relations(cooldownState, ({one}) => ({
	user: one(users, {
		fields: [cooldownState.userId],
		references: [users.userId]
	}),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({one}) => ({
	user: one(users, {
		fields: [analyticsEvents.userId],
		references: [users.userId]
	}),
}));

export const mentionsIndexRelations = relations(mentionsIndex, ({one}) => ({
	user_mentioningUserId: one(users, {
		fields: [mentionsIndex.mentioningUserId],
		references: [users.userId],
		relationName: "mentionsIndex_mentioningUserId_users_userId"
	}),
	user_mentionedUserId: one(users, {
		fields: [mentionsIndex.mentionedUserId],
		references: [users.userId],
		relationName: "mentionsIndex_mentionedUserId_users_userId"
	}),
}));

export const dictionaryEntriesRelations = relations(dictionaryEntries, ({one, many}) => ({
	user_authorId: one(users, {
		fields: [dictionaryEntries.authorId],
		references: [users.userId],
		relationName: "dictionaryEntries_authorId_users_userId"
	}),
	user_approverId: one(users, {
		fields: [dictionaryEntries.approverId],
		references: [users.userId],
		relationName: "dictionaryEntries_approverId_users_userId"
	}),
	dictionaryUpvotes: many(dictionaryUpvotes),
}));

export const referralSourcesRelations = relations(referralSources, ({one, many}) => ({
	user: one(users, {
		fields: [referralSources.createdBy],
		references: [users.userId]
	}),
	userReferrals: many(userReferrals),
}));

export const dictionaryUpvotesRelations = relations(dictionaryUpvotes, ({one}) => ({
	dictionaryEntry: one(dictionaryEntries, {
		fields: [dictionaryUpvotes.entryId],
		references: [dictionaryEntries.id]
	}),
	user: one(users, {
		fields: [dictionaryUpvotes.userId],
		references: [users.userId]
	}),
}));

export const userMentionPreferencesRelations = relations(userMentionPreferences, ({one}) => ({
	user: one(users, {
		fields: [userMentionPreferences.userId],
		references: [users.userId]
	}),
}));

export const userReferralsRelations = relations(userReferrals, ({one}) => ({
	user_userId: one(users, {
		fields: [userReferrals.userId],
		references: [users.userId],
		relationName: "userReferrals_userId_users_userId"
	}),
	user_referredByUserId: one(users, {
		fields: [userReferrals.referredByUserId],
		references: [users.userId],
		relationName: "userReferrals_referredByUserId_users_userId"
	}),
	referralSource: one(referralSources, {
		fields: [userReferrals.referralSourceId],
		references: [referralSources.id]
	}),
}));

export const mentionsRelations = relations(mentions, ({one}) => ({
	user_mentionedUserId: one(users, {
		fields: [mentions.mentionedUserId],
		references: [users.userId],
		relationName: "mentions_mentionedUserId_users_userId"
	}),
	user_mentioningUserId: one(users, {
		fields: [mentions.mentioningUserId],
		references: [users.userId],
		relationName: "mentions_mentioningUserId_users_userId"
	}),
	thread: one(threads, {
		fields: [mentions.threadId],
		references: [threads.threadId]
	}),
	post: one(posts, {
		fields: [mentions.postId],
		references: [posts.postId]
	}),
}));

export const threadsRelations = relations(threads, ({one, many}) => ({
	mentions: many(mentions),
	posts: many(posts),
	forumStructure: one(forumStructure, {
		fields: [threads.structureId],
		references: [forumStructure.id]
	}),
	user_userId: one(users, {
		fields: [threads.userId],
		references: [users.userId],
		relationName: "threads_userId_users_userId"
	}),
	threadPrefix: one(threadPrefixes, {
		fields: [threads.prefixId],
		references: [threadPrefixes.prefixId]
	}),
	user_featuredBy: one(users, {
		fields: [threads.featuredBy],
		references: [users.userId],
		relationName: "threads_featuredBy_users_userId"
	}),
	user_deletedBy: one(users, {
		fields: [threads.deletedBy],
		references: [users.userId],
		relationName: "threads_deletedBy_users_userId"
	}),
	postDrafts: many(postDrafts),
	polls: many(polls),
	threadFeaturePermissions: many(threadFeaturePermissions),
	threadTags: many(threadTags),
	userThreadBookmarks: many(userThreadBookmarks),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	mentions: many(mentions),
	thread: one(threads, {
		fields: [posts.threadId],
		references: [threads.threadId]
	}),
	user_userId: one(users, {
		fields: [posts.userId],
		references: [users.userId],
		relationName: "posts_userId_users_userId"
	}),
	post: one(posts, {
		fields: [posts.replyToPostId],
		references: [posts.postId],
		relationName: "posts_replyToPostId_posts_postId"
	}),
	posts: many(posts, {
		relationName: "posts_replyToPostId_posts_postId"
	}),
	user_deletedBy: one(users, {
		fields: [posts.deletedBy],
		references: [users.userId],
		relationName: "posts_deletedBy_users_userId"
	}),
	user_editedBy: one(users, {
		fields: [posts.editedBy],
		references: [users.userId],
		relationName: "posts_editedBy_users_userId"
	}),
	users: many(users, {
		relationName: "users_pinnedPostId_posts_postId"
	}),
	postLikes: many(postLikes),
	postTips: many(postTips),
	postReactions: many(postReactions),
}));

export const userFollowsRelations = relations(userFollows, ({one}) => ({
	user_followerId: one(users, {
		fields: [userFollows.followerId],
		references: [users.userId],
		relationName: "userFollows_followerId_users_userId"
	}),
	user_followeeId: one(users, {
		fields: [userFollows.followeeId],
		references: [users.userId],
		relationName: "userFollows_followeeId_users_userId"
	}),
}));

export const friendGroupMembersRelations = relations(friendGroupMembers, ({one}) => ({
	friendGroup: one(friendGroups, {
		fields: [friendGroupMembers.groupId],
		references: [friendGroups.id]
	}),
	friendship: one(friendships, {
		fields: [friendGroupMembers.friendshipId],
		references: [friendships.id]
	}),
}));

export const friendGroupsRelations = relations(friendGroups, ({one, many}) => ({
	friendGroupMembers: many(friendGroupMembers),
	user: one(users, {
		fields: [friendGroups.userId],
		references: [users.userId]
	}),
}));

export const friendshipsRelations = relations(friendships, ({one, many}) => ({
	friendGroupMembers: many(friendGroupMembers),
	user_requesterId: one(users, {
		fields: [friendships.requesterId],
		references: [users.userId],
		relationName: "friendships_requesterId_users_userId"
	}),
	user_addresseeId: one(users, {
		fields: [friendships.addresseeId],
		references: [users.userId],
		relationName: "friendships_addresseeId_users_userId"
	}),
}));

export const userFriendPreferencesRelations = relations(userFriendPreferences, ({one}) => ({
	user: one(users, {
		fields: [userFriendPreferences.userId],
		references: [users.userId]
	}),
}));

export const depositRecordsRelations = relations(depositRecords, ({one}) => ({
	user: one(users, {
		fields: [depositRecords.userId],
		references: [users.userId]
	}),
}));

export const withdrawalRecordsRelations = relations(withdrawalRecords, ({one}) => ({
	user: one(users, {
		fields: [withdrawalRecords.userId],
		references: [users.userId]
	}),
}));

export const internalTransfersRelations = relations(internalTransfers, ({one}) => ({
	user_fromUserId: one(users, {
		fields: [internalTransfers.fromUserId],
		references: [users.userId],
		relationName: "internalTransfers_fromUserId_users_userId"
	}),
	user_toUserId: one(users, {
		fields: [internalTransfers.toUserId],
		references: [users.userId],
		relationName: "internalTransfers_toUserId_users_userId"
	}),
}));

export const ccpaymentUsersRelations = relations(ccpaymentUsers, ({one}) => ({
	user: one(users, {
		fields: [ccpaymentUsers.userId],
		references: [users.userId]
	}),
}));

export const cryptoWalletsRelations = relations(cryptoWallets, ({one}) => ({
	user: one(users, {
		fields: [cryptoWallets.userId],
		references: [users.userId]
	}),
}));

export const stickerUsageRelations = relations(stickerUsage, ({one}) => ({
	user: one(users, {
		fields: [stickerUsage.userId],
		references: [users.userId]
	}),
	sticker: one(stickers, {
		fields: [stickerUsage.stickerId],
		references: [stickers.id]
	}),
}));

export const stickersRelations = relations(stickers, ({one, many}) => ({
	stickerUsages: many(stickerUsage),
	userStickerInventories: many(userStickerInventory),
	stickerPack: one(stickerPacks, {
		fields: [stickers.packId],
		references: [stickerPacks.id]
	}),
	user: one(users, {
		fields: [stickers.createdBy],
		references: [users.userId]
	}),
}));

export const userStickerInventoryRelations = relations(userStickerInventory, ({one}) => ({
	user: one(users, {
		fields: [userStickerInventory.userId],
		references: [users.userId]
	}),
	sticker: one(stickers, {
		fields: [userStickerInventory.stickerId],
		references: [stickers.id]
	}),
}));

export const swapRecordsRelations = relations(swapRecords, ({one}) => ({
	user: one(users, {
		fields: [swapRecords.userId],
		references: [users.userId]
	}),
}));

export const stickerPacksRelations = relations(stickerPacks, ({one, many}) => ({
	user: one(users, {
		fields: [stickerPacks.createdBy],
		references: [users.userId]
	}),
	stickers: many(stickers),
	userStickerPacks: many(userStickerPacks),
}));

export const userStickerPacksRelations = relations(userStickerPacks, ({one}) => ({
	user: one(users, {
		fields: [userStickerPacks.userId],
		references: [users.userId]
	}),
	stickerPack: one(stickerPacks, {
		fields: [userStickerPacks.packId],
		references: [stickerPacks.id]
	}),
}));

export const campaignsRelations = relations(campaigns, ({one, many}) => ({
	user: one(users, {
		fields: [campaigns.advertiserUserId],
		references: [users.userId]
	}),
	cryptoPayments: many(cryptoPayments),
	adImpressions: many(adImpressions),
	campaignMetrics: many(campaignMetrics),
}));

export const adGovernanceVotesRelations = relations(adGovernanceVotes, ({one}) => ({
	adGovernanceProposal: one(adGovernanceProposals, {
		fields: [adGovernanceVotes.proposalId],
		references: [adGovernanceProposals.id]
	}),
	user: one(users, {
		fields: [adGovernanceVotes.voterUserId],
		references: [users.userId]
	}),
}));

export const adGovernanceProposalsRelations = relations(adGovernanceProposals, ({one, many}) => ({
	adGovernanceVotes: many(adGovernanceVotes),
	user: one(users, {
		fields: [adGovernanceProposals.proposerUserId],
		references: [users.userId]
	}),
}));

export const cryptoPaymentsRelations = relations(cryptoPayments, ({one}) => ({
	campaign: one(campaigns, {
		fields: [cryptoPayments.campaignId],
		references: [campaigns.id]
	}),
	user: one(users, {
		fields: [cryptoPayments.payerUserId],
		references: [users.userId]
	}),
}));

export const announcementSlotsRelations = relations(announcementSlots, ({one}) => ({
	userPromotion: one(userPromotions, {
		fields: [announcementSlots.userPromotionId],
		references: [userPromotions.id]
	}),
	user: one(users, {
		fields: [announcementSlots.bookedByUserId],
		references: [users.userId]
	}),
}));

export const userPromotionsRelations = relations(userPromotions, ({one, many}) => ({
	announcementSlots: many(announcementSlots),
	threadBoosts: many(threadBoosts),
	shoutboxPins: many(shoutboxPins),
	profileSpotlights: many(profileSpotlights),
	userPromotionAnalytics: many(userPromotionAnalytics),
	user_userId: one(users, {
		fields: [userPromotions.userId],
		references: [users.userId],
		relationName: "userPromotions_userId_users_userId"
	}),
	user_moderatorId: one(users, {
		fields: [userPromotions.moderatorId],
		references: [users.userId],
		relationName: "userPromotions_moderatorId_users_userId"
	}),
}));

export const threadBoostsRelations = relations(threadBoosts, ({one}) => ({
	userPromotion: one(userPromotions, {
		fields: [threadBoosts.userPromotionId],
		references: [userPromotions.id]
	}),
	user: one(users, {
		fields: [threadBoosts.userId],
		references: [users.userId]
	}),
}));

export const shoutboxPinsRelations = relations(shoutboxPins, ({one}) => ({
	userPromotion: one(userPromotions, {
		fields: [shoutboxPins.userPromotionId],
		references: [userPromotions.id]
	}),
	shoutboxMessage: one(shoutboxMessages, {
		fields: [shoutboxPins.messageId],
		references: [shoutboxMessages.messageId]
	}),
	user: one(users, {
		fields: [shoutboxPins.userId],
		references: [users.userId]
	}),
}));

export const shoutboxMessagesRelations = relations(shoutboxMessages, ({one, many}) => ({
	shoutboxPins: many(shoutboxPins),
	user: one(users, {
		fields: [shoutboxMessages.userId],
		references: [users.userId]
	}),
	chatRoom: one(chatRooms, {
		fields: [shoutboxMessages.roomId],
		references: [chatRooms.roomId]
	}),
}));

export const adImpressionsRelations = relations(adImpressions, ({one}) => ({
	campaign: one(campaigns, {
		fields: [adImpressions.campaignId],
		references: [campaigns.id]
	}),
	adPlacement: one(adPlacements, {
		fields: [adImpressions.placementId],
		references: [adPlacements.id]
	}),
}));

export const adPlacementsRelations = relations(adPlacements, ({many}) => ({
	adImpressions: many(adImpressions),
}));

export const campaignMetricsRelations = relations(campaignMetrics, ({one}) => ({
	campaign: one(campaigns, {
		fields: [campaignMetrics.campaignId],
		references: [campaigns.id]
	}),
}));

export const profileSpotlightsRelations = relations(profileSpotlights, ({one}) => ({
	userPromotion: one(userPromotions, {
		fields: [profileSpotlights.userPromotionId],
		references: [userPromotions.id]
	}),
	user: one(users, {
		fields: [profileSpotlights.userId],
		references: [users.userId]
	}),
}));

export const userPromotionAnalyticsRelations = relations(userPromotionAnalytics, ({one}) => ({
	userPromotion: one(userPromotions, {
		fields: [userPromotionAnalytics.userPromotionId],
		references: [userPromotions.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.userId]
	}),
	eventLog: one(eventLogs, {
		fields: [notifications.eventLogId],
		references: [eventLogs.id]
	}),
}));

export const eventLogsRelations = relations(eventLogs, ({one, many}) => ({
	notifications: many(notifications),
	user: one(users, {
		fields: [eventLogs.userId],
		references: [users.userId]
	}),
}));

export const platformTreasurySettingsRelations = relations(platformTreasurySettings, ({one}) => ({
	user: one(users, {
		fields: [platformTreasurySettings.updatedBy],
		references: [users.userId]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productCategory: one(productCategories, {
		fields: [products.categoryId],
		references: [productCategories.categoryId]
	}),
	mediaLibrary_featuredImageId: one(mediaLibrary, {
		fields: [products.featuredImageId],
		references: [mediaLibrary.mediaId],
		relationName: "products_featuredImageId_mediaLibrary_mediaId"
	}),
	mediaLibrary_digitalFileId: one(mediaLibrary, {
		fields: [products.digitalFileId],
		references: [mediaLibrary.mediaId],
		relationName: "products_digitalFileId_mediaLibrary_mediaId"
	}),
	avatarFrame: one(avatarFrames, {
		fields: [products.frameId],
		references: [avatarFrames.id]
	}),
	productMedias: many(productMedia),
	orderItems: many(orderItems),
	userInventories: many(userInventory),
	inventoryTransactions: many(inventoryTransactions),
}));

export const productCategoriesRelations = relations(productCategories, ({one, many}) => ({
	products: many(products),
	mediaLibrary: one(mediaLibrary, {
		fields: [productCategories.imageId],
		references: [mediaLibrary.mediaId]
	}),
	productCategory: one(productCategories, {
		fields: [productCategories.parentId],
		references: [productCategories.categoryId],
		relationName: "productCategories_parentId_productCategories_categoryId"
	}),
	productCategories: many(productCategories, {
		relationName: "productCategories_parentId_productCategories_categoryId"
	}),
}));

export const mediaLibraryRelations = relations(mediaLibrary, ({one, many}) => ({
	products_featuredImageId: many(products, {
		relationName: "products_featuredImageId_mediaLibrary_mediaId"
	}),
	products_digitalFileId: many(products, {
		relationName: "products_digitalFileId_mediaLibrary_mediaId"
	}),
	user_userId: one(users, {
		fields: [mediaLibrary.userId],
		references: [users.userId],
		relationName: "mediaLibrary_userId_users_userId"
	}),
	user_deletedBy: one(users, {
		fields: [mediaLibrary.deletedBy],
		references: [users.userId],
		relationName: "mediaLibrary_deletedBy_users_userId"
	}),
	animationPackItems: many(animationPackItems),
	productMedias: many(productMedia),
	productCategories: many(productCategories),
}));

export const avatarFramesRelations = relations(avatarFrames, ({many}) => ({
	products: many(products),
	users_activeFrameId: many(users, {
		relationName: "users_activeFrameId_avatarFrames_id"
	}),
	users_avatarFrameId: many(users, {
		relationName: "users_avatarFrameId_avatarFrames_id"
	}),
	userOwnedFrames: many(userOwnedFrames),
}));

export const inventoryTransactionLinksRelations = relations(inventoryTransactionLinks, ({one}) => ({
	userInventory: one(userInventory, {
		fields: [inventoryTransactionLinks.inventoryId],
		references: [userInventory.id]
	}),
	transaction: one(transactions, {
		fields: [inventoryTransactionLinks.dgtTransactionId],
		references: [transactions.transactionId]
	}),
}));

export const userInventoryRelations = relations(userInventory, ({one, many}) => ({
	inventoryTransactionLinks: many(inventoryTransactionLinks),
	user: one(users, {
		fields: [userInventory.userId],
		references: [users.userId]
	}),
	product: one(products, {
		fields: [userInventory.productId],
		references: [products.productId]
	}),
	transaction: one(transactions, {
		fields: [userInventory.transactionId],
		references: [transactions.transactionId]
	}),
}));

export const transactionsRelations = relations(transactions, ({one, many}) => ({
	inventoryTransactionLinks: many(inventoryTransactionLinks),
	user_userId: one(users, {
		fields: [transactions.userId],
		references: [users.userId],
		relationName: "transactions_userId_users_userId"
	}),
	wallet: one(wallets, {
		fields: [transactions.walletId],
		references: [wallets.walletId]
	}),
	user_fromUserId: one(users, {
		fields: [transactions.fromUserId],
		references: [users.userId],
		relationName: "transactions_fromUserId_users_userId"
	}),
	user_toUserId: one(users, {
		fields: [transactions.toUserId],
		references: [users.userId],
		relationName: "transactions_toUserId_users_userId"
	}),
	vaults_lockTransactionId: many(vaults, {
		relationName: "vaults_lockTransactionId_transactions_transactionId"
	}),
	vaults_unlockTransactionId: many(vaults, {
		relationName: "vaults_unlockTransactionId_transactions_transactionId"
	}),
	rainEvents: many(rainEvents),
	withdrawalRequests: many(withdrawalRequests),
	userInventories: many(userInventory),
}));

export const animationPackItemsRelations = relations(animationPackItems, ({one}) => ({
	animationPack: one(animationPacks, {
		fields: [animationPackItems.packId],
		references: [animationPacks.id]
	}),
	mediaLibrary: one(mediaLibrary, {
		fields: [animationPackItems.mediaId],
		references: [mediaLibrary.mediaId]
	}),
}));

export const animationPacksRelations = relations(animationPacks, ({many}) => ({
	animationPackItems: many(animationPackItems),
}));

export const uiCollectionQuotesRelations = relations(uiCollectionQuotes, ({one}) => ({
	uiCollection: one(uiCollections, {
		fields: [uiCollectionQuotes.collectionId],
		references: [uiCollections.id]
	}),
	uiQuote: one(uiQuotes, {
		fields: [uiCollectionQuotes.quoteId],
		references: [uiQuotes.id]
	}),
}));

export const emailTemplateLogsRelations = relations(emailTemplateLogs, ({one}) => ({
	emailTemplate: one(emailTemplates, {
		fields: [emailTemplateLogs.templateId],
		references: [emailTemplates.id]
	}),
	user: one(users, {
		fields: [emailTemplateLogs.recipientUserId],
		references: [users.userId]
	}),
}));

export const titlesRelations = relations(titles, ({many}) => ({
	users: many(users),
	levels: many(levels),
	userTitles: many(userTitles),
}));

export const badgesRelations = relations(badges, ({many}) => ({
	users: many(users),
	levels: many(levels),
	userBadges: many(userBadges),
}));

export const displayPreferencesRelations = relations(displayPreferences, ({one}) => ({
	user: one(users, {
		fields: [displayPreferences.userId],
		references: [users.userId]
	}),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({one}) => ({
	user: one(users, {
		fields: [notificationSettings.userId],
		references: [users.userId]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.userId]
	}),
}));

export const userBansRelations = relations(userBans, ({one}) => ({
	user_userId: one(users, {
		fields: [userBans.userId],
		references: [users.userId],
		relationName: "userBans_userId_users_userId"
	}),
	user_bannedBy: one(users, {
		fields: [userBans.bannedBy],
		references: [users.userId],
		relationName: "userBans_bannedBy_users_userId"
	}),
	user_liftedBy: one(users, {
		fields: [userBans.liftedBy],
		references: [users.userId],
		relationName: "userBans_liftedBy_users_userId"
	}),
}));

export const userOwnedFramesRelations = relations(userOwnedFrames, ({one}) => ({
	user: one(users, {
		fields: [userOwnedFrames.userId],
		references: [users.userId]
	}),
	avatarFrame: one(avatarFrames, {
		fields: [userOwnedFrames.frameId],
		references: [avatarFrames.id]
	}),
}));

export const userRelationshipsRelations = relations(userRelationships, ({one}) => ({
	user_userId: one(users, {
		fields: [userRelationships.userId],
		references: [users.userId],
		relationName: "userRelationships_userId_users_userId"
	}),
	user_targetUserId: one(users, {
		fields: [userRelationships.targetUserId],
		references: [users.userId],
		relationName: "userRelationships_targetUserId_users_userId"
	}),
	user_followerId: one(users, {
		fields: [userRelationships.followerId],
		references: [users.userId],
		relationName: "userRelationships_followerId_users_userId"
	}),
	user_followingId: one(users, {
		fields: [userRelationships.followingId],
		references: [users.userId],
		relationName: "userRelationships_followingId_users_userId"
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one, many}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.userId]
	}),
	cosmeticDrops: many(cosmeticDrops),
}));

export const featurePermissionsRelations = relations(featurePermissions, ({one}) => ({
	role: one(roles, {
		fields: [featurePermissions.groupId],
		references: [roles.roleId]
	}),
}));

export const verificationTokensRelations = relations(verificationTokens, ({one}) => ({
	user: one(users, {
		fields: [verificationTokens.userId],
		references: [users.userId]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.userId]
	}),
}));

export const userSettingsHistoryRelations = relations(userSettingsHistory, ({one}) => ({
	user: one(users, {
		fields: [userSettingsHistory.userId],
		references: [users.userId]
	}),
}));

export const userSocialPreferencesRelations = relations(userSocialPreferences, ({one}) => ({
	user: one(users, {
		fields: [userSocialPreferences.userId],
		references: [users.userId]
	}),
}));

export const cosmeticDropsRelations = relations(cosmeticDrops, ({one}) => ({
	user: one(users, {
		fields: [cosmeticDrops.userId],
		references: [users.userId]
	}),
	subscription: one(subscriptions, {
		fields: [cosmeticDrops.subscriptionId],
		references: [subscriptions.subscriptionId]
	}),
}));

export const forumStructureRelations = relations(forumStructure, ({one, many}) => ({
	threads: many(threads),
	threadPrefixes: many(threadPrefixes),
	forumStructure: one(forumStructure, {
		fields: [forumStructure.parentId],
		references: [forumStructure.id],
		relationName: "forumStructure_parentId_forumStructure_id"
	}),
	forumStructures: many(forumStructure, {
		relationName: "forumStructure_parentId_forumStructure_id"
	}),
	role: one(roles, {
		fields: [forumStructure.minGroupIdRequired],
		references: [roles.roleId]
	}),
	threadDrafts: many(threadDrafts),
}));

export const threadPrefixesRelations = relations(threadPrefixes, ({one, many}) => ({
	threads: many(threads),
	forumStructure: one(forumStructure, {
		fields: [threadPrefixes.structureId],
		references: [forumStructure.id]
	}),
	threadDrafts: many(threadDrafts),
}));

export const threadDraftsRelations = relations(threadDrafts, ({one}) => ({
	user: one(users, {
		fields: [threadDrafts.userId],
		references: [users.userId]
	}),
	forumStructure: one(forumStructure, {
		fields: [threadDrafts.structureId],
		references: [forumStructure.id]
	}),
	threadPrefix: one(threadPrefixes, {
		fields: [threadDrafts.prefixId],
		references: [threadPrefixes.prefixId]
	}),
}));

export const postDraftsRelations = relations(postDrafts, ({one}) => ({
	thread: one(threads, {
		fields: [postDrafts.threadId],
		references: [threads.threadId]
	}),
	user: one(users, {
		fields: [postDrafts.userId],
		references: [users.userId]
	}),
}));

export const postLikesRelations = relations(postLikes, ({one}) => ({
	post: one(posts, {
		fields: [postLikes.postId],
		references: [posts.postId]
	}),
	user: one(users, {
		fields: [postLikes.likedByUserId],
		references: [users.userId]
	}),
}));

export const pollsRelations = relations(polls, ({one, many}) => ({
	thread: one(threads, {
		fields: [polls.threadId],
		references: [threads.threadId]
	}),
	pollOptions: many(pollOptions),
}));

export const pollOptionsRelations = relations(pollOptions, ({one, many}) => ({
	poll: one(polls, {
		fields: [pollOptions.pollId],
		references: [polls.pollId]
	}),
	pollVotes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({one}) => ({
	pollOption: one(pollOptions, {
		fields: [pollVotes.optionId],
		references: [pollOptions.optionId]
	}),
	user: one(users, {
		fields: [pollVotes.userId],
		references: [users.userId]
	}),
}));

export const emojiPackItemsRelations = relations(emojiPackItems, ({one}) => ({
	emojiPack: one(emojiPacks, {
		fields: [emojiPackItems.packId],
		references: [emojiPacks.packId]
	}),
	customEmoji: one(customEmojis, {
		fields: [emojiPackItems.emojiId],
		references: [customEmojis.emojiId]
	}),
}));

export const emojiPacksRelations = relations(emojiPacks, ({one, many}) => ({
	emojiPackItems: many(emojiPackItems),
	user: one(users, {
		fields: [emojiPacks.createdBy],
		references: [users.userId]
	}),
	userEmojiPacks: many(userEmojiPacks),
}));

export const customEmojisRelations = relations(customEmojis, ({one, many}) => ({
	emojiPackItems: many(emojiPackItems),
	user: one(users, {
		fields: [customEmojis.createdBy],
		references: [users.userId]
	}),
}));

export const forumRulesRelations = relations(forumRules, ({one, many}) => ({
	user_createdBy: one(users, {
		fields: [forumRules.createdBy],
		references: [users.userId],
		relationName: "forumRules_createdBy_users_userId"
	}),
	user_updatedBy: one(users, {
		fields: [forumRules.updatedBy],
		references: [users.userId],
		relationName: "forumRules_updatedBy_users_userId"
	}),
	userRulesAgreements: many(userRulesAgreements),
}));

export const threadFeaturePermissionsRelations = relations(threadFeaturePermissions, ({one}) => ({
	thread: one(threads, {
		fields: [threadFeaturePermissions.threadId],
		references: [threads.threadId]
	}),
}));

export const levelsRelations = relations(levels, ({one}) => ({
	title: one(titles, {
		fields: [levels.rewardTitleId],
		references: [titles.titleId]
	}),
	badge: one(badges, {
		fields: [levels.rewardBadgeId],
		references: [badges.badgeId]
	}),
}));

export const xpAdjustmentLogsRelations = relations(xpAdjustmentLogs, ({one}) => ({
	user_userId: one(users, {
		fields: [xpAdjustmentLogs.userId],
		references: [users.userId],
		relationName: "xpAdjustmentLogs_userId_users_userId"
	}),
	user_adminId: one(users, {
		fields: [xpAdjustmentLogs.adminId],
		references: [users.userId],
		relationName: "xpAdjustmentLogs_adminId_users_userId"
	}),
}));

export const userEmojiPacksRelations = relations(userEmojiPacks, ({one}) => ({
	user: one(users, {
		fields: [userEmojiPacks.userId],
		references: [users.userId]
	}),
	emojiPack: one(emojiPacks, {
		fields: [userEmojiPacks.emojiPackId],
		references: [emojiPacks.packId]
	}),
}));

export const walletsRelations = relations(wallets, ({one, many}) => ({
	user_userId: one(users, {
		fields: [wallets.userId],
		references: [users.userId],
		relationName: "wallets_userId_users_userId"
	}),
	user_deletedBy: one(users, {
		fields: [wallets.deletedBy],
		references: [users.userId],
		relationName: "wallets_deletedBy_users_userId"
	}),
	transactions: many(transactions),
}));

export const vaultsRelations = relations(vaults, ({one}) => ({
	user: one(users, {
		fields: [vaults.userId],
		references: [users.userId]
	}),
	transaction_lockTransactionId: one(transactions, {
		fields: [vaults.lockTransactionId],
		references: [transactions.transactionId],
		relationName: "vaults_lockTransactionId_transactions_transactionId"
	}),
	transaction_unlockTransactionId: one(transactions, {
		fields: [vaults.unlockTransactionId],
		references: [transactions.transactionId],
		relationName: "vaults_unlockTransactionId_transactions_transactionId"
	}),
}));

export const rainEventsRelations = relations(rainEvents, ({one}) => ({
	user: one(users, {
		fields: [rainEvents.userId],
		references: [users.userId]
	}),
	transaction: one(transactions, {
		fields: [rainEvents.transactionId],
		references: [transactions.transactionId]
	}),
}));

export const postTipsRelations = relations(postTips, ({one}) => ({
	post: one(posts, {
		fields: [postTips.postId],
		references: [posts.postId]
	}),
	user: one(users, {
		fields: [postTips.userId],
		references: [users.userId]
	}),
}));

export const dgtEconomyParametersRelations = relations(dgtEconomyParameters, ({one}) => ({
	user: one(users, {
		fields: [dgtEconomyParameters.updatedBy],
		references: [users.userId]
	}),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({one}) => ({
	user_userId: one(users, {
		fields: [withdrawalRequests.userId],
		references: [users.userId],
		relationName: "withdrawalRequests_userId_users_userId"
	}),
	user_processedBy: one(users, {
		fields: [withdrawalRequests.processedBy],
		references: [users.userId],
		relationName: "withdrawalRequests_processedBy_users_userId"
	}),
	transaction: one(transactions, {
		fields: [withdrawalRequests.transactionId],
		references: [transactions.transactionId]
	}),
}));

export const userCommandsRelations = relations(userCommands, ({one}) => ({
	user: one(users, {
		fields: [userCommands.userId],
		references: [users.userId]
	}),
}));

export const dgtPurchaseOrdersRelations = relations(dgtPurchaseOrders, ({one}) => ({
	user: one(users, {
		fields: [dgtPurchaseOrders.userId],
		references: [users.userId]
	}),
}));

export const userCloutLogRelations = relations(userCloutLog, ({one}) => ({
	user: one(users, {
		fields: [userCloutLog.userId],
		references: [users.userId]
	}),
	cloutAchievement: one(cloutAchievements, {
		fields: [userCloutLog.achievementId],
		references: [cloutAchievements.id]
	}),
}));

export const cloutAchievementsRelations = relations(cloutAchievements, ({many}) => ({
	userCloutLogs: many(userCloutLog),
}));

export const airdropSettingsRelations = relations(airdropSettings, ({one}) => ({
	role: one(roles, {
		fields: [airdropSettings.targetGroupId],
		references: [roles.roleId]
	}),
}));

export const productMediaRelations = relations(productMedia, ({one}) => ({
	product: one(products, {
		fields: [productMedia.productId],
		references: [products.productId]
	}),
	mediaLibrary: one(mediaLibrary, {
		fields: [productMedia.mediaId],
		references: [mediaLibrary.mediaId]
	}),
}));

export const airdropRecordsRelations = relations(airdropRecords, ({one}) => ({
	user: one(users, {
		fields: [airdropRecords.userId],
		references: [users.userId]
	}),
}));

export const xpLogsRelations = relations(xpLogs, ({one}) => ({
	user: one(users, {
		fields: [xpLogs.userId],
		references: [users.userId]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.orderId]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.productId]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.userId],
		references: [users.userId]
	}),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({one}) => ({
	user_userId: one(users, {
		fields: [inventoryTransactions.userId],
		references: [users.userId],
		relationName: "inventoryTransactions_userId_users_userId"
	}),
	product: one(products, {
		fields: [inventoryTransactions.productId],
		references: [products.productId]
	}),
	user_createdBy: one(users, {
		fields: [inventoryTransactions.createdBy],
		references: [users.userId],
		relationName: "inventoryTransactions_createdBy_users_userId"
	}),
}));

export const userSignatureItemsRelations = relations(userSignatureItems, ({one}) => ({
	user: one(users, {
		fields: [userSignatureItems.userId],
		references: [users.userId]
	}),
	signatureShopItem: one(signatureShopItems, {
		fields: [userSignatureItems.signatureItemId],
		references: [signatureShopItems.id]
	}),
}));

export const signatureShopItemsRelations = relations(signatureShopItems, ({many}) => ({
	userSignatureItems: many(userSignatureItems),
}));

export const conversationsRelations = relations(conversations, ({one, many}) => ({
	user: one(users, {
		fields: [conversations.createdBy],
		references: [users.userId]
	}),
	conversationParticipants: many(conversationParticipants),
	messages: many(messages),
}));

export const chatRoomsRelations = relations(chatRooms, ({one, many}) => ({
	role: one(roles, {
		fields: [chatRooms.minGroupIdRequired],
		references: [roles.roleId]
	}),
	user: one(users, {
		fields: [chatRooms.createdBy],
		references: [users.userId]
	}),
	shoutboxMessages: many(shoutboxMessages),
	onlineUsers: many(onlineUsers),
}));

export const onlineUsersRelations = relations(onlineUsers, ({one}) => ({
	user: one(users, {
		fields: [onlineUsers.userId],
		references: [users.userId]
	}),
	chatRoom: one(chatRooms, {
		fields: [onlineUsers.roomId],
		references: [chatRooms.roomId]
	}),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({one}) => ({
	user: one(users, {
		fields: [conversationParticipants.userId],
		references: [users.userId]
	}),
	conversation: one(conversations, {
		fields: [conversationParticipants.conversationId],
		references: [conversations.conversationId]
	}),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.conversationId]
	}),
	user: one(users, {
		fields: [messages.senderId],
		references: [users.userId]
	}),
	messageReads: many(messageReads),
}));

export const directMessagesRelations = relations(directMessages, ({one}) => ({
	user_senderId: one(users, {
		fields: [directMessages.senderId],
		references: [users.userId],
		relationName: "directMessages_senderId_users_userId"
	}),
	user_recipientId: one(users, {
		fields: [directMessages.recipientId],
		references: [users.userId],
		relationName: "directMessages_recipientId_users_userId"
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.userId]
	}),
}));

export const reportedContentRelations = relations(reportedContent, ({one}) => ({
	user_reporterId: one(users, {
		fields: [reportedContent.reporterId],
		references: [users.userId],
		relationName: "reportedContent_reporterId_users_userId"
	}),
	user_resolvedBy: one(users, {
		fields: [reportedContent.resolvedBy],
		references: [users.userId],
		relationName: "reportedContent_resolvedBy_users_userId"
	}),
}));

export const contentModerationActionsRelations = relations(contentModerationActions, ({one}) => ({
	user: one(users, {
		fields: [contentModerationActions.moderatorId],
		references: [users.userId]
	}),
}));

export const threadTagsRelations = relations(threadTags, ({one}) => ({
	thread: one(threads, {
		fields: [threadTags.threadId],
		references: [threads.threadId]
	}),
	tag: one(tags, {
		fields: [threadTags.tagId],
		references: [tags.tagId]
	}),
}));

export const tagsRelations = relations(tags, ({many}) => ({
	threadTags: many(threadTags),
}));

export const userThreadBookmarksRelations = relations(userThreadBookmarks, ({one}) => ({
	user: one(users, {
		fields: [userThreadBookmarks.userId],
		references: [users.userId]
	}),
	thread: one(threads, {
		fields: [userThreadBookmarks.threadId],
		references: [threads.threadId]
	}),
}));

export const userTitlesRelations = relations(userTitles, ({one}) => ({
	user: one(users, {
		fields: [userTitles.userId],
		references: [users.userId]
	}),
	title: one(titles, {
		fields: [userTitles.titleId],
		references: [titles.titleId]
	}),
}));

export const userBadgesRelations = relations(userBadges, ({one}) => ({
	user: one(users, {
		fields: [userBadges.userId],
		references: [users.userId]
	}),
	badge: one(badges, {
		fields: [userBadges.badgeId],
		references: [badges.badgeId]
	}),
}));

export const messageReadsRelations = relations(messageReads, ({one}) => ({
	message: one(messages, {
		fields: [messageReads.messageId],
		references: [messages.messageId]
	}),
	user: one(users, {
		fields: [messageReads.userId],
		references: [users.userId]
	}),
}));

export const userAchievementsRelations = relations(userAchievements, ({one}) => ({
	user: one(users, {
		fields: [userAchievements.userId],
		references: [users.userId]
	}),
	achievement: one(achievements, {
		fields: [userAchievements.achievementId],
		references: [achievements.achievementId]
	}),
}));

export const achievementsRelations = relations(achievements, ({many}) => ({
	userAchievements: many(userAchievements),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.roleId]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permId],
		references: [permissions.permId]
	}),
	user: one(users, {
		fields: [rolePermissions.grantedBy],
		references: [users.userId]
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const postReactionsRelations = relations(postReactions, ({one}) => ({
	user: one(users, {
		fields: [postReactions.userId],
		references: [users.userId]
	}),
	post: one(posts, {
		fields: [postReactions.postId],
		references: [posts.postId]
	}),
}));

export const userRulesAgreementsRelations = relations(userRulesAgreements, ({one}) => ({
	user: one(users, {
		fields: [userRulesAgreements.userId],
		references: [users.userId]
	}),
	forumRule: one(forumRules, {
		fields: [userRulesAgreements.ruleId],
		references: [forumRules.ruleId]
	}),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user_userId: one(users, {
		fields: [userRoles.userId],
		references: [users.userId],
		relationName: "userRoles_userId_users_userId"
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.roleId]
	}),
	user_grantedBy: one(users, {
		fields: [userRoles.grantedBy],
		references: [users.userId],
		relationName: "userRoles_grantedBy_users_userId"
	}),
}));