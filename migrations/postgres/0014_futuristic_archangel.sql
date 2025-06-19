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
ALTER TABLE "display_preferences" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "notification_settings" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_roles" ALTER COLUMN "granted_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "granted_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_bans" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_bans" ALTER COLUMN "banned_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_bans" ALTER COLUMN "lifted_by" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_relationships" ALTER COLUMN "follower_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_relationships" ALTER COLUMN "following_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_settings_history" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_badges" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "thread_prefixes" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "rollout_percentage" numeric(5, 2) DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_clout_log" ADD CONSTRAINT "user_clout_log_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_clout_log" ADD CONSTRAINT "user_clout_log_achievement_id_clout_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."clout_achievements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictionary_entries" ADD CONSTRAINT "dictionary_entries_author_id_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictionary_entries" ADD CONSTRAINT "dictionary_entries_approver_id_users_user_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictionary_upvotes" ADD CONSTRAINT "dictionary_upvotes_entry_id_dictionary_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."dictionary_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dictionary_upvotes" ADD CONSTRAINT "dictionary_upvotes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_clout" ON "user_clout_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_cosmetic_categories_slug" ON "cosmetic_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_rarities_rarity_score" ON "rarities" USING btree ("rarity_score");--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;