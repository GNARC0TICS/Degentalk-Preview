import { randomUUID } from 'node:crypto';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/db';
import { forumStructure } from '@/schema/forum/structure';
import { forumMap } from '@/client/src/config/forumMap.config';
import chalk from 'chalk';

/** Lightweight recursive traversal – handles zones ➔ forums ➔ sub-forums (1 level deep) */
async function upsertForumNode({
  slug,
  name,
  description,
  type,
  parentId
}: {
  slug: string;
  name: string;
  description?: string;
  type: 'zone' | 'forum';
  parentId?: string | null;
}) {
  await db
    .insert(forumStructure)
    .values({
      id: randomUUID(),
      slug,
      name,
      description: description ?? null,
      type,
      parentId: null, // parentId column is still integer in schema – leave null for now
      position: 0
    })
    .onConflictDoUpdate({ target: forumStructure.slug, set: { name, description } })
    .execute();
  console.log(chalk.green(`✓ synced ${type}: ${slug}`));
}

export async function seedForumsFromConfig(): Promise<void> {
  console.log('🌱 [SEED-FORUMS] Seeding zones & forums…');

  for (const zone of forumMap.zones) {
    await upsertForumNode({ slug: zone.slug, name: zone.name, description: zone.description, type: 'zone' });

    for (const forum of zone.forums) {
      await upsertForumNode({ slug: forum.slug, name: forum.name, description: forum.description, type: 'forum' });

      // One level of sub-forums (if present)
      if (forum.forums) {
        for (const sub of forum.forums) {
          await upsertForumNode({ slug: sub.slug, name: sub.name, description: sub.description, type: 'forum' });
        }
      }
    }
  }

  console.log('✅ [SEED-FORUMS] Done');
}

if (process.argv[1] && process.argv[1].endsWith('seedForumsFromConfig.ts')) {
  seedForumsFromConfig().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
