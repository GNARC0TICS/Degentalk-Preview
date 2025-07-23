import { z } from 'zod';
import { UserIdSchema, MissionIdSchema } from '../shared/branded-ids';
import type { MissionId, UserId } from '@shared/types/ids';

/**
 * Mission Template Schema
 */
export const MissionTemplateSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum([
    'participation',
    'social',
    'trading',
    'content',
    'engagement',
    'achievement',
    'special_event',
    'vip_exclusive',
    'degen_activities'
  ]),
  type: z.enum([
    'count',
    'threshold',
    'streak',
    'timebound',
    'combo',
    'unique',
    'competitive'
  ]),
  requirements: z.record(z.number()).optional(),
  rewards: z.object({
    xp: z.number().optional(),
    dgt: z.number().optional(),
    clout: z.number().optional(),
    badge: z.string().optional(),
    title: z.string().optional(),
    avatar_frame: z.string().optional(),
    items: z.array(z.string()).optional(),
    special_flair: z.string().optional()
  }),
  weight: z.number(),
  minLevel: z.number(),
  maxLevel: z.number().optional(),
  cooldownHours: z.number().optional(),
  isActive: z.boolean()
});

/**
 * Mission Progress Schema
 */
export const MissionProgressSchema = z.object({
  metrics: z.record(
    z.object({
      current: z.number(),
      target: z.number(),
      percentage: z.number()
    })
  ),
  isComplete: z.boolean(),
  isClaimed: z.boolean()
});

/**
 * Mission Schema (with progress)
 */
export const MissionSchema = z.object({
  id: MissionIdSchema,
  template: MissionTemplateSchema,
  userId: UserIdSchema,
  periodType: z.enum(['daily', 'weekly', 'monthly', 'special', 'perpetual']),
  periodStart: z.string(),
  periodEnd: z.string(),
  assignedAt: z.string(),
  completedAt: z.string().optional(),
  claimedAt: z.string().optional(),
  isFeatured: z.boolean(),
  progress: MissionProgressSchema.optional(),
  // Helper properties
  isComplete: z.boolean().optional(),
  isClaimed: z.boolean().optional()
});

export type Mission = z.infer<typeof MissionSchema>;

/**
 * Mission Streak Schema
 * Handles both API property names and component aliases
 */
export const MissionStreakSchema = z.object({
  userId: UserIdSchema,
  streakType: z.enum(['daily', 'weekly']),
  // Primary properties (from API)
  current: z.number().optional(),
  best: z.number().optional(),
  // Alternative names (some APIs use these)
  currentStreak: z.number().optional(),
  bestStreak: z.number().optional(),
  lastCompleted: z.string().nullable(),
  streakBrokenAt: z.string().optional()
}).transform(data => {
  // Normalize to always have both sets of properties
  return {
    ...data,
    current: data.current ?? data.currentStreak ?? 0,
    best: data.best ?? data.bestStreak ?? 0,
    currentStreak: data.currentStreak ?? data.current ?? 0,
    bestStreak: data.bestStreak ?? data.best ?? 0
  };
});

export type MissionStreak = z.infer<typeof MissionStreakSchema>;

/**
 * Mission Stats Schema
 */
export const MissionStatsSchema = z.object({
  totalCompleted: z.number(),
  totalXpEarned: z.number(),
  totalDgtEarned: z.number(),
  completionRate: z.number(),
  favoriteCategory: z.string(),
  degenScore: z.number().optional(),
  rektCount: z.number().optional(),
  diamondHandsScore: z.number().optional()
});

export type MissionStats = z.infer<typeof MissionStatsSchema>;

/**
 * Mission API Responses
 */
export const MissionsResponseSchema = z.object({
  daily: z.array(MissionSchema),
  weekly: z.array(MissionSchema),
  special: z.array(MissionSchema),
  vip: z.array(MissionSchema).optional()
});

export type MissionsResponse = z.infer<typeof MissionsResponseSchema>;

export const MissionStreaksResponseSchema = z.object({
  streaks: z.array(MissionStreakSchema)
});

export const MissionStatsResponseSchema = z.object({
  stats: MissionStatsSchema
});

export const ClaimMissionRewardResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    xp: z.number().optional(),
    dgt: z.number().optional(),
    badge: z.string().optional()
  }),
  message: z.string()
});