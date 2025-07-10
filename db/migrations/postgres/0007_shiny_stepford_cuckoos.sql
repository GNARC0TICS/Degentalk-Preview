ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_user_id_achievement_id_pk";--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "awarded_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievement_unique" PRIMARY KEY("user_id","achievement_id");--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "key" varchar(100);--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "category" varchar(50) DEFAULT 'participation' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "tier" varchar(20) DEFAULT 'common' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "display_group" varchar(50);--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "icon_emoji" varchar(10);--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "trigger_type" varchar(50) DEFAULT 'count' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "trigger_config" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "reward_dgt" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "reward_clout" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "is_secret" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "is_retroactive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "unlock_message" text;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "current_progress" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "progress_percentage" numeric(5, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "is_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "started_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "notified_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "completion_data" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_key_unique" UNIQUE("key");