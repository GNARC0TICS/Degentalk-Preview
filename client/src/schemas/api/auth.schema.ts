import { z } from 'zod';
import { UserIdSchema, NullableOptionalFrameIdSchema } from '../shared/branded-ids';

/**
 * User Schema - matches the User interface from use-auth.tsx
 */
export const UserSchema = z.object({
  id: UserIdSchema,
  username: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
  role: z.enum(['user', 'moderator', 'admin', 'super_admin']),
  walletId: z.string().optional(),
  walletAddress: z.string().optional(),
  createdAt: z.string(),
  level: z.number(),
  xp: z.number(),
  isVerified: z.boolean(),
  bio: z.string().nullable().optional(),
  reputation: z.number().optional(),
  reputation: z.number().optional(),
  website: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  discord: z.string().nullable().optional(),
  pluginData: z.record(z.unknown()).nullable().optional(),
  isActive: z.boolean().optional(),
  signature: z.string().nullable().optional(),
  lastActiveAt: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  dgtBalance: z.number().optional(),
  activeFrameId: NullableOptionalFrameIdSchema,
  avatarFrameId: NullableOptionalFrameIdSchema,
  isBanned: z.boolean(),
  isVIP: z.boolean().optional(),
  isVip: z.boolean().optional(), // Alias for different casing
  
  // Computed properties
  isAdmin: z.boolean(),
  isModerator: z.boolean()
});

export type User = z.infer<typeof UserSchema>;

/**
 * Login Response Schema
 */
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  token: z.string(),
  user: UserSchema,
  message: z.string().optional()
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * Register Response Schema
 */
export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  token: z.string(),
  user: UserSchema,
  message: z.string().optional()
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

/**
 * User Profile Response
 */
export const UserProfileResponseSchema = z.object({
  user: UserSchema,
  stats: z.object({
    posts: z.number(),
    threads: z.number(),
    likes: z.number(),
    following: z.number(),
    followers: z.number()
  }).optional(),
  badges: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      earnedAt: z.string()
    })
  ).optional()
});

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;