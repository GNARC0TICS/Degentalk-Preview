CREATE TYPE "public"."achievement_rarity" AS ENUM('common', 'rare', 'epic', 'legendary');--> statement-breakpoint
CREATE TABLE "profile_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_user_id" uuid NOT NULL,
	"viewer_user_id" uuid,
	"session_duration" integer NOT NULL,
	"tab_switches" integer DEFAULT 0 NOT NULL,
	"actions_performed" integer DEFAULT 0 NOT NULL,
	"scroll_depth" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"engagement_score" integer DEFAULT 0 NOT NULL,
	"user_agent" text,
	"ip_address" "inet",
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_relationships" RENAME COLUMN "relationship_id" TO "id";--> statement-breakpoint
ALTER TABLE "achievements" RENAME COLUMN "achievement_id" TO "id";--> statement-breakpoint
ALTER TABLE "achievements" RENAME COLUMN "requirement" TO "requirements";--> statement-breakpoint
ALTER TABLE "achievements" RENAME COLUMN "reward_points" TO "reward_dgt";--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "event_type" TO "type";--> statement-breakpoint
ALTER TABLE "achievements" DROP CONSTRAINT "achievements_name_unique";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_achievement_id_achievements_achievement_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_event_log_id_event_logs_id_fk";
--> statement-breakpoint
DROP INDEX "idx_notifications_user_read";--> statement-breakpoint
DROP INDEX "idx_notifications_user_created";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_user_id_achievement_id_pk";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "wallet_pending_withdrawals" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "wallet_pending_withdrawals" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_relationships" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "achievement_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "progress" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dgt_balance" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reputation" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_posts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_threads" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_likes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_tips" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "next_level_xp" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "friend_requests_sent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "friend_requests_received" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_staff" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_moderator" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD COLUMN "target_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD COLUMN "type" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD COLUMN "status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "category" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "rarity" "achievement_rarity" DEFAULT 'common' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "is_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "message" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "metadata" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_analytics" ADD CONSTRAINT "profile_analytics_profile_user_id_users_user_id_fk" FOREIGN KEY ("profile_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_analytics" ADD CONSTRAINT "profile_analytics_viewer_user_id_users_user_id_fk" FOREIGN KEY ("viewer_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_profile_analytics_profile_user" ON "profile_analytics" USING btree ("profile_user_id");--> statement-breakpoint
CREATE INDEX "idx_profile_analytics_viewer" ON "profile_analytics" USING btree ("viewer_user_id");--> statement-breakpoint
CREATE INDEX "idx_profile_analytics_created" ON "profile_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_profile_analytics_engagement" ON "profile_analytics" USING btree ("engagement_score");--> statement-breakpoint
ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_target_user_id_users_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_relationships_user_type" ON "user_relationships" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "idx_user_relationships_target_type" ON "user_relationships" USING btree ("target_user_id","type");--> statement-breakpoint
CREATE INDEX "idx_user_relationships_status" ON "user_relationships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_relationships_created" ON "user_relationships" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_achievements_category" ON "achievements" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_achievements_rarity" ON "achievements" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_user" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_completed" ON "user_achievements" USING btree ("user_id","is_completed");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_unread" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_notifications_created" ON "notifications" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "user_achievements" DROP COLUMN "awarded_at";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "event_log_id";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "body";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "data";--> statement-breakpoint
ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_user_target_type_unique" UNIQUE("user_id","target_user_id","type");--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievement_unique" UNIQUE("user_id","achievement_id");