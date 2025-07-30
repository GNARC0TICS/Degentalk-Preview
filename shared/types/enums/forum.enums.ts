/**
 * Forum Status Enums
 * Shared across client/server/db layers
 */

export enum ThreadStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  SHADOWBANNED = 'shadowbanned',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  SHADOWBANNED = 'shadowbanned',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export type ThreadStatusType = keyof typeof ThreadStatus;
export type PostStatusType = keyof typeof PostStatus;