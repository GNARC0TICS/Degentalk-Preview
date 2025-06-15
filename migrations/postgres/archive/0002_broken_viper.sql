CREATE TABLE "feature_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"feature" varchar(100) NOT NULL,
	"group_id" integer,
	"allow" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread_drafts" (
	"draft_id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"category_id" integer,
	"prefix_id" integer,
	"title" varchar(255),
	"content" text,
	"editor_state" jsonb,
	"tags" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
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
	"user_id" integer,
	"token_type" varchar(50),
	"amount" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"transaction_id" integer
);
--> statement-breakpoint
ALTER TABLE "user_inventory" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_inventory" CASCADE;--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_product_id_products_product_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_created_by_users_user_id_fk";
--> statement-breakpoint
DROP INDEX "idx_inventory_transactions_user_id";--> statement-breakpoint
DROP INDEX "idx_inventory_transactions_product_id";--> statement-breakpoint
DROP INDEX "idx_inventory_transactions_transaction_type";--> statement-breakpoint
DROP INDEX "idx_inventory_transactions_created_at";--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "transaction_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_frame_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "group_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_title_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_badge_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "is_zone" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "canonical" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "min_group_id_required" integer;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "inventory_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "quantity_change" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "related_transaction_id" integer;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "dgt_transaction_id" integer;--> statement-breakpoint
ALTER TABLE "feature_permissions" ADD CONSTRAINT "feature_permissions_group_id_user_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("group_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_category_id_forum_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_prefix_id_thread_prefixes_prefix_id_fk" FOREIGN KEY ("prefix_id") REFERENCES "public"."thread_prefixes"("prefix_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airdrop_settings" ADD CONSTRAINT "airdrop_settings_target_group_id_user_groups_group_id_fk" FOREIGN KEY ("target_group_id") REFERENCES "public"."user_groups"("group_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airdrop_records" ADD CONSTRAINT "airdrop_records_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_product_idx" ON "inventory" USING btree ("user_id","product_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_frame_id_avatar_frames_id_fk" FOREIGN KEY ("avatar_frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_group_id_user_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("group_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_title_id_titles_title_id_fk" FOREIGN KEY ("active_title_id") REFERENCES "public"."titles"("title_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_badge_id_badges_badge_id_fk" FOREIGN KEY ("active_badge_id") REFERENCES "public"."badges"("badge_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD CONSTRAINT "forum_categories_parent_id_forum_categories_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_categories"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD CONSTRAINT "forum_categories_min_group_id_required_user_groups_group_id_fk" FOREIGN KEY ("min_group_id_required") REFERENCES "public"."user_groups"("group_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_dgt_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("dgt_transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "transaction_id";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "currency_amount";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "forum_categories" ADD CONSTRAINT "forum_categories_slug_unique" UNIQUE("slug");