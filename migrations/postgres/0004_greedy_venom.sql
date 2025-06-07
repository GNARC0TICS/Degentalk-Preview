ALTER TYPE "public"."content_edit_status" ADD VALUE 'pending_review' BEFORE 'published';--> statement-breakpoint
ALTER TYPE "public"."content_edit_status" ADD VALUE 'rejected' BEFORE 'archived';--> statement-breakpoint
CREATE TABLE "display_preferences" (
	"user_id" integer PRIMARY KEY NOT NULL,
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
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transaction_type";--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('purchase', 'sale', 'transfer', 'deposit', 'withdrawal', 'admin_grant', 'tip', 'rain', 'fee', 'refund', 'other');--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "public"."transaction_type" USING "type"::"public"."transaction_type";--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "forum_type" text DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "slug_override" text;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "components" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "thread_rules" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "access_control" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "display_priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "forum_categories" ADD COLUMN "seo" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "display_preferences" ADD CONSTRAINT "display_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_display_preferences_user_id" ON "display_preferences" USING btree ("user_id");--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
DROP TYPE "public"."reaction_type";--> statement-breakpoint
DROP TYPE "public"."shoutbox_position";--> statement-breakpoint
DROP TYPE "public"."ticket_status";--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
DROP TYPE "public"."vault_status";--> statement-breakpoint
DROP TYPE "public"."withdrawal_status";