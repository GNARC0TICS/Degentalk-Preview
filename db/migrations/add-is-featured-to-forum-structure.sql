-- Add isFeatured column to forum_structure table
ALTER TABLE forum_structure 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add index for performance when filtering by featured status
CREATE INDEX IF NOT EXISTS idx_forum_structure_is_featured 
ON forum_structure(is_featured);

-- Add theme_preset column for featured forums
ALTER TABLE forum_structure 
ADD COLUMN IF NOT EXISTS theme_preset TEXT;