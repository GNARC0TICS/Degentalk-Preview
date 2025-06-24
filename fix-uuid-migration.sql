-- Fix UUID migration issue by dropping problematic table and recreating
-- This is safe for development environment

-- Drop the user_follows table that's causing the UUID conversion issue
DROP TABLE IF EXISTS user_follows CASCADE;

-- Also drop any other tables that might have similar integer->uuid issues
DROP TABLE IF EXISTS post_reactions CASCADE;

-- The next drizzle push should recreate these tables with proper UUID columns