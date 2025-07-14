-- Create test users with proper UUID primary keys
-- This script creates all necessary test data for mission system testing

-- First, check if users have UUID columns
DO $$
BEGIN
    -- Create test admin user
    INSERT INTO users (
        username, 
        email, 
        password, 
        role, 
        xp, 
        is_active, 
        is_verified,
        created_at,
        last_seen
    ) VALUES (
        'cryptoadmin',
        'admin@degentalk.com',
        '$2a$10$YourHashedPasswordHere', -- password123
        'admin',
        99999,
        true,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (username) DO UPDATE SET
        role = 'admin',
        xp = 99999,
        is_active = true,
        is_verified = true,
        last_seen = NOW();

    -- Create regular test user
    INSERT INTO users (
        username, 
        email, 
        password, 
        role, 
        xp, 
        is_active, 
        is_verified,
        created_at,
        last_seen
    ) VALUES (
        'testuser',
        'test@degentalk.com',
        '$2a$10$YourHashedPasswordHere', -- password123
        'user',
        100,
        true,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (username) DO UPDATE SET
        xp = 100,
        is_active = true,
        is_verified = true,
        last_seen = NOW();

    -- Create moderator test user
    INSERT INTO users (
        username, 
        email, 
        password, 
        role, 
        xp, 
        is_active, 
        is_verified,
        created_at,
        last_seen
    ) VALUES (
        'testmod',
        'mod@degentalk.com',
        '$2a$10$YourHashedPasswordHere', -- password123
        'moderator',
        5000,
        true,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (username) DO UPDATE SET
        role = 'moderator',
        xp = 5000,
        is_active = true,
        is_verified = true,
        last_seen = NOW();

END $$;

-- Add wallet balances for test users
DO $$
DECLARE
    admin_id UUID;
    user_id UUID;
    mod_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO admin_id FROM users WHERE username = 'cryptoadmin';
    SELECT id INTO user_id FROM users WHERE username = 'testuser';
    SELECT id INTO mod_id FROM users WHERE username = 'testmod';

    -- Create wallet entries if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_wallets') THEN
        INSERT INTO user_wallets (user_id, dgt_balance, created_at, updated_at)
        VALUES 
            (admin_id, 100000, NOW(), NOW()),
            (user_id, 100, NOW(), NOW()),
            (mod_id, 1000, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            dgt_balance = EXCLUDED.dgt_balance,
            updated_at = NOW();
    END IF;

    -- Assign some daily missions to users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_mission_progress') THEN
        -- Get daily mission IDs
        INSERT INTO user_mission_progress (user_id, mission_id, current_count, is_completed, is_reward_claimed, updated_at)
        SELECT 
            admin_id,
            m.id,
            0,
            false,
            false,
            NOW()
        FROM missions m
        WHERE m.is_daily = true AND m.is_active = true
        ON CONFLICT (user_id, mission_id) DO NOTHING;

        -- Give testuser some progress
        INSERT INTO user_mission_progress (user_id, mission_id, current_count, is_completed, is_reward_claimed, updated_at)
        SELECT 
            user_id,
            m.id,
            CASE 
                WHEN m.title = 'First Post of the Day' THEN 1
                WHEN m.title = 'Daily Contributor' THEN 2
                ELSE 0
            END,
            CASE 
                WHEN m.title = 'First Post of the Day' THEN true
                ELSE false
            END,
            false,
            NOW()
        FROM missions m
        WHERE m.is_daily = true AND m.is_active = true
        ON CONFLICT (user_id, mission_id) DO UPDATE SET
            current_count = EXCLUDED.current_count,
            is_completed = EXCLUDED.is_completed;
    END IF;

    RAISE NOTICE 'Test data created successfully!';
    RAISE NOTICE 'Admin ID: %', admin_id;
    RAISE NOTICE 'User ID: %', user_id;
    RAISE NOTICE 'Mod ID: %', mod_id;
END $$;

-- Show created users
SELECT id, username, email, role, xp, is_active 
FROM users 
WHERE username IN ('cryptoadmin', 'testuser', 'testmod');

-- Show mission progress
SELECT 
    u.username,
    m.title,
    ump.current_count,
    ump.is_completed,
    ump.is_reward_claimed
FROM user_mission_progress ump
JOIN users u ON u.id = ump.user_id
JOIN missions m ON m.id = ump.mission_id
WHERE u.username IN ('cryptoadmin', 'testuser', 'testmod')
ORDER BY u.username, m.title;