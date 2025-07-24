/**
 * Gamification Components Export
 *
 * Central export file for all gamification UI components
 */

// Core Components
export { LevelDisplay, LevelBadge } from './level-display';
export { ProgressionCard } from './progression-card';
export { ProfileGamificationWidget } from './profile-gamification-widget';

// Achievement Components
export { AchievementCard } from './achievement-card';
export { AchievementGrid } from './achievement-grid';
export { AchievementUnlockModal } from './achievement-unlock-modal';

// Mission Components
export { MissionCard } from './mission-card';
export { MissionDashboard } from './mission-dashboard';

// Leaderboard Components
export { Leaderboard } from './leaderboard';

// Modal Components
export { LevelUpModal } from './level-up-modal';

// Re-export types for convenience
export type {
	LevelInfo,
	UserProgression,
	Achievement,
	UserAchievement,
	Mission,
	MissionProgress,
	LeaderboardEntry,
	GamificationStats,
	GamificationDashboard
} from '@app/features/gamification/services/gamification-api.service';
