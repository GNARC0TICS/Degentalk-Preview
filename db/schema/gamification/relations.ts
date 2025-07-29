/**
 * Gamification Domain Relations
 *
 * Auto-generated Drizzle relations for type-safe joins
 */
import { relations } from 'drizzle-orm';
import { achievementEvents } from './achievementEvents';
import { achievements } from './achievements';
// import { leaderboardHistory } from './leaderboardHistory'; // File doesn't exist yet
// import { platformStatistics } from './platformStatistics'; // File doesn't exist yet
import { userAchievements } from './userAchievements';
import { users } from '../user/users';
export const achievementsRelations = relations(achievements, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [achievements.createdBy],
		references: [users.id]
	})
}));
