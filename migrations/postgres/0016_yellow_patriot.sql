CREATE TYPE "public"."moderator_note_type" AS ENUM('thread', 'post', 'user');--> statement-breakpoint
CREATE TYPE "public"."mention_type" AS ENUM('thread', 'post', 'shoutbox', 'whisper');--> statement-breakpoint
CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TABLE "animation_packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"rarity" varchar(20) DEFAULT 'cope' NOT NULL,
	"price_dgt" double precision,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "animation_packs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "animation_pack_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"media_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderator_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "moderator_note_type" NOT NULL,
	"item_id" varchar(255) NOT NULL,
	"note" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentioned_user_id" uuid NOT NULL,
	"mentioning_user_id" uuid NOT NULL,
	"type" "mention_type" NOT NULL,
	"thread_id" uuid,
	"post_id" uuid,
	"message_id" varchar(255),
	"mention_text" varchar(100) NOT NULL,
	"context" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_notified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_mention_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"allow_thread_mentions" boolean DEFAULT true NOT NULL,
	"allow_post_mentions" boolean DEFAULT true NOT NULL,
	"allow_shoutbox_mentions" boolean DEFAULT true NOT NULL,
	"allow_whisper_mentions" boolean DEFAULT true NOT NULL,
	"only_friends_mention" boolean DEFAULT false NOT NULL,
	"only_followers_mention" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"message" text,
	"is_pending" boolean DEFAULT true NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"is_rejected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_follow_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"allow_all_follows" boolean DEFAULT true NOT NULL,
	"only_friends_can_follow" boolean DEFAULT false NOT NULL,
	"require_follow_approval" boolean DEFAULT false NOT NULL,
	"hide_follower_count" boolean DEFAULT false NOT NULL,
	"hide_following_count" boolean DEFAULT false NOT NULL,
	"hide_followers_list" boolean DEFAULT false NOT NULL,
	"hide_following_list" boolean DEFAULT false NOT NULL,
	"notify_on_new_follower" boolean DEFAULT true NOT NULL,
	"email_on_new_follower" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" uuid NOT NULL,
	"followed_id" uuid NOT NULL,
	"notify_on_posts" boolean DEFAULT true NOT NULL,
	"notify_on_threads" boolean DEFAULT true NOT NULL,
	"notify_on_trades" boolean DEFAULT false NOT NULL,
	"notify_on_large_stakes" boolean DEFAULT true NOT NULL,
	"min_stake_notification" integer DEFAULT 1000,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend_group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" uuid NOT NULL,
	"friendship_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#3b82f6',
	"is_default" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" uuid NOT NULL,
	"addressee_id" uuid NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"request_message" text,
	"allow_whispers" boolean DEFAULT true NOT NULL,
	"allow_profile_view" boolean DEFAULT true NOT NULL,
	"allow_activity_view" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_friend_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"allow_all_friend_requests" boolean DEFAULT true NOT NULL,
	"only_mutuals_can_request" boolean DEFAULT false NOT NULL,
	"require_min_level" boolean DEFAULT false NOT NULL,
	"min_level_required" integer DEFAULT 1,
	"auto_accept_from_followers" boolean DEFAULT false NOT NULL,
	"auto_accept_from_whales" boolean DEFAULT false NOT NULL,
	"hide_friends_list" boolean DEFAULT false NOT NULL,
	"hide_friend_count" boolean DEFAULT false NOT NULL,
	"show_online_status" boolean DEFAULT true NOT NULL,
	"notify_on_friend_request" boolean DEFAULT true NOT NULL,
	"notify_on_friend_accept" boolean DEFAULT true NOT NULL,
	"email_on_friend_request" boolean DEFAULT false NOT NULL,
	"default_allow_whispers" boolean DEFAULT true NOT NULL,
	"default_allow_profile_view" boolean DEFAULT true NOT NULL,
	"default_allow_activity_view" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "emoji" varchar(10);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "font_family" varchar(100);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "font_size" integer;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "font_weight" varchar(20);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "text_color" varchar(25);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "background_color" varchar(25);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "border_color" varchar(25);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "border_width" integer;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "border_style" varchar(20);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "border_radius" integer;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "glow_color" varchar(25);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "glow_intensity" integer;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "shadow_color" varchar(25);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "shadow_blur" integer;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "shadow_offset_x" integer;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "shadow_offset_y" integer;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "gradient_start" varchar(25);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "gradient_end" varchar(25);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "gradient_direction" varchar(30);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "animation" varchar(20);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "animation_duration" double precision;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "role_id" varchar(50);--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "is_shop_item" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "is_unlockable" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "unlock_conditions" jsonb;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "shop_price" double precision;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "shop_currency" varchar(10);--> statement-breakpoint
ALTER TABLE "animation_pack_items" ADD CONSTRAINT "animation_pack_items_pack_id_animation_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."animation_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animation_pack_items" ADD CONSTRAINT "animation_pack_items_media_id_media_library_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_library"("media_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_notes" ADD CONSTRAINT "moderator_notes_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_mentioned_user_id_users_user_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_mentioning_user_id_users_user_id_fk" FOREIGN KEY ("mentioning_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mention_preferences" ADD CONSTRAINT "user_mention_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_requests" ADD CONSTRAINT "follow_requests_requester_id_users_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_requests" ADD CONSTRAINT "follow_requests_target_id_users_user_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follow_preferences" ADD CONSTRAINT "user_follow_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followed_id_users_user_id_fk" FOREIGN KEY ("followed_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_group_members" ADD CONSTRAINT "friend_group_members_group_id_friend_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."friend_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_group_members" ADD CONSTRAINT "friend_group_members_friendship_id_friendships_id_fk" FOREIGN KEY ("friendship_id") REFERENCES "public"."friendships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_groups" ADD CONSTRAINT "friend_groups_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_user_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_friend_preferences" ADD CONSTRAINT "user_friend_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;