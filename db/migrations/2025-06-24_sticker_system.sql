-- Sticker System Migration
-- Creates Telegram-style collectible sticker system with rarity tiers and packs

-- Sticker packs table - themed collections
CREATE TABLE IF NOT EXISTS sticker_packs (
    id SERIAL PRIMARY KEY,
    
    -- Pack identification
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    
    -- Pack media
    cover_url VARCHAR(255),
    preview_url VARCHAR(255),
    
    -- Pack properties
    theme VARCHAR(50),
    total_stickers INTEGER NOT NULL DEFAULT 0,
    
    -- Pack unlock mechanics
    unlock_type VARCHAR(20) NOT NULL DEFAULT 'shop',
    price_dgt BIGINT DEFAULT 0,
    required_xp INTEGER,
    required_level INTEGER,
    
    -- Pack status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    is_promoted BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Analytics
    total_unlocks INTEGER NOT NULL DEFAULT 0,
    popularity_score INTEGER NOT NULL DEFAULT 0,
    
    -- Audit trail
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Admin metadata
    admin_notes TEXT
);

-- Core stickers table - collectible assets with rarity system
CREATE TABLE IF NOT EXISTS stickers (
    id SERIAL PRIMARY KEY,
    
    -- Basic sticker identification
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    shortcode VARCHAR(30) NOT NULL UNIQUE,
    description TEXT,
    
    -- Media URLs - supports both static and animated
    static_url VARCHAR(255) NOT NULL,
    animated_url VARCHAR(255),
    thumbnail_url VARCHAR(255),
    
    -- File properties
    width INTEGER DEFAULT 128,
    height INTEGER DEFAULT 128,
    static_file_size INTEGER,
    animated_file_size INTEGER,
    format VARCHAR(15) DEFAULT 'webp',
    
    -- Collectible properties
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    pack_id INTEGER REFERENCES sticker_packs(id),
    
    -- Unlock mechanics
    unlock_type VARCHAR(20) NOT NULL DEFAULT 'shop',
    price_dgt BIGINT DEFAULT 0,
    required_xp INTEGER,
    required_level INTEGER,
    
    -- Usage and visibility
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    is_animated BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP,
    
    -- Analytics
    total_unlocks INTEGER NOT NULL DEFAULT 0,
    total_usage INTEGER NOT NULL DEFAULT 0,
    popularity_score INTEGER NOT NULL DEFAULT 0,
    
    -- Audit trail
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Admin metadata
    admin_notes TEXT,
    tags TEXT
);

