import type { AdminId } from '@db/types';
import { db } from '@db';
import { siteSettings } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to initialize Giphy integration settings in the site_settings table
 */
async function initializeGiphySettings() {
  console.log('🔄 Initializing Giphy integration settings...');
  
  // Check if settings already exist
  const existingSettings = await db.select().from(siteSettings).where(
    eq(siteSettings.group, 'editor')
  );
  
  // Settings to ensure exist
  const requiredSettings = [
    {
      key: 'giphy_enabled',
      value: 'true',
      valueType: 'boolean',
      group: 'editor',
      description: 'Enable or disable the Giphy GIF search in the rich text editor',
      isPublic: true
    },
    {
      key: 'giphy_result_limit',
      value: '25',
      valueType: 'number',
      group: 'editor',
      description: 'Number of GIF results to display per search',
      isPublic: true
    },
    {
      key: 'giphy_rating',
      value: 'pg-13',
      valueType: ': AdminId',
      group: 'editor',
      description: 'Content rating for Giphy results (g, pg, pg-13, r)',
      isPublic: true
    }
  ];
  
  // Create map of existing settings by key
  const existingSettingsMap = existingSettings.reduce((acc, setting) => {
    acc[setting.key] = true;
    return acc;
  }, {} as Record<: AdminId, boolean>);
  
  // Insert any missing settings
  for (const setting of requiredSettings) {
    if (!existingSettingsMap[setting.key]) {
      await db.insert(siteSettings).values({
        ...setting,
        updatedAt: new Date()
      });
      console.log(`✅ Added ${setting.key} setting`);
    } else {
      console.log(`ℹ️ ${setting.key} setting already exists, skipping`);
    }
  }
  
  console.log('✅ Giphy integration settings initialized successfully');
}

// Export the initialization function
export { initializeGiphySettings };