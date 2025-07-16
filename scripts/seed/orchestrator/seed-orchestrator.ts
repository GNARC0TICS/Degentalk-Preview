import '../../../server/config/loadEnv';
import { db } from '../../../db';
import chalk from 'chalk';
import ora from 'ora';
import { getSeedConfig } from '../config/seed.config';
import { personas } from '../config/personas.config';
import { ConfigEnforcer } from '../sync/config-enforcer';
import { GamificationSimulator } from '../engines/gamification-simulator';
import { CosmeticsEffectsEngine } from '../engines/cosmetics-effects';
import { AbuseSimulator } from '../engines/abuse-simulator';
import { AdminFlowSimulator } from '../engines/admin-flow-simulator';
import { TemporalSimulator } from '../engines/temporal-simulator';
import { ContentGenerator } from '../generators/content-generator';
import { UserGenerator } from '../generators/user-generator';
import { EconomySimulator } from '../generators/economy-simulator';
import type { UserId } from '../../../shared/types/ids';

export class SeedOrchestrator {
	private config = getSeedConfig();
	private configEnforcer = new ConfigEnforcer();
	private gamificationSim = new GamificationSimulator();
	private cosmeticsEngine = new CosmeticsEffectsEngine();
	private abuseSim = new AbuseSimulator();
	private adminFlowSim = new AdminFlowSimulator();
	private temporalSim = new TemporalSimulator();
	private spinner = ora();
	private startTime = Date.now();

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`\n${prefix} ${message}`);
	}

	private async phase(name: string, fn: () => Promise<void>): Promise<void> {
		this.spinner.start(chalk.cyan(`Running ${name}...`));
		try {
			await fn();
			this.spinner.succeed(chalk.green(`${name} completed`));
		} catch (error) {
			this.spinner.fail(chalk.red(`${name} failed: ${(error as Error).message}`));
			throw error;
		}
	}

	/**
	 * Main orchestration method
	 */
	async orchestrate(): Promise<void> {
		console.log(chalk.bold.magenta('\n🎭 DegenTalk Seed Orchestrator v2.0\n'));
		console.log(chalk.gray(`Environment: ${this.config.environment.mode}`));
		console.log(chalk.gray(`Safe Mode: ${this.config.environment.safeMode}`));
		console.log(chalk.gray(`Simulation Days: ${this.config.temporal.simulationDays}`));
		console.log(chalk.gray('─'.repeat(50)));

		try {
			// Phase 1: Foundation
			await this.phase('Phase 1: Foundation Setup', async () => {
				await this.setupFoundation();
			});

			// Phase 2: User Generation
			await this.phase('Phase 2: User Generation', async () => {
				await this.generateUsers();
			});

			// Phase 3: Content Generation
			await this.phase('Phase 3: Content Generation', async () => {
				await this.generateContent();
			});

			// Phase 4: Gamification Simulation
			await this.phase('Phase 4: Gamification Simulation', async () => {
				await this.simulateGamification();
			});

			// Phase 5: Economy Simulation
			await this.phase('Phase 5: Economy Simulation', async () => {
				await this.simulateEconomy();
			});

			// Phase 6: Cosmetics & Shop
			await this.phase('Phase 6: Cosmetics & Shop', async () => {
				await this.setupCosmetics();
			});

			// Phase 7: Temporal Simulation
			await this.phase('Phase 7: Temporal Simulation', async () => {
				await this.runTemporalSimulation();
			});

			// Phase 8: Admin & Moderation
			await this.phase('Phase 8: Admin & Moderation', async () => {
				await this.simulateAdminFlows();
			});

			// Phase 9: Abuse Patterns
			if (this.config.abuse.enabled) {
				await this.phase('Phase 9: Abuse Patterns', async () => {
					await this.simulateAbuse();
				});
			}

			// Phase 10: Final Validation
			await this.phase('Phase 10: Final Validation', async () => {
				await this.validateSeed();
			});

			// Success!
			const duration = Math.floor((Date.now() - this.startTime) / 1000);
			console.log(chalk.bold.green(`\n✨ Seed orchestration completed in ${duration}s!\n`));
			
			await this.printSummary();

		} catch (error) {
			this.log(`Fatal error: ${(error as Error).message}`, 'error');
			console.error(error);
			process.exit(1);
		}
	}

	/**
	 * Phase 1: Foundation Setup
	 */
	private async setupFoundation(): Promise<void> {
		// Enforce canonical configurations
		await this.configEnforcer.enforceAll();

		// Initialize engines
		await this.gamificationSim.initialize();
		await this.cosmeticsEngine.initialize();
		await this.abuseSim.initialize();
		await this.temporalSim.initialize();

		this.log('Foundation initialized', 'success');
	}

	/**
	 * Phase 2: User Generation
	 */
	private async generateUsers(): Promise<void> {
		const userGen = new UserGenerator();
		const generatedUsers: Array<{ id: UserId; personaId: string }> = [];

		// Generate users based on personas
		for (const [personaId, persona] of Object.entries(personas)) {
			const user = await userGen.generateFromPersona(personaId, persona);
			if (user) {
				generatedUsers.push({ id: user.id, personaId });
			}
		}

		// Generate additional random users
		const additionalCount = Math.max(0, this.config.users.total - generatedUsers.length);
		for (let i = 0; i < additionalCount; i++) {
			const user = await userGen.generateRandom();
			if (user) {
				generatedUsers.push({ id: user.id, personaId: 'random' });
			}
		}

		this.log(`Generated ${generatedUsers.length} users`, 'success');
		
		// Store for later phases
		(global as any).generatedUsers = generatedUsers;
	}

	/**
	 * Phase 3: Content Generation
	 */
	private async generateContent(): Promise<void> {
		const contentGen = new ContentGenerator();
		const users = (global as any).generatedUsers;

		// Generate threads
		await contentGen.generateThreads(users, this.config.content.threads.total);

		// Generate posts
		await contentGen.generatePosts(users, this.config.content.posts.total);

		// Generate reactions
		await contentGen.generateReactions(users);

		this.log('Content generation complete', 'success');
	}

	/**
	 * Phase 4: Gamification Simulation
	 */
	private async simulateGamification(): Promise<void> {
		const users = (global as any).generatedUsers;

		// Run XP simulation over time
		await this.gamificationSim.simulateForAllUsers(
			users,
			Math.min(7, this.config.temporal.simulationDays) // First week only for XP
		);

		this.log('Gamification simulation complete', 'success');
	}

	/**
	 * Phase 5: Economy Simulation
	 */
	private async simulateEconomy(): Promise<void> {
		const economySim = new EconomySimulator();
		const users = (global as any).generatedUsers;

		// Generate transactions
		await economySim.generateTransactions(users, this.config.economy.transactions);

		// Generate rain events
		await economySim.generateRainEvents(users, this.config.economy.transactions.rainEvents);

		this.log('Economy simulation complete', 'success');
	}

	/**
	 * Phase 6: Cosmetics & Shop
	 */
	private async setupCosmetics(): Promise<void> {
		const users = (global as any).generatedUsers;

		// Generate cosmetics for all users
		await this.cosmeticsEngine.generateForAllUsers(users);

		// Simulate shop purchases over time
		for (let day = 1; day <= Math.min(7, this.config.temporal.simulationDays); day++) {
			for (const user of users) {
				await this.cosmeticsEngine.simulateShopPurchases(user.id, user.personaId, day);
			}
		}

		this.log('Cosmetics setup complete', 'success');
	}

	/**
	 * Phase 7: Temporal Simulation
	 */
	private async runTemporalSimulation(): Promise<void> {
		const users = (global as any).generatedUsers;

		// Run full temporal simulation
		await this.temporalSim.runSimulation(users, this.config.temporal.simulationDays);

		this.log('Temporal simulation complete', 'success');
	}

	/**
	 * Phase 8: Admin & Moderation
	 */
	private async simulateAdminFlows(): Promise<void> {
		// Run admin/mod actions
		await this.adminFlowSim.simulateStaffActions(this.config.temporal.simulationDays);

		this.log('Admin flow simulation complete', 'success');
	}

	/**
	 * Phase 9: Abuse Patterns
	 */
	private async simulateAbuse(): Promise<void> {
		// Generate abuse patterns
		await this.abuseSim.simulateAbuse();

		this.log('Abuse simulation complete', 'success');
	}

	/**
	 * Phase 10: Final Validation
	 */
	private async validateSeed(): Promise<void> {
		const stats = await this.gatherStats();

		// Validate minimum thresholds
		const validations = [
			{ name: 'Users', value: stats.users, min: 10 },
			{ name: 'Threads', value: stats.threads, min: 50 },
			{ name: 'Posts', value: stats.posts, min: 100 },
			{ name: 'Transactions', value: stats.transactions, min: 50 }
		];

		let allValid = true;
		for (const check of validations) {
			if (check.value < check.min) {
				this.log(`Validation failed: ${check.name} (${check.value} < ${check.min})`, 'error');
				allValid = false;
			}
		}

		if (!allValid && !this.config.environment.forceReseed) {
			throw new Error('Validation failed. Use --force to ignore.');
		}

		this.log('Validation complete', 'success');
	}

	/**
	 * Gather final statistics
	 */
	private async gatherStats(): Promise<any> {
		const [stats] = await db.execute<any>(sql`
			SELECT 
				(SELECT COUNT(*) FROM users) as users,
				(SELECT COUNT(*) FROM threads) as threads,
				(SELECT COUNT(*) FROM posts) as posts,
				(SELECT COUNT(*) FROM transactions) as transactions,
				(SELECT COUNT(*) FROM user_achievements) as achievements,
				(SELECT COUNT(*) FROM user_inventory) as cosmetics,
				(SELECT COUNT(*) FROM reports) as reports,
				(SELECT COUNT(*) FROM bans) as bans
		`);

		return stats;
	}

	/**
	 * Print final summary
	 */
	private async printSummary(): Promise<void> {
		const stats = await this.gatherStats();

		console.log(chalk.bold('\n📊 Seed Summary\n'));
		console.log(chalk.gray('─'.repeat(30)));
		
		const items = [
			{ label: 'Users', value: stats.users, icon: '👥' },
			{ label: 'Threads', value: stats.threads, icon: '📝' },
			{ label: 'Posts', value: stats.posts, icon: '💬' },
			{ label: 'Transactions', value: stats.transactions, icon: '💰' },
			{ label: 'Achievements', value: stats.achievements, icon: '🏆' },
			{ label: 'Cosmetics', value: stats.cosmetics, icon: '🎨' },
			{ label: 'Reports', value: stats.reports, icon: '🚨' },
			{ label: 'Bans', value: stats.bans, icon: '🔨' }
		];

		items.forEach(item => {
			console.log(`${item.icon}  ${chalk.cyan(item.label.padEnd(15))} ${chalk.yellow(item.value.toString().padStart(8))}`);
		});

		console.log(chalk.gray('─'.repeat(30)));
		console.log(chalk.green('\n🎉 Platform is ready for testing!\n'));
		console.log(chalk.gray('Login with: cryptoadmin / password123'));
		console.log(chalk.gray('Start dev server: pnpm dev\n'));
	}
}

// Export convenience function
export async function runSeedOrchestration(): Promise<void> {
	const orchestrator = new SeedOrchestrator();
	await orchestrator.orchestrate();
}

// Run if called directly (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
	runSeedOrchestration()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}