/**
 * Migration: Consolidate Forum Themes to Database
 * 
 * Migrates static forum theme configurations to the database-driven theme system
 * This allows for dynamic theme management through the admin panel
 */

import { db } from '../../../core/db';
import { uiThemes, type NewUiTheme } from '@schema/admin/uiThemes';
import { FORUM_THEMES, type ForumThemeKey } from '@shared/config/forumThemes.config';
import { eq } from 'drizzle-orm';
import { logger } from '../../../core/logger';

/**
 * Maps old ForumTheme config to new database UiTheme structure
 */
async function migrateForumThemesToDB() {
  logger.info('Starting forum theme migration to database...');
  
  let migrated = 0;
  let errors = 0;
  
  for (const [key, theme] of Object.entries(FORUM_THEMES)) {
    try {
      // Check if theme already exists
      const existing = await db.query.uiThemes.findFirst({
        where: eq(uiThemes.themeKey, key)
      });
      
      if (existing) {
        logger.info(`Theme ${key} already exists, updating...`);
      }
      
      // Map old theme structure to new database schema
      const dbTheme: Partial<NewUiTheme> = {
        themeKey: key,
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
        
        // Map visual properties
        gradient: theme.gradient,
        color: theme.accent,
        borderColor: theme.border,
        glow: theme.glow,
        icon: theme.icon,
        
        // Map intensity and overlay
        glowIntensity: theme.glowIntensity || 'medium',
        rarityOverlay: theme.rarityOverlay || 'common',
        
        // Default values
        isActive: true,
        version: 1,
        
        // Extract base colors from Tailwind classes
        // This is a simplified mapping - in production you'd want more sophisticated parsing
        bgColor: extractBgColor(theme.gradient),
        
        // Store original config in metadata for reference
        metadata: {
          originalConfig: theme,
          migratedFrom: 'forumThemes.config.ts',
          migratedAt: new Date().toISOString()
        }
      };
      
      if (existing) {
        // Update existing theme
        await db.update(uiThemes)
          .set(dbTheme)
          .where(eq(uiThemes.themeKey, key));
      } else {
        // Insert new theme
        await db.insert(uiThemes).values(dbTheme as NewUiTheme);
      }
      
      migrated++;
      logger.info(`✓ Migrated theme: ${key}`);
      
    } catch (error) {
      errors++;
      logger.error(`✗ Failed to migrate theme ${key}:`, error);
    }
  }
  
  logger.info(`
    Migration complete:
    - Themes migrated: ${migrated}
    - Errors: ${errors}
    - Total themes: ${Object.keys(FORUM_THEMES).length}
  `);
  
  return { migrated, errors };
}

/**
 * Extract background color from gradient string
 * This is a simplified version - enhance as needed
 */
function extractBgColor(gradient: string): string {
  // Extract the first color from gradient
  // e.g., 'from-red-900/40' -> 'bg-red-900/40'
  const match = gradient.match(/from-(\w+-\d+\/?\d*)/);
  if (match) {
    return `bg-${match[1]}`;
  }
  return 'bg-zinc-900/30'; // fallback
}

/**
 * Assign default themes to forums based on their IDs
 * This maintains the theme associations from the config
 */
async function assignDefaultThemes() {
  logger.info('Assigning default themes to forums...');
  
  // Map of forum IDs to theme keys
  // In production, this would come from your forum configuration
  const forumThemeMap: Record<string, ForumThemeKey> = {
    'pit': 'pit',
    'casino': 'casino',
    'shop': 'shop',
    'briefing': 'briefing',
    'archive': 'archive',
    // Add more mappings as needed
  };
  
  for (const [forumId, themeKey] of Object.entries(forumThemeMap)) {
    try {
      // This would integrate with your forum system
      // For now, just log the intended assignment
      logger.info(`Would assign theme '${themeKey}' to forum '${forumId}'`);
      
      // In production:
      // await forumService.updateForumTheme(forumId, themeKey);
      
    } catch (error) {
      logger.error(`Failed to assign theme to forum ${forumId}:`, error);
    }
  }
}

/**
 * Main migration function
 */
export async function runThemeMigration() {
  try {
    logger.info('=== Starting Theme System Migration ===');
    
    // Step 1: Migrate themes from config to database
    const { migrated, errors } = await migrateForumThemesToDB();
    
    if (errors > 0) {
      logger.warn(`Migration completed with ${errors} errors`);
    }
    
    // Step 2: Assign themes to forums
    await assignDefaultThemes();
    
    logger.info('=== Theme Migration Complete ===');
    
    return { success: true, migrated, errors };
    
  } catch (error) {
    logger.error('Theme migration failed:', error);
    return { success: false, error };
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runThemeMigration()
    .then(result => {
      logger.info('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Migration crashed:', error);
      process.exit(1);
    });
}