-- Add missing type defaults based on file extension
UPDATE admin.media_library SET type = 'lottie' WHERE type IS NULL AND (url ILIKE '%.lottie' OR url ILIKE '%.lottie.json');
UPDATE admin.media_library SET type = 'emoji' WHERE type IS NULL AND (url ILIKE '%.png' OR url ILIKE '%.jpg' OR url ILIKE '%.jpeg' OR url ILIKE '%.webp');
-- Fallback unknowns to 'emoji'
UPDATE admin.media_library SET type = 'emoji' WHERE type IS NULL; 