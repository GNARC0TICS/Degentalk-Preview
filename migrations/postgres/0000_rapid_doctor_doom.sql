CREATE TYPE "public"."content_edit_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'system', 'private_message', 'achievement', 'transaction', 'post_mention', 'thread_reply', 'reaction', 'quest_complete', 'badge_awarded');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'helpful');--> statement-breakpoint
CREATE TYPE "public"."shoutbox_position" AS ENUM('sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'pending', 'resolved', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'confirmed', 'failed', 'reversed', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('TIP', 'DEPOSIT', 'WITHDRAWAL', 'ADMIN_ADJUST', 'RAIN', 'AIRDROP', 'SHOP_PURCHASE', 'REWARD', 'REFERRAL_BONUS', 'FEE', 'VAULT_LOCK', 'VAULT_UNLOCK');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'mod', 'admin');--> statement-breakpoint
CREATE TYPE "public"."vault_status" AS ENUM('locked', 'unlocked', 'pending_unlock');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "achievements" (
	"achievement_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon_url" varchar(255),
	"reward_xp" integer DEFAULT 0 NOT NULL,
	"reward_points" integer DEFAULT 0 NOT NULL,
	"requirement" jsonb DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "activity_feed" (
	"activity_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"activity_data" jsonb DEFAULT '{}' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- CREATE TABLE "admin_audit_logs" (
-- 	"log_id" serial PRIMARY KEY NOT NULL,
-- 	"user_id" integer NOT NULL,
-- 	"action" varchar(100) NOT NULL,
-- 	"entity_type" varchar(50) NOT NULL,
-- 	"entity_id" varchar(100),
-- 	"details" jsonb DEFAULT '{}' NOT NULL,
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"ip_address" varchar(45)
-- );
--> statement-breakpoint
CREATE TABLE "admin_themes" (
	"theme_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"css_vars" jsonb DEFAULT '{}' NOT NULL,
	"custom_css" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	CONSTRAINT "admin_themes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
-- CREATE TABLE "airdrop_records" (
-- 	"id" serial PRIMARY KEY NOT NULL,
-- 	"admin_user_id" integer,
-- 	"title" varchar(255) NOT NULL,
-- 	"description" text,
-- 	"amount" bigint NOT NULL,
-- 	"per_user_amount" bigint NOT NULL,
-- 	"currency" varchar(10) NOT NULL,
-- 	"recipient_count" integer NOT NULL,
-- 	"target" varchar(50),
-- 	"activity_days" integer,
-- 	"threshold" integer,
-- 	"reference" uuid NOT NULL,
-- 	"status" varchar(20) DEFAULT 'pending' NOT NULL,
-- 	"metadata" jsonb,
-- 	"transaction_id" integer,
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"updated_at" timestamp DEFAULT now() NOT NULL,
-- 	CONSTRAINT "airdrop_records_reference_unique" UNIQUE("reference")
-- );
--> statement-breakpoint
-- CREATE TABLE "airdrop_settings" (
-- 	"id" serial PRIMARY KEY NOT NULL,
-- 	"key" varchar(100) NOT NULL,
-- 	"value" text NOT NULL,
-- 	"description" text,
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"updated_at" timestamp DEFAULT now() NOT NULL,
-- 	CONSTRAINT "airdrop_settings_key_unique" UNIQUE("key")
-- );
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"event_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" uuid,
	"event_type" varchar(100) NOT NULL,
	"data" jsonb DEFAULT '{}' NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"announcement_id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"icon" varchar(50),
	"type" varchar(30) DEFAULT 'info',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"priority" integer DEFAULT 0,
	"visible_to" jsonb DEFAULT '["all"]'::jsonb,
	"ticker_mode" boolean DEFAULT true,
	"link" varchar(255),
	"bg_color" varchar(30),
	"text_color" varchar(30)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(100),
	"before" jsonb,
	"after" jsonb,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatar_frames" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"rarity" text DEFAULT 'common',
	"animated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"badge_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon_url" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- CREATE TABLE "beta_feature_flags" (
-- 	"flag_id" serial PRIMARY KEY NOT NULL,
-- 	"name" varchar(100) NOT NULL,
-- 	"enabled" boolean DEFAULT false NOT NULL,
-- 	"description" text,
-- 	"access_code" varchar(100),
-- 	"expires_at" timestamp,
-- 	"created_at" timestamp DEFAULT now() NOT NULL,
-- 	"updated_at" timestamp DEFAULT now() NOT NULL,
-- 	"created_by" integer,
-- 	"updated_by" integer,
-- 	CONSTRAINT "beta_feature_flags_name_unique" UNIQUE("name")
-- );
--> statement-breakpoint
-- CREATE TABLE "chat_messages" (
-- 	"message_id" serial PRIMARY KEY NOT NULL,
-- 	"user_id" integer NOT NULL,
-- 	"message" text NOT NULL,
-- 	"created_at" timestamp DEFAULT now() NOT NULL
-- );
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"room_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_private" boolean DEFAULT false NOT NULL,
	"min_group_id_required" integer,
	"min_xp_required" integer DEFAULT 0,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_moderation_actions" (
	"action_id" serial PRIMARY KEY NOT NULL,
	"moderator_id" integer NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" integer NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"additional_data" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"participant_id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "conversation_user_unique" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"conversation_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255),
	"is_group" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cooldown_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"tip_cooldown_seconds" integer DEFAULT 10 NOT NULL,
	"rain_cooldown_seconds" integer DEFAULT 60 NOT NULL,
	"moderator_bypass_cooldown" boolean DEFAULT true NOT NULL,
	"admin_bypass_cooldown" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_emojis" (
	"emoji_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" varchar(20) DEFAULT 'static' NOT NULL,
	"url" varchar(255) NOT NULL,
	"preview_url" varchar(255),
	"category" varchar(50) DEFAULT 'standard',
	"is_locked" boolean DEFAULT true NOT NULL,
	"unlock_type" varchar(20) DEFAULT 'free',
	"price_dgt" bigint,
	"required_path" varchar(50),
	"required_path_xp" integer,
	"xp_value" integer DEFAULT 0 NOT NULL,
	"clout_value" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "custom_emojis_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "dgt_packages" (
	"package_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"dgt_amount" bigint NOT NULL,
	"usd_price" numeric(10, 2) NOT NULL,
	"discount_percentage" integer,
	"is_featured" boolean DEFAULT false NOT NULL,
	"image_url" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dgt_purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"dgt_amount_requested" bigint NOT NULL,
	"crypto_amount_expected" numeric(18, 8) NOT NULL,
	"crypto_currency_expected" varchar(10) NOT NULL,
	"ccpayment_reference" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "direct_messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "economy_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"flag_id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" integer,
	"is_zone" boolean DEFAULT false NOT NULL,
	"canonical" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_vip" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"min_xp" integer DEFAULT 0 NOT NULL,
	"color" text DEFAULT 'gray' NOT NULL,
	"icon" text DEFAULT 'hash' NOT NULL,
	"color_theme" text,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"min_group_id_required" integer,
	"plugin_data" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_rules" (
	"rule_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"content_html" text,
	"section" varchar(100) DEFAULT 'general' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"status" "content_edit_status" DEFAULT 'published' NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"last_agreed_version_hash" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"transaction_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"currency" varchar(10) NOT NULL,
	"currency_amount" double precision NOT NULL,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard_history" (
	"leaderboard_id" serial PRIMARY KEY NOT NULL,
	"week_start_date" timestamp NOT NULL,
	"week_end_date" timestamp NOT NULL,
	"leaderboard_type" varchar(50) NOT NULL,
	"leaderboard_data" jsonb DEFAULT '[]' NOT NULL,
	"path_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"level" integer PRIMARY KEY NOT NULL,
	"min_xp" bigint DEFAULT 0 NOT NULL,
	"name" varchar(100),
	"reward_dgt" integer DEFAULT 0,
	"reward_title_id" integer,
	"reward_badge_id" integer
);
--> statement-breakpoint
CREATE TABLE "media_library" (
	"media_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" varchar(50) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"path" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"thumbnail_url" varchar(255),
	"is_public" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_reads" (
	"message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_reads_message_id_user_id_pk" PRIMARY KEY("message_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"content" text NOT NULL,
	"attachment_url" varchar(255),
	"attachment_type" varchar(50),
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"system_message_type" varchar(50),
	"editor_state" jsonb
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"required_action" varchar(100) NOT NULL,
	"required_count" integer DEFAULT 1 NOT NULL,
	"xp_reward" integer NOT NULL,
	"dgt_reward" integer,
	"badge_reward" varchar(100),
	"icon" varchar(100),
	"is_daily" boolean DEFAULT true NOT NULL,
	"is_weekly" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"min_level" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"receive_mention_notifications" boolean DEFAULT true NOT NULL,
	"receive_reply_notifications" boolean DEFAULT true NOT NULL,
	"receive_pm_notifications" boolean DEFAULT true NOT NULL,
	"receive_friend_notifications" boolean DEFAULT true NOT NULL,
	"receive_follow_notifications" boolean DEFAULT true NOT NULL,
	"receive_shop_notifications" boolean DEFAULT true NOT NULL,
	"receive_system_notifications" boolean DEFAULT true NOT NULL,
	"receive_email_notifications" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "online_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"room_id" integer,
	"last_active" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "unique_online_user" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" double precision NOT NULL,
	"total" double precision NOT NULL,
	"is_points_used" boolean DEFAULT false NOT NULL,
	"points_used" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"total" double precision DEFAULT 0 NOT NULL,
	"subtotal" double precision DEFAULT 0 NOT NULL,
	"tax" double precision DEFAULT 0,
	"shipping" double precision DEFAULT 0,
	"discount" double precision DEFAULT 0,
	"payment_method" varchar(100),
	"payment_id" varchar(255),
	"billing_address" jsonb DEFAULT '{}',
	"shipping_address" jsonb DEFAULT '{}',
	"customer_notes" text,
	"admin_notes" text,
	"is_points_used" boolean DEFAULT false NOT NULL,
	"points_used" integer DEFAULT 0,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"token_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"ip_requested" varchar(50),
	"ip_used" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"perm_id" serial PRIMARY KEY NOT NULL,
	"perm_name" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "permissions_perm_name_unique" UNIQUE("perm_name")
);
--> statement-breakpoint
CREATE TABLE "platform_statistics" (
	"stat_id" serial PRIMARY KEY NOT NULL,
	"stat_key" varchar(100) NOT NULL,
	"stat_value" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_statistics_stat_key_unique" UNIQUE("stat_key")
);
--> statement-breakpoint
CREATE TABLE "post_drafts" (
	"draft_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" integer,
	"user_id" integer NOT NULL,
	"content" text,
	"editor_state" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"liked_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_post_like" UNIQUE("post_id","liked_by_user_id")
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"reaction_type" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_reactions_user_id_post_id_reaction_type_pk" PRIMARY KEY("user_id","post_id","reaction_type")
);
--> statement-breakpoint
CREATE TABLE "post_tips" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"amount" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"post_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reply_to_post_id" integer,
	"content" text NOT NULL,
	"editor_state" jsonb,
	"like_count" integer DEFAULT 0 NOT NULL,
	"tip_count" integer DEFAULT 0 NOT NULL,
	"total_tips" bigint DEFAULT 0 NOT NULL,
	"is_first_post" boolean DEFAULT false NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" integer,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"edited_by" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"quarantine_data" jsonb,
	"plugin_data" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"image_id" integer,
	"parent_id" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"media_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_media_unique" UNIQUE("product_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"rich_description" text,
	"price" double precision DEFAULT 0 NOT NULL,
	"discount_price" double precision,
	"cost_price" double precision,
	"sku" varchar(100),
	"barcode" varchar(100),
	"stock" integer DEFAULT 0 NOT NULL,
	"weight" double precision,
	"dimensions" jsonb DEFAULT '{}',
	"category_id" integer,
	"featured_image_id" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"plugin_reward" jsonb DEFAULT '{}',
	"is_digital" boolean DEFAULT false NOT NULL,
	"digital_file_id" integer,
	"points_price" integer,
	"published_at" timestamp,
	"available_from" timestamp,
	"available_until" timestamp,
	"stock_limit" integer,
	"featured_until" timestamp,
	"promotion_label" varchar(100),
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rain_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'DGT' NOT NULL,
	"recipient_count" integer NOT NULL,
	"transaction_id" integer,
	"source" varchar(50) DEFAULT 'shoutbox',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "rain_settings" (
	"setting_id" serial PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"min_amount_dgt" double precision DEFAULT 10 NOT NULL,
	"min_amount_usdt" double precision DEFAULT 1 NOT NULL,
	"max_recipients" integer DEFAULT 15 NOT NULL,
	"cooldown_seconds" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"endpoint" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reported_content" (
	"report_id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" integer NOT NULL,
	"reason" varchar(100) NOT NULL,
	"details" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" integer,
	"resolution_notes" text
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"perm_id" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"granted_by" integer,
	CONSTRAINT "role_permissions_role_id_perm_id_pk" PRIMARY KEY("role_id","perm_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"role_name" varchar(50) NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "roles_role_name_unique" UNIQUE("role_name")
);
--> statement-breakpoint
CREATE TABLE "scheduled_tasks" (
	"task_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"task_type" varchar(50) NOT NULL,
	"frequency" varchar(50) NOT NULL,
	"cron_expression" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"last_status" varchar(50),
	"last_run_details" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_metadata" (
	"meta_id" serial PRIMARY KEY NOT NULL,
	"path" varchar(255) NOT NULL,
	"title" varchar(255),
	"description" text,
	"keywords" text,
	"og_image" varchar(255),
	"canonical_url" varchar(255),
	"robots" varchar(100),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer,
	CONSTRAINT "seo_metadata_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE "shoutbox_messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"room_id" integer,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"tip_amount" integer
);
--> statement-breakpoint
CREATE TABLE "signature_shop_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"effect_key" text NOT NULL,
	"price" integer NOT NULL,
	"required_level" integer DEFAULT 1,
	"rarity" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"setting_id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"value_type" varchar(20) DEFAULT 'string' NOT NULL,
	"group" varchar(100) DEFAULT 'general' NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "site_templates" (
	"template_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	CONSTRAINT "site_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"tag_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
-- CREATE TABLE "thread_drafts" (
-- 	"draft_id" serial PRIMARY KEY NOT NULL,
-- 	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
-- 	"user_id" integer NOT NULL,
-- 	"category_id" integer NOT NULL,
-- 	"title" varchar(255),
-- 	"content" text,
-- 	"content_html" text,
-- 	"editor_state" jsonb,
-- 	"prefix_id" integer,
-- 	"is_published" boolean DEFAULT false NOT NULL,
-- 	"last_saved_at" timestamp DEFAULT now() NOT NULL,
-- 	"updated_at" timestamp DEFAULT now() NOT NULL,
-- 	"created_at" timestamp DEFAULT now() NOT NULL
-- );
--> statement-breakpoint
CREATE TABLE "thread_feature_permissions" (
	"feature_id" serial PRIMARY KEY NOT NULL,
	"feature_name" varchar(50) NOT NULL,
	"description" text,
	"required_level" integer DEFAULT 1 NOT NULL,
	"role_override" text[],
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "thread_feature_permissions_feature_name_unique" UNIQUE("feature_name")
);
--> statement-breakpoint
CREATE TABLE "thread_prefixes" (
	"prefix_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	"color" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"category_id" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "thread_prefixes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "thread_tags" (
	"thread_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "thread_tags_thread_id_tag_id_pk" PRIMARY KEY("thread_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"thread_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"prefix_id" integer,
	"is_sticky" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_at" timestamp,
	"featured_by" integer,
	"featured_expires_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" integer,
	"view_count" integer DEFAULT 0 NOT NULL,
	"post_count" integer DEFAULT 0 NOT NULL,
	"first_post_like_count" integer DEFAULT 0 NOT NULL,
	"dgt_staked" bigint DEFAULT 0 NOT NULL,
	"hot_score" real DEFAULT 0 NOT NULL,
	"is_boosted" boolean DEFAULT false NOT NULL,
	"boost_amount_dgt" bigint DEFAULT 0,
	"boost_expires_at" timestamp,
	"last_post_id" bigint,
	"last_post_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"poll_id" bigint,
	"is_solved" boolean DEFAULT false NOT NULL,
	"solving_post_id" integer,
	"plugin_data" jsonb DEFAULT '{}',
	CONSTRAINT "threads_slug_visible_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tip_settings" (
	"setting_id" serial PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"min_amount_dgt" double precision DEFAULT 10 NOT NULL,
	"min_amount_usdt" double precision DEFAULT 0.1 NOT NULL,
	"max_amount_dgt" double precision DEFAULT 1000 NOT NULL,
	"max_amount_usdt" double precision DEFAULT 100 NOT NULL,
	"burn_percentage" double precision DEFAULT 5 NOT NULL,
	"processing_fee_percentage" double precision DEFAULT 2.5 NOT NULL,
	"cooldown_seconds" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "titles" (
	"title_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon_url" varchar(255),
	"rarity" varchar(50) DEFAULT 'common',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"transaction_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"wallet_id" integer,
	"from_user_id" integer,
	"to_user_id" integer,
	"amount" bigint NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}',
	"blockchain_tx_id" varchar(255),
	"from_wallet_address" varchar(255),
	"to_wallet_address" varchar(255),
	"is_treasury_transaction" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treasury_settings" (
	"setting_id" serial PRIMARY KEY NOT NULL,
	"treasury_wallet_address" varchar(255),
	"dgt_treasury_balance" bigint DEFAULT 0 NOT NULL,
	"min_withdrawal_amount" bigint DEFAULT 5000000 NOT NULL,
	"withdrawal_fee_percent" double precision DEFAULT 0 NOT NULL,
	"reward_distribution_delay_hours" integer DEFAULT 24 NOT NULL,
	"tip_burn_percent" integer DEFAULT 10 NOT NULL,
	"tip_recipient_percent" integer DEFAULT 90 NOT NULL,
	"min_tip_amount" bigint DEFAULT 1000000 NOT NULL,
	"max_tip_amount" bigint DEFAULT 1000000000 NOT NULL,
	"enable_likes" boolean DEFAULT true NOT NULL,
	"enable_tips" boolean DEFAULT true NOT NULL,
	"likes_give_xp" boolean DEFAULT true NOT NULL,
	"tips_give_xp" boolean DEFAULT true NOT NULL,
	"like_xp_amount" integer DEFAULT 5 NOT NULL,
	"tip_xp_multiplier" double precision DEFAULT 0.1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	"progress" jsonb DEFAULT '{}' NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_badges_user_id_badge_id_pk" PRIMARY KEY("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "user_bans" (
	"ban_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"banned_by" integer NOT NULL,
	"reason" text NOT NULL,
	"ban_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"lifted_at" timestamp,
	"lifted_by" integer,
	"lifting_reason" text
);
--> statement-breakpoint
CREATE TABLE "user_commands" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"command_type" text NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "user_groups" (
	"group_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(25) DEFAULT '#3366ff',
	"icon" varchar(100),
	"badge" varchar(100),
	"is_staff" boolean DEFAULT false NOT NULL,
	"staff_priority" integer DEFAULT 0,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_moderator" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"can_manage_users" boolean DEFAULT false NOT NULL,
	"can_manage_content" boolean DEFAULT false NOT NULL,
	"can_manage_settings" boolean DEFAULT false NOT NULL,
	"permissions" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"plugin_data" jsonb DEFAULT '{}',
	CONSTRAINT "user_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_inventory" (
	"inventory_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_equipped" boolean DEFAULT false NOT NULL,
	"acquired_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"transaction_id" integer,
	"metadata" jsonb DEFAULT '{}',
	CONSTRAINT "user_inventory_user_product_unique" UNIQUE("user_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "user_mission_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"mission_id" integer NOT NULL,
	"current_count" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"is_reward_claimed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"claimed_at" timestamp,
	CONSTRAINT "user_mission_idx" UNIQUE("user_id","mission_id")
);
--> statement-breakpoint
CREATE TABLE "user_relationships" (
	"relationship_id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"relationship_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_accepted" boolean,
	"accepted_at" timestamp,
	CONSTRAINT "user_relationships_follower_following_type_unique" UNIQUE("follower_id","following_id","relationship_type")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"granted_by" integer,
	"expires_at" timestamp,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "user_rules_agreements" (
	"user_id" integer NOT NULL,
	"rule_id" integer NOT NULL,
	"version_hash" varchar(255) NOT NULL,
	"agreed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_rules_agreements_user_id_rule_id_pk" PRIMARY KEY("user_id","rule_id")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"theme" varchar(40) DEFAULT 'auto',
	"sidebar_state" jsonb DEFAULT '{}',
	"notification_prefs" jsonb DEFAULT '{}',
	"profile_visibility" varchar(20) DEFAULT 'public',
	"timezone" varchar(50),
	"language" varchar(20) DEFAULT 'en',
	"shoutbox_position" varchar(20) DEFAULT 'sidebar-top'
);
--> statement-breakpoint
CREATE TABLE "user_settings_history" (
	"history_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"changed_field" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "user_signature_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"signature_item_id" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"purchase_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_signature_items_user_item_unique" UNIQUE("user_id","signature_item_id")
);
--> statement-breakpoint
CREATE TABLE "user_thread_bookmarks" (
	"user_id" integer NOT NULL,
	"thread_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_thread_bookmarks_user_id_thread_id_pk" PRIMARY KEY("user_id","thread_id")
);
--> statement-breakpoint
CREATE TABLE "user_titles" (
	"user_id" integer NOT NULL,
	"title_id" integer NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_titles_user_id_title_id_pk" PRIMARY KEY("user_id","title_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"bio" text,
	"signature" text,
	"avatar_url" varchar(255),
	"active_avatar_url" varchar(255),
	"profile_banner_url" varchar(255),
	"active_frame_id" integer,
	"avatar_frame_id" integer,
	"group_id" integer,
	"discord_handle" varchar(255),
	"twitter_handle" varchar(255),
	"website" varchar(255),
	"telegram_handle" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_shadowbanned" boolean DEFAULT false NOT NULL,
	"subscribed_to_newsletter" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_login" timestamp,
	"referrer_id" integer,
	"referral_level" integer,
	"xp" bigint DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"clout" integer DEFAULT 0 NOT NULL,
	"active_title_id" integer,
	"active_badge_id" integer,
	"dgt_points" integer DEFAULT 0 NOT NULL,
	"dgt_wallet_balance" integer DEFAULT 0 NOT NULL,
	"points_version" integer DEFAULT 1 NOT NULL,
	"daily_xp_gained" integer DEFAULT 0 NOT NULL,
	"last_xp_gain_date" timestamp,
	"role" "user_role" DEFAULT 'user',
	"wallet_address" varchar(255),
	"encrypted_private_key" varchar(512),
	"wallet_balance_usdt" double precision DEFAULT 0 NOT NULL,
	"wallet_pending_withdrawals" jsonb DEFAULT '[]',
	"ccpayment_account_id" varchar(100),
	"verify_token" varchar(255),
	"reset_token" varchar(255),
	"reset_token_expires_at" timestamp,
	"gdpr_consented_at" timestamp,
	"tos_agreed_at" timestamp,
	"privacy_agreed_at" timestamp,
	"path_xp" jsonb DEFAULT '{}',
	"path_multipliers" jsonb DEFAULT '{}',
	"plugin_data" jsonb DEFAULT '{}',
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vaults" (
	"vault_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wallet_address" varchar(255) NOT NULL,
	"amount" double precision NOT NULL,
	"initial_amount" double precision NOT NULL,
	"locked_at" timestamp DEFAULT now() NOT NULL,
	"unlock_time" timestamp,
	"status" "vault_status" DEFAULT 'locked' NOT NULL,
	"unlocked_at" timestamp,
	"lock_transaction_id" integer,
	"unlock_transaction_id" integer,
	"blockchain_tx_id" varchar(255),
	"unlock_blockchain_tx_id" varchar(255),
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"wallet_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL,
	"last_transaction" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawal_requests" (
	"request_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" bigint NOT NULL,
	"status" "withdrawal_status" DEFAULT 'pending' NOT NULL,
	"wallet_address" varchar(255) NOT NULL,
	"transaction_id" integer,
	"processing_fee" bigint DEFAULT 0 NOT NULL,
	"request_notes" text,
	"admin_notes" text,
	"processed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"fulfilled_at" timestamp,
	"processed_by" integer
);
--> statement-breakpoint
CREATE TABLE "xp_action_settings" (
	"action" text PRIMARY KEY NOT NULL,
	"base_value" integer NOT NULL,
	"description" text NOT NULL,
	"max_per_day" integer,
	"cooldown_sec" integer,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_adjustment_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"admin_id" integer NOT NULL,
	"adjustment_type" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"old_xp" integer NOT NULL,
	"new_xp" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_clout_settings" (
	"action_key" varchar(100) PRIMARY KEY NOT NULL,
	"xp_value" integer DEFAULT 0 NOT NULL,
	"clout_value" integer DEFAULT 0 NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_themes" ADD CONSTRAINT "admin_themes_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "airdrop_records" ADD CONSTRAINT "airdrop_records_admin_user_id_users_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "airdrop_records" ADD CONSTRAINT "airdrop_records_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "beta_feature_flags" ADD CONSTRAINT "beta_feature_flags_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "beta_feature_flags" ADD CONSTRAINT "beta_feature_flags_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_min_group_id_required_user_groups_group_id_fk" FOREIGN KEY ("min_group_id_required") REFERENCES "public"."user_groups"("group_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_moderation_actions" ADD CONSTRAINT "content_moderation_actions_moderator_id_users_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_emojis" ADD CONSTRAINT "custom_emojis_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgt_purchase_orders" ADD CONSTRAINT "dgt_purchase_orders_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_recipient_id_users_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_rules" ADD CONSTRAINT "forum_rules_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_rules" ADD CONSTRAINT "forum_rules_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_reward_title_id_titles_title_id_fk" FOREIGN KEY ("reward_title_id") REFERENCES "public"."titles"("title_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_reward_badge_id_badges_badge_id_fk" FOREIGN KEY ("reward_badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_deleted_by_users_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_users" ADD CONSTRAINT "online_users_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_users" ADD CONSTRAINT "online_users_room_id_chat_rooms_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("room_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_liked_by_user_id_users_user_id_fk" FOREIGN KEY ("liked_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tips" ADD CONSTRAINT "post_tips_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tips" ADD CONSTRAINT "post_tips_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_reply_to_post_id_posts_post_id_fk" FOREIGN KEY ("reply_to_post_id") REFERENCES "public"."posts"("post_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_deleted_by_users_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_edited_by_users_user_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_image_id_media_library_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_library"("media_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_id_media_library_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_library"("media_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_featured_image_id_media_library_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media_library"("media_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_digital_file_id_media_library_media_id_fk" FOREIGN KEY ("digital_file_id") REFERENCES "public"."media_library"("media_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rain_events" ADD CONSTRAINT "rain_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rain_events" ADD CONSTRAINT "rain_events_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_content" ADD CONSTRAINT "reported_content_reporter_id_users_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_content" ADD CONSTRAINT "reported_content_resolved_by_users_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_perm_id_permissions_perm_id_fk" FOREIGN KEY ("perm_id") REFERENCES "public"."permissions"("perm_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_granted_by_users_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_messages" ADD CONSTRAINT "shoutbox_messages_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_messages" ADD CONSTRAINT "shoutbox_messages_room_id_chat_rooms_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("room_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_templates" ADD CONSTRAINT "site_templates_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_category_id_forum_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("category_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_prefix_id_thread_prefixes_prefix_id_fk" FOREIGN KEY ("prefix_id") REFERENCES "public"."thread_prefixes"("prefix_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_prefixes" ADD CONSTRAINT "thread_prefixes_category_id_forum_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_tags" ADD CONSTRAINT "thread_tags_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_tags" ADD CONSTRAINT "thread_tags_tag_id_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("tag_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_category_id_forum_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("category_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_prefix_id_thread_prefixes_prefix_id_fk" FOREIGN KEY ("prefix_id") REFERENCES "public"."thread_prefixes"("prefix_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_featured_by_users_user_id_fk" FOREIGN KEY ("featured_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_deleted_by_users_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_solving_post_id_posts_post_id_fk" FOREIGN KEY ("solving_post_id") REFERENCES "public"."posts"("post_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("wallet_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_users_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_users_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treasury_settings" ADD CONSTRAINT "treasury_settings_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_achievement_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("achievement_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_banned_by_users_user_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_lifted_by_users_user_id_fk" FOREIGN KEY ("lifted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_commands" ADD CONSTRAINT "user_commands_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_transaction_id_inventory_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."inventory_transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_follower_id_users_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_following_id_users_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_granted_by_users_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rules_agreements" ADD CONSTRAINT "user_rules_agreements_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rules_agreements" ADD CONSTRAINT "user_rules_agreements_rule_id_forum_rules_rule_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."forum_rules"("rule_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings_history" ADD CONSTRAINT "user_settings_history_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_signature_items" ADD CONSTRAINT "user_signature_items_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_signature_items" ADD CONSTRAINT "user_signature_items_signature_item_id_signature_shop_items_id_fk" FOREIGN KEY ("signature_item_id") REFERENCES "public"."signature_shop_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_thread_bookmarks" ADD CONSTRAINT "user_thread_bookmarks_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_thread_bookmarks" ADD CONSTRAINT "user_thread_bookmarks_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_title_id_titles_title_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("title_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_frame_id_avatar_frames_id_fk" FOREIGN KEY ("avatar_frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_group_id_user_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("group_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referrer_id_users_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_title_id_titles_title_id_fk" FOREIGN KEY ("active_title_id") REFERENCES "public"."titles"("title_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_badge_id_badges_badge_id_fk" FOREIGN KEY ("active_badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_lock_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("lock_transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_unlock_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("unlock_transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_deleted_by_users_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_processed_by_users_user_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_adjustment_logs" ADD CONSTRAINT "xp_adjustment_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_adjustment_logs" ADD CONSTRAINT "xp_adjustment_logs_admin_id_users_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_events_user_id" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_type" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_created_at" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_announcements_created_by" ON "announcements" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_announcements_created_at" ON "announcements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity_type" ON "audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
-- CREATE INDEX "idx_chat_messages_user_id" ON "chat_messages" USING btree ("user_id");--> statement-breakpoint
-- CREATE INDEX "idx_chat_messages_created_at" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_name" ON "chat_rooms" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_is_private" ON "chat_rooms" USING btree ("is_private");--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_order" ON "chat_rooms" USING btree ("order");--> statement-breakpoint
CREATE INDEX "idx_conversation_participants_conversation_id" ON "conversation_participants" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_participants_user_id" ON "conversation_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_created_by" ON "conversations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_conversations_updated_at" ON "conversations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_custom_emojis_name" ON "custom_emojis" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_custom_emojis_category" ON "custom_emojis" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_custom_emojis_type" ON "custom_emojis" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_custom_emojis_unlock_type" ON "custom_emojis" USING btree ("unlock_type");--> statement-breakpoint
CREATE INDEX "idx_dgt_packages_name" ON "dgt_packages" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_dgt_packages_active" ON "dgt_packages" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_dgt_packages_featured" ON "dgt_packages" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_dgt_purchase_orders_user_id" ON "dgt_purchase_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_dgt_purchase_orders_status" ON "dgt_purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_dgt_purchase_orders_ccpayment_ref" ON "dgt_purchase_orders" USING btree ("ccpayment_reference");--> statement-breakpoint
CREATE INDEX "idx_dgt_purchase_orders_created_at" ON "dgt_purchase_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_direct_messages_sender_id" ON "direct_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_direct_messages_recipient_id" ON "direct_messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_direct_messages_timestamp" ON "direct_messages" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_forum_rules_section" ON "forum_rules" USING btree ("section");--> statement-breakpoint
CREATE INDEX "idx_forum_rules_status" ON "forum_rules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_user_id" ON "inventory_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_product_id" ON "inventory_transactions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_transaction_type" ON "inventory_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_created_at" ON "inventory_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_media_library_user_id" ON "media_library" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_media_library_type" ON "media_library" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_media_library_created_at" ON "media_library" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_message_reads_message_id" ON "message_reads" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_online_users_user_id" ON "online_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_online_users_last_active" ON "online_users" USING btree ("last_active");--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_product_id" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_created_at" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_token" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_post_reactions_post_id" ON "post_reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_reactions_reaction_type" ON "post_reactions" USING btree ("reaction_type");--> statement-breakpoint
CREATE INDEX "idx_posts_thread_id" ON "posts" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "idx_posts_reply_to" ON "posts" USING btree ("reply_to_post_id");--> statement-breakpoint
CREATE INDEX "idx_posts_user_id" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_posts_total_tips" ON "posts" USING btree ("total_tips");--> statement-breakpoint
CREATE INDEX "idx_product_categories_parent_id" ON "product_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_product_media_product_id" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_products_category_id" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_products_created_at" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_products_available_from" ON "products" USING btree ("available_from");--> statement-breakpoint
CREATE INDEX "idx_products_available_until" ON "products" USING btree ("available_until");--> statement-breakpoint
CREATE INDEX "idx_products_featured_until" ON "products" USING btree ("featured_until");--> statement-breakpoint
CREATE INDEX "idx_shoutbox_messages_user_id" ON "shoutbox_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_shoutbox_messages_room_id" ON "shoutbox_messages" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "idx_shoutbox_messages_created_at" ON "shoutbox_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_thread_drafts_user_id" ON "thread_drafts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_thread_drafts_category_id" ON "thread_drafts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_threads_category_id" ON "threads" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_threads_user_id" ON "threads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_threads_created_at" ON "threads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_threads_hot_score" ON "threads" USING btree ("hot_score");--> statement-breakpoint
CREATE INDEX "idx_threads_is_boosted" ON "threads" USING btree ("is_boosted");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_id" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_wallet_id" ON "transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_from_user_id" ON "transactions" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_to_user_id" ON "transactions" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_type" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_transactions_created_at" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_type_status" ON "transactions" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "idx_user_inventory_user_id" ON "user_inventory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_inventory_product_id" ON "user_inventory" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_user_rules_agreements_user_id" ON "user_rules_agreements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_settings_user_id" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_thread_bookmarks_user_id" ON "user_thread_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_referrer_id" ON "users" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_users_group_id" ON "users" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_vaults_user_id" ON "vaults" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_vaults_status" ON "vaults" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_vaults_unlock_time" ON "vaults" USING btree ("unlock_time");--> statement-breakpoint
CREATE INDEX "idx_vaults_wallet_address" ON "vaults" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "idx_wallets_user_id" ON "wallets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_user_id" ON "withdrawal_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_status" ON "withdrawal_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_created_at" ON "withdrawal_requests" USING btree ("created_at");