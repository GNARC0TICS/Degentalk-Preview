#!/usr/bin/env tsx

/**
 * Enhanced Seed Runner
 * 
 * Usage:
 *   pnpm seed:enhanced           # Run with default settings
 *   pnpm seed:enhanced --dev     # Development mode (full chaos)
 *   pnpm seed:enhanced --staging # Staging mode (realistic)
 *   pnpm seed:enhanced --quick   # Quick mode (minimal data)
 */

import '../../server/config/loadEnv';
import { runSeedOrchestration } from './orchestrator/seed-orchestrator';
import chalk from 'chalk';

async function main() {
	console.log(chalk.bold.cyan('\n🚀 DegenTalk Enhanced Seeding System\n'));

	// Parse command line arguments
	const args = process.argv.slice(2);
	const mode = args.includes('--staging') ? 'staging' : 
	             args.includes('--prod') ? 'prod' : 'dev';
	const quick = args.includes('--quick');

	// Set environment
	process.env.SEED_MODE = mode;
	process.env.SEED_QUICK = quick ? 'true' : 'false';

	console.log(chalk.gray(`Mode: ${mode}`));
	console.log(chalk.gray(`Quick: ${quick}`));
	console.log(chalk.gray('─'.repeat(40)));

	try {
		await runSeedOrchestration();
	} catch (error) {
		console.error(chalk.red('\n❌ Seeding failed:'), error);
		process.exit(1);
	}
}

// Run the seeder
main();