import { db } from '@db';
import { sql } from 'drizzle-orm';

async function addColorThemeField() {
  try {
    console.log('Adding colorTheme field to forum_categories table...');
    
    // Check if the column already exists
    const tableInfo = await db.run(sql`PRAGMA table_info(forum_categories)`);
    
    // Add the colorTheme column if it doesn't exist
    try {
      await db.run(sql`
        ALTER TABLE forum_categories 
        ADD COLUMN color_theme TEXT;
      `);
      console.log('✅ Successfully added colorTheme field');
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('✓ colorTheme field already exists');
      } else {
        throw error;
      }
    }
    
    // Update primary zones with their theme values
    const primaryZonesThemes = [
      { slug: 'the-pit', colorTheme: 'theme-pit' },
      { slug: 'mission-control', colorTheme: 'theme-mission' },
      { slug: 'the-casino-floor', colorTheme: 'theme-casino' },
      { slug: 'the-briefing-room', colorTheme: 'theme-briefing' },
      { slug: 'the-archive', colorTheme: 'theme-archive' },
    ];
    
    for (const zone of primaryZonesThemes) {
      await db.run(sql`
        UPDATE forum_categories 
        SET color_theme = ${zone.colorTheme}
        WHERE slug = ${zone.slug} AND is_zone = 1
      `);
      console.log(`✅ Updated ${zone.slug} with colorTheme: ${zone.colorTheme}`);
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
addColorThemeField(); 