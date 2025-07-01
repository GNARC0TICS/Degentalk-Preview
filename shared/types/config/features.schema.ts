import { z } from 'zod';

/**
 * Feature Flags & Access Control Configuration Schemas
 * 
 * Runtime validation for feature gates, access control, and permissions.
 * Enables dynamic feature rollout and granular permission management.
 */

// Feature flag rollout strategies
export const RolloutStrategySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('all'),
    enabled: z.boolean()
  }),
  z.object({
    type: z.literal('percentage'),
    percentage: z.number().min(0).max(100),
    seed: z.string().optional() // for consistent rollout
  }),
  z.object({
    type: z.literal('whitelist'),
    userIds: z.array(z.string().uuid()),
    roles: z.array(z.string()).optional()
  }),
  z.object({
    type: z.literal('level_based'),
    minLevel: z.number().nonnegative(),
    maxLevel: z.number().positive().optional()
  }),
  z.object({
    type: z.literal('date_based'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional()
  }),
  z.object({
    type: z.literal('combined'),
    strategies: z.array(z.lazy(() => RolloutStrategySchema)),
    operator: z.enum(['AND', 'OR']).default('AND')
  })
]);

// Individual feature flag configuration
export const FeatureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['core', 'experimental', 'beta', 'premium', 'admin']),
  rollout: RolloutStrategySchema,
  dependencies: z.array(z.string()).default([]),
  override: z.object({
    enabled: z.boolean().optional(),
    environments: z.record(z.boolean()).optional()
  }).optional(),
  metadata: z.object({
    owner: z.string().optional(),
    jiraTicket: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  }).optional(),
  metrics: z.object({
    track: z.boolean().default(true),
    events: z.array(z.string()).optional()
  }).optional()
});

// Permission definition
export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  resource: z.string(),
  action: z.enum(['create', 'read', 'update', 'delete', 'execute', '*']),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in']),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number(), z.boolean()]))])
  })).optional()
});

// Role definition
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  level: z.number().nonnegative(),
  permissions: z.array(z.string()), // permission IDs
  inherits: z.array(z.string()).optional(), // inherit from other roles
  features: z.array(z.string()).optional(), // feature flag IDs
  limits: z.object({
    postsPerDay: z.number().positive().optional(),
    threadsPerDay: z.number().positive().optional(),
    tipsPerDay: z.number().positive().optional(),
    uploadSizeMB: z.number().positive().optional(),
    apiRequestsPerHour: z.number().positive().optional()
  }).optional(),
  cosmetics: z.object({
    nameColor: z.string().optional(),
    badgeIcon: z.string().optional(),
    specialEffects: z.array(z.string()).optional()
  }).optional()
});

// Access control rules
export const AccessRuleSchema = z.object({
  id: z.string(),
  resource: z.string(),
  conditions: z.array(z.object({
    type: z.enum(['level', 'role', 'permission', 'custom']),
    operator: z.enum(['gte', 'lte', 'equals', 'includes', 'excludes']),
    value: z.union([z.string(), z.number(), z.array(z.string())])
  })),
  action: z.enum(['allow', 'deny']),
  priority: z.number().default(0),
  message: z.string().optional()
});

// Forum-specific access configuration
export const ForumAccessSchema = z.object({
  forumId: z.string(),
  view: z.object({
    public: z.boolean().default(true),
    minLevel: z.number().nonnegative().default(0),
    requiredRoles: z.array(z.string()).default([]),
    blockedRoles: z.array(z.string()).default([])
  }),
  post: z.object({
    enabled: z.boolean().default(true),
    minLevel: z.number().nonnegative().default(1),
    requiredRoles: z.array(z.string()).default([]),
    cooldown: z.number().nonnegative().default(60),
    requireEmailVerified: z.boolean().default(false)
  }),
  moderate: z.object({
    requiredRoles: z.array(z.string()).default(['moderator', 'admin']),
    actions: z.array(z.enum(['pin', 'lock', 'delete', 'move', 'edit'])).default(['pin', 'lock', 'delete'])
  })
});

// Main features configuration schema
export const FeaturesConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  
  flags: z.array(FeatureFlagSchema).default([]),
  
  permissions: z.array(PermissionSchema).default([]),
  
  roles: z.array(RoleSchema).default([
    {
      id: 'user',
      name: 'User',
      description: 'Standard user role',
      level: 0,
      permissions: ['forum.read', 'forum.post', 'wallet.view'],
      limits: {
        postsPerDay: 50,
        threadsPerDay: 5,
        tipsPerDay: 20
      }
    },
    {
      id: 'vip',
      name: 'VIP',
      description: 'Premium user role',
      level: 10,
      permissions: ['forum.read', 'forum.post', 'wallet.view', 'shop.discount'],
      inherits: ['user'],
      limits: {
        postsPerDay: 100,
        threadsPerDay: 10,
        tipsPerDay: 50
      },
      cosmetics: {
        nameColor: '#f59e0b',
        badgeIcon: '⭐'
      }
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Forum moderator',
      level: 50,
      permissions: ['forum.*', 'user.warn', 'user.mute'],
      inherits: ['vip'],
      cosmetics: {
        nameColor: '#10b981',
        badgeIcon: '🛡️'
      }
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      level: 100,
      permissions: ['*'],
      cosmetics: {
        nameColor: '#ef4444',
        badgeIcon: '👑',
        specialEffects: ['glow', 'rainbow']
      }
    }
  ]),
  
  access: z.object({
    rules: z.array(AccessRuleSchema).default([]),
    forums: z.array(ForumAccessSchema).default([]),
    defaultPolicy: z.enum(['allow', 'deny']).default('allow')
  }),
  
  levelGates: z.object({
    withdrawals: z.number().nonnegative().default(5),
    trading: z.number().nonnegative().default(10),
    advancedWallet: z.number().nonnegative().default(15),
    createThreads: z.number().nonnegative().default(2),
    uploadMedia: z.number().nonnegative().default(3),
    customProfile: z.number().nonnegative().default(5),
    privateMessages: z.number().nonnegative().default(3)
  }),
  
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    rules: z.array(z.object({
      resource: z.string(),
      window: z.number().positive(), // seconds
      limit: z.number().positive(),
      keyBy: z.enum(['ip', 'userId', 'combined']).default('userId'),
      skipRoles: z.array(z.string()).default(['admin']),
      message: z.string().optional()
    })).default([
      { resource: 'api/*', window: 60, limit: 60 },
      { resource: 'auth/login', window: 300, limit: 5, keyBy: 'ip' },
      { resource: 'forum/post', window: 60, limit: 5 },
      { resource: 'wallet/withdraw', window: 86400, limit: 3 }
    ])
  }),
  
  experimental: z.object({
    enabled: z.boolean().default(false),
    features: z.array(z.string()).default([]),
    allowList: z.array(z.string().uuid()).default([]),
    telemetry: z.boolean().default(true)
  })
});

// Type inference
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type RolloutStrategy = z.infer<typeof RolloutStrategySchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type AccessRule = z.infer<typeof AccessRuleSchema>;
export type ForumAccess = z.infer<typeof ForumAccessSchema>;

// Validation helpers
export function validateFeaturesConfig(config: unknown): FeaturesConfig {
  return FeaturesConfigSchema.parse(config);
}

export function validatePartialFeaturesConfig(config: unknown): Partial<FeaturesConfig> {
  return FeaturesConfigSchema.partial().parse(config);
}

// Feature flag evaluation helper
export function evaluateFeatureFlag(
  flag: FeatureFlag,
  context: {
    userId?: string;
    userLevel?: number;
    userRole?: string;
    timestamp?: Date;
  }
): boolean {
  const { rollout } = flag;
  
  switch (rollout.type) {
    case 'all':
      return rollout.enabled;
    
    case 'percentage':
      // Implement consistent hashing based on userId
      return false; // Placeholder
    
    case 'whitelist':
      return context.userId ? rollout.userIds.includes(context.userId) : false;
    
    case 'level_based':
      return context.userLevel ? context.userLevel >= rollout.minLevel : false;
    
    case 'date_based':
      const now = context.timestamp || new Date();
      const start = new Date(rollout.startDate);
      const end = rollout.endDate ? new Date(rollout.endDate) : null;
      return now >= start && (!end || now <= end);
    
    case 'combined':
      const results = rollout.strategies.map(s => evaluateFeatureFlag({ ...flag, rollout: s }, context));
      return rollout.operator === 'AND' ? results.every(Boolean) : results.some(Boolean);
    
    default:
      return false;
  }
}