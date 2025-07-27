import '@server/config/loadEnv';
import { db } from '@degentalk/db';
import { logSeed } from './utils/seedUtils';
import { seedXpActions } from './seed-xp-actions';
import { seedBadges } from './seed-badges';
import { seedTreasurySettings } from './seed-treasury';
import { seedVaults } from './seed-vaults';
import { seedUsers } from './seed-users';
import { seedDefaultLevels } from './seed-default-levels';
import { seedEconomySettings } from './seed-economy-settings';
import { seedShop } from './seed-shop';
import { seedAchievements } from './seed-achievements';
import { seedChat } from './seed-chat';
import { seedUiConfigQuotes } from './seed-ui-config-quotes';
import { seedPromotionPricing } from './seed-promotion-pricing';
import { sql } from 'drizzle-orm';

const SCRIPT_NAME = 'reset-and-seed';

async function main() {
	logSeed(SCRIPT_NAME, '🚀 Starting database reset and seed process...');

	const quickMode = process.argv.includes('--quick');
	if (quickMode) {
		logSeed(SCRIPT_NAME, '⚡ Running in --quick mode. Some seeds might be skipped.');
	}

	try {
		logSeed(SCRIPT_NAME, '🗑️  Starting database cleanup...');

		// 🔄 Full schema reset
		await db.execute(sql`DROP SCHEMA public CASCADE;`);
		logSeed(SCRIPT_NAME, '💥 Dropped schema "public" (cascade)');
		await db.execute(sql`CREATE SCHEMA public;`);
		logSeed(SCRIPT_NAME, '🏗️  Re-created schema "public"');
		
		logSeed(SCRIPT_NAME, '✅ Database cleanup complete.');

		// Apply migrations after cleanup but before seeding
		logSeed(SCRIPT_NAME, '📦 Applying database migrations...');
		const { spawn } = await import('child_process');
		await new Promise<void>((resolve, reject) => {
			const child = spawn('pnpm', ['run', 'db:migrate:apply'], {
				stdio: 'inherit',
				shell: true
			});

			child.on('close', (code: number) => {
				if (code === 0) {
					logSeed(SCRIPT_NAME, '✅ Database migrations applied.');
					resolve();
				} else {
					reject(new Error(`Migration process exited with code ${code}`));
				}
			});

			child.on('error', (err: Error) => {
				reject(err);
			});
		});

		// Seed foundation data
		logSeed(SCRIPT_NAME, '🌱 Seeding foundation data...');
		await seedDefaultLevels();
		await seedXpActions();
		await seedBadges();
		await seedTreasurySettings();
		await seedVaults();
		await seedEconomySettings();
		await seedAchievements();

		// Seed users
		logSeed(SCRIPT_NAME, '👥 Seeding users...');
		await seedUsers();

		// Seed shop
		logSeed(SCRIPT_NAME, '🛍️  Seeding shop data...');
		await seedShop();

		// Seed content
		if (!quickMode) {
			logSeed(SCRIPT_NAME, '💬 Seeding chat data...');
			await seedChat();
		}

		// Seed UI config
		logSeed(SCRIPT_NAME, '🎨 Seeding UI config...');
		await seedUiConfigQuotes();
		await seedPromotionPricing();

		// Seed forum structure
		logSeed(SCRIPT_NAME, '🏛️  Seeding forum zones & forums from config...');
		await new Promise<void>((resolve, reject) => {
			const child = spawn('tsx', ['scripts/db/sync-forum-config.ts'], {
				stdio: 'inherit',
				shell: true
			});
			child.on('close', (code: number) => {
				if (code === 0) {
					logSeed(SCRIPT_NAME, '✅ Forum structure seeded');
					resolve();
				} else {
					reject(new Error(`Forum seeder exited with code ${code}`));
				}
			});
			child.on('error', reject);
		});

		logSeed(SCRIPT_NAME, '🎉 All seed scripts completed successfully!');
		process.exit(0);
	} catch (error) {
		logSeed(SCRIPT_NAME, `💀 Fatal error during seeding: ${(error as Error).message}`, true);
		console.error(error);
		process.exit(1);
	}
}

main();