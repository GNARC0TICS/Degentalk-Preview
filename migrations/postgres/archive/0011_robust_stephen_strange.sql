CREATE TABLE "referral_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_sources_slug_unique" UNIQUE("slug"),
	CONSTRAINT "referral_sources_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"referred_by_user_id" integer,
	"referral_source_id" integer,
	"bonus_granted" boolean DEFAULT false NOT NULL,
	"reward_metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_referrals_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "threads" ADD COLUMN "parent_forum_slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "referral_sources" ADD CONSTRAINT "referral_sources_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_referred_by_user_id_users_user_id_fk" FOREIGN KEY ("referred_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_referral_source_id_referral_sources_id_fk" FOREIGN KEY ("referral_source_id") REFERENCES "public"."referral_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_threads_parent_forum_slug" ON "threads" USING btree ("parent_forum_slug");