-- User sticker inventory - what stickers each user owns
CREATE TABLE IF NOT EXISTS user_sticker_inventory (
    id SERIAL PRIMARY KEY,
    
    -- Relationships
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sticker_id INTEGER NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
    
    -- Unlock details
    unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unlock_method VARCHAR(20) NOT NULL,
    price_paid BIGINT DEFAULT 0,
    
    -- Quick access slots (Telegram-style favorites)
    is_equipped BOOLEAN NOT NULL DEFAULT false,
    slot_position INTEGER,
    
    -- Usage tracking
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used TIMESTAMP,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- User sticker pack ownership
CREATE TABLE IF NOT EXISTS user_sticker_packs (
    id SERIAL PRIMARY KEY,
    
    -- Relationships
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    pack_id INTEGER NOT NULL REFERENCES sticker_packs(id) ON DELETE CASCADE,
    
    -- Unlock details
    unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unlock_method VARCHAR(20) NOT NULL,
    price_paid BIGINT DEFAULT 0,
    
    -- Progress tracking
    stickers_unlocked INTEGER NOT NULL DEFAULT 0,
    total_stickers INTEGER NOT NULL DEFAULT 0,
    is_complete BOOLEAN NOT NULL DEFAULT false,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Sticker usage tracking (for analytics and trending)
CREATE TABLE IF NOT EXISTS sticker_usage (
    id SERIAL PRIMARY KEY,
    
    -- Relationships
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sticker_id INTEGER NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
    
    -- Context where used
    context_type VARCHAR(20) NOT NULL,
    context_id VARCHAR(50),
    
    -- Usage metadata
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Create performance indices

-- Sticker packs indices
CREATE INDEX IF NOT EXISTS idx_sticker_packs_name ON sticker_packs(name);
CREATE INDEX IF NOT EXISTS idx_sticker_packs_theme ON sticker_packs(theme);
CREATE INDEX IF NOT EXISTS idx_sticker_packs_unlock_type ON sticker_packs(unlock_type);
CREATE INDEX IF NOT EXISTS idx_sticker_packs_is_active ON sticker_packs(is_active);
CREATE INDEX IF NOT EXISTS idx_sticker_packs_is_promoted ON sticker_packs(is_promoted);
CREATE INDEX IF NOT EXISTS idx_sticker_packs_sort_order ON sticker_packs(sort_order);

-- Stickers indices
CREATE INDEX IF NOT EXISTS idx_stickers_shortcode ON stickers(shortcode);
CREATE INDEX IF NOT EXISTS idx_stickers_rarity ON stickers(rarity);
CREATE INDEX IF NOT EXISTS idx_stickers_pack_id ON stickers(pack_id);
CREATE INDEX IF NOT EXISTS idx_stickers_unlock_type ON stickers(unlock_type);
CREATE INDEX IF NOT EXISTS idx_stickers_is_active ON stickers(is_active);
CREATE INDEX IF NOT EXISTS idx_stickers_is_visible ON stickers(is_visible);
CREATE INDEX IF NOT EXISTS idx_stickers_is_animated ON stickers(is_animated);
CREATE INDEX IF NOT EXISTS idx_stickers_popularity ON stickers(popularity_score);
CREATE INDEX IF NOT EXISTS idx_stickers_created_at ON stickers(created_at);

-- User sticker inventory indices
CREATE INDEX IF NOT EXISTS idx_user_sticker_inventory_user_id ON user_sticker_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sticker_inventory_sticker_id ON user_sticker_inventory(sticker_id);
CREATE INDEX IF NOT EXISTS idx_user_sticker_inventory_unlocked_at ON user_sticker_inventory(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_user_sticker_inventory_is_equipped ON user_sticker_inventory(is_equipped);
CREATE INDEX IF NOT EXISTS idx_user_sticker_inventory_slot_position ON user_sticker_inventory(slot_position);

-- Unique constraint to prevent duplicate ownership
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sticker_inventory_unique 
ON user_sticker_inventory(user_id, sticker_id);

-- User sticker packs indices
CREATE INDEX IF NOT EXISTS idx_user_sticker_packs_user_id ON user_sticker_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sticker_packs_pack_id ON user_sticker_packs(pack_id);
CREATE INDEX IF NOT EXISTS idx_user_sticker_packs_unlocked_at ON user_sticker_packs(unlocked_at);

-- Unique constraint to prevent duplicate pack ownership
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sticker_packs_unique 
ON user_sticker_packs(user_id, pack_id);

-- Sticker usage indices
CREATE INDEX IF NOT EXISTS idx_sticker_usage_user_id ON sticker_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_sticker_usage_sticker_id ON sticker_usage(sticker_id);
CREATE INDEX IF NOT EXISTS idx_sticker_usage_context_type ON sticker_usage(context_type);
CREATE INDEX IF NOT EXISTS idx_sticker_usage_used_at ON sticker_usage(used_at);

-- Create triggers for automatic timestamp updates

-- Sticker packs updated_at trigger
CREATE OR REPLACE FUNCTION update_sticker_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sticker_packs_updated_at
    BEFORE UPDATE ON sticker_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_sticker_packs_updated_at();

-- Stickers updated_at trigger
CREATE OR REPLACE FUNCTION update_stickers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stickers_updated_at
    BEFORE UPDATE ON stickers
    FOR EACH ROW
    EXECUTE FUNCTION update_stickers_updated_at();