/**
 * Migration Script: Passport Sessions to Lucia Sessions
 * 
 * This script migrates existing Passport sessions to Lucia format.
 * It should be run once during the migration to Lucia auth.
 */

import { db } from '@db';
import { sessions } from '@schema';
import { eq } from 'drizzle-orm';
import { generateIdFromEntropySize } from 'lucia';
import { lucia } from '@server/src/lib/lucia';

async function migratePassportSessions() {
  console.log('Starting Passport to Lucia session migration...');

  try {
    // Get all existing sessions from the passport session table
    // Note: This assumes you have access to the old session store
    const passportSessions = await db.execute(
      `SELECT sess, expire FROM user_sessions WHERE sess IS NOT NULL`
    );

    console.log(`Found ${passportSessions.rows.length} Passport sessions to migrate`);

    let migrated = 0;
    let failed = 0;

    for (const row of passportSessions.rows) {
      try {
        // Parse session data
        const sessionData = typeof row.sess === 'string' 
          ? JSON.parse(row.sess) 
          : row.sess;
        
        // Extract user ID from passport session
        const userId = sessionData.passport?.user;
        
        if (!userId) {
          console.log('Skipping session without user ID');
          continue;
        }

        // Calculate expiry (Lucia uses Date, not timestamp)
        const expiresAt = new Date(row.expire);
        
        // Skip expired sessions
        if (expiresAt < new Date()) {
          console.log(`Skipping expired session for user ${userId}`);
          continue;
        }

        // Create new Lucia session
        const sessionId = generateIdFromEntropySize(10);
        
        await db.insert(sessions).values({
          id: sessionId,
          userId: userId,
          expiresAt: expiresAt,
          // Optional metadata from passport session
          ipAddress: sessionData.ipAddress || null,
          userAgent: sessionData.userAgent || null,
          deviceId: sessionData.deviceId || null,
          lastActiveAt: new Date()
        });

        console.log(`Migrated session for user ${userId}`);
        migrated++;
      } catch (error) {
        console.error('Failed to migrate session:', error);
        failed++;
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Successfully migrated: ${migrated} sessions`);
    console.log(`Failed: ${failed} sessions`);

    // Optional: Clean up old passport sessions
    const cleanup = process.argv.includes('--cleanup');
    if (cleanup) {
      console.log('\nCleaning up old Passport sessions...');
      await db.execute(`TRUNCATE TABLE user_sessions`);
      console.log('Old sessions removed');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migratePassportSessions()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });