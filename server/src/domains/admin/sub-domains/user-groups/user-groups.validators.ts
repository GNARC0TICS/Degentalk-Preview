/**
 * Admin User Groups Validators
 * 
 * Zod validation schemas for user group management.
 */

import { z } from 'zod';

export const UserGroupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().optional().nullable(), // Allow null for optional fields
  color: z.string().regex(/^#([0-9A-F]{3,6})$/i, "Must be a valid hex color (e.g., #RRGGBB or #RGB)").default("#3366ff").optional(),
  icon: z.string().optional().nullable(),
  badge: z.string().optional().nullable(),
  isStaff: z.boolean().default(false).optional(),
  staffPriority: z.coerce.number().int().min(0).default(0).optional(),
  isDefault: z.boolean().default(false).optional(),
  isModerator: z.boolean().default(false).optional(),
  isAdmin: z.boolean().default(false).optional(),
  canManageUsers: z.boolean().default(false).optional(),
  canManageContent: z.boolean().default(false).optional(),
  canManageSettings: z.boolean().default(false).optional(),
  // permissions: z.record(z.boolean()).optional(), // For more granular JSONB permissions if needed later
});

// Schema for listing users in a group (pagination)
export const ListGroupUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type UserGroupInput = z.infer<typeof UserGroupSchema>;
export type ListGroupUsersQueryInput = z.infer<typeof ListGroupUsersQuerySchema>;
