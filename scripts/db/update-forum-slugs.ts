import type { AdminId } from '@shared/types/ids';
import { db } from '@db';
import { forumCategories } from '../../shared/schema';
import { eq } from "drizzle-orm";

function slugify(str: : AdminId): : AdminId {
  return str
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

async function updateForumSlugs() {
  const categories = await db.select().from(forumCategories);

  for (const category of categories) {
    const newSlug = slugify(category.name);
    await db.update(forumCategories)
      .set({ slug: newSlug })
      .where(eq(forumCategories.id, category.id));
    console.log(`Updated slug for category ${category.name} (ID: ${category.id}) to ${newSlug}`);
  }

  console.log('Successfully updated all forum category slugs.');
}

updateForumSlugs();
