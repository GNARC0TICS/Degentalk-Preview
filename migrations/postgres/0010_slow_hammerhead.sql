CREATE TYPE "public"."mention_source_type" AS ENUM('post', 'thread', 'chat');--> statement-breakpoint
CREATE TABLE "mentions_index" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" "mention_source_type" NOT NULL,
	"source_id" integer NOT NULL,
	"mentioning_user_id" integer NOT NULL,
	"mentioned_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mentions_index" ADD CONSTRAINT "mentions_index_mentioning_user_id_users_user_id_fk" FOREIGN KEY ("mentioning_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentions_index" ADD CONSTRAINT "mentions_index_mentioned_user_id_users_user_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mentions_mentioned_user" ON "mentions_index" USING btree ("mentioned_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_mentions_unique" ON "mentions_index" USING btree ("source_type","source_id","mentioned_user_id");