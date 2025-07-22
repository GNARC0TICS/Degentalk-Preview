/**
 * Clout System Type Definitions
 * 
 * Types for the clout (influence/reputation) system including
 * achievements, settings, and user clout data
 */

import type { AchievementId, UserId } from '../ids.js';

/**
 * Clout achievement definition
 */
export interface CloutAchievement {
  id: AchievementId;
  achievementKey: string;
  name: string;
  description?: string;
  cloutReward: number;
  criteriaType?: string;
  criteriaValue?: number;
  enabled: boolean;
  iconUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * User's clout achievement status
 */
export interface UserCloutAchievement {
  userId: UserId;
  achievementId: AchievementId;
  achievement?: CloutAchievement;
  earnedAt: string;
  cloutAwarded: number;
}

/**
 * Clout system settings
 */
export interface CloutSettings {
  baseCloutPerLevel: number;
  maxCloutFromLevels: number;
  cloutDecayEnabled: boolean;
  cloutDecayDays?: number;
  cloutDecayPercentage?: number;
  achievementsEnabled: boolean;
  displayCloutInProfile: boolean;
  displayCloutInPosts: boolean;
}

/**
 * User clout summary
 */
export interface UserCloutSummary {
  userId: UserId;
  totalClout: number;
  levelClout: number;
  achievementClout: number;
  bonusClout: number;
  rank?: number;
  percentile?: number;
  achievements: UserCloutAchievement[];
}