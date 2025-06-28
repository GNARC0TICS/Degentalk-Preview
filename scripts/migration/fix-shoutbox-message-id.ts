#!/usr/bin/env tsx

/**
 * One-off migration: convert shoutbox_pins.message_id from integer → uuid
 * (dev/staging only, table assumed empty; no data preserved).
 */

import { db } from '../../db';
import { sql } from 'drizzle-orm';
import chalk from 'chalk';

(async () => {
  try {
    console.log(chalk.cyan('→ Patching shoutbox_pins.message_id to uuid'));

    await db.execute(sql`\
      ALTER TABLE shoutbox_pins
      DROP CONSTRAINT IF EXISTS shoutbox_pins_message_id_shoutbox_messages_message_id_fk;
    `);

    await db.execute(sql`\
      ALTER TABLE shoutbox_pins DROP COLUMN IF EXISTS message_id;
    `);

    await db.execute(sql`\
      ALTER TABLE shoutbox_pins ADD COLUMN message_id uuid;
    `);

    await db.execute(sql`\
      ALTER TABLE shoutbox_pins
      ADD CONSTRAINT shoutbox_pins_message_id_shoutbox_messages_message_id_fk
      FOREIGN KEY (message_id) REFERENCES shoutbox_messages(message_id)
      ON DELETE NO ACTION ON UPDATE NO ACTION;
    `);

    console.log(chalk.green('✓ Column recreated as uuid'));
  } catch (err) {
    console.error(chalk.red('✖ Migration failed'), err);
    process.exit(1);
  }
})(); 