import { z } from 'zod';

export const ThreadRulesSchema = z.object({
  allowUserPosts: z.boolean().default(true),
  requireDGT: z.boolean().default(false),
  allowPolls: z.boolean().default(true),
  unlockedStyling: z.boolean().default(false),
});

export const AccessControlSchema = z.object({
  canPost: z.array(z.string()).default([]), // Array of role names/IDs
  canReply: z.array(z.string()).default([]),
  canView: z.array(z.string()).default(['all']),
});

export const SEOSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

export const ForumStatsSchema = z.object({
  threadCount: z.number().int().nonnegative().optional().default(0),
  postCount: z.number().int().nonnegative().optional().default(0),
  activeUsersCount: z.number().int().nonnegative().optional().default(0),
});

export const ForumCategorySharedSchema = z.object({
  // Fields from db/schema/forum/categories.ts
  id: z.number().int().positive(), // category_id in DB
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  parentId: z.number().int().positive().nullable().optional(),
  type: z.string().default('forum'), // Existing field: 'zone', 'category', 'forum'
  position: z.number().int().default(0),
  isVip: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  minXp: z.number().int().default(0),
  color: z.string().default('gray'),
  icon: z.string().default('hash'),
  colorTheme: z.string().nullable().optional(),
  isHidden: z.boolean().default(false),
  isZone: z.boolean().default(false),
  canonical: z.boolean().default(false),
  minGroupIdRequired: z.number().int().positive().nullable().optional(),
  pluginData: z.record(z.string(), z.any()).optional().default({}), // Assuming pluginData is a generic JSON object
  createdAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()).optional(),
  updatedAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()).optional(),

  // New fields from the plan, matching drizzle schema
  forumType: z.enum(['primary', 'general', 'merged', 'deprecated']).default('general'),
  slugOverride: z.string().nullable().optional(),
  components: z.array(z.string()).optional().default([]),
  threadRules: ThreadRulesSchema.optional().default({ 
    allowUserPosts: true, 
    requireDGT: false, 
    allowPolls: true, 
    unlockedStyling: false 
  }),
  accessControl: AccessControlSchema.optional().default({ 
    canPost: [], 
    canReply: [], 
    canView: ['all'] 
  }),
  displayPriority: z.number().int().default(0),
  seo: SEOSchema.optional().default({}),
  stats: ForumStatsSchema.optional().default({ // Assuming 'stats' is not a direct DB column yet, but a derived/requested field
    threadCount: 0,
    postCount: 0,
    activeUsersCount: 0
  }),
});

export type ThreadRules = z.infer<typeof ThreadRulesSchema>;
export type AccessControl = z.infer<typeof AccessControlSchema>;
export type SEO = z.infer<typeof SEOSchema>;
export type ForumStats = z.infer<typeof ForumStatsSchema>;
export type ForumCategoryShared = z.infer<typeof ForumCategorySharedSchema>;

// Example usage (optional, for testing)
// const exampleCategory: ForumCategoryShared = {
//   id: 1,
//   name: "The Pit",
//   slug: "the-pit",
//   forumType: "primary",
//   components: ["Shoutbox"],
//   threadRules: {
//     allowUserPosts: true,
//     requireDGT: false,
//     allowPolls: true,
//     unlockedStyling: true,
//   },
//   accessControl: {
//     canPost: ["all"],
//     canReply: ["all"],
//     canView: ["all"],
//   },
//   displayPriority: 2,
//   seo: {
//     title: "The Pit - Degentalk",
//     description: "Anything-goes discussion chaos.",
//   },
//   // fill other required fields
//   type: 'zone',
//   position: 0,
//   isVip: false,
//   isLocked: false,
//   minXp: 0,
//   color: 'red',
//   icon: 'flame',
//   isHidden: false,
//   isZone: true,
//   canonical: true,
// };

// console.log(ThreadRulesSchema.parse({})); // Test defaults
// console.log(ForumCategorySharedSchema.passthrough().safeParse(exampleCategory)); 