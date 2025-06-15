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
ALTER TABLE "display_preferences" ADD CONSTRAINT "display_preferences_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_display_preferences_user_id" ON "display_preferences" USING btree ("user_id");