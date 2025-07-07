import { randomUUID } from 'crypto';
import { join } from 'path';
import glob from 'fast-glob';
import { db } from '@db';
import { avatarFrames, users, userOwnedFrames } from '@schema';
import { sql } from 'drizzle-orm';

/**
 * Seed script that scans `client/public/assets/frames/*` for frame images,
 * infers rarity from filename, and populates the `avatar_frames` table.
 *
 * It also grants the `common` frame to every user that does not yet have an `active_frame_id`.
 *
 * Run with:  ts-node scripts/seed/avatar-frames.ts  (or npm run ts-node ...)
 */
(async () => {
  try {
    const assetsRoot = join(process.cwd(), 'client/public/assets/frames');
    const paths = await glob('*.{png,svg,webp}', { cwd: assetsRoot });

    const rarityFromName = (filename: string): string => {
      const name = filename.toLowerCase();
      if (name.includes('legendary')) return 'legendary';
      if (name.includes('epic')) return 'epic';
      if (name.includes('rare')) return 'rare';
      return 'common';
    };

    for (const file of paths) {
      const imageUrl = `/assets/frames/${file}`; // Public-facing URL
      const name = file.replace(/\.[a-zA-Z0-9]+$/, '');
      const rarity = rarityFromName(file);

      const existingFrames = await db
        .select({ id: avatarFrames.id })
        .from(avatarFrames)
        .where(sql`${avatarFrames.imageUrl} = ${imageUrl}`);
      if (existingFrames.length === 0) {
        await db.insert(avatarFrames).values({ name, imageUrl, rarity, animated: false }).execute();
        console.log(`Inserted frame: ${name}`);
      }
    }

    // Fetch common frame id (assumes exactly one)
    const [commonFrame] = await db
      .select({ id: avatarFrames.id })
      .from(avatarFrames)
      .where(sql`${avatarFrames.rarity} = 'common'`)
      .limit(1);

    if (commonFrame) {
      // Grant to users without active frame
      const usersWithoutFrame = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`${users.activeFrameId} IS NULL`);

      if (usersWithoutFrame.length) {
        for (const u of usersWithoutFrame) {
          await db.insert(userOwnedFrames).values({ userId: u.id, frameId: commonFrame.id, source: 'seed' });
          await db
            .update(users)
            .set({ activeFrameId: commonFrame.id })
            .where(sql`${users.id} = ${u.id}`);
        }
        console.log(`Granted common frame to ${usersWithoutFrame.length} users`);
      }
    }

    console.log('Avatar-frame seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})(); 