CREATE TABLE "ui_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"page" text,
	"position" text,
	"user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ui_collection_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"quote_id" uuid NOT NULL,
	"order_in_collection" integer DEFAULT 0,
	"weight" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ui_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ui_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"headline" text NOT NULL,
	"subheader" text,
	"tags" text[] DEFAULT '{}',
	"intensity" integer DEFAULT 1,
	"theme" text,
	"target_audience" text,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"weight" integer DEFAULT 1,
	"start_date" timestamp,
	"end_date" timestamp,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"variant" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ui_analytics" ADD CONSTRAINT "ui_analytics_quote_id_ui_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."ui_quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_collection_quotes" ADD CONSTRAINT "ui_collection_quotes_collection_id_ui_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."ui_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_collection_quotes" ADD CONSTRAINT "ui_collection_quotes_quote_id_ui_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."ui_quotes"("id") ON DELETE cascade ON UPDATE no action;