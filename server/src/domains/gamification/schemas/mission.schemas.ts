import { z } from 'zod';

// Progress update schema
export const ProgressUpdateSchema = z.object({
	increment: z.number().int().positive().default(1)
});

// Event mission creation
export const CreateEventMissionSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().min(1).max(255),
	action: z.string().min(1).max(100),
	target: z.number().int().positive(),
	rewards: z.object({
		xp: z.number().int().min(0).optional(),
		dgt: z.number().int().min(0).optional(),
		badge: z.string().optional()
	}),
	duration: z.object({
		hours: z.number().int().positive().optional(),
		days: z.number().int().positive().optional()
	}).refine(data => data.hours || data.days, {
		message: "Either hours or days must be specified"
	}),
	conditions: z.object({
		forumId: z.string().uuid().optional(),
		timeWindow: z.object({
			start: z.number().int().min(0).max(23),
			end: z.number().int().min(0).max(23)
		}).optional(),
		minWordCount: z.number().int().positive().optional(),
		requiresMission: z.string().uuid().optional(),
		requiresRole: z.string().optional(),
		requiresBadge: z.string().optional(),
		dayOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
		minUserLevel: z.number().int().min(1).optional(),
		maxUserLevel: z.number().int().min(1).optional()
	}).optional(),
	icon: z.string().max(100).optional()
});

// Template creation
export const CreateFromTemplatesSchema = z.object({
	templateIds: z.array(z.string()).min(1)
});

// Admin mission creation (full flexibility)
export const CreateMissionSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().min(1).max(255),
	type: z.enum(['daily', 'weekly', 'milestone', 'event', 'stacking']),
	requiredAction: z.string().min(1).max(100),
	requiredCount: z.number().int().positive().default(1),
	xpReward: z.number().int().min(0),
	dgtReward: z.number().int().min(0).optional(),
	badgeReward: z.string().max(100).optional(),
	icon: z.string().max(100).optional(),
	isDaily: z.boolean().optional(),
	isWeekly: z.boolean().optional(),
	expiresAt: z.string().datetime().optional(),
	isActive: z.boolean().default(true),
	minLevel: z.number().int().min(1).default(1),
	sortOrder: z.number().int().default(0),
	conditions: z.record(z.unknown()).optional(),
	// For stacking missions
	stages: z.array(z.object({
		count: z.number().int().positive(),
		reward: z.object({
			xp: z.number().int().min(0).optional(),
			dgt: z.number().int().min(0).optional(),
			badge: z.string().optional()
		})
	})).optional()
});

// Update mission schema
export const UpdateMissionSchema = CreateMissionSchema.partial();

// Mission action tracking (for webhooks/events)
export const TrackActionSchema = z.object({
	userId: z.string().uuid(),
	action: z.string(),
	metadata: z.record(z.unknown()).optional()
});

// Bulk mission operations
export const BulkMissionOperationSchema = z.object({
	missionIds: z.array(z.string().uuid()),
	operation: z.enum(['activate', 'deactivate', 'delete', 'reset'])
});

// Mission pool configuration
export const MissionPoolConfigSchema = z.object({
	daily: z.object({
		poolSize: z.number().int().min(1).default(5),
		randomSelection: z.boolean().default(true),
		missionIds: z.array(z.string().uuid()).optional()
	}),
	weekly: z.object({
		poolSize: z.number().int().min(1).default(3),
		randomSelection: z.boolean().default(false),
		missionIds: z.array(z.string().uuid()).optional()
	})
});