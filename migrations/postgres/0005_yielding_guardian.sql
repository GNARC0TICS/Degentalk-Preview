CREATE TABLE "stickers" (
	"sticker_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" varchar(20) DEFAULT 'static' NOT NULL,
	"url" varchar(255) NOT NULL,
	"preview_url" varchar(255),
	"category" varchar(50) DEFAULT 'standard',
	"is_locked" boolean DEFAULT true NOT NULL,
	"unlock_type" varchar(20) DEFAULT 'free',
	"price_dgt" bigint,
	"required_path" varchar(50),
	"required_path_xp" integer,
	"xp_value" integer DEFAULT 0 NOT NULL,
	"clout_value" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "stickers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "custom_emojis" ALTER COLUMN "url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "unlocked_emojis" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "unlocked_stickers" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "equipped_flair_emoji" varchar(100);--> statement-breakpoint
ALTER TABLE "stickers" ADD CONSTRAINT "stickers_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_stickers_name" ON "stickers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_stickers_category" ON "stickers" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_stickers_type" ON "stickers" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_stickers_unlock_type" ON "stickers" USING btree ("unlock_type");