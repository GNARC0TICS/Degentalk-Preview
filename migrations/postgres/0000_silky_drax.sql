CREATE TYPE "public"."content_edit_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."content_visibility_status" AS ENUM('draft', 'published', 'hidden', 'shadowbanned', 'archived', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."mention_source_type" AS ENUM('post', 'thread', 'chat');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'system', 'private_message', 'achievement', 'transaction', 'post_mention', 'thread_reply', 'reaction', 'quest_complete', 'badge_awarded', 'rain_received', 'level_up', 'tip_received', 'airdrop_received', 'referral_complete', 'cosmetic_unlocked', 'mission_complete');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'helpful');--> statement-breakpoint
CREATE TYPE "public"."shoutbox_position" AS ENUM('sidebar-top', 'sidebar-bottom', 'main-top', 'main-bottom', 'floating');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'pending', 'resolved', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'confirmed', 'failed', 'reversed', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('TIP', 'DEPOSIT', 'WITHDRAWAL', 'ADMIN_ADJUST', 'RAIN', 'AIRDROP', 'SHOP_PURCHASE', 'REWARD', 'REFERRAL_BONUS', 'FEE', 'VAULT_LOCK', 'VAULT_UNLOCK');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'mod', 'admin');--> statement-breakpoint
CREATE TYPE "public"."vault_status" AS ENUM('locked', 'unlocked', 'pending_unlock');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."moderator_note_type" AS ENUM('thread', 'post', 'user');--> statement-breakpoint
CREATE TYPE "public"."token_type_admin_airdrop" AS ENUM('XP', 'DGT');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('rain_claimed', 'thread_created', 'post_created', 'cosmetic_unlocked', 'level_up', 'badge_earned', 'tip_sent', 'tip_received', 'xp_earned', 'referral_completed', 'product_purchased', 'mission_completed', 'airdrop_claimed');--> statement-breakpoint
CREATE TYPE "public"."mention_type" AS ENUM('thread', 'post', 'shoutbox', 'whisper');--> statement-breakpoint
CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"primary_role_id" integer,
	"discord_handle" varchar(255),
	"twitter_handle" varchar(255),
	"website" varchar(255),
	"telegram_handle" varchar(255),
	"x_account_id" varchar(255),
	"x_access_token" text,
	"x_refresh_token" text,
	"x_token_expires_at" timestamp,
	"x_linked_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_shadowbanned" boolean DEFAULT false NOT NULL,
	"subscribed_to_newsletter" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_login" timestamp,
	"referrer_id" uuid,
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
	"wallet_balance_usdt" bigint DEFAULT 0 NOT NULL,
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
	"status_line" text,
	"pinned_post_id" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"group_id" integer,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "display_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"theme" varchar(40) DEFAULT 'system' NOT NULL,
	"font_size" varchar(20) DEFAULT 'medium' NOT NULL,
	"thread_display_mode" varchar(20) DEFAULT 'card' NOT NULL,
	"reduced_motion" boolean DEFAULT false NOT NULL,
	"hide_nsfw" boolean DEFAULT true NOT NULL,
	"show_mature_content" boolean DEFAULT false NOT NULL,
	"show_offline_users" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
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
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"theme" varchar(40) DEFAULT 'auto',
	"sidebar_state" jsonb DEFAULT '{}',
	"notification_prefs" jsonb DEFAULT '{}',
	"profile_visibility" varchar(20) DEFAULT 'public',
	"timezone" varchar(50),
	"language" varchar(20) DEFAULT 'en',
	"shoutbox_position" varchar(20) DEFAULT 'sidebar-top'
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
CREATE TABLE "roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"description" text,
	"badge_image" varchar(255),
	"text_color" varchar(25),
	"background_color" varchar(25),
	"is_staff" boolean DEFAULT false NOT NULL,
	"is_moderator" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"permissions" jsonb DEFAULT '{}' NOT NULL,
	"xp_multiplier" double precision DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"plugin_data" jsonb DEFAULT '{}',
	CONSTRAINT "roles_name_unique" UNIQUE("name"),
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"granted_by" uuid,
	"expires_at" timestamp,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"perm_id" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"granted_by" uuid,
	CONSTRAINT "role_permissions_role_id_perm_id_pk" PRIMARY KEY("role_id","perm_id")
);
--> statement-breakpoint
CREATE TABLE "user_bans" (
	"ban_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"banned_by" uuid NOT NULL,
	"reason" text NOT NULL,
	"ban_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"lifted_at" timestamp,
	"lifted_by" uuid,
	"lifting_reason" text
);
--> statement-breakpoint
CREATE TABLE "user_relationships" (
	"relationship_id" serial PRIMARY KEY NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"relationship_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_accepted" boolean,
	"accepted_at" timestamp,
	CONSTRAINT "user_relationships_follower_following_type_unique" UNIQUE("follower_id","following_id","relationship_type")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"token_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
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
CREATE TABLE "user_settings_history" (
	"history_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"changed_field" varchar(100) NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text
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
CREATE TABLE "user_owned_frames" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"frame_id" integer NOT NULL,
	"source" varchar(20) DEFAULT 'shop' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_social_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"allow_mentions" boolean DEFAULT true NOT NULL,
	"mention_permissions" varchar(20) DEFAULT 'everyone' NOT NULL,
	"mention_notifications" boolean DEFAULT true NOT NULL,
	"mention_email_notifications" boolean DEFAULT false NOT NULL,
	"allow_followers" boolean DEFAULT true NOT NULL,
	"follower_approval_required" boolean DEFAULT false NOT NULL,
	"hide_follower_count" boolean DEFAULT false NOT NULL,
	"hide_following_count" boolean DEFAULT false NOT NULL,
	"allow_whale_designation" boolean DEFAULT true NOT NULL,
	"allow_friend_requests" boolean DEFAULT true NOT NULL,
	"friend_request_permissions" varchar(20) DEFAULT 'everyone' NOT NULL,
	"auto_accept_mutual_follows" boolean DEFAULT false NOT NULL,
	"hide_online_status" boolean DEFAULT false NOT NULL,
	"hide_friends_list" boolean DEFAULT false NOT NULL,
	"show_social_activity" boolean DEFAULT true NOT NULL,
	"allow_direct_messages" varchar(20) DEFAULT 'friends' NOT NULL,
	"show_profile_to_public" boolean DEFAULT true NOT NULL,
	"allow_social_discovery" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature" varchar(100) NOT NULL,
	"group_id" integer,
	"allow" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_forum_slug" text,
	"parent_id" integer,
	"type" text DEFAULT 'forum' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_vip" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"min_xp" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"min_group_id_required" integer,
	"color" text DEFAULT 'gray' NOT NULL,
	"icon" text DEFAULT 'hash' NOT NULL,
	"color_theme" text,
	"tipping_enabled" boolean DEFAULT false NOT NULL,
	"xp_multiplier" real DEFAULT 1 NOT NULL,
	"plugin_data" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "forum_structure_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"thread_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"structure_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"prefix_id" integer,
	"is_sticky" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_at" timestamp,
	"featured_by" uuid,
	"featured_expires_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
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
	"visibility_status" "content_visibility_status" DEFAULT 'published' NOT NULL,
	"moderation_reason" varchar(255),
	"xp_multiplier" real DEFAULT 1 NOT NULL,
	"reward_rules" jsonb DEFAULT '{}',
	CONSTRAINT "threads_slug_visible_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"post_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
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
	"deleted_by" uuid,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"edited_by" uuid,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"quarantine_data" jsonb,
	"plugin_data" jsonb DEFAULT '{}',
	"visibility_status" "content_visibility_status" DEFAULT 'published' NOT NULL,
	"moderation_reason" varchar(255),
	"depth" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread_prefixes" (
	"prefix_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	"color" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"structure_id" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "thread_prefixes_name_unique" UNIQUE("name")
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
CREATE TABLE "thread_tags" (
	"thread_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "thread_tags_thread_id_tag_id_pk" PRIMARY KEY("thread_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"user_id" uuid NOT NULL,
	"post_id" integer NOT NULL,
	"reaction_type" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_reactions_user_id_post_id_reaction_type_pk" PRIMARY KEY("user_id","post_id","reaction_type")
);
--> statement-breakpoint
CREATE TABLE "post_drafts" (
	"draft_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" integer,
	"user_id" uuid NOT NULL,
	"content" text,
	"editor_state" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread_drafts" (
	"draft_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"structure_id" integer,
	"prefix_id" integer,
	"title" varchar(255),
	"content" text,
	"editor_state" jsonb,
	"tags" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_thread_bookmarks" (
	"user_id" uuid NOT NULL,
	"thread_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_thread_bookmarks_user_id_thread_id_pk" PRIMARY KEY("user_id","thread_id")
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
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "user_rules_agreements" (
	"user_id" uuid NOT NULL,
	"rule_id" integer NOT NULL,
	"version_hash" varchar(255) NOT NULL,
	"agreed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_rules_agreements_user_id_rule_id_pk" PRIMARY KEY("user_id","rule_id")
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
	"created_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "custom_emojis_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"liked_by_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_post_like" UNIQUE("post_id","liked_by_user_id")
);
--> statement-breakpoint
CREATE TABLE "thread_feature_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"feature" text NOT NULL,
	"allowed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emoji_packs" (
	"pack_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon_url" varchar(255),
	"price_dgt" bigint,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emoji_pack_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_id" integer NOT NULL,
	"emoji_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_emoji_packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"emoji_pack_id" integer NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"unlock_type" text DEFAULT 'shop' NOT NULL,
	"price_paid" integer
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"wallet_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL,
	"last_transaction" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"transaction_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"wallet_id" integer,
	"from_user_id" uuid,
	"to_user_id" uuid,
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
CREATE TABLE "levels" (
	"level" integer PRIMARY KEY NOT NULL,
	"min_xp" bigint DEFAULT 0 NOT NULL,
	"name" varchar(100),
	"icon_url" varchar(255),
	"rarity" varchar(10) DEFAULT 'common',
	"frame_url" varchar(255),
	"color_theme" varchar(25),
	"animation_effect" varchar(30),
	"unlocks" jsonb,
	"reward_dgt" integer DEFAULT 0,
	"reward_title_id" integer,
	"reward_badge_id" integer
);
--> statement-breakpoint
CREATE TABLE "xp_adjustment_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"adjustment_type" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"old_xp" integer NOT NULL,
	"new_xp" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
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
CREATE TABLE "titles" (
	"title_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon_url" varchar(255),
	"rarity" varchar(50) DEFAULT 'common',
	"emoji" varchar(10),
	"font_family" varchar(100),
	"font_size" integer,
	"font_weight" varchar(20),
	"text_color" varchar(25),
	"background_color" varchar(25),
	"border_color" varchar(25),
	"border_width" integer,
	"border_style" varchar(20),
	"border_radius" integer,
	"glow_color" varchar(25),
	"glow_intensity" integer,
	"shadow_color" varchar(25),
	"shadow_blur" integer,
	"shadow_offset_x" integer,
	"shadow_offset_y" integer,
	"gradient_start" varchar(25),
	"gradient_end" varchar(25),
	"gradient_direction" varchar(30),
	"animation" varchar(20),
	"animation_duration" double precision,
	"role_id" varchar(50),
	"is_shop_item" boolean DEFAULT false,
	"is_unlockable" boolean DEFAULT false,
	"unlock_conditions" jsonb,
	"shop_price" double precision,
	"shop_currency" varchar(10),
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
CREATE TABLE "user_titles" (
	"user_id" uuid NOT NULL,
	"title_id" integer NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_titles_user_id_title_id_pk" PRIMARY KEY("user_id","title_id")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"user_id" uuid NOT NULL,
	"badge_id" integer NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_badges_user_id_badge_id_pk" PRIMARY KEY("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "vaults" (
	"vault_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
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
CREATE TABLE "withdrawal_requests" (
	"request_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
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
	"processed_by" uuid
);
--> statement-breakpoint
CREATE TABLE "user_commands" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"command_type" text NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "rain_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"currency" varchar(10) DEFAULT 'DGT' NOT NULL,
	"recipient_count" integer NOT NULL,
	"transaction_id" integer,
	"source" varchar(50) DEFAULT 'shoutbox',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "post_tips" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
	"user_id" uuid NOT NULL,
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
CREATE TABLE "dgt_economy_parameters" (
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
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "economy_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" integer NOT NULL
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
CREATE TABLE "xp_clout_settings" (
	"action_key" varchar(100) PRIMARY KEY NOT NULL,
	"xp_value" integer DEFAULT 0 NOT NULL,
	"clout_value" integer DEFAULT 0 NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "platform_treasury_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"currency" text NOT NULL,
	"balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"hot_wallet_address" varchar(255),
	"cold_wallet_address" varchar(255),
	"min_deposit_amount" numeric(18, 2) DEFAULT '0',
	"max_deposit_amount" numeric(18, 2),
	"min_withdrawal_amount" numeric(18, 2) DEFAULT '0',
	"max_withdrawal_amount" numeric(18, 2),
	"deposit_fee_percent" double precision DEFAULT 0,
	"withdrawal_fee_percent" double precision DEFAULT 0,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"notes" text,
	"last_audited_at" timestamp with time zone,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_treasury_settings_currency_unique" UNIQUE("currency")
);
--> statement-breakpoint
CREATE TABLE "clout_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"achievement_key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"clout_reward" integer DEFAULT 0 NOT NULL,
	"criteria_type" varchar(50),
	"criteria_value" integer,
	"enabled" boolean DEFAULT true NOT NULL,
	"icon_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clout_achievements_achievement_key_unique" UNIQUE("achievement_key")
);
--> statement-breakpoint
CREATE TABLE "user_clout_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" integer,
	"clout_earned" integer NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airdrop_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"interval" varchar(50) DEFAULT 'daily',
	"target_group_id" integer,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "airdrop_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"token_type" varchar(50),
	"amount" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "xp_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"xp_gained" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "xp_logs_user_date_unique" UNIQUE("user_id","date")
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
	"frame_id" integer,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
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
CREATE TABLE "orders" (
	"order_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
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
CREATE TABLE "inventory_transaction_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_id" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"quantity_change" integer NOT NULL,
	"related_transaction_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"dgt_transaction_id" integer
);
--> statement-breakpoint
CREATE TABLE "user_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"equipped" boolean DEFAULT false NOT NULL,
	"acquired_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"transaction_id" integer,
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"transaction_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" integer NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"currency" varchar(10) NOT NULL,
	"currency_amount" double precision NOT NULL,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "user_signature_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"signature_item_id" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"purchase_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_signature_items_user_item_unique" UNIQUE("user_id","signature_item_id")
);
--> statement-breakpoint
CREATE TABLE "cosmetic_categories" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"bg_color" varchar(10),
	"text_color" varchar(10),
	"icon_url" varchar(255),
	"allowed_rarities" jsonb DEFAULT '[]',
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"plugin_data" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "cosmetic_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rarities" (
	"rarity_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"hex_color" varchar(10) NOT NULL,
	"rarity_score" integer NOT NULL,
	"is_glow" boolean DEFAULT false NOT NULL,
	"is_animated" boolean DEFAULT false NOT NULL,
	"flags" jsonb DEFAULT '{}',
	"plugin_data" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "rarities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
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
CREATE TABLE "conversations" (
	"conversation_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255),
	"is_group" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"participant_id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "conversation_user_unique" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" uuid NOT NULL,
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
CREATE TABLE "message_reads" (
	"message_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "message_reads_message_id_user_id_pk" PRIMARY KEY("message_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "direct_messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"sender_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"room_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_private" boolean DEFAULT false NOT NULL,
	"min_group_id_required" integer,
	"min_xp_required" integer DEFAULT 0,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shoutbox_messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"room_id" integer,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"tip_amount" integer
);
--> statement-breakpoint
CREATE TABLE "online_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"room_id" integer,
	"last_active" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "unique_online_user" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"log_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(100),
	"before" jsonb,
	"after" jsonb,
	"details" jsonb DEFAULT '{}',
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reported_content" (
	"report_id" serial PRIMARY KEY NOT NULL,
	"reporter_id" uuid NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" integer NOT NULL,
	"reason" varchar(100) NOT NULL,
	"details" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"resolution_notes" text
);
--> statement-breakpoint
CREATE TABLE "content_moderation_actions" (
	"action_id" serial PRIMARY KEY NOT NULL,
	"moderator_id" uuid NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" integer NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"additional_data" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"announcement_id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"icon" varchar(50),
	"type" varchar(30) DEFAULT 'info',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"priority" integer DEFAULT 0,
	"visible_to" jsonb DEFAULT '["all"]',
	"ticker_mode" boolean DEFAULT true,
	"link" varchar(255),
	"bg_color" varchar(30),
	"text_color" varchar(30)
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
	"updated_by" uuid,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
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
	"created_by" uuid,
	CONSTRAINT "admin_themes_name_unique" UNIQUE("name")
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
	"created_by" uuid,
	CONSTRAINT "site_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"flag_id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"access_code" varchar(100),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"rollout_percentage" numeric(5, 2) DEFAULT 100 NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
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
	"updated_by" uuid,
	CONSTRAINT "seo_metadata_path_unique" UNIQUE("path")
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
CREATE TABLE "media_library" (
	"media_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
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
	"deleted_by" uuid,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ui_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"page" text,
	"position" text,
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ui_collection_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"quote_id" uuid NOT NULL,
	"order_in_collection" integer DEFAULT 0,
	"weight" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ui_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ui_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"headline" text NOT NULL,
	"subheader" text,
	"tags" text[] DEFAULT '{}',
	"intensity" integer DEFAULT 1,
	"theme" text,
	"target_audience" text,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"weight" integer DEFAULT 1,
	"start_date" timestamp,
	"end_date" timestamp,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"variant" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ui_themes" (
	"theme_id" serial PRIMARY KEY NOT NULL,
	"theme_key" text NOT NULL,
	"icon" text,
	"color" text,
	"bg_color" text,
	"border_color" text,
	"label" text,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ui_themes_theme_key_unique" UNIQUE("theme_key")
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
CREATE TABLE "email_template_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" serial NOT NULL,
	"recipient_email" varchar(255) NOT NULL,
	"recipient_user_id" uuid,
	"subject" text NOT NULL,
	"variables_used" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(20) DEFAULT 'sent' NOT NULL,
	"error_message" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"opened_at" timestamp,
	"clicked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_template_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" serial NOT NULL,
	"version" serial NOT NULL,
	"subject" text NOT NULL,
	"body_markdown" text NOT NULL,
	"body_html" text,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"change_description" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) DEFAULT 'general' NOT NULL,
	"subject" text NOT NULL,
	"body_markdown" text NOT NULL,
	"body_html" text,
	"body_plain_text" text,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"default_values" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"last_used_at" timestamp,
	"use_count" serial DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"version" serial DEFAULT 1 NOT NULL,
	"previous_version_id" serial NOT NULL,
	CONSTRAINT "email_templates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "admin_backups" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"backup_type" varchar(50) DEFAULT 'full' NOT NULL,
	"source" varchar(50) DEFAULT 'manual' NOT NULL,
	"file_path" text NOT NULL,
	"file_size" bigint DEFAULT 0 NOT NULL,
	"checksum_md5" varchar(32),
	"compression_type" varchar(20) DEFAULT 'gzip',
	"database_name" varchar(100) NOT NULL,
	"postgres_version" varchar(50),
	"backup_format" varchar(20) DEFAULT 'custom',
	"included_tables" jsonb DEFAULT '[]',
	"included_schemas" jsonb DEFAULT '["public"]',
	"excluded_tables" jsonb DEFAULT '[]',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"error_message" text,
	"error_code" varchar(50),
	"retry_count" integer DEFAULT 0,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_protected" boolean DEFAULT false,
	"tags" jsonb DEFAULT '[]',
	"metadata" jsonb DEFAULT '{}',
	CONSTRAINT "admin_backups_filename_unique" UNIQUE("filename")
);
--> statement-breakpoint
CREATE TABLE "backup_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"cron_expression" varchar(100) NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC',
	"backup_type" varchar(50) DEFAULT 'full' NOT NULL,
	"backup_format" varchar(20) DEFAULT 'custom',
	"compression_type" varchar(20) DEFAULT 'gzip',
	"included_tables" jsonb DEFAULT '[]',
	"included_schemas" jsonb DEFAULT '["public"]',
	"excluded_tables" jsonb DEFAULT '[]',
	"retention_days" integer DEFAULT 30,
	"max_backups" integer DEFAULT 10,
	"is_active" boolean DEFAULT true,
	"last_run_at" timestamp,
	"next_run_at" timestamp,
	"last_backup_id" integer,
	"consecutive_failures" integer DEFAULT 0,
	"last_error" text,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"notify_on_success" boolean DEFAULT false,
	"notify_on_failure" boolean DEFAULT true,
	"notification_emails" jsonb DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE "backup_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"storage_location" text DEFAULT '/var/backups/degentalk' NOT NULL,
	"max_storage_size" bigint DEFAULT 107374182400,
	"compression_level" integer DEFAULT 6,
	"default_retention_days" integer DEFAULT 30,
	"max_manual_backups" integer DEFAULT 50,
	"max_scheduled_backups" integer DEFAULT 100,
	"require_approval_for_restore" boolean DEFAULT true,
	"allowed_restore_roles" jsonb DEFAULT '["admin"]',
	"allowed_backup_roles" jsonb DEFAULT '["admin", "mod"]',
	"default_notification_emails" jsonb DEFAULT '[]',
	"notify_on_large_backups" boolean DEFAULT true,
	"large_backup_threshold_mb" integer DEFAULT 1000,
	"connection_timeout" integer DEFAULT 30,
	"command_timeout" integer DEFAULT 3600,
	"max_concurrent_operations" integer DEFAULT 2,
	"cleanup_frequency" varchar(50) DEFAULT 'daily',
	"cleanup_time" varchar(10) DEFAULT '02:00',
	"auto_cleanup_enabled" boolean DEFAULT true,
	"last_cleanup_at" timestamp,
	"disk_usage" bigint DEFAULT 0,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restore_operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"operation_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"source_backup_id" integer NOT NULL,
	"source_filename" varchar(255) NOT NULL,
	"restore_type" varchar(50) DEFAULT 'full' NOT NULL,
	"target_database" varchar(100),
	"pre_restore_backup_id" integer,
	"create_pre_backup" boolean DEFAULT true,
	"included_tables" jsonb DEFAULT '[]',
	"excluded_tables" jsonb DEFAULT '[]',
	"include_indexes" boolean DEFAULT true,
	"include_constraints" boolean DEFAULT true,
	"include_triggers" boolean DEFAULT true,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"pre_backup_completed_at" timestamp,
	"restore_started_at" timestamp,
	"completed_at" timestamp,
	"duration" integer,
	"progress_percent" integer DEFAULT 0,
	"current_step" varchar(100),
	"estimated_time_remaining" integer,
	"tables_restored" integer DEFAULT 0,
	"rows_restored" bigint DEFAULT 0,
	"data_size" bigint DEFAULT 0,
	"error_message" text,
	"error_code" varchar(50),
	"error_step" varchar(100),
	"can_rollback" boolean DEFAULT true,
	"initiated_by" uuid NOT NULL,
	"approved_by" uuid,
	"confirmation_token" varchar(100),
	"confirmation_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"validation_warnings" jsonb DEFAULT '[]',
	"impact_assessment" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	CONSTRAINT "restore_operations_operation_id_unique" UNIQUE("operation_id")
);
--> statement-breakpoint
CREATE TABLE "brand_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"category" text NOT NULL,
	"theme_key" text NOT NULL,
	"config_data" jsonb NOT NULL,
	"is_active" boolean DEFAULT false,
	"is_default" boolean DEFAULT false,
	"environment" text DEFAULT 'dev',
	"variant" text,
	"weight" integer DEFAULT 100,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
CREATE TABLE "user_achievements" (
	"user_id" uuid NOT NULL,
	"achievement_id" integer NOT NULL,
	"awarded_at" timestamp DEFAULT now() NOT NULL,
	"progress" jsonb DEFAULT '{}' NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
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
CREATE TABLE "user_mission_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
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
CREATE TABLE "platform_statistics" (
	"stat_id" serial PRIMARY KEY NOT NULL,
	"stat_key" varchar(100) NOT NULL,
	"stat_value" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platform_statistics_stat_key_unique" UNIQUE("stat_key")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"endpoint" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" "notification_type" NOT NULL,
	"event_log_id" uuid,
	"title" varchar(255) NOT NULL,
	"body" text,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"event_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"session_id" uuid,
	"event_type" varchar(100) NOT NULL,
	"data" jsonb DEFAULT '{}' NOT NULL,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_feed" (
	"activity_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"activity_data" jsonb DEFAULT '{}' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_manual_airdrop_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"token_type" "token_type_admin_airdrop" NOT NULL,
	"amount" integer NOT NULL,
	"group_id" integer,
	"note" text,
	"airdrop_batch_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_abuse_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"strike_count" integer DEFAULT 0 NOT NULL,
	"last_strike_at" timestamp,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cooldown_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"action_key" varchar(100) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentions_index" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" "mention_source_type" NOT NULL,
	"source_id" integer NOT NULL,
	"mentioning_user_id" uuid NOT NULL,
	"mentioned_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_sources_slug_unique" UNIQUE("slug"),
	CONSTRAINT "referral_sources_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"referred_by_user_id" uuid,
	"referral_source_id" integer,
	"bonus_granted" boolean DEFAULT false NOT NULL,
	"reward_metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_referrals_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "event_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" "event_type" NOT NULL,
	"related_id" uuid,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "economy_config_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dictionary_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"word" text NOT NULL,
	"definition" text NOT NULL,
	"usage_example" text,
	"tags" text[] DEFAULT '{}',
	"author_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"approver_id" uuid,
	"upvote_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"meta_description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "dictionary_entries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dictionary_upvotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_dictionary_upvote" UNIQUE("entry_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentioned_user_id" uuid NOT NULL,
	"mentioning_user_id" uuid NOT NULL,
	"type" "mention_type" NOT NULL,
	"thread_id" integer,
	"post_id" integer,
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
CREATE TABLE "user_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" uuid NOT NULL,
	"followee_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_follows_follower_id_followee_id_unique" UNIQUE("follower_id","followee_id")
);
--> statement-breakpoint
CREATE TABLE "friend_group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"friendship_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
CREATE TABLE "ccpayment_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"ccpayment_user_id" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ccpayment_users_ccpayment_user_id_unique" UNIQUE("ccpayment_user_id")
);
--> statement-breakpoint
CREATE TABLE "crypto_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"ccpayment_user_id" varchar(64) NOT NULL,
	"coin_id" integer NOT NULL,
	"coin_symbol" varchar(20) NOT NULL,
	"chain" varchar(50) NOT NULL,
	"address" varchar(255) NOT NULL,
	"memo" varchar(255),
	"qr_code_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deposit_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"record_id" varchar(255) NOT NULL,
	"coin_id" integer NOT NULL,
	"coin_symbol" varchar(20) NOT NULL,
	"chain" varchar(50) NOT NULL,
	"contract" varchar(255),
	"amount" numeric(36, 18) NOT NULL,
	"service_fee" numeric(36, 18),
	"coin_usd_price" numeric(18, 8),
	"usdt_amount" numeric(36, 18),
	"dgt_amount" numeric(36, 18),
	"conversion_rate" numeric(10, 4),
	"original_token" varchar(20),
	"from_address" varchar(255),
	"to_address" varchar(255) NOT NULL,
	"to_memo" varchar(255),
	"tx_id" varchar(255),
	"status" varchar(20) NOT NULL,
	"is_flagged_risky" boolean DEFAULT false,
	"arrived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deposit_records_record_id_unique" UNIQUE("record_id")
);
--> statement-breakpoint
CREATE TABLE "withdrawal_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"record_id" varchar(255) NOT NULL,
	"coin_id" integer NOT NULL,
	"coin_symbol" varchar(20) NOT NULL,
	"chain" varchar(50) NOT NULL,
	"contract" varchar(255),
	"amount" numeric(36, 18) NOT NULL,
	"service_fee" numeric(36, 18),
	"coin_usd_price" numeric(18, 8),
	"from_address" varchar(255),
	"to_address" varchar(255) NOT NULL,
	"to_memo" varchar(255),
	"tx_id" varchar(255),
	"withdraw_type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"failure_reason" varchar(500),
	"is_flagged_risky" boolean DEFAULT false,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "withdrawal_records_record_id_unique" UNIQUE("record_id")
);
--> statement-breakpoint
CREATE TABLE "internal_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"record_id" varchar(255) NOT NULL,
	"coin_id" integer NOT NULL,
	"coin_symbol" varchar(20) NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"service_fee" numeric(36, 18),
	"coin_usd_price" numeric(18, 8),
	"status" varchar(20) NOT NULL,
	"failure_reason" varchar(500),
	"note" varchar(1000),
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internal_transfers_record_id_unique" UNIQUE("record_id")
);
--> statement-breakpoint
CREATE TABLE "swap_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"record_id" varchar(255) NOT NULL,
	"from_coin_id" integer NOT NULL,
	"from_coin_symbol" varchar(20) NOT NULL,
	"from_amount" numeric(36, 18) NOT NULL,
	"from_coin_usd_price" numeric(18, 8),
	"to_coin_id" integer NOT NULL,
	"to_coin_symbol" varchar(20) NOT NULL,
	"to_amount" numeric(36, 18) NOT NULL,
	"to_coin_usd_price" numeric(18, 8),
	"exchange_rate" numeric(36, 18),
	"service_fee" numeric(36, 18),
	"status" varchar(20) NOT NULL,
	"failure_reason" varchar(500),
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "swap_records_record_id_unique" UNIQUE("record_id")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"webhook_id" varchar(255) NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"raw_payload" text NOT NULL,
	"signature" varchar(500),
	"is_processed" boolean DEFAULT false,
	"processed_at" timestamp,
	"processing_error" text,
	"retry_count" varchar(10) DEFAULT '0',
	"related_record_type" varchar(50),
	"related_record_id" varchar(255),
	"received_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_webhook_id_unique" UNIQUE("webhook_id")
);
--> statement-breakpoint
CREATE TABLE "supported_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"coin_id" integer NOT NULL,
	"coin_symbol" varchar(20) NOT NULL,
	"coin_name" varchar(100) NOT NULL,
	"chain" varchar(50) NOT NULL,
	"contract" varchar(255),
	"decimals" integer DEFAULT 18 NOT NULL,
	"min_deposit_amount" numeric(36, 18),
	"min_withdraw_amount" numeric(36, 18),
	"withdraw_fee" numeric(36, 18),
	"is_active" boolean DEFAULT true,
	"supports_deposit" boolean DEFAULT true,
	"supports_withdraw" boolean DEFAULT true,
	"supports_swap" boolean DEFAULT true,
	"icon_url" varchar(500),
	"explorer_url" varchar(500),
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supported_tokens_coin_id_unique" UNIQUE("coin_id")
);
--> statement-breakpoint
CREATE TABLE "sticker_packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(150) NOT NULL,
	"description" text,
	"cover_url" varchar(255),
	"preview_url" varchar(255),
	"theme" varchar(50),
	"total_stickers" integer DEFAULT 0 NOT NULL,
	"unlock_type" varchar(20) DEFAULT 'shop' NOT NULL,
	"price_dgt" bigint DEFAULT 0,
	"required_xp" integer,
	"required_level" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_promoted" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0,
	"total_unlocks" integer DEFAULT 0 NOT NULL,
	"popularity_score" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"admin_notes" text,
	CONSTRAINT "sticker_packs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sticker_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"sticker_id" integer NOT NULL,
	"context_type" varchar(20) NOT NULL,
	"context_id" varchar(50),
	"used_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "stickers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"shortcode" varchar(30) NOT NULL,
	"description" text,
	"static_url" varchar(255) NOT NULL,
	"animated_url" varchar(255),
	"thumbnail_url" varchar(255),
	"width" integer DEFAULT 128,
	"height" integer DEFAULT 128,
	"static_file_size" integer,
	"animated_file_size" integer,
	"format" varchar(15) DEFAULT 'webp',
	"rarity" varchar(20) DEFAULT 'common' NOT NULL,
	"pack_id" integer,
	"unlock_type" varchar(20) DEFAULT 'shop' NOT NULL,
	"price_dgt" bigint DEFAULT 0,
	"required_xp" integer,
	"required_level" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_animated" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"total_unlocks" integer DEFAULT 0 NOT NULL,
	"total_usage" integer DEFAULT 0 NOT NULL,
	"popularity_score" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"admin_notes" text,
	"tags" text,
	CONSTRAINT "stickers_name_unique" UNIQUE("name"),
	CONSTRAINT "stickers_shortcode_unique" UNIQUE("shortcode")
);
--> statement-breakpoint
CREATE TABLE "user_sticker_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"sticker_id" integer NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"unlock_method" varchar(20) NOT NULL,
	"price_paid" bigint DEFAULT 0,
	"is_equipped" boolean DEFAULT false NOT NULL,
	"slot_position" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used" timestamp,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sticker_packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"pack_id" integer NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"unlock_method" varchar(20) NOT NULL,
	"price_paid" bigint DEFAULT 0,
	"stickers_unlocked" integer DEFAULT 0 NOT NULL,
	"total_stickers" integer DEFAULT 0 NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_frame_id_avatar_frames_id_fk" FOREIGN KEY ("active_frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_frame_id_avatar_frames_id_fk" FOREIGN KEY ("avatar_frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_primary_role_id_roles_role_id_fk" FOREIGN KEY ("primary_role_id") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referrer_id_users_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_title_id_titles_title_id_fk" FOREIGN KEY ("active_title_id") REFERENCES "public"."titles"("title_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_badge_id_badges_badge_id_fk" FOREIGN KEY ("active_badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_pinned_post_id_posts_post_id_fk" FOREIGN KEY ("pinned_post_id") REFERENCES "public"."posts"("post_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "display_preferences" ADD CONSTRAINT "display_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_granted_by_users_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_perm_id_permissions_perm_id_fk" FOREIGN KEY ("perm_id") REFERENCES "public"."permissions"("perm_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_granted_by_users_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_banned_by_users_user_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_lifted_by_users_user_id_fk" FOREIGN KEY ("lifted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_follower_id_users_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_relationships" ADD CONSTRAINT "user_relationships_following_id_users_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings_history" ADD CONSTRAINT "user_settings_history_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_owned_frames" ADD CONSTRAINT "user_owned_frames_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_owned_frames" ADD CONSTRAINT "user_owned_frames_frame_id_avatar_frames_id_fk" FOREIGN KEY ("frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_social_preferences" ADD CONSTRAINT "user_social_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_permissions" ADD CONSTRAINT "feature_permissions_group_id_roles_role_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."roles"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_structure" ADD CONSTRAINT "forum_structure_parent_id_forum_structure_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_structure"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_structure" ADD CONSTRAINT "forum_structure_min_group_id_required_roles_role_id_fk" FOREIGN KEY ("min_group_id_required") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_prefix_id_thread_prefixes_prefix_id_fk" FOREIGN KEY ("prefix_id") REFERENCES "public"."thread_prefixes"("prefix_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_featured_by_users_user_id_fk" FOREIGN KEY ("featured_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_deleted_by_users_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_reply_to_post_id_posts_post_id_fk" FOREIGN KEY ("reply_to_post_id") REFERENCES "public"."posts"("post_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_deleted_by_users_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_edited_by_users_user_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_prefixes" ADD CONSTRAINT "thread_prefixes_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_tags" ADD CONSTRAINT "thread_tags_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_tags" ADD CONSTRAINT "thread_tags_tag_id_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("tag_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_prefix_id_thread_prefixes_prefix_id_fk" FOREIGN KEY ("prefix_id") REFERENCES "public"."thread_prefixes"("prefix_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_thread_bookmarks" ADD CONSTRAINT "user_thread_bookmarks_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_thread_bookmarks" ADD CONSTRAINT "user_thread_bookmarks_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_rules" ADD CONSTRAINT "forum_rules_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_rules" ADD CONSTRAINT "forum_rules_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rules_agreements" ADD CONSTRAINT "user_rules_agreements_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rules_agreements" ADD CONSTRAINT "user_rules_agreements_rule_id_forum_rules_rule_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."forum_rules"("rule_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_emojis" ADD CONSTRAINT "custom_emojis_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_liked_by_user_id_users_user_id_fk" FOREIGN KEY ("liked_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_feature_permissions" ADD CONSTRAINT "thread_feature_permissions_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_polls_poll_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("poll_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("option_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emoji_packs" ADD CONSTRAINT "emoji_packs_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emoji_pack_items" ADD CONSTRAINT "emoji_pack_items_pack_id_emoji_packs_pack_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."emoji_packs"("pack_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emoji_pack_items" ADD CONSTRAINT "emoji_pack_items_emoji_id_custom_emojis_emoji_id_fk" FOREIGN KEY ("emoji_id") REFERENCES "public"."custom_emojis"("emoji_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_emoji_packs" ADD CONSTRAINT "user_emoji_packs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_emoji_packs" ADD CONSTRAINT "user_emoji_packs_emoji_pack_id_emoji_packs_pack_id_fk" FOREIGN KEY ("emoji_pack_id") REFERENCES "public"."emoji_packs"("pack_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_deleted_by_users_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("wallet_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_users_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_users_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_reward_title_id_titles_title_id_fk" FOREIGN KEY ("reward_title_id") REFERENCES "public"."titles"("title_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_reward_badge_id_badges_badge_id_fk" FOREIGN KEY ("reward_badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_adjustment_logs" ADD CONSTRAINT "xp_adjustment_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_adjustment_logs" ADD CONSTRAINT "xp_adjustment_logs_admin_id_users_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_title_id_titles_title_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("title_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_lock_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("lock_transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_unlock_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("unlock_transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_processed_by_users_user_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_commands" ADD CONSTRAINT "user_commands_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rain_events" ADD CONSTRAINT "rain_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rain_events" ADD CONSTRAINT "rain_events_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tips" ADD CONSTRAINT "post_tips_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tips" ADD CONSTRAINT "post_tips_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgt_purchase_orders" ADD CONSTRAINT "dgt_purchase_orders_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dgt_economy_parameters" ADD CONSTRAINT "dgt_economy_parameters_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_treasury_settings" ADD CONSTRAINT "platform_treasury_settings_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_clout_log" ADD CONSTRAINT "user_clout_log_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_clout_log" ADD CONSTRAINT "user_clout_log_achievement_id_clout_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."clout_achievements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airdrop_settings" ADD CONSTRAINT "airdrop_settings_target_group_id_roles_role_id_fk" FOREIGN KEY ("target_group_id") REFERENCES "public"."roles"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airdrop_records" ADD CONSTRAINT "airdrop_records_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_logs" ADD CONSTRAINT "xp_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_featured_image_id_media_library_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media_library"("media_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_digital_file_id_media_library_media_id_fk" FOREIGN KEY ("digital_file_id") REFERENCES "public"."media_library"("media_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_frame_id_avatar_frames_id_fk" FOREIGN KEY ("frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_image_id_media_library_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_library"("media_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_id_media_library_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_library"("media_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_links" ADD CONSTRAINT "inventory_transaction_links_inventory_id_user_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."user_inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_links" ADD CONSTRAINT "inventory_transaction_links_dgt_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("dgt_transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_signature_items" ADD CONSTRAINT "user_signature_items_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_signature_items" ADD CONSTRAINT "user_signature_items_signature_item_id_signature_shop_items_id_fk" FOREIGN KEY ("signature_item_id") REFERENCES "public"."signature_shop_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animation_pack_items" ADD CONSTRAINT "animation_pack_items_pack_id_animation_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."animation_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animation_pack_items" ADD CONSTRAINT "animation_pack_items_media_id_media_library_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_library"("media_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("message_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_users_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_recipient_id_users_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_min_group_id_required_roles_role_id_fk" FOREIGN KEY ("min_group_id_required") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_messages" ADD CONSTRAINT "shoutbox_messages_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_messages" ADD CONSTRAINT "shoutbox_messages_room_id_chat_rooms_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("room_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_users" ADD CONSTRAINT "online_users_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_users" ADD CONSTRAINT "online_users_room_id_chat_rooms_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("room_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_content" ADD CONSTRAINT "reported_content_reporter_id_users_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_content" ADD CONSTRAINT "reported_content_resolved_by_users_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_moderation_actions" ADD CONSTRAINT "content_moderation_actions_moderator_id_users_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_themes" ADD CONSTRAINT "admin_themes_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_templates" ADD CONSTRAINT "site_templates_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_deleted_by_users_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_analytics" ADD CONSTRAINT "ui_analytics_quote_id_ui_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."ui_quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_analytics" ADD CONSTRAINT "ui_analytics_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_collection_quotes" ADD CONSTRAINT "ui_collection_quotes_collection_id_ui_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."ui_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_collection_quotes" ADD CONSTRAINT "ui_collection_quotes_quote_id_ui_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."ui_quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_collections" ADD CONSTRAINT "ui_collections_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_quotes" ADD CONSTRAINT "ui_quotes_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_notes" ADD CONSTRAINT "moderator_notes_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_template_logs" ADD CONSTRAINT "email_template_logs_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_template_logs" ADD CONSTRAINT "email_template_logs_recipient_user_id_users_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_template_versions" ADD CONSTRAINT "email_template_versions_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_template_versions" ADD CONSTRAINT "email_template_versions_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_backups" ADD CONSTRAINT "admin_backups_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_schedules" ADD CONSTRAINT "backup_schedules_last_backup_id_admin_backups_id_fk" FOREIGN KEY ("last_backup_id") REFERENCES "public"."admin_backups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_schedules" ADD CONSTRAINT "backup_schedules_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_schedules" ADD CONSTRAINT "backup_schedules_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_settings" ADD CONSTRAINT "backup_settings_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restore_operations" ADD CONSTRAINT "restore_operations_source_backup_id_admin_backups_id_fk" FOREIGN KEY ("source_backup_id") REFERENCES "public"."admin_backups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restore_operations" ADD CONSTRAINT "restore_operations_pre_restore_backup_id_admin_backups_id_fk" FOREIGN KEY ("pre_restore_backup_id") REFERENCES "public"."admin_backups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restore_operations" ADD CONSTRAINT "restore_operations_initiated_by_users_user_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restore_operations" ADD CONSTRAINT "restore_operations_approved_by_users_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_configurations" ADD CONSTRAINT "brand_configurations_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_achievement_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("achievement_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_log_id_event_logs_id_fk" FOREIGN KEY ("event_log_id") REFERENCES "public"."event_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ADD CONSTRAINT "admin_manual_airdrop_logs_admin_id_users_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ADD CONSTRAINT "admin_manual_airdrop_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ADD CONSTRAINT "admin_manual_airdrop_logs_group_id_roles_role_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_abuse_flags" ADD CONSTRAINT "user_abuse_flags_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooldown_state" ADD CONSTRAINT "cooldown_state_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions_index" ADD CONSTRAINT "mentions_index_mentioning_user_id_users_user_id_fk" FOREIGN KEY ("mentioning_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions_index" ADD CONSTRAINT "mentions_index_mentioned_user_id_users_user_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_sources" ADD CONSTRAINT "referral_sources_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_referred_by_user_id_users_user_id_fk" FOREIGN KEY ("referred_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_referral_source_id_referral_sources_id_fk" FOREIGN KEY ("referral_source_id") REFERENCES "public"."referral_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictionary_entries" ADD CONSTRAINT "dictionary_entries_author_id_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictionary_entries" ADD CONSTRAINT "dictionary_entries_approver_id_users_user_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictionary_upvotes" ADD CONSTRAINT "dictionary_upvotes_entry_id_dictionary_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."dictionary_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictionary_upvotes" ADD CONSTRAINT "dictionary_upvotes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_mentioned_user_id_users_user_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_mentioning_user_id_users_user_id_fk" FOREIGN KEY ("mentioning_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mention_preferences" ADD CONSTRAINT "user_mention_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followee_id_users_user_id_fk" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_group_members" ADD CONSTRAINT "friend_group_members_group_id_friend_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."friend_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_group_members" ADD CONSTRAINT "friend_group_members_friendship_id_friendships_id_fk" FOREIGN KEY ("friendship_id") REFERENCES "public"."friendships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_groups" ADD CONSTRAINT "friend_groups_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_user_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_friend_preferences" ADD CONSTRAINT "user_friend_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccpayment_users" ADD CONSTRAINT "ccpayment_users_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD CONSTRAINT "crypto_wallets_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_records" ADD CONSTRAINT "deposit_records_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_records" ADD CONSTRAINT "withdrawal_records_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_transfers" ADD CONSTRAINT "internal_transfers_from_user_id_users_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_transfers" ADD CONSTRAINT "internal_transfers_to_user_id_users_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swap_records" ADD CONSTRAINT "swap_records_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sticker_packs" ADD CONSTRAINT "sticker_packs_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sticker_usage" ADD CONSTRAINT "sticker_usage_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sticker_usage" ADD CONSTRAINT "sticker_usage_sticker_id_stickers_id_fk" FOREIGN KEY ("sticker_id") REFERENCES "public"."stickers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stickers" ADD CONSTRAINT "stickers_pack_id_sticker_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."sticker_packs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stickers" ADD CONSTRAINT "stickers_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sticker_inventory" ADD CONSTRAINT "user_sticker_inventory_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sticker_inventory" ADD CONSTRAINT "user_sticker_inventory_sticker_id_stickers_id_fk" FOREIGN KEY ("sticker_id") REFERENCES "public"."stickers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sticker_packs" ADD CONSTRAINT "user_sticker_packs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sticker_packs" ADD CONSTRAINT "user_sticker_packs_pack_id_sticker_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."sticker_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_display_preferences_user_id" ON "display_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_settings_user_id" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_token" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_threads_structure_id" ON "threads" USING btree ("structure_id");--> statement-breakpoint
CREATE INDEX "idx_threads_user_id" ON "threads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_threads_created_at" ON "threads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_threads_hot_score" ON "threads" USING btree ("hot_score");--> statement-breakpoint
CREATE INDEX "idx_threads_is_boosted" ON "threads" USING btree ("is_boosted");--> statement-breakpoint
CREATE INDEX "idx_posts_thread_id" ON "posts" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "idx_posts_reply_to" ON "posts" USING btree ("reply_to_post_id");--> statement-breakpoint
CREATE INDEX "idx_posts_user_id" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_posts_total_tips" ON "posts" USING btree ("total_tips");--> statement-breakpoint
CREATE INDEX "idx_post_reactions_post_id" ON "post_reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_post_reactions_reaction_type" ON "post_reactions" USING btree ("reaction_type");--> statement-breakpoint
CREATE INDEX "idx_user_thread_bookmarks_user_id" ON "user_thread_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_forum_rules_section" ON "forum_rules" USING btree ("section");--> statement-breakpoint
CREATE INDEX "idx_forum_rules_status" ON "forum_rules" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_rules_agreements_user_id" ON "user_rules_agreements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_custom_emojis_name" ON "custom_emojis" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_custom_emojis_category" ON "custom_emojis" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_custom_emojis_type" ON "custom_emojis" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_custom_emojis_unlock_type" ON "custom_emojis" USING btree ("unlock_type");--> statement-breakpoint
CREATE INDEX "idx_emoji_packs_name" ON "emoji_packs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_emoji_packs_featured" ON "emoji_packs" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_pack_emoji_unique" ON "emoji_pack_items" USING btree ("pack_id","emoji_id");--> statement-breakpoint
CREATE INDEX "idx_user_pack_unique" ON "user_emoji_packs" USING btree ("user_id","emoji_pack_id");--> statement-breakpoint
CREATE INDEX "idx_wallets_user_id" ON "wallets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_id" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_wallet_id" ON "transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_from_user_id" ON "transactions" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_to_user_id" ON "transactions" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_type" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_transactions_created_at" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_type_status" ON "transactions" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "idx_vaults_user_id" ON "vaults" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_vaults_status" ON "vaults" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_vaults_unlock_time" ON "vaults" USING btree ("unlock_time");--> statement-breakpoint
CREATE INDEX "idx_vaults_wallet_address" ON "vaults" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_user_id" ON "withdrawal_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_status" ON "withdrawal_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_requests_created_at" ON "withdrawal_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_dgt_packages_name" ON "dgt_packages" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_dgt_packages_active" ON "dgt_packages" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_dgt_packages_featured" ON "dgt_packages" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_dgt_purchase_orders_user_id" ON "dgt_purchase_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_dgt_purchase_orders_status" ON "dgt_purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_dgt_purchase_orders_ccpayment_ref" ON "dgt_purchase_orders" USING btree ("ccpayment_reference");--> statement-breakpoint
CREATE INDEX "idx_dgt_purchase_orders_created_at" ON "dgt_purchase_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_clout" ON "user_clout_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_xp_logs_user_date" ON "xp_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_products_category_id" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_products_created_at" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_products_available_from" ON "products" USING btree ("available_from");--> statement-breakpoint
CREATE INDEX "idx_products_available_until" ON "products" USING btree ("available_until");--> statement-breakpoint
CREATE INDEX "idx_products_featured_until" ON "products" USING btree ("featured_until");--> statement-breakpoint
CREATE INDEX "idx_product_categories_parent_id" ON "product_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_product_media_product_id" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orders_created_at" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_product_id" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_product_idx" ON "user_inventory" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_user_id" ON "inventory_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_product_id" ON "inventory_transactions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_transaction_type" ON "inventory_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_created_at" ON "inventory_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_cosmetic_categories_slug" ON "cosmetic_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_rarities_rarity_score" ON "rarities" USING btree ("rarity_score");--> statement-breakpoint
CREATE INDEX "idx_conversations_created_by" ON "conversations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_conversations_updated_at" ON "conversations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_conversation_participants_conversation_id" ON "conversation_participants" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_conversation_participants_user_id" ON "conversation_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_message_reads_message_id" ON "message_reads" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_direct_messages_sender_id" ON "direct_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_direct_messages_recipient_id" ON "direct_messages" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "idx_direct_messages_timestamp" ON "direct_messages" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_name" ON "chat_rooms" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_is_private" ON "chat_rooms" USING btree ("is_private");--> statement-breakpoint
CREATE INDEX "idx_chat_rooms_order" ON "chat_rooms" USING btree ("order");--> statement-breakpoint
CREATE INDEX "idx_shoutbox_messages_user_id" ON "shoutbox_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_shoutbox_messages_room_id" ON "shoutbox_messages" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "idx_shoutbox_messages_created_at" ON "shoutbox_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_online_users_user_id" ON "online_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_online_users_last_active" ON "online_users" USING btree ("last_active");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity_type" ON "audit_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_announcements_created_by" ON "announcements" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_announcements_created_at" ON "announcements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_media_library_user_id" ON "media_library" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_media_library_type" ON "media_library" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_media_library_created_at" ON "media_library" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_user_id" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_type" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_created_at" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_mentions_mentioned_user" ON "mentions_index" USING btree ("mentioned_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_mentions_unique" ON "mentions_index" USING btree ("source_type","source_id","mentioned_user_id");--> statement-breakpoint
CREATE INDEX "idx_event_logs_user_created" ON "event_logs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_event_logs_type_created" ON "event_logs" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "follower_idx" ON "user_follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "followee_idx" ON "user_follows" USING btree ("followee_id");--> statement-breakpoint
CREATE INDEX "follows_created_at_idx" ON "user_follows" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ccpayment_users_user_id" ON "ccpayment_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ccpayment_users_ccpayment_user_id" ON "ccpayment_users" USING btree ("ccpayment_user_id");--> statement-breakpoint
CREATE INDEX "idx_crypto_wallets_user_id" ON "crypto_wallets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_crypto_wallets_ccpayment_user_id" ON "crypto_wallets" USING btree ("ccpayment_user_id");--> statement-breakpoint
CREATE INDEX "idx_crypto_wallets_coin_chain" ON "crypto_wallets" USING btree ("coin_id","chain");--> statement-breakpoint
CREATE INDEX "idx_crypto_wallets_address" ON "crypto_wallets" USING btree ("address");--> statement-breakpoint
CREATE INDEX "idx_deposit_records_user_id" ON "deposit_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_deposit_records_record_id" ON "deposit_records" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "idx_deposit_records_coin_id" ON "deposit_records" USING btree ("coin_id");--> statement-breakpoint
CREATE INDEX "idx_deposit_records_chain" ON "deposit_records" USING btree ("chain");--> statement-breakpoint
CREATE INDEX "idx_deposit_records_status" ON "deposit_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_deposit_records_tx_id" ON "deposit_records" USING btree ("tx_id");--> statement-breakpoint
CREATE INDEX "idx_deposit_records_created_at" ON "deposit_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_records_user_id" ON "withdrawal_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_records_record_id" ON "withdrawal_records" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_records_coin_id" ON "withdrawal_records" USING btree ("coin_id");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_records_chain" ON "withdrawal_records" USING btree ("chain");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_records_status" ON "withdrawal_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_records_withdraw_type" ON "withdrawal_records" USING btree ("withdraw_type");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_records_tx_id" ON "withdrawal_records" USING btree ("tx_id");--> statement-breakpoint
CREATE INDEX "idx_withdrawal_records_created_at" ON "withdrawal_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_internal_transfers_from_user_id" ON "internal_transfers" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "idx_internal_transfers_to_user_id" ON "internal_transfers" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "idx_internal_transfers_record_id" ON "internal_transfers" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "idx_internal_transfers_coin_id" ON "internal_transfers" USING btree ("coin_id");--> statement-breakpoint
CREATE INDEX "idx_internal_transfers_status" ON "internal_transfers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_internal_transfers_created_at" ON "internal_transfers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_swap_records_user_id" ON "swap_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_swap_records_record_id" ON "swap_records" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "idx_swap_records_from_coin_id" ON "swap_records" USING btree ("from_coin_id");--> statement-breakpoint
CREATE INDEX "idx_swap_records_to_coin_id" ON "swap_records" USING btree ("to_coin_id");--> statement-breakpoint
CREATE INDEX "idx_swap_records_status" ON "swap_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_swap_records_created_at" ON "swap_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_webhook_id" ON "webhook_events" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_event_type" ON "webhook_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_status" ON "webhook_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_is_processed" ON "webhook_events" USING btree ("is_processed");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_related_record" ON "webhook_events" USING btree ("related_record_type","related_record_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_received_at" ON "webhook_events" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "idx_supported_tokens_coin_id" ON "supported_tokens" USING btree ("coin_id");--> statement-breakpoint
CREATE INDEX "idx_supported_tokens_coin_symbol" ON "supported_tokens" USING btree ("coin_symbol");--> statement-breakpoint
CREATE INDEX "idx_supported_tokens_chain" ON "supported_tokens" USING btree ("chain");--> statement-breakpoint
CREATE INDEX "idx_supported_tokens_is_active" ON "supported_tokens" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_supported_tokens_supports_deposit" ON "supported_tokens" USING btree ("supports_deposit");--> statement-breakpoint
CREATE INDEX "idx_supported_tokens_supports_withdraw" ON "supported_tokens" USING btree ("supports_withdraw");--> statement-breakpoint
CREATE INDEX "idx_supported_tokens_supports_swap" ON "supported_tokens" USING btree ("supports_swap");--> statement-breakpoint
CREATE INDEX "idx_sticker_packs_name" ON "sticker_packs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_sticker_packs_theme" ON "sticker_packs" USING btree ("theme");--> statement-breakpoint
CREATE INDEX "idx_sticker_packs_unlock_type" ON "sticker_packs" USING btree ("unlock_type");--> statement-breakpoint
CREATE INDEX "idx_sticker_packs_is_active" ON "sticker_packs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_sticker_packs_is_promoted" ON "sticker_packs" USING btree ("is_promoted");--> statement-breakpoint
CREATE INDEX "idx_sticker_packs_sort_order" ON "sticker_packs" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_sticker_usage_user_id" ON "sticker_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sticker_usage_sticker_id" ON "sticker_usage" USING btree ("sticker_id");--> statement-breakpoint
CREATE INDEX "idx_sticker_usage_context_type" ON "sticker_usage" USING btree ("context_type");--> statement-breakpoint
CREATE INDEX "idx_sticker_usage_used_at" ON "sticker_usage" USING btree ("used_at");--> statement-breakpoint
CREATE INDEX "idx_stickers_shortcode" ON "stickers" USING btree ("shortcode");--> statement-breakpoint
CREATE INDEX "idx_stickers_rarity" ON "stickers" USING btree ("rarity");--> statement-breakpoint
CREATE INDEX "idx_stickers_pack_id" ON "stickers" USING btree ("pack_id");--> statement-breakpoint
CREATE INDEX "idx_stickers_unlock_type" ON "stickers" USING btree ("unlock_type");--> statement-breakpoint
CREATE INDEX "idx_stickers_is_active" ON "stickers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_stickers_is_visible" ON "stickers" USING btree ("is_visible");--> statement-breakpoint
CREATE INDEX "idx_stickers_is_animated" ON "stickers" USING btree ("is_animated");--> statement-breakpoint
CREATE INDEX "idx_stickers_popularity" ON "stickers" USING btree ("popularity_score");--> statement-breakpoint
CREATE INDEX "idx_stickers_created_at" ON "stickers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_inventory_user_id" ON "user_sticker_inventory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_inventory_sticker_id" ON "user_sticker_inventory" USING btree ("sticker_id");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_inventory_unlocked_at" ON "user_sticker_inventory" USING btree ("unlocked_at");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_inventory_is_equipped" ON "user_sticker_inventory" USING btree ("is_equipped");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_inventory_slot_position" ON "user_sticker_inventory" USING btree ("slot_position");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_inventory_unique" ON "user_sticker_inventory" USING btree ("user_id","sticker_id");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_packs_user_id" ON "user_sticker_packs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_packs_pack_id" ON "user_sticker_packs" USING btree ("pack_id");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_packs_unlocked_at" ON "user_sticker_packs" USING btree ("unlocked_at");--> statement-breakpoint
CREATE INDEX "idx_user_sticker_packs_unique" ON "user_sticker_packs" USING btree ("user_id","pack_id");