/**
 * Advertising Domain Relations
 *
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { campaigns } from './campaigns';
import { cryptoPayments, adGovernanceProposals, adGovernanceVotes } from './payments';
import { adImpressions, campaignMetrics } from './performance';
import { adPlacements } from './placements';
import { campaignRules } from './targeting';
import {
	userPromotions,
	announcementSlots,
	shoutboxPins,
	promotionPricingConfig,
	threadBoosts,
	profileSpotlights,
	userPromotionAnalytics
} from './user-promotions';
import { threads } from '../forum/threads';
import { users } from '../user/users';
import { shoutboxMessages } from '../messaging/shoutboxMessages';
export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one, many }) => ({
	campaign: one(campaigns, {
		fields: [cryptoPayments.campaignId],
		references: [campaigns.id]
	}),
	payerUser: one(users, {
		fields: [cryptoPayments.payerUserId],
		references: [users.id]
	})
}));
export const adImpressionsRelations = relations(adImpressions, ({ one, many }) => ({
	thread: one(threads, {
		fields: [adImpressions.threadId],
		references: [threads.id]
	})
}));
export const campaignRulesRelations = relations(campaignRules, ({ one, many }) => ({
	campaign: one(campaigns, {
		fields: [campaignRules.campaignId],
		references: [campaigns.id]
	})
}));
export const userPromotionsRelations = relations(userPromotions, ({ one, many }) => ({
	user: one(users, {
		fields: [userPromotions.userId],
		references: [users.id]
	}),
	moderator: one(users, {
		fields: [userPromotions.moderatorId],
		references: [users.id]
	})
}));
export const adGovernanceProposalsRelations = relations(adGovernanceProposals, ({ one, many }) => ({
	proposerUser: one(users, {
		fields: [adGovernanceProposals.proposerUserId],
		references: [users.id]
	}),
	discussionThread: one(threads, {
		fields: [adGovernanceProposals.discussionThreadId],
		references: [threads.id]
	})
}));

export const announcementSlotsRelations = relations(announcementSlots, ({ one, many }) => ({
	userPromotion: one(userPromotions, {
		fields: [announcementSlots.userPromotionId],
		references: [userPromotions.id]
	}),
	bookedByUser: one(users, {
		fields: [announcementSlots.bookedByUserId],
		references: [users.id]
	})
}));

export const shoutboxPinsRelations = relations(shoutboxPins, ({ one, many }) => ({
	userPromotion: one(userPromotions, {
		fields: [shoutboxPins.userPromotionId],
		references: [userPromotions.id]
	}),
	message: one(shoutboxMessages, {
		fields: [shoutboxPins.messageId],
		references: [shoutboxMessages.id]
	}),
	user: one(users, {
		fields: [shoutboxPins.userId],
		references: [users.id]
	})
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
	campaignRules: many(campaignRules)
}));
