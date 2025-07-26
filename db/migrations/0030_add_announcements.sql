-- Create announcements table
CREATE TABLE IF NOT EXISTS "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) DEFAULT 'info' NOT NULL,
	"content" text NOT NULL,
	"link" varchar(255),
	"ticker_mode" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"bg_color" varchar(7),
	"text_color" varchar(7),
	"icon" varchar(50),
	"animation_style" varchar(20) DEFAULT 'scroll',
	"target_role_ids" uuid[],
	"target_forum_ids" uuid[],
	"active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"display_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_id" uuid NOT NULL,
	"metadata" jsonb
);

-- Add foreign key constraint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_id_users_id_fk" 
FOREIGN KEY ("created_by_id") REFERENCES "users"("id");

-- Create indexes for performance
CREATE INDEX idx_announcements_ticker ON announcements (ticker_mode, active, priority DESC) 
WHERE ticker_mode = true AND active = true;

CREATE INDEX idx_announcements_expiry ON announcements (expires_at) 
WHERE expires_at IS NOT NULL;

CREATE INDEX idx_announcements_created_by ON announcements (created_by_id);

-- Insert a default announcement for immediate visibility
INSERT INTO announcements (type, content, ticker_mode, priority, icon, created_by_id)
SELECT 
	'hot',
	'🚀 Welcome to DegenTalk - The ultimate Web3 forum for degens! Trading talk, alpha hunting, and premium shitposting.',
	true,
	100,
	'rocket',
	id
FROM users 
WHERE username = 'admin' OR username = 'testadmin'
LIMIT 1;