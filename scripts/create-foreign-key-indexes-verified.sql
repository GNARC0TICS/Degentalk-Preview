-- Foreign Key Index Creation Script
-- Generated on 2025-07-21T05:40:52.893Z
-- Total indexes to create: 192
-- 
-- This script uses CONCURRENTLY to avoid locking tables during index creation.
-- However, this means it cannot be run inside a transaction block.
-- Run each statement individually or remove CONCURRENTLY if you need transactions.

-- Table: users (8 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_frame_id ON "users"("active_frame_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_avatar_frame_id ON "users"("avatar_frame_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_primary_role_id ON "users"("primary_role_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_referrer_id ON "users"("referrer_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_title_id ON "users"("active_title_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_badge_id ON "users"("active_badge_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_pinned_post_id ON "users"("pinned_post_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_user_id ON "users"("user_id");

-- Table: user-promotions (7 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_promotions_moderator_id ON "user-promotions"("moderator_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_promotions_user_promotion_id ON "user-promotions"("user_promotion_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_promotions_booked_by_user_id ON "user-promotions"("booked_by_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_promotions_message_id ON "user-promotions"("message_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_promotions_user_id ON "user-promotions"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_promotions_content_id ON "user-promotions"("content_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_promotions_thread_id ON "user-promotions"("thread_id");

-- Table: payments (6 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_discussion_thread_id ON "payments"("discussion_thread_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_campaign_id ON "payments"("campaign_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_payer_user_id ON "payments"("payer_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_proposer_user_id ON "payments"("proposer_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_proposal_id ON "payments"("proposal_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_voter_user_id ON "payments"("voter_user_id");

-- Table: mentions (5 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_thread_id ON "mentions"("thread_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_post_id ON "mentions"("post_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_mentioned_user_id ON "mentions"("mentioned_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_mentioning_user_id ON "mentions"("mentioning_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_user_id ON "mentions"("user_id");

-- Table: user_inventory (5 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_inventory_transaction_id ON "user_inventory"("transaction_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_inventory_dgt_transaction_id ON "user_inventory"("dgt_transaction_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_inventory_user_id ON "user_inventory"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_inventory_product_id ON "user_inventory"("product_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_inventory_inventory_id ON "user_inventory"("inventory_id");

-- Table: backups (4 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backups_last_backup_id ON "backups"("last_backup_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backups_pre_restore_backup_id ON "backups"("pre_restore_backup_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backups_operation_id ON "backups"("operation_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backups_source_backup_id ON "backups"("source_backup_id");

-- Table: products (4 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_id ON "products"("category_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured_image_id ON "products"("featured_image_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_digital_file_id ON "products"("digital_file_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_frame_id ON "products"("frame_id");

-- Table: relationships (4 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_relationships_user_id ON "relationships"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_relationships_target_user_id ON "relationships"("target_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_relationships_follower_id ON "relationships"("follower_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_relationships_following_id ON "relationships"("following_id");

-- Table: threads (4 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_prefix_id ON "threads"("prefix_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_structure_id ON "threads"("structure_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_user_id ON "threads"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threads_solving_post_id ON "threads"("solving_post_id");

-- Table: transactions (4 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_id ON "transactions"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_wallet_id ON "transactions"("wallet_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_from_user_id ON "transactions"("from_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_to_user_id ON "transactions"("to_user_id");

-- Table: airdrop-records (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_records_admin_id ON "airdrop-records"("admin_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_records_user_id ON "airdrop-records"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_records_airdrop_batch_id ON "airdrop-records"("airdrop_batch_id");

-- Table: email_templates (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_recipient_user_id ON "email_templates"("recipient_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_previous_version_id ON "email_templates"("previous_version_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_templates_template_id ON "email_templates"("template_id");

-- Table: friends (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_requester_id ON "friends"("requester_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_addressee_id ON "friends"("addressee_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_user_id ON "friends"("user_id");

-- Table: performance (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_thread_id ON "performance"("thread_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_campaign_id ON "performance"("campaign_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_placement_id ON "performance"("placement_id");

-- Table: posts (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_reply_to_post_id ON "posts"("reply_to_post_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_thread_id ON "posts"("thread_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_id ON "posts"("user_id");

-- Table: shoutbox_config (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shoutbox_config_user_id ON "shoutbox_config"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shoutbox_config_ignored_user_id ON "shoutbox_config"("ignored_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shoutbox_config_emoji_id ON "shoutbox_config"("emoji_id");

-- Table: stickers (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_pack_id ON "stickers"("pack_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_user_id ON "stickers"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_sticker_id ON "stickers"("sticker_id");

-- Table: thread_drafts (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thread_drafts_structure_id ON "thread_drafts"("structure_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thread_drafts_prefix_id ON "thread_drafts"("prefix_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thread_drafts_user_id ON "thread_drafts"("user_id");

-- Table: uiConfig (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_uiconfig_user_id ON "uiConfig"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_uiconfig_collection_id ON "uiConfig"("collection_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_uiconfig_quote_id ON "uiConfig"("quote_id");

-- Table: user_referrals (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_referrals_referred_by_user_id ON "user_referrals"("referred_by_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_referrals_referral_source_id ON "user_referrals"("referral_source_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_referrals_user_id ON "user_referrals"("user_id");

-- Table: vaults (3 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vaults_lock_transaction_id ON "vaults"("lock_transaction_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vaults_unlock_transaction_id ON "vaults"("unlock_transaction_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vaults_user_id ON "vaults"("user_id");

-- Table: active_missions (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_missions_template_id ON "active_missions"("template_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_missions_user_id ON "active_missions"("user_id");

-- Table: analytics_events (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_id ON "analytics_events"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_session_id ON "analytics_events"("session_id");

-- Table: animation_pack_items (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_animation_pack_items_pack_id ON "animation_pack_items"("pack_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_animation_pack_items_media_id ON "animation_pack_items"("media_id");

-- Table: direct_messages (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_direct_messages_sender_id ON "direct_messages"("sender_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_direct_messages_recipient_id ON "direct_messages"("recipient_id");

-- Table: entries (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entries_approver_id ON "entries"("approver_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entries_author_id ON "entries"("author_id");

-- Table: event_logs (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_logs_user_id ON "event_logs"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_logs_related_id ON "event_logs"("related_id");

-- Table: internal-transfers (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internal_transfers_from_user_id ON "internal-transfers"("from_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_internal_transfers_to_user_id ON "internal-transfers"("to_user_id");

-- Table: levels (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_levels_reward_title_id ON "levels"("reward_title_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_levels_reward_badge_id ON "levels"("reward_badge_id");

-- Table: mentions_index (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_index_mentioning_user_id ON "mentions_index"("mentioning_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_index_mentioned_user_id ON "mentions_index"("mentioned_user_id");

-- Table: message_reads (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_reads_message_id ON "message_reads"("message_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_reads_user_id ON "message_reads"("user_id");

-- Table: mission_history (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mission_history_user_id ON "mission_history"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mission_history_template_id ON "mission_history"("template_id");

-- Table: mission_progress (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mission_progress_mission_id ON "mission_progress"("mission_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mission_progress_user_id ON "mission_progress"("user_id");

-- Table: notifications (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_event_log_id ON "notifications"("event_log_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON "notifications"("user_id");

-- Table: online_users (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_online_users_room_id ON "online_users"("room_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_online_users_user_id ON "online_users"("user_id");

-- Table: post_drafts (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_drafts_thread_id ON "post_drafts"("thread_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_drafts_user_id ON "post_drafts"("user_id");

-- Table: post_likes (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_likes_post_id ON "post_likes"("post_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_likes_liked_by_user_id ON "post_likes"("liked_by_user_id");

-- Table: post_reactions (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_reactions_user_id ON "post_reactions"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_reactions_post_id ON "post_reactions"("post_id");

-- Table: post_tips (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_tips_post_id ON "post_tips"("post_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_tips_user_id ON "post_tips"("user_id");

-- Table: product_categories (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_categories_image_id ON "product_categories"("image_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_categories_parent_id ON "product_categories"("parent_id");

-- Table: profile_analytics (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_analytics_viewer_user_id ON "profile_analytics"("viewer_user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_analytics_profile_user_id ON "profile_analytics"("profile_user_id");

-- Table: shoutbox_messages (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shoutbox_messages_room_id ON "shoutbox_messages"("room_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shoutbox_messages_user_id ON "shoutbox_messages"("user_id");

-- Table: threadBookmarks (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threadbookmarks_user_id ON "threadBookmarks"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_threadbookmarks_thread_id ON "threadBookmarks"("thread_id");

-- Table: thread_tags (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thread_tags_thread_id ON "thread_tags"("thread_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thread_tags_tag_id ON "thread_tags"("tag_id");

-- Table: upvotes (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_upvotes_entry_id ON "upvotes"("entry_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_upvotes_user_id ON "upvotes"("user_id");

-- Table: user-follows (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_follower_id ON "user-follows"("follower_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_follows_followee_id ON "user-follows"("followee_id");

-- Table: user_clout_log (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_clout_log_achievement_id ON "user_clout_log"("achievement_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_clout_log_user_id ON "user_clout_log"("user_id");

-- Table: user_owned_frames (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_owned_frames_user_id ON "user_owned_frames"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_owned_frames_frame_id ON "user_owned_frames"("frame_id");

-- Table: user_roles (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id ON "user_roles"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role_id ON "user_roles"("role_id");

-- Table: withdrawal_requests (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawal_requests_transaction_id ON "withdrawal_requests"("transaction_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawal_requests_user_id ON "withdrawal_requests"("user_id");

-- Table: xp_adjustment_logs (2 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_xp_adjustment_logs_user_id ON "xp_adjustment_logs"("user_id");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_xp_adjustment_logs_admin_id ON "xp_adjustment_logs"("admin_id");

-- Table: achievement_events (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievement_events_user_id ON "achievement_events"("user_id");

-- Table: activity_feed (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_feed_user_id ON "activity_feed"("user_id");

-- Table: airdrop_records (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_records_user_id ON "airdrop_records"("user_id");

-- Table: airdrop_settings (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_airdrop_settings_target_group_id ON "airdrop_settings"("target_group_id");

-- Table: audit_logs (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON "audit_logs"("user_id");

-- Table: bans (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bans_user_id ON "bans"("user_id");

-- Table: campaigns (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_advertiser_user_id ON "campaigns"("advertiser_user_id");

-- Table: ccpayment-users (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ccpayment_users_user_id ON "ccpayment-users"("user_id");

-- Table: conversation_participants (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_participants_user_id ON "conversation_participants"("user_id");

-- Table: cooldown_state (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cooldown_state_user_id ON "cooldown_state"("user_id");

-- Table: crypto-wallets (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_crypto_wallets_user_id ON "crypto-wallets"("user_id");

-- Table: deposit-records (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deposit_records_user_id ON "deposit-records"("user_id");

-- Table: dgt_purchase_orders (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dgt_purchase_orders_user_id ON "dgt_purchase_orders"("user_id");

-- Table: inventory_transactions (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_transactions_user_id ON "inventory_transactions"("user_id");

-- Table: media_library (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_library_user_id ON "media_library"("user_id");

-- Table: messages (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id ON "messages"("sender_id");

-- Table: mission_streaks (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mission_streaks_user_id ON "mission_streaks"("user_id");

-- Table: moderationActions (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_moderationactions_moderator_id ON "moderationActions"("moderator_id");

-- Table: orders (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON "orders"("user_id");

-- Table: password_reset_tokens (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_password_reset_tokens_user_id ON "password_reset_tokens"("user_id");

-- Table: poll_votes (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_poll_votes_user_id ON "poll_votes"("user_id");

-- Table: polls (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_polls_thread_id ON "polls"("thread_id");

-- Table: preferences (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_preferences_user_id ON "preferences"("user_id");

-- Table: rain_events (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rain_events_user_id ON "rain_events"("user_id");

-- Table: reports (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_reporter_id ON "reports"("reporter_id");

-- Table: role_permissions (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_role_permissions_role_id ON "role_permissions"("role_id");

-- Table: roles (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roles_role_id ON "roles"("role_id");

-- Table: settingsHistory (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settingshistory_user_id ON "settingsHistory"("user_id");

-- Table: structure (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_structure_parent_id ON "structure"("parent_id");

-- Table: subscriptions (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id ON "subscriptions"("user_id");

-- Table: swap-records (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_swap_records_user_id ON "swap-records"("user_id");

-- Table: targeting (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_targeting_campaign_id ON "targeting"("campaign_id");

-- Table: thread_feature_permissions (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thread_feature_permissions_thread_id ON "thread_feature_permissions"("thread_id");

-- Table: user-social-preferences (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_social_preferences_user_id ON "user-social-preferences"("user_id");

-- Table: userRuleAgreements (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_userruleagreements_user_id ON "userRuleAgreements"("user_id");

-- Table: user_abuse_flags (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_abuse_flags_user_id ON "user_abuse_flags"("user_id");

-- Table: user_achievements (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user_id ON "user_achievements"("user_id");

-- Table: user_badges (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_badges_user_id ON "user_badges"("user_id");

-- Table: user_commands (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_commands_user_id ON "user_commands"("user_id");

-- Table: user_emoji_packs (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_emoji_packs_user_id ON "user_emoji_packs"("user_id");

-- Table: user_mission_progress (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_mission_progress_user_id ON "user_mission_progress"("user_id");

-- Table: user_signature_items (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_signature_items_user_id ON "user_signature_items"("user_id");

-- Table: user_titles (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_titles_user_id ON "user_titles"("user_id");

-- Table: verification_tokens (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_tokens_user_id ON "verification_tokens"("user_id");

-- Table: wallets (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_user_id ON "wallets"("user_id");

-- Table: withdrawal-records (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_withdrawal_records_user_id ON "withdrawal-records"("user_id");

-- Table: x_shares (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_x_shares_user_id ON "x_shares"("user_id");

-- Table: xp_logs (1 indexes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_xp_logs_user_id ON "xp_logs"("user_id");


-- Analyze tables after index creation for better query planning
ANALYZE "achievement_events";
ANALYZE "active_missions";
ANALYZE "activity_feed";
ANALYZE "airdrop-records";
ANALYZE "airdrop_records";
ANALYZE "airdrop_settings";
ANALYZE "analytics_events";
ANALYZE "animation_pack_items";
ANALYZE "audit_logs";
ANALYZE "backups";
ANALYZE "bans";
ANALYZE "campaigns";
ANALYZE "ccpayment-users";
ANALYZE "conversation_participants";
ANALYZE "cooldown_state";
ANALYZE "crypto-wallets";
ANALYZE "deposit-records";
ANALYZE "dgt_purchase_orders";
ANALYZE "direct_messages";
ANALYZE "email_templates";
ANALYZE "entries";
ANALYZE "event_logs";
ANALYZE "friends";
ANALYZE "internal-transfers";
ANALYZE "inventory_transactions";
ANALYZE "levels";
ANALYZE "media_library";
ANALYZE "mentions";
ANALYZE "mentions_index";
ANALYZE "message_reads";
ANALYZE "messages";
ANALYZE "mission_history";
ANALYZE "mission_progress";
ANALYZE "mission_streaks";
ANALYZE "moderationActions";
ANALYZE "notifications";
ANALYZE "online_users";
ANALYZE "orders";
ANALYZE "password_reset_tokens";
ANALYZE "payments";
ANALYZE "performance";
ANALYZE "poll_votes";
ANALYZE "polls";
ANALYZE "post_drafts";
ANALYZE "post_likes";
ANALYZE "post_reactions";
ANALYZE "post_tips";
ANALYZE "posts";
ANALYZE "preferences";
ANALYZE "product_categories";
ANALYZE "products";
ANALYZE "profile_analytics";
ANALYZE "rain_events";
ANALYZE "relationships";
ANALYZE "reports";
ANALYZE "role_permissions";
ANALYZE "roles";
ANALYZE "settingsHistory";
ANALYZE "shoutbox_config";
ANALYZE "shoutbox_messages";
ANALYZE "stickers";
ANALYZE "structure";
ANALYZE "subscriptions";
ANALYZE "swap-records";
ANALYZE "targeting";
ANALYZE "threadBookmarks";
ANALYZE "thread_drafts";
ANALYZE "thread_feature_permissions";
ANALYZE "thread_tags";
ANALYZE "threads";
ANALYZE "transactions";
ANALYZE "uiConfig";
ANALYZE "upvotes";
ANALYZE "user-follows";
ANALYZE "user-promotions";
ANALYZE "user-social-preferences";
ANALYZE "userRuleAgreements";
ANALYZE "user_abuse_flags";
ANALYZE "user_achievements";
ANALYZE "user_badges";
ANALYZE "user_clout_log";
ANALYZE "user_commands";
ANALYZE "user_emoji_packs";
ANALYZE "user_inventory";
ANALYZE "user_mission_progress";
ANALYZE "user_owned_frames";
ANALYZE "user_referrals";
ANALYZE "user_roles";
ANALYZE "user_signature_items";
ANALYZE "user_titles";
ANALYZE "users";
ANALYZE "vaults";
ANALYZE "verification_tokens";
ANALYZE "wallets";
ANALYZE "withdrawal-records";
ANALYZE "withdrawal_requests";
ANALYZE "x_shares";
ANALYZE "xp_adjustment_logs";
ANALYZE "xp_logs";
