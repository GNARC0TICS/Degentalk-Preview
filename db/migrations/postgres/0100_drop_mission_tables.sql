-- Drop mission system tables
-- This migration removes all deprecated mission-related tables from the database

-- Drop tables in reverse dependency order to avoid foreign key constraint issues

-- First, drop tables that reference mission tables
DROP TABLE IF EXISTS user_mission_progress CASCADE;
DROP TABLE IF EXISTS mission_history CASCADE;
DROP TABLE IF EXISTS mission_progress CASCADE;
DROP TABLE IF EXISTS mission_streaks CASCADE;
DROP TABLE IF EXISTS active_missions CASCADE;

-- Then drop the main mission tables
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS mission_templates CASCADE;

-- Drop any remaining mission-related types or enums
DROP TYPE IF EXISTS mission_status CASCADE;
DROP TYPE IF EXISTS mission_type CASCADE;
DROP TYPE IF EXISTS mission_period_type CASCADE;
DROP TYPE IF EXISTS mission_difficulty CASCADE;

-- Clean up any orphaned sequences
DROP SEQUENCE IF EXISTS missions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS mission_templates_id_seq CASCADE;
DROP SEQUENCE IF EXISTS user_mission_progress_id_seq CASCADE;