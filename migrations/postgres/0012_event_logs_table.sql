-- Create event_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE "event_type" AS ENUM (
            'rain_claimed',
            'thread_created',
            'post_created',
            'cosmetic_unlocked',
            'level_up',
            'badge_earned',
            'tip_sent',
            'tip_received',
            'xp_earned',
            'referral_completed',
            'product_purchased',
            'mission_completed',
            'airdrop_claimed'
        );
    END IF;
END$$;

-- Create event_logs table
CREATE TABLE IF NOT EXISTS "event_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "event_type" event_type NOT NULL,
    "related_id" uuid,
    "meta" jsonb NOT NULL DEFAULT '{}',
    "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "idx_event_logs_user_created" ON "event_logs" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_event_logs_type_created" ON "event_logs" ("event_type", "created_at" DESC);

-- Add comment to table
COMMENT ON TABLE "event_logs" IS 'Stores user activity and system events for activity feeds, notifications, and audit trails';
