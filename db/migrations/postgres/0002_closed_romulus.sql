CREATE TYPE "public"."cosmetic_type" AS ENUM('avatar_frame', 'badge', 'title', 'sticker', 'emoji_pack', 'profile_theme');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled', 'lifetime');--> statement-breakpoint
CREATE TYPE "public"."subscription_type" AS ENUM('vip_pass', 'degen_pass');--> statement-breakpoint
CREATE TABLE "cosmetic_drops" (
	"drop_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" integer NOT NULL,
	"drop_month" integer NOT NULL,
	"drop_year" integer NOT NULL,
	"cosmetic_type" "cosmetic_type" NOT NULL,
	"cosmetic_id" integer NOT NULL,
	"cosmetic_name" varchar(100) NOT NULL,
	"cosmetic_value" integer DEFAULT 120 NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp,
	"metadata" jsonb DEFAULT '{}',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_benefits" (
	"benefit_id" serial PRIMARY KEY NOT NULL,
	"subscription_type" "subscription_type" NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"benefit_key" varchar(50) NOT NULL,
	"value" integer,
	"config" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"subscription_id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "subscription_type" NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"price_paid" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'DGT' NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"next_billing_date" timestamp,
	"last_payment_date" timestamp DEFAULT now() NOT NULL,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"last_cosmetic_drop" timestamp,
	"total_cosmetic_value" integer DEFAULT 0 NOT NULL,
	"purchase_transaction_id" integer,
	"benefits" jsonb DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "friend_group_members" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "friend_group_members" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "friend_group_members" ALTER COLUMN "group_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "friend_group_members" ALTER COLUMN "friendship_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "friend_groups" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "friend_groups" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_friend_preferences" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "user_friend_preferences" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cosmetic_drops" ADD CONSTRAINT "cosmetic_drops_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cosmetic_drops" ADD CONSTRAINT "cosmetic_drops_subscription_id_subscriptions_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("subscription_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;