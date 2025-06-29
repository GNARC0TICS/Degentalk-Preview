import { pgEnum } from 'drizzle-orm/pg-core';

// Canonical user roles used across the entire platform
export const userRoleEnum = pgEnum('user_role', ['user', 'mod', 'admin']);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
