import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { forumCategories } from './utils/schema';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const categories = await db.select().from(forumCategories);
    console.log('Forum Categories:');
    categories.forEach(category => {
      console.log(`  ${category.id}: ${category.name} (${category.slug})`);
    });
  } catch (error) {
    console.error('Error reading forum categories:', error);
  }
}

main();
