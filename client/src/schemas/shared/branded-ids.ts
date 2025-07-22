import { z } from 'zod';
import type { 
  UserId, 
  ForumId, 
  ThreadId, 
  PostId, 
  CategoryId,
  ItemId,
  TransactionId,
  WalletId,
  MissionId,
  BadgeId,
  FrameId,
  TitleId,
  AchievementId
} from '@shared/types/ids';

/**
 * Branded ID Schema Helpers
 * 
 * These helpers create Zod schemas that properly validate branded IDs
 * while maintaining type safety
 */

export const UserIdSchema = z.string().transform((val) => val as UserId);
export const ForumIdSchema = z.string().transform((val) => val as ForumId);
export const ThreadIdSchema = z.string().transform((val) => val as ThreadId);
export const PostIdSchema = z.string().transform((val) => val as PostId);
export const CategoryIdSchema = z.string().transform((val) => val as CategoryId);
export const ItemIdSchema = z.string().transform((val) => val as ItemId);
export const TransactionIdSchema = z.string().transform((val) => val as TransactionId);
export const WalletIdSchema = z.string().transform((val) => val as WalletId);
export const MissionIdSchema = z.string().transform((val) => val as MissionId);
export const BadgeIdSchema = z.string().transform((val) => val as BadgeId);
export const FrameIdSchema = z.string().transform((val) => val as FrameId);
export const TitleIdSchema = z.string().transform((val) => val as TitleId);
export const AchievementIdSchema = z.string().transform((val) => val as AchievementId);

// Optional versions
export const OptionalUserIdSchema = z.string().transform((val) => val as UserId).optional();
export const OptionalFrameIdSchema = z.string().transform((val) => val as FrameId).optional();
export const OptionalWalletIdSchema = z.string().transform((val) => val as WalletId).optional();

// Nullable versions
export const NullableFrameIdSchema = z.string().transform((val) => val as FrameId).nullable();
export const NullableUserIdSchema = z.string().transform((val) => val as UserId).nullable();

// Nullable and optional versions
export const NullableOptionalFrameIdSchema = z.union([
  z.string().transform((val) => val as FrameId),
  z.null(),
  z.undefined()
]);