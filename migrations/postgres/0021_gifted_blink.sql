CREATE TABLE "user_owned_frames" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"frame_id" integer NOT NULL,
	"source" varchar(20) DEFAULT 'shop' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "forum_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "forum_categories" CASCADE;--> statement-breakpoint
ALTER TABLE "threads" RENAME COLUMN "category_id" TO "structure_id";--> statement-breakpoint
ALTER TABLE "thread_prefixes" RENAME COLUMN "category_id" TO "structure_id";--> statement-breakpoint
ALTER TABLE "thread_drafts" RENAME COLUMN "category_id" TO "structure_id";--> statement-breakpoint
ALTER TABLE "threads" DROP CONSTRAINT "threads_category_id_forum_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "thread_prefixes" DROP CONSTRAINT "thread_prefixes_category_id_forum_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "thread_drafts" DROP CONSTRAINT "thread_drafts_category_id_forum_categories_category_id_fk";
--> statement-breakpoint
DROP INDEX "idx_threads_category_id";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "frame_id" integer;--> statement-breakpoint
ALTER TABLE "user_owned_frames" ADD CONSTRAINT "user_owned_frames_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_owned_frames" ADD CONSTRAINT "user_owned_frames_frame_id_avatar_frames_id_fk" FOREIGN KEY ("frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_frame_id_avatar_frames_id_fk" FOREIGN KEY ("active_frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_prefixes" ADD CONSTRAINT "thread_prefixes_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_frame_id_avatar_frames_id_fk" FOREIGN KEY ("frame_id") REFERENCES "public"."avatar_frames"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_threads_structure_id" ON "threads" USING btree ("structure_id");