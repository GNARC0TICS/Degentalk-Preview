/**
 * Reputation System Type Definitions
 * 
 * Types for the reputation (influence/reputation) system including
 * achievements, settings, and user reputation data
 */

import type { AchievementId, UserId } from '../ids.js';

/**
 * Reputation achievement definition
 */
export interface ReputationAchievement {
  id: AchievementId;
  achievementKey: string;
  name: string;
  description?: string;
  reputationReward: number;
  criteriaType?: string;
  criteriaValue?: number;
  enabled: boolean;
  iconUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * User's reputation achievement status
 */
export interface UserReputationAchievement {
  userId: UserId;
  achievementId: AchievementId;
  achievement?: ReputationAchievement;
  earnedAt: string;
  reputationAwarded: number;
}

/**
 * Reputation system settings
 */
export interface ReputationSettings {
  baseReputationPerLevel: number;
  maxReputationFromLevels: number;
  reputationDecayEnabled: boolean;
  reputationDecayDays?: number;
  reputationDecayPercentage?: number;
  achievementsEnabled: boolean;
  displayReputationInProfile: boolean;
  displayReputationInPosts: boolean;
}

/**
 * User reputation summary
 */
export interface UserReputationSummary {
  userId: UserId;
  totalReputation: number;
  levelReputation: number;
  achievementReputation: number;
  bonusReputation: number;
  rank?: number;
  percentile?: number;
  achievements: UserReputationAchievement[];
}