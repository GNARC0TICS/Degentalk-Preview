CREATE TYPE "public"."token_type_admin_airdrop" AS ENUM('XP', 'DGT');--> statement-breakpoint
CREATE TABLE "thread_feature_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"feature" text NOT NULL,
	"allowed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
	"updated_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_treasury_settings_currency_unique" UNIQUE("currency")
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
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"equipped" boolean DEFAULT false NOT NULL,
	"acquired_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"transaction_id" integer,
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "admin_manual_airdrop_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"token_type" "token_type_admin_airdrop" NOT NULL,
	"amount" integer NOT NULL,
	"group_id" integer,
	"note" text,
	"airdrop_batch_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "inventory" CASCADE;--> statement-breakpoint
ALTER TABLE "treasury_settings" RENAME TO "dgt_economy_parameters";--> statement-breakpoint
ALTER TABLE "dgt_economy_parameters" DROP CONSTRAINT "treasury_settings_updated_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_inventory_id_inventory_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_dgt_transaction_id_transactions_transaction_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "transaction_type" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "transaction_id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "product_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "amount" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "currency" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "currency_amount" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "status" varchar(20) DEFAULT 'completed' NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "metadata" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "thread_feature_permissions" ADD CONSTRAINT "thread_feature_permissions_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_treasury_settings" ADD CONSTRAINT "platform_treasury_settings_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_links" ADD CONSTRAINT "inventory_transaction_links_inventory_id_user_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."user_inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_links" ADD CONSTRAINT "inventory_transaction_links_dgt_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("dgt_transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inventory" ADD CONSTRAINT "user_inventory_transaction_id_transactions_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("transaction_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ADD CONSTRAINT "admin_manual_airdrop_logs_admin_id_users_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ADD CONSTRAINT "admin_manual_airdrop_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_manual_airdrop_logs" ADD CONSTRAINT "admin_manual_airdrop_logs_group_id_user_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("group_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_product_idx" ON "user_inventory" USING btree ("user_id","product_id");--> statement-breakpoint
ALTER TABLE "dgt_economy_parameters" ADD CONSTRAINT "dgt_economy_parameters_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_user_id" ON "inventory_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_product_id" ON "inventory_transactions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_transaction_type" ON "inventory_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_inventory_transactions_created_at" ON "inventory_transactions" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "inventory_id";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "quantity_change";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "related_transaction_id";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "dgt_transaction_id";