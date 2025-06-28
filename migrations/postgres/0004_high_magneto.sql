CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."campaign_type" AS ENUM('display_banner', 'sponsored_thread', 'forum_spotlight', 'user_reward', 'native_content');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('dgt_tokens', 'usdt', 'bitcoin', 'ethereum', 'stripe');--> statement-breakpoint
CREATE TYPE "public"."ad_format" AS ENUM('banner_728x90', 'banner_300x250', 'banner_320x50', 'native_card', 'sponsored_post', 'video_overlay', 'popup_modal', 'inline_text');--> statement-breakpoint
CREATE TYPE "public"."placement_position" AS ENUM('header_banner', 'sidebar_top', 'sidebar_middle', 'sidebar_bottom', 'thread_header', 'thread_footer', 'between_posts', 'forum_header', 'zone_header', 'mobile_banner');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('impression', 'click', 'conversion', 'dgt_reward', 'share', 'save', 'report');--> statement-breakpoint
CREATE TYPE "public"."crypto_currency" AS ENUM('DGT', 'USDT', 'BTC', 'ETH', 'USDC', 'BNB');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'confirmed', 'failed', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."promotion_status" AS ENUM('pending', 'approved', 'active', 'completed', 'rejected', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."promotion_type" AS ENUM('thread_boost', 'announcement_bar', 'pinned_shoutbox', 'profile_spotlight', 'achievement_highlight');--> statement-breakpoint
CREATE TYPE "public"."slot_priority" AS ENUM('premium', 'standard', 'economy');--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"advertiser_user_id" uuid NOT NULL,
	"type" "campaign_type" NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"total_budget" numeric(12, 2),
	"daily_budget" numeric(10, 2),
	"spent_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"pricing_model" varchar(10) NOT NULL,
	"bid_amount" numeric(8, 4),
	"start_date" timestamp,
	"end_date" timestamp,
	"targeting_rules" jsonb DEFAULT '{}' NOT NULL,
	"placement_rules" jsonb DEFAULT '{}' NOT NULL,
	"frequency_cap" jsonb DEFAULT '{}' NOT NULL,
	"creative_assets" jsonb DEFAULT '[]' NOT NULL,
	"optimization_goal" varchar(50),
	"quality_score" numeric(3, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_placements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"position" "placement_position" NOT NULL,
	"forum_zone_slug" varchar(100),
	"forum_slug" varchar(100),
	"allowed_formats" jsonb DEFAULT '[]' NOT NULL,
	"dimensions" varchar(20),
	"max_file_size" integer DEFAULT 2097152,
	"floor_price_cpm" numeric(6, 2) DEFAULT '0.50' NOT NULL,
	"max_daily_impressions" integer,
	"priority" integer DEFAULT 1 NOT NULL,
	"targeting_constraints" jsonb DEFAULT '{}' NOT NULL,
	"display_rules" jsonb DEFAULT '{}' NOT NULL,
	"average_ctr" numeric(5, 4) DEFAULT '0.0',
	"total_impressions" integer DEFAULT 0 NOT NULL,
	"total_clicks" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"requires_approval" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ad_placements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "campaign_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"campaign_id" uuid,
	"rule_type" varchar(50) NOT NULL,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"execution_count" integer DEFAULT 0 NOT NULL,
	"last_executed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_impressions" (
	"id" bigint PRIMARY KEY NOT NULL,
	"campaign_id" uuid NOT NULL,
	"placement_id" uuid NOT NULL,
	"user_hash" varchar(64),
	"session_id" varchar(64),
	"interaction_type" "interaction_type" NOT NULL,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"bid_price" numeric(8, 4),
	"paid_price" numeric(8, 4),
	"revenue" numeric(10, 6),
	"currency" varchar(10) DEFAULT 'DGT',
	"forum_slug" varchar(100),
	"thread_id" uuid,
	"device_info" jsonb,
	"geo_data" jsonb,
	"user_agent" varchar(500),
	"referrer" varchar(500),
	"view_duration" integer,
	"scroll_depth" numeric(3, 2),
	"dgt_reward_amount" numeric(10, 2),
	"xp_awarded" integer DEFAULT 0,
	"fraud_score" numeric(3, 2) DEFAULT '0.0',
	"quality_score" numeric(3, 2) DEFAULT '1.0'
);
--> statement-breakpoint
CREATE TABLE "campaign_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"date_hour" timestamp NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"spend" numeric(12, 2) DEFAULT '0' NOT NULL,
	"revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"dgt_rewards" numeric(12, 2) DEFAULT '0' NOT NULL,
	"ctr" numeric(5, 4) DEFAULT '0',
	"cpm" numeric(8, 2) DEFAULT '0',
	"cpc" numeric(8, 4) DEFAULT '0',
	"roas" numeric(5, 2) DEFAULT '0',
	"avg_quality_score" numeric(3, 2) DEFAULT '1.0',
	"fraud_detections" integer DEFAULT 0,
	"unique_users" integer DEFAULT 0,
	"avg_view_duration" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_governance_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"proposer_user_id" uuid NOT NULL,
	"proposal_type" varchar(50) NOT NULL,
	"proposed_changes" jsonb NOT NULL,
	"current_configuration" jsonb,
	"voting_start_at" timestamp NOT NULL,
	"voting_end_at" timestamp NOT NULL,
	"required_quorum" integer DEFAULT 1000,
	"votes_for" integer DEFAULT 0,
	"votes_against" integer DEFAULT 0,
	"total_voting_power" numeric(18, 2) DEFAULT '0',
	"status" varchar(20) DEFAULT 'draft',
	"executed_at" timestamp,
	"execution_result" jsonb,
	"discussion_thread_id" uuid,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_governance_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"voter_user_id" uuid NOT NULL,
	"vote" varchar(10) NOT NULL,
	"voting_power" numeric(18, 2) NOT NULL,
	"vote_reason" text,
	"delegated_from" uuid,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crypto_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_hash" varchar(64) NOT NULL,
	"campaign_id" uuid NOT NULL,
	"payer_user_id" uuid NOT NULL,
	"currency" "crypto_currency" NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"usd_value" numeric(12, 2),
	"transaction_hash" varchar(66),
	"block_number" integer,
	"blockchain_network" varchar(50),
	"from_address" varchar(42),
	"to_address" varchar(42),
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"confirmations" integer DEFAULT 0,
	"required_confirmations" integer DEFAULT 3,
	"network_fee" numeric(18, 8),
	"platform_fee" numeric(12, 2),
	"processing_fee" numeric(12, 2),
	"payment_metadata" jsonb DEFAULT '{}',
	"failure_reason" text,
	"initiated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"confirmed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "crypto_payments_payment_hash_unique" UNIQUE("payment_hash")
);
--> statement-breakpoint
CREATE TABLE "announcement_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_number" integer NOT NULL,
	"priority" "slot_priority" DEFAULT 'standard' NOT NULL,
	"date" date NOT NULL,
	"hour_start" integer NOT NULL,
	"hour_end" integer NOT NULL,
	"user_promotion_id" uuid,
	"booked_by_user_id" uuid,
	"is_booked" boolean DEFAULT false NOT NULL,
	"booked_at" timestamp,
	"base_price" numeric(10, 2) NOT NULL,
	"current_price" numeric(10, 2) NOT NULL,
	"demand_multiplier" numeric(3, 2) DEFAULT '1.0' NOT NULL,
	"max_content_length" integer DEFAULT 200 NOT NULL,
	"allow_images" boolean DEFAULT true NOT NULL,
	"allow_links" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_spotlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_promotion_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"spotlight_message" text NOT NULL,
	"highlighted_achievement" varchar(255),
	"custom_badge_url" varchar(500),
	"display_location" varchar(100) DEFAULT 'sidebar' NOT NULL,
	"display_order" integer DEFAULT 1 NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"profile_views" integer DEFAULT 0 NOT NULL,
	"follows_gained" integer DEFAULT 0 NOT NULL,
	"interaction_increase" numeric(5, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotion_pricing_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promotion_type" "promotion_type" NOT NULL,
	"duration" varchar(50) NOT NULL,
	"base_price_dgt" numeric(10, 2) NOT NULL,
	"demand_multiplier" numeric(3, 2) DEFAULT '1.0' NOT NULL,
	"time_multiplier" numeric(3, 2) DEFAULT '1.0' NOT NULL,
	"weekend_multiplier" numeric(3, 2) DEFAULT '1.2' NOT NULL,
	"peak_hours" text DEFAULT '[18,19,20,21]',
	"peak_multiplier" numeric(3, 2) DEFAULT '1.5' NOT NULL,
	"min_price" numeric(10, 2) NOT NULL,
	"max_price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shoutbox_pins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_promotion_id" uuid NOT NULL,
	"message_id" uuid,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"image_url" varchar(500),
	"link_url" varchar(500),
	"background_color" varchar(20) DEFAULT '#fbbf24',
	"text_color" varchar(20) DEFAULT '#000000',
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"dismissals" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread_boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_promotion_id" uuid NOT NULL,
	"thread_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"boost_multiplier" numeric(3, 2) DEFAULT '2.0' NOT NULL,
	"priority_level" integer DEFAULT 1 NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"extra_views" integer DEFAULT 0 NOT NULL,
	"extra_engagement" integer DEFAULT 0 NOT NULL,
	"position_improvement" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_promotion_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_promotion_id" uuid NOT NULL,
	"date" date NOT NULL,
	"hour" integer,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"average_view_duration" integer DEFAULT 0,
	"bounce_rate" numeric(5, 4) DEFAULT '0',
	"engagement_score" numeric(5, 2) DEFAULT '0',
	"dgt_spent" numeric(10, 2) DEFAULT '0' NOT NULL,
	"cost_per_click" numeric(10, 4) DEFAULT '0',
	"cost_per_conversion" numeric(10, 4) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "promotion_type" NOT NULL,
	"content_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"link_url" varchar(500),
	"target_placement" varchar(100),
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"dgt_cost" numeric(12, 2) NOT NULL,
	"dgt_spent" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "promotion_status" DEFAULT 'pending' NOT NULL,
	"moderator_id" uuid,
	"moderator_notes" text,
	"rejection_reason" text,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"engagement_rate" numeric(5, 4) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"activated_at" timestamp,
	"completed_at" timestamp,
	"auto_renew" boolean DEFAULT false NOT NULL,
	"max_daily_spend" numeric(10, 2),
	"target_audience" text
);
--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "type" TO "event_type";--> statement-breakpoint
ALTER TABLE "achievements" RENAME COLUMN "id" TO "achievement_id";--> statement-breakpoint
ALTER TABLE "achievements" RENAME COLUMN "reward_dgt" TO "reward_points";--> statement-breakpoint
ALTER TABLE "achievements" RENAME COLUMN "requirements" TO "requirement";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievement_unique";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_achievement_id_achievements_id_fk";
--> statement-breakpoint
DROP INDEX "idx_notifications_user_unread";--> statement-breakpoint
DROP INDEX "idx_notifications_type";--> statement-breakpoint
DROP INDEX "idx_notifications_created";--> statement-breakpoint
DROP INDEX "idx_achievements_category";--> statement-breakpoint
DROP INDEX "idx_achievements_rarity";--> statement-breakpoint
DROP INDEX "idx_user_achievements_user";--> statement-breakpoint
DROP INDEX "idx_user_achievements_completed";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "achievement_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "progress" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id");--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "event_log_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "body" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "data" jsonb;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "awarded_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_advertiser_user_id_users_user_id_fk" FOREIGN KEY ("advertiser_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_placement_id_ad_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."ad_placements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_metrics" ADD CONSTRAINT "campaign_metrics_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_governance_proposals" ADD CONSTRAINT "ad_governance_proposals_proposer_user_id_users_user_id_fk" FOREIGN KEY ("proposer_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_governance_votes" ADD CONSTRAINT "ad_governance_votes_proposal_id_ad_governance_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."ad_governance_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_governance_votes" ADD CONSTRAINT "ad_governance_votes_voter_user_id_users_user_id_fk" FOREIGN KEY ("voter_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_payments" ADD CONSTRAINT "crypto_payments_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_payments" ADD CONSTRAINT "crypto_payments_payer_user_id_users_user_id_fk" FOREIGN KEY ("payer_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_slots" ADD CONSTRAINT "announcement_slots_user_promotion_id_user_promotions_id_fk" FOREIGN KEY ("user_promotion_id") REFERENCES "public"."user_promotions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_slots" ADD CONSTRAINT "announcement_slots_booked_by_user_id_users_user_id_fk" FOREIGN KEY ("booked_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_spotlights" ADD CONSTRAINT "profile_spotlights_user_promotion_id_user_promotions_id_fk" FOREIGN KEY ("user_promotion_id") REFERENCES "public"."user_promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_spotlights" ADD CONSTRAINT "profile_spotlights_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_pins" ADD CONSTRAINT "shoutbox_pins_user_promotion_id_user_promotions_id_fk" FOREIGN KEY ("user_promotion_id") REFERENCES "public"."user_promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_pins" ADD CONSTRAINT "shoutbox_pins_message_id_shoutbox_messages_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."shoutbox_messages"("message_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_pins" ADD CONSTRAINT "shoutbox_pins_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_boosts" ADD CONSTRAINT "thread_boosts_user_promotion_id_user_promotions_id_fk" FOREIGN KEY ("user_promotion_id") REFERENCES "public"."user_promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_boosts" ADD CONSTRAINT "thread_boosts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_promotion_analytics" ADD CONSTRAINT "user_promotion_analytics_user_promotion_id_user_promotions_id_fk" FOREIGN KEY ("user_promotion_id") REFERENCES "public"."user_promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_promotions" ADD CONSTRAINT "user_promotions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_promotions" ADD CONSTRAINT "user_promotions_moderator_id_users_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_impressions_timestamp_campaign" ON "ad_impressions" USING btree ("timestamp","campaign_id");--> statement-breakpoint
CREATE INDEX "idx_impressions_campaign_placement" ON "ad_impressions" USING btree ("campaign_id","placement_id");--> statement-breakpoint
CREATE INDEX "idx_impressions_user_timestamp" ON "ad_impressions" USING btree ("user_hash","timestamp");--> statement-breakpoint
CREATE INDEX "idx_impressions_revenue_timestamp" ON "ad_impressions" USING btree ("revenue","timestamp");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_log_id_event_logs_id_fk" FOREIGN KEY ("event_log_id") REFERENCES "public"."event_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_achievement_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("achievement_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "message";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "achievements" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "achievements" DROP COLUMN "rarity";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP COLUMN "is_completed";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP COLUMN "completed_at";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_name_unique" UNIQUE("name");--> statement-breakpoint
DROP TYPE "public"."achievement_rarity";