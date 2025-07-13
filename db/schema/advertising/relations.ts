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
	discussionThread: one(threads, {
		fields: [cryptoPayments.discussionThreadId],
		references: [threads.id]
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
	moderator: one(users, {
		fields: [userPromotions.moderatorId],
		references: [users.id]
	}),
	userPromotion: one(userPromotions, {
		fields: [userPromotions.userPromotionId],
		references: [userPromotions.id]
	}),
	bookedByUser: one(users, {
		fields: [userPromotions.bookedByUserId],
		references: [users.id]
	}),
	message: one(shoutboxMessages, {
		fields: [userPromotions.messageId],
		references: [shoutboxMessages.id]
	})
}));
export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
	campaignRules: many(campaignRules)
}));
