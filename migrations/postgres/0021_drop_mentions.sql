-- 0021_drop_mentions.sql
-- Drops and recreates mentions table with INT FK columns

DROP TABLE IF EXISTS mentions CASCADE;

CREATE TABLE "mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentioned_user_id" uuid NOT NULL,
	"mentioning_user_id" uuid NOT NULL,
	"type" "mention_type" NOT NULL,
	"thread_id" integer,
	"post_id" integer,
	"message_id" varchar(255),
	"mention_text" varchar(100) NOT NULL,
	"context" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_notified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);

ALTER TABLE "mentions" ADD CONSTRAINT "mentions_mentioned_user_id_users_user_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_mentioning_user_id_users_user_id_fk" FOREIGN KEY ("mentioning_user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_thread_id_threads_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("thread_id") ON DELETE CASCADE;
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("post_id") ON DELETE CASCADE; 