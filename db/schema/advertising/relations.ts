/**
 * Advertising Domain Relations
 * 
 * Auto-generated Drizzle relations for type-safe joins
 */

import { relations } from 'drizzle-orm';
import { campaigns } from './campaigns';
import { cryptoPayments } from './cryptoPayments';
import { adGovernanceProposals } from './adGovernanceProposals';
import { adGovernanceVotes } from './adGovernanceVotes';
import { adImpressions } from './adImpressions';
import { campaignMetrics } from './campaignMetrics';
import { adPlacements } from './adPlacements';
import { campaignRules } from './campaignRules';
import { userPromotions } from './userPromotions';
import { announcementSlots } from './announcementSlots';
import { shoutboxPins } from './shoutboxPins';
import { promotionPricingConfig } from './promotionPricingConfig';
import { threadBoosts } from './threadBoosts';
import { profileSpotlights } from './profileSpotlights';
import { userPromotionAnalytics } from './userPromotionAnalytics';
import { threads } from '../forum';
import { users, shoutboxMessages } from '../user';

export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one, many }) => ({
  discussionThread: one(threads, {
    fields: [cryptoPayments.discussionThreadId],
    references: [threads.id]
  }),
}));

export const adImpressionsRelations = relations(adImpressions, ({ one, many }) => ({
  thread: one(threads, {
    fields: [adImpressions.threadId],
    references: [threads.id]
  }),
}));

export const campaignRulesRelations = relations(campaignRules, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [campaignRules.campaignId],
    references: [campaigns.id]
  }),
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
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  campaignRules: many(campaignRules),
}));

export const userPromotionsRelations = relations(userPromotions, ({ one, many }) => ({
  userPromotions: many(userPromotions),
}));

