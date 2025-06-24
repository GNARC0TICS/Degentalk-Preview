-- Create the new forum_structure table
CREATE TABLE "forum_structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_forum_slug" text,
	"parent_id" integer,
	"type" text DEFAULT 'forum' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_vip" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"min_xp" integer DEFAULT 0 NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"min_group_id_required" integer,
	"color" text DEFAULT 'gray' NOT NULL,
	"icon" text DEFAULT 'hash' NOT NULL,
	"color_theme" text,
	"tipping_enabled" boolean DEFAULT false NOT NULL,
	"xp_multiplier" real DEFAULT 1 NOT NULL,
	"plugin_data" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "forum_structure_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint

-- Add foreign key constraints for the new table
ALTER TABLE "forum_structure" ADD CONSTRAINT "forum_structure_parent_id_forum_structure_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_structure"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_structure" ADD CONSTRAINT "forum_structure_min_group_id_required_roles_role_id_fk" FOREIGN KEY ("min_group_id_required") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- Copy all data from forum_categories to forum_structure (preserving IDs and structure)
INSERT INTO "forum_structure" (
	"id", "name", "slug", "description", "parent_forum_slug", "parent_id", "type", "position",
	"is_vip", "is_locked", "min_xp", "is_hidden", "min_group_id_required", "color", "icon", 
	"color_theme", "tipping_enabled", "xp_multiplier", "plugin_data", "created_at", "updated_at"
)
SELECT 
	"category_id", "name", "slug", "description", "parent_forum_slug", "parent_id", "type", "position",
	"is_vip", "is_locked", "min_xp", "is_hidden", "min_group_id_required", "color", "icon",
	"color_theme", "tipping_enabled", "xp_multiplier", "plugin_data", "created_at", "updated_at"
FROM "forum_categories"
ORDER BY "category_id";
--> statement-breakpoint

-- Update the sequence to continue from the highest ID
SELECT setval('forum_structure_id_seq', (SELECT MAX(id) FROM "forum_structure"));
--> statement-breakpoint

-- Add new columns to reference tables that will point to forum_structure
ALTER TABLE "threads" ADD COLUMN "structure_id" integer;
ALTER TABLE "thread_prefixes" ADD COLUMN "structure_id" integer; 
ALTER TABLE "thread_drafts" ADD COLUMN "structure_id" integer;
--> statement-breakpoint

-- Copy foreign key references from old to new columns
UPDATE "threads" SET "structure_id" = "category_id";
UPDATE "thread_prefixes" SET "structure_id" = "category_id";
UPDATE "thread_drafts" SET "structure_id" = "category_id";
--> statement-breakpoint

-- Add foreign key constraints for the new columns
ALTER TABLE "threads" ADD CONSTRAINT "threads_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_prefixes" ADD CONSTRAINT "thread_prefixes_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_drafts" ADD CONSTRAINT "thread_drafts_structure_id_forum_structure_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."forum_structure"("id") ON DELETE set null ON UPDATE no action;