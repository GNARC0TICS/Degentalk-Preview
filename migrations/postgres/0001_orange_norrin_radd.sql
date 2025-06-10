ALTER TABLE "admin_audit_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "airdrop_records" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "airdrop_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "beta_feature_flags" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "thread_drafts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "thread_feature_permissions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admin_audit_logs" CASCADE;--> statement-breakpoint
DROP TABLE "airdrop_records" CASCADE;--> statement-breakpoint
DROP TABLE "airdrop_settings" CASCADE;--> statement-breakpoint
DROP TABLE "beta_feature_flags" CASCADE;--> statement-breakpoint
DROP TABLE "chat_messages" CASCADE;--> statement-breakpoint
DROP TABLE "thread_drafts" CASCADE;--> statement-breakpoint
DROP TABLE "thread_feature_permissions" CASCADE;--> statement-breakpoint
ALTER TABLE "media_library" DROP CONSTRAINT "media_library_filename_unique";--> statement-breakpoint
ALTER TABLE "threads" DROP CONSTRAINT "threads_solving_post_id_posts_post_id_fk";
--> statement-breakpoint
ALTER TABLE "user_inventory" DROP CONSTRAINT "user_inventory_transaction_id_inventory_transactions_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_avatar_frame_id_avatar_frames_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_group_id_user_groups_group_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_active_title_id_titles_title_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_active_badge_id_badges_badge_id_fk";
--> statement-breakpoint
DROP INDEX "idx_users_referrer_id";--> statement-breakpoint
DROP INDEX "idx_users_group_id";--> statement-breakpoint
ALTER TABLE "announcements" ALTER COLUMN "visible_to" SET DEFAULT '["all"]';--> statement-breakpoint
ALTER TABLE "rate_limits" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "rate_limits" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "wallet_balance_usdt" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "details" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "access_code" varchar(100);--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "type" text DEFAULT 'forum' NOT NULL;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "is_zone";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "canonical";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "min_group_id_required";--> statement-breakpoint
ALTER TABLE "user_inventory" DROP COLUMN "transaction_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "avatar_frame_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "group_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "active_title_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "active_badge_id";