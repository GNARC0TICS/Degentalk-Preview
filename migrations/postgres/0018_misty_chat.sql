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
ALTER TABLE "follow_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_follow_preferences" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "follow_requests" CASCADE;--> statement-breakpoint
DROP TABLE "user_follow_preferences" CASCADE;--> statement-breakpoint
ALTER TABLE "user_follows" DROP CONSTRAINT "user_follows_followed_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_follows" ADD COLUMN "followee_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_social_preferences" ADD CONSTRAINT "user_social_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ccpayment_users" ADD CONSTRAINT "ccpayment_users_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD CONSTRAINT "crypto_wallets_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_records" ADD CONSTRAINT "deposit_records_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawal_records" ADD CONSTRAINT "withdrawal_records_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_transfers" ADD CONSTRAINT "internal_transfers_from_user_id_users_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_transfers" ADD CONSTRAINT "internal_transfers_to_user_id_users_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swap_records" ADD CONSTRAINT "swap_records_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followee_id_users_user_id_fk" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "follower_idx" ON "user_follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "followee_idx" ON "user_follows" USING btree ("followee_id");--> statement-breakpoint
CREATE INDEX "follows_created_at_idx" ON "user_follows" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "user_follows" DROP COLUMN "followed_id";--> statement-breakpoint
ALTER TABLE "user_follows" DROP COLUMN "notify_on_posts";--> statement-breakpoint
ALTER TABLE "user_follows" DROP COLUMN "notify_on_threads";--> statement-breakpoint
ALTER TABLE "user_follows" DROP COLUMN "notify_on_trades";--> statement-breakpoint
ALTER TABLE "user_follows" DROP COLUMN "notify_on_large_stakes";--> statement-breakpoint
ALTER TABLE "user_follows" DROP COLUMN "min_stake_notification";--> statement-breakpoint
ALTER TABLE "user_follows" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "user_follows" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_followee_id_unique" UNIQUE("follower_id","followee_id");