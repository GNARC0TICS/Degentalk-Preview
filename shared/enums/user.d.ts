export declare const userRoleEnum: import("drizzle-orm/pg-core").PgEnum<["user", "super_admin", "admin", "moderator", "dev", "shoutbox_mod", "content_mod", "market_mod"]>;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
