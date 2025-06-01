import { db } from '@server/src/core/db';
import { forumCategories } from '@shared/schema';

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
