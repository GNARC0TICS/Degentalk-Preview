-- Fix UUID conversion issues
-- Script to resolve specific "column id cannot be cast automatically to type uuid" errors

-- The issue is that Drizzle is trying to convert some integer ID columns to UUID
-- when they should remain as integers. This script drops and recreates problematic tables.

-- First, check which tables are causing issues by looking for non-standard ID types
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Find tables with integer id columns that might be getting converted incorrectly
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'id' 
        AND data_type = 'integer'
        AND table_schema = 'public'
        AND table_name IN ('user_follows', 'post_reactions', 'mentions')
    LOOP
        -- Drop these tables if they exist (they'll be recreated by drizzle correctly)
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE;', table_record.table_name);
        RAISE NOTICE 'Dropped table: %', table_record.table_name;
    END LOOP;
END $$;

-- Migration locks cleanup removed since table doesn't exist