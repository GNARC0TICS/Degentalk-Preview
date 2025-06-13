import { z } from 'zod';

/**
 * Configuration for forum zones including access roles and multipliers.
 */

// -------------------- Zone Definition --------------------
export const ForumZoneSchema = z.object({
  /** Unique zone id */
  id: z.string(),
  /** Display title */
  title: z.string(),
  /** Roles allowed to access */
  accessRoles: z.array(z.string()),
  /** XP boost multiplier */
  xpBoost: z.number().optional(),
  /** Allow posting */
  allowPosting: z.boolean().default(true),
  /** Reward multiplier for activities */
  rewardMultiplier: z.number().optional(),
});

export type ForumZone = z.infer<typeof ForumZoneSchema>;

// -------------------- Main Zones Config --------------------
export const forumZones: ForumZone[] = [
  {
    id: 'the-pit',
    title: 'The Pit',
    accessRoles: ['user', 'mod'],
    xpBoost: 1.5,
    allowPosting: true,
    rewardMultiplier: 1.2,
  },
]; 