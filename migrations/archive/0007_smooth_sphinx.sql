ALTER TABLE "user_sessions" RENAME COLUMN "session_id" TO "sid";--> statement-breakpoint
ALTER TABLE "user_sessions" RENAME COLUMN "is_active" TO "sess";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_user_id_users_user_id_fk";
--> statement-breakpoint
DROP INDEX "idx_user_sessions_user_id";--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "min_xp" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "color" varchar(20);--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "icon" varchar(100);--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "is_hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "expire" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "issued_at";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "expires";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "last_activity";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN "user_agent";