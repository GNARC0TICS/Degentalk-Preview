CREATE TYPE "public"."content_visibility_status" AS ENUM('draft', 'published', 'hidden', 'shadowbanned', 'archived', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'system', 'private_message', 'achievement', 'transaction', 'post_mention', 'thread_reply', 'reaction', 'quest_complete', 'badge_awarded');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'helpful');--> statement-breakpoint
CREATE TYPE "public"."shoutbox_position" AS ENUM('sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'pending', 'resolved', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'mod', 'admin');--> statement-breakpoint
CREATE TYPE "public"."vault_status" AS ENUM('locked', 'unlocked', 'pending_unlock');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "polls" (
	"poll_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" integer NOT NULL,
	"question" text NOT NULL,
	"allows_multiple_choices" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_options" (
	"option_id" serial PRIMARY KEY NOT NULL,
	"poll_id" integer NOT NULL,
	"option_text" text NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"vote_id" serial PRIMARY KEY NOT NULL,
	"option_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_abuse_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"strike_count" integer DEFAULT 0 NOT NULL,
	"last_strike_at" timestamp,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cooldown_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action_key" varchar(100) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stickers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "stickers" CASCADE;--> statement-breakpoint
ALTER TABLE "forum_rules" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "forum_rules" ALTER COLUMN "status" SET DEFAULT 'published'::text;--> statement-breakpoint
DROP TYPE "public"."content_edit_status";--> statement-breakpoint
CREATE TYPE "public"."content_edit_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
ALTER TABLE "forum_rules" ALTER COLUMN "status" SET DEFAULT 'published'::"public"."content_edit_status";--> statement-breakpoint
ALTER TABLE "forum_rules" ALTER COLUMN "status" SET DATA TYPE "public"."content_edit_status" USING "status"::"public"."content_edit_status";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transaction_type";--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('TIP', 'DEPOSIT', 'WITHDRAWAL', 'ADMIN_ADJUST', 'RAIN', 'AIRDROP', 'SHOP_PURCHASE', 'REWARD', 'REFERRAL_BONUS', 'FEE', 'VAULT_LOCK', 'VAULT_UNLOCK');--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "public"."transaction_type" USING "type"::"public"."transaction_type";--> statement-breakpoint
ALTER TABLE "custom_emojis" ALTER COLUMN "url" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "visibility_status" "content_visibility_status" DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "moderation_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "xp_multiplier" real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "reward_rules" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "visibility_status" "content_visibility_status" DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "moderation_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "depth" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_polls_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("poll_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("option_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_abuse_flags" ADD CONSTRAINT "user_abuse_flags_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooldown_state" ADD CONSTRAINT "cooldown_state_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "unlocked_emojis";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "unlocked_stickers";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "equipped_flair_emoji";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "forum_type";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "slug_override";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "components";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "thread_rules";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "access_control";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "display_priority";--> statement-breakpoint
ALTER TABLE "forum_categories" DROP COLUMN "seo";