/**
 * Gamification Domain Entry Point
 *
 * Exports all gamification services, controllers, and routes
 * for the comprehensive leveling and achievement system.
 */

// Services
export { LevelingService, levelingService } from './services/leveling.service';
export { AchievementService, achievementService } from './services/achievement.service';
export { TitlesService } from './titles.service';
export { ReputationService } from './services/reputationService';

// Controllers
export { LevelingController, levelingController } from './leveling.controller';
export { AchievementController, achievementController } from './achievement.controller';

// Routes
export { default as levelingRoutes } from './leveling.routes';
export { default as achievementRoutes } from './achievement.routes';
export { default as titlesRoutes } from './titles.routes';
export { default as xpAdminRoutes } from './admin/xp.routes';

// Types
export type {
	LevelInfo,
	UserProgression,
	LeaderboardEntry,
	ProgressionAnalytics
} from './leveling.service';

export type {
	AchievementDefinition,
	AchievementRequirement,
	UserAchievementProgress,
	AchievementStats
} from './achievement.service';
