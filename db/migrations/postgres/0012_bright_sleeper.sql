CREATE TABLE "x_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"content_id" integer,
	"x_post_id" varchar(255),
	"shared_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_active_title_id_titles_title_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_active_badge_id_badges_badge_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_pinned_post_id_posts_post_id_fk";
--> statement-breakpoint
ALTER TABLE "cosmetic_drops" DROP CONSTRAINT "cosmetic_drops_subscription_id_subscriptions_subscription_id_fk";
--> statement-breakpoint
ALTER TABLE "threads" DROP CONSTRAINT "threads_prefix_id_thread_prefixes_prefix_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_thread_id_threads_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_reply_to_post_id_posts_post_id_fk";
--> statement-breakpoint
ALTER TABLE "thread_tags" DROP CONSTRAINT "thread_tags_thread_id_threads_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "thread_tags" DROP CONSTRAINT "thread_tags_tag_id_tags_tag_id_fk";
--> statement-breakpoint
ALTER TABLE "post_reactions" DROP CONSTRAINT "post_reactions_post_id_posts_post_id_fk";
--> statement-breakpoint
ALTER TABLE "post_drafts" DROP CONSTRAINT "post_drafts_thread_id_threads_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "thread_drafts" DROP CONSTRAINT "thread_drafts_prefix_id_thread_prefixes_prefix_id_fk";
--> statement-breakpoint
ALTER TABLE "user_thread_bookmarks" DROP CONSTRAINT "user_thread_bookmarks_thread_id_threads_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "user_rules_agreements" DROP CONSTRAINT "user_rules_agreements_rule_id_forum_rules_rule_id_fk";
--> statement-breakpoint
ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_post_id_posts_post_id_fk";
--> statement-breakpoint
ALTER TABLE "thread_feature_permissions" DROP CONSTRAINT "thread_feature_permissions_thread_id_threads_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "polls" DROP CONSTRAINT "polls_thread_id_threads_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "poll_options" DROP CONSTRAINT "poll_options_poll_id_polls_poll_id_fk";
--> statement-breakpoint
ALTER TABLE "poll_votes" DROP CONSTRAINT "poll_votes_option_id_poll_options_option_id_fk";
--> statement-breakpoint
ALTER TABLE "emoji_pack_items" DROP CONSTRAINT "emoji_pack_items_pack_id_emoji_packs_pack_id_fk";
--> statement-breakpoint
ALTER TABLE "emoji_pack_items" DROP CONSTRAINT "emoji_pack_items_emoji_id_custom_emojis_emoji_id_fk";
--> statement-breakpoint
ALTER TABLE "user_emoji_packs" DROP CONSTRAINT "user_emoji_packs_emoji_pack_id_emoji_packs_pack_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_wallet_id_wallets_wallet_id_fk";
--> statement-breakpoint
ALTER TABLE "levels" DROP CONSTRAINT "levels_reward_title_id_titles_title_id_fk";
--> statement-breakpoint
ALTER TABLE "levels" DROP CONSTRAINT "levels_reward_badge_id_badges_badge_id_fk";
--> statement-breakpoint
ALTER TABLE "user_titles" DROP CONSTRAINT "user_titles_title_id_titles_title_id_fk";
--> statement-breakpoint
ALTER TABLE "user_badges" DROP CONSTRAINT "user_badges_badge_id_badges_badge_id_fk";
--> statement-breakpoint
ALTER TABLE "vaults" DROP CONSTRAINT "vaults_lock_transaction_id_transactions_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "vaults" DROP CONSTRAINT "vaults_unlock_transaction_id_transactions_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "withdrawal_requests" DROP CONSTRAINT "withdrawal_requests_transaction_id_transactions_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "rain_events" DROP CONSTRAINT "rain_events_transaction_id_transactions_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "post_tips" DROP CONSTRAINT "post_tips_post_id_posts_post_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_product_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_featured_image_id_media_library_media_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_digital_file_id_media_library_media_id_fk";
--> statement-breakpoint
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_image_id_media_library_media_id_fk";
--> statement-breakpoint
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_parent_id_product_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "product_media" DROP CONSTRAINT "product_media_product_id_products_product_id_fk";
--> statement-breakpoint
ALTER TABLE "product_media" DROP CONSTRAINT "product_media_media_id_media_library_media_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_orders_order_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_products_product_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transaction_links" DROP CONSTRAINT "inventory_transaction_links_dgt_transaction_id_transactions_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "user_inventory" DROP CONSTRAINT "user_inventory_product_id_products_product_id_fk";
--> statement-breakpoint
ALTER TABLE "user_inventory" DROP CONSTRAINT "user_inventory_transaction_id_transactions_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_product_id_products_product_id_fk";
--> statement-breakpoint
ALTER TABLE "animation_pack_items" DROP CONSTRAINT "animation_pack_items_media_id_media_library_media_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_conversation_id_conversations_conversation_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_conversations_conversation_id_fk";
--> statement-breakpoint
ALTER TABLE "message_reads" DROP CONSTRAINT "message_reads_message_id_messages_message_id_fk";
--> statement-breakpoint
ALTER TABLE "shoutbox_messages" DROP CONSTRAINT "shoutbox_messages_room_id_chat_rooms_room_id_fk";
--> statement-breakpoint
ALTER TABLE "online_users" DROP CONSTRAINT "online_users_room_id_chat_rooms_room_id_fk";
--> statement-breakpoint
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_achievement_id_achievements_achievement_id_fk";
--> statement-breakpoint
ALTER TABLE "mentions" DROP CONSTRAINT "mentions_thread_id_threads_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "mentions" DROP CONSTRAINT "mentions_post_id_posts_post_id_fk";
--> statement-breakpoint
ALTER TABLE "shoutbox_pins" DROP CONSTRAINT "shoutbox_pins_message_id_shoutbox_messages_message_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "pinned_post_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "avatar_frames" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "avatar_frames" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_owned_frames" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_owned_frames" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "feature_permissions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "feature_permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "forum_structure" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "forum_structure" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "thread_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "reply_to_post_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "thread_tags" ALTER COLUMN "thread_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "post_reactions" ALTER COLUMN "post_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "post_drafts" ALTER COLUMN "thread_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_thread_bookmarks" ALTER COLUMN "thread_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "post_likes" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "post_likes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "post_likes" ALTER COLUMN "post_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "thread_feature_permissions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "thread_feature_permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "thread_feature_permissions" ALTER COLUMN "thread_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "thread_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "emoji_pack_items" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "emoji_pack_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_emoji_packs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_emoji_packs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "xp_adjustment_logs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "xp_adjustment_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_commands" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_commands" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rain_events" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "rain_events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "post_tips" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "post_tips" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "post_tips" ALTER COLUMN "post_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "dgt_purchase_orders" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "dgt_purchase_orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "cooldown_settings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "cooldown_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "platform_treasury_settings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "platform_treasury_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "clout_achievements" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "clout_achievements" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_clout_log" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_clout_log" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "airdrop_settings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "airdrop_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "airdrop_records" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "airdrop_records" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "xp_logs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "xp_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "inventory_transaction_links" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "inventory_transaction_links" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_inventory" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_inventory" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "signature_shop_items" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "signature_shop_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_signature_items" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_signature_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "animation_packs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animation_packs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "animation_pack_items" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animation_pack_items" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "message_reads" ALTER COLUMN "message_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "online_users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "online_users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "moderator_notes" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "moderator_notes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_template_logs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "email_template_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_template_versions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "email_template_versions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "email_templates" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "email_templates" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "admin_backups" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "admin_backups" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "backup_schedules" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "backup_schedules" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "backup_settings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "backup_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "restore_operations" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "restore_operations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "achievement_events" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "achievement_events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "missions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "missions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_mission_progress" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_mission_progress" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rate_limits" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "rate_limits" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_abuse_flags" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_abuse_flags" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "cooldown_state" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "cooldown_state" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "mentions_index" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "mentions_index" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "referral_sources" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "referral_sources" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_referrals" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_referrals" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "economy_config_overrides" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "economy_config_overrides" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "dictionary_entries" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "dictionary_entries" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "dictionary_upvotes" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "dictionary_upvotes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "thread_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "mentions" ALTER COLUMN "post_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_mention_preferences" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_mention_preferences" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_follows" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_follows" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "friend_group_members" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "friend_group_members" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "friend_groups" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "friend_groups" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_friend_preferences" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_friend_preferences" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ccpayment_users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "ccpayment_users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "crypto_wallets" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "deposit_records" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "deposit_records" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "withdrawal_records" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "withdrawal_records" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "internal_transfers" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "internal_transfers" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "swap_records" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "swap_records" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "webhook_events" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "webhook_events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "supported_tokens" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "supported_tokens" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sticker_packs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "sticker_packs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sticker_usage" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "sticker_usage" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "stickers" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_sticker_inventory" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_sticker_inventory" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "user_sticker_packs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_sticker_packs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "shoutbox_pins" ALTER COLUMN "message_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_bans" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings_history" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "cosmetic_drops" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_benefits" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "thread_prefixes" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_rules" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_emojis" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "poll_options" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "emoji_packs" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "vaults" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "dgt_packages" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "dgt_economy_parameters" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "rain_settings" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "tip_settings" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "xp_clout_settings" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "xp_clout_settings" ADD COLUMN "xp_to_dgt_rate" numeric(10, 4) DEFAULT '0.10' NOT NULL;--> statement-breakpoint
ALTER TABLE "xp_clout_settings" ADD COLUMN "clout_multiplier" numeric(10, 4) DEFAULT '1.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "xp_clout_settings" ADD COLUMN "decay_rate" numeric(10, 4) DEFAULT '0.05' NOT NULL;--> statement-breakpoint
ALTER TABLE "xp_clout_settings" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "product_categories" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "cosmetic_categories" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "rarities" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "shoutbox_messages" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "reported_content" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "content_moderation_actions" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_themes" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "site_templates" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "seo_metadata" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "scheduled_tasks" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "media_library" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "ui_themes" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "leaderboard_history" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_statistics" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_feed" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "x_shares" ADD CONSTRAINT "x_shares_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_title_id_titles_id_fk" FOREIGN KEY ("active_title_id") REFERENCES "public"."titles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_badge_id_badges_id_fk" FOREIGN KEY ("active_badge_id") REFERENCES "public"."badges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_pinned_post_id_posts_id_fk" FOREIGN KEY ("pinned_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cosmetic_drops" ADD CONSTRAINT "cosmetic_drops_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_prefix_id_thread_prefixes_id_fk" FOREIGN KEY ("prefix_id") REFERENCES "public"."thread_prefixes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_reply_to_post_id_posts_id_fk" FOREIGN KEY ("reply_to_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_tags" ADD CONSTRAINT "thread_tags_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_tags" ADD CONSTRAINT "thread_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_prefix_id_thread_prefixes_id_fk" FOREIGN KEY ("prefix_id") REFERENCES "public"."thread_prefixes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_thread_bookmarks" ADD CONSTRAINT "user_thread_bookmarks_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rules_agreements" ADD CONSTRAINT "user_rules_agreements_rule_id_forum_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."forum_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_feature_permissions" ADD CONSTRAINT "thread_feature_permissions_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emoji_pack_items" ADD CONSTRAINT "emoji_pack_items_pack_id_emoji_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."emoji_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emoji_pack_items" ADD CONSTRAINT "emoji_pack_items_emoji_id_custom_emojis_id_fk" FOREIGN KEY ("emoji_id") REFERENCES "public"."custom_emojis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_emoji_packs" ADD CONSTRAINT "user_emoji_packs_emoji_pack_id_emoji_packs_id_fk" FOREIGN KEY ("emoji_pack_id") REFERENCES "public"."emoji_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_reward_title_id_titles_id_fk" FOREIGN KEY ("reward_title_id") REFERENCES "public"."titles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_reward_badge_id_badges_id_fk" FOREIGN KEY ("reward_badge_id") REFERENCES "public"."badges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_titles" ADD CONSTRAINT "user_titles_title_id_titles_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_lock_transaction_id_transactions_id_fk" FOREIGN KEY ("lock_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vaults_unlock_transaction_id_transactions_id_fk" FOREIGN KEY ("unlock_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rain_events" ADD CONSTRAINT "rain_events_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tips" ADD CONSTRAINT "post_tips_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_featured_image_id_media_library_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media_library"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_digital_file_id_media_library_id_fk" FOREIGN KEY ("digital_file_id") REFERENCES "public"."media_library"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_image_id_media_library_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_library"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_id_media_library_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_library"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_links" ADD CONSTRAINT "inventory_transaction_links_dgt_transaction_id_transactions_id_fk" FOREIGN KEY ("dgt_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animation_pack_items" ADD CONSTRAINT "animation_pack_items_media_id_media_library_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_library"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_messages" ADD CONSTRAINT "shoutbox_messages_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "online_users" ADD CONSTRAINT "online_users_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoutbox_pins" ADD CONSTRAINT "shoutbox_pins_message_id_shoutbox_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."shoutbox_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bans" DROP COLUMN "ban_id";--> statement-breakpoint
ALTER TABLE "password_reset_tokens" DROP COLUMN "token_id";--> statement-breakpoint
ALTER TABLE "user_settings_history" DROP COLUMN "history_id";--> statement-breakpoint
ALTER TABLE "cosmetic_drops" DROP COLUMN "drop_id";--> statement-breakpoint
ALTER TABLE "subscription_benefits" DROP COLUMN "benefit_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "subscription_id";--> statement-breakpoint
ALTER TABLE "threads" DROP COLUMN "thread_id";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "post_id";--> statement-breakpoint
ALTER TABLE "thread_prefixes" DROP COLUMN "prefix_id";--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "tag_id";--> statement-breakpoint
ALTER TABLE "post_drafts" DROP COLUMN "draft_id";--> statement-breakpoint
ALTER TABLE "thread_drafts" DROP COLUMN "draft_id";--> statement-breakpoint
ALTER TABLE "forum_rules" DROP COLUMN "rule_id";--> statement-breakpoint
ALTER TABLE "custom_emojis" DROP COLUMN "emoji_id";--> statement-breakpoint
ALTER TABLE "polls" DROP COLUMN "poll_id";--> statement-breakpoint
ALTER TABLE "poll_options" DROP COLUMN "option_id";--> statement-breakpoint
ALTER TABLE "poll_votes" DROP COLUMN "vote_id";--> statement-breakpoint
ALTER TABLE "emoji_packs" DROP COLUMN "pack_id";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "wallet_id";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "transaction_id";--> statement-breakpoint
ALTER TABLE "titles" DROP COLUMN "title_id";--> statement-breakpoint
ALTER TABLE "badges" DROP COLUMN "badge_id";--> statement-breakpoint
ALTER TABLE "vaults" DROP COLUMN "vault_id";--> statement-breakpoint
ALTER TABLE "withdrawal_requests" DROP COLUMN "request_id";--> statement-breakpoint
ALTER TABLE "dgt_packages" DROP COLUMN "package_id";--> statement-breakpoint
ALTER TABLE "dgt_economy_parameters" DROP COLUMN "setting_id";--> statement-breakpoint
ALTER TABLE "rain_settings" DROP COLUMN "setting_id";--> statement-breakpoint
ALTER TABLE "tip_settings" DROP COLUMN "setting_id";--> statement-breakpoint
ALTER TABLE "xp_clout_settings" DROP COLUMN "action_key";--> statement-breakpoint
ALTER TABLE "xp_clout_settings" DROP COLUMN "xp_value";--> statement-breakpoint
ALTER TABLE "xp_clout_settings" DROP COLUMN "clout_value";--> statement-breakpoint
ALTER TABLE "xp_clout_settings" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "product_categories" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "order_id";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "item_id";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "transaction_id";--> statement-breakpoint
ALTER TABLE "cosmetic_categories" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "rarities" DROP COLUMN "rarity_id";--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "conversation_id";--> statement-breakpoint
ALTER TABLE "conversation_participants" DROP COLUMN "participant_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "message_id";--> statement-breakpoint
ALTER TABLE "direct_messages" DROP COLUMN "message_id";--> statement-breakpoint
ALTER TABLE "chat_rooms" DROP COLUMN "room_id";--> statement-breakpoint
ALTER TABLE "shoutbox_messages" DROP COLUMN "message_id";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP COLUMN "log_id";--> statement-breakpoint
ALTER TABLE "reported_content" DROP COLUMN "report_id";--> statement-breakpoint
ALTER TABLE "content_moderation_actions" DROP COLUMN "action_id";--> statement-breakpoint
ALTER TABLE "announcements" DROP COLUMN "announcement_id";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "setting_id";--> statement-breakpoint
ALTER TABLE "admin_themes" DROP COLUMN "theme_id";--> statement-breakpoint
ALTER TABLE "site_templates" DROP COLUMN "template_id";--> statement-breakpoint
ALTER TABLE "feature_flags" DROP COLUMN "flag_id";--> statement-breakpoint
ALTER TABLE "seo_metadata" DROP COLUMN "meta_id";--> statement-breakpoint
ALTER TABLE "scheduled_tasks" DROP COLUMN "task_id";--> statement-breakpoint
ALTER TABLE "media_library" DROP COLUMN "media_id";--> statement-breakpoint
ALTER TABLE "ui_themes" DROP COLUMN "theme_id";--> statement-breakpoint
ALTER TABLE "achievements" DROP COLUMN "achievement_id";--> statement-breakpoint
ALTER TABLE "leaderboard_history" DROP COLUMN "leaderboard_id";--> statement-breakpoint
ALTER TABLE "platform_statistics" DROP COLUMN "stat_id";--> statement-breakpoint
ALTER TABLE "analytics_events" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "activity_feed" DROP COLUMN "activity_id";