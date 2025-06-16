CREATE TYPE "public"."event_type" AS ENUM('rain_claimed', 'thread_created', 'post_created', 'cosmetic_unlocked', 'level_up', 'badge_earned', 'tip_sent', 'tip_received', 'xp_earned', 'referral_completed', 'product_purchased', 'mission_completed', 'airdrop_claimed');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'rain_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'level_up';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'tip_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'airdrop_received';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'referral_complete';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'cosmetic_unlocked';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'mission_complete';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "xp_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"xp_gained" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "xp_logs_user_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" "event_type" NOT NULL,
	"related_id" uuid,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_groups" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_groups" CASCADE;--> statement-breakpoint
ALTER TABLE "roles" RENAME COLUMN "role_name" TO "name";--> statement-breakpoint
ALTER TABLE "roles" DROP CONSTRAINT "roles_role_name_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_group_id_user_groups_group_id_fk";
--> statement-breakpoint
ALTER TABLE "feature_permissions" DROP CONSTRAINT "feature_permissions_group_id_user_groups_group_id_fk";
--> statement-breakpoint
ALTER TABLE "forum_categories" DROP CONSTRAINT "forum_categories_min_group_id_required_user_groups_group_id_fk";
--> statement-breakpoint
ALTER TABLE "airdrop_settings" DROP CONSTRAINT "airdrop_settings_target_group_id_user_groups_group_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_rooms" DROP CONSTRAINT "chat_rooms_min_group_id_required_user_groups_group_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" DROP CONSTRAINT "admin_manual_airdrop_logs_group_id_user_groups_group_id_fk";
--> statement-breakpoint
DROP INDEX "idx_threads_parent_forum_slug";--> statement-breakpoint
DROP INDEX "idx_notifications_user_id";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "primary_role_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "x_account_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "x_access_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "x_refresh_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "x_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "x_linked_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status_line" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pinned_post_id" integer;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "slug" varchar(50);--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "rank" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "badge_image" varchar(255);--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "text_color" varchar(25);--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "background_color" varchar(25);--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_staff" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_moderator" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "is_admin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "permissions" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "xp_multiplier" double precision DEFAULT 1;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "plugin_data" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN IF NOT EXISTS "parent_forum_slug" text;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN IF NOT EXISTS "tipping_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN IF NOT EXISTS "xp_multiplier" real DEFAULT 1;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "id" uuid PRIMARY KEY DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "event_type" "notification_type";--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "event_log_id" uuid;--> statement-breakpoint
ALTER TABLE "xp_logs" ADD CONSTRAINT "xp_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_xp_logs_user_date" ON "xp_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_event_logs_user_created" ON "event_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_event_logs_type_created" ON "event_logs" USING btree ("event_type","created_at");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_primary_role_id_roles_role_id_fk" FOREIGN KEY ("primary_role_id") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_pinned_post_id_posts_post_id_fk" FOREIGN KEY ("pinned_post_id") REFERENCES "public"."posts"("post_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_permissions" ADD CONSTRAINT "feature_permissions_group_id_roles_role_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."roles"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD CONSTRAINT "forum_categories_min_group_id_required_roles_role_id_fk" FOREIGN KEY ("min_group_id_required") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airdrop_settings" ADD CONSTRAINT "airdrop_settings_target_group_id_roles_role_id_fk" FOREIGN KEY ("target_group_id") REFERENCES "public"."roles"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_min_group_id_required_roles_role_id_fk" FOREIGN KEY ("min_group_id_required") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_log_id_event_logs_id_fk" FOREIGN KEY ("event_log_id") REFERENCES "public"."event_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ADD CONSTRAINT "admin_manual_airdrop_logs_group_id_roles_role_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN "is_system_role";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "is_zone";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "canonical";--> statement-breakpoint
ALTER TABLE "threads" DROP COLUMN "parent_forum_slug";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "notification_id";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "read_at";--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_slug_unique" UNIQUE("slug");