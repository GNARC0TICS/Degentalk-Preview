-- Add prerequisites column to missions table
ALTER TABLE "missions" ADD COLUMN "prerequisites" jsonb;

-- Add performance_metrics column to campaigns table
ALTER TABLE "campaigns" ADD COLUMN "performance_metrics" jsonb DEFAULT '{}'::jsonb;