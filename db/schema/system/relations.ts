/**
 * System Domain Relations
 * 
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { activityFeed } from './activityFeed';
import { analyticsEvents } from './analyticsEvents';
import { cooldownState } from './cooldownState';
import { economyConfigOverrides } from './economyConfigOverrides';
import { eventLogs } from './event_logs';
import { mentionsIndex } from './mentionsIndex';
import { notifications } from './notifications';
import { profileAnalytics } from './profileAnalytics';
import { rateLimits } from './rateLimits';
import { referralSources } from './referralSources';
import { userAbuseFlags } from './userAbuseFlags';
import { userReferrals } from './userReferrals';
import { users } from '../user/users';
export const analyticsEventsRelations = relations(analyticsEvents, ({ one, many }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id]
  }),
}));
export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  eventLog: one(eventLogs, {
    fields: [notifications.eventLogId],
    references: [eventLogs.id]
  }),
}));
export const profileAnalyticsRelations = relations(profileAnalytics, ({ one, many }) => ({
  viewerUser: one(users, {
    fields: [profileAnalytics.viewerUserId],
    references: [users.id]
  }),
}));
export const referralSourcesRelations = relations(referralSources, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [referralSources.createdBy],
    references: [users.id]
  }),
  userReferrals: many(userReferrals),
}));
export const userReferralsRelations = relations(userReferrals, ({ one, many }) => ({
  referredByUser: one(users, {
    fields: [userReferrals.referredByUserId],
    references: [users.id]
  }),
  referralSource: one(referralSources, {
    fields: [userReferrals.referralSourceId],
    references: [referralSources.id]
  }),
}));
export const eventLogsRelations = relations(eventLogs, ({ one, many }) => ({
  notifications: many(notifications),
}));
