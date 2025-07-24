import { db } from '../../../db';
// import { logger } from '@api/core/logger'; // Logger not needed in seeding
import { forumMap } from './config-stubs';
import { economyConfig } from '../../../shared/economy/economy.config';
import { featureFlags } from './config-stubs';
import { themes } from './config-stubs';
import * as schema from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';
import chalk from 'chalk';

export class ConfigEnforcer {
	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [ConfigEnforcer] ${message}`);
	}

	/**
	 * Enforce all canonical configurations
	 */
	async enforceAll(): Promise<void> {
		this.log('Starting config enforcement...', 'info');
		
		try {
			await this.syncForumMap();
			await this.syncEconomy();
			await this.syncFeatureFlags();
			await this.syncThemes();
			
			this.log('All configs enforced successfully!', 'success');
		} catch (error) {
			this.log(`Config enforcement failed: ${(error as Error).message}`, 'error');
			throw error;
		}
	}

	/**
	 * Sync forum structure from forumMap.config.ts
	 */
	async syncForumMap(): Promise<void> {
		this.log('Syncing forum structure from forumMap.config.ts...', 'info');
		
		await db.transaction(async (tx) => {
			// First, sync zones
			for (const [zoneSlug, zone] of Object.entries(forumMap.zones)) {
				const existingZone = await tx
					.select()
					.from(schema.forumStructure)
					.where(eq(schema.forumStructure.slug, zoneSlug))
					.limit(1);

				if (existingZone.length === 0) {
					await tx.insert(schema.forumStructure).values({
						slug: zoneSlug,
						name: zone.name,
						description: zone.description,
						type: 'zone',
						displayOrder: zone.order,
						icon: zone.icon,
						pluginData: {
							theme: zone.theme,
							features: zone.features || []
						}
					});
					this.log(`Created zone: ${zone.name}`, 'success');
				}
			}

			// Then sync forums
			for (const [forumSlug, forum] of Object.entries(forumMap.forums)) {
				const parentZone = await tx
					.select()
					.from(schema.forumStructure)
					.where(eq(schema.forumStructure.slug, forum.zoneSlug))
					.limit(1);

				if (parentZone.length === 0) {
					this.log(`Parent zone not found for forum: ${forumSlug}`, 'warn');
					continue;
				}

				const existingForum = await tx
					.select()
					.from(schema.forumStructure)
					.where(eq(schema.forumStructure.slug, forumSlug))
					.limit(1);

				const forumData = {
					slug: forumSlug,
					name: forum.name,
					description: forum.description,
					type: 'forum' as const,
					parentId: parentZone[0].id,
					displayOrder: forum.order,
					icon: forum.icon,
					pluginData: {
						theme: forum.theme,
						rules: forum.rules,
						features: forum.features || [],
						xpMultiplier: forum.rules.xpMultiplier || 1,
						accessLevel: forum.rules.accessLevel || 'public',
						availablePrefixes: forum.rules.availablePrefixes || []
					}
				};

				if (existingForum.length === 0) {
					await tx.insert(schema.forumStructure).values(forumData);
					this.log(`Created forum: ${forum.name}`, 'success');
				} else {
					await tx
						.update(schema.forumStructure)
						.set(forumData)
						.where(eq(schema.forumStructure.id, existingForum[0].id));
					this.log(`Updated forum: ${forum.name}`, 'success');
				}
			}
		});
	}

	/**
	 * Sync economy configuration
	 */
	async syncEconomy(): Promise<void> {
		this.log('Syncing economy settings from economy.config.ts...', 'info');
		
		// Skip XP action settings sync - economyConfig doesn't have xpRewards
		this.log('Skipping XP action settings - not implemented in current economyConfig', 'warn');
		return;
		
		// Original code commented out:
		/*
		// Sync XP action settings
		for (const [action, xpAmount] of Object.entries(economyConfig.xpRewards)) {
			const existing = await db
				.select()
				.from(schema.xpActionSettings)
				.where(eq(schema.xpActionSettings.action, action))
				.limit(1);

			if (existing.length === 0) {
				await db.insert(schema.xpActionSettings).values({
					action,
					baseXp: xpAmount,
					dailyLimit: economyConfig.MAX_XP_PER_DAY,
					cooldownSeconds: 0,
					isActive: true
				});
				this.log(`Created XP action: ${action} (${xpAmount} XP)`, 'success');
			}
		}

		// Update economy parameters
		await db.insert(schema.economyConfigOverrides).values({
			key: 'dgt_to_usd',
			value: economyConfig.DGT_TO_USD.toString(),
			updatedAt: new Date()
		}).onConflictDoUpdate({
			target: schema.economyConfigOverrides.key,
			set: { 
				value: economyConfig.DGT_TO_USD.toString(),
				updatedAt: new Date()
			}
		});

		this.log('Economy settings synced', 'success');
		*/
	}

	/**
	 * Sync feature flags
	 */
	async syncFeatureFlags(): Promise<void> {
		this.log('Syncing feature flags...', 'info');
		
		for (const [key, isEnabled] of Object.entries(featureFlags)) {
			// Convert camelCase key to Title Case for the name
			const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
			
			await db.insert(schema.featureFlags).values({
				key,
				name,
				isEnabled: isEnabled as boolean,
				description: `Feature flag for ${name}`,
				rolloutPercentage: '100',
				config: {}
			}).onConflictDoUpdate({
				target: schema.featureFlags.key,
				set: {
					isEnabled: isEnabled as boolean,
					updatedAt: new Date()
				}
			});
			
			this.log(`Synced feature flag: ${key} (${isEnabled ? 'ON' : 'OFF'})`, 'success');
		}
	}

	/**
	 * Sync UI themes
	 */
	async syncThemes(): Promise<void> {
		this.log('Syncing UI themes...', 'info');
		
		for (const [themeName, themeConfig] of Object.entries(themes)) {
			await db.insert(schema.uiThemes).values({
				themeKey: themeName,
				label: themeConfig.name,
				color: `text-${themeConfig.primaryColor}`,
				bgColor: `bg-${themeConfig.backgroundColor}`,
				borderColor: `border-${themeConfig.primaryColor}/30`,
				isActive: true
			}).onConflictDoUpdate({
				target: schema.uiThemes.themeKey,
				set: {
					label: themeConfig.name,
					updatedAt: new Date()
				}
			});
			
			this.log(`Synced theme: ${themeName}`, 'success');
		}
	}

	/**
	 * Validate seed data against configs
	 */
	validateThread(thread: any): boolean {
		const forum = forumMap.forums[thread.forumSlug];
		
		if (!forum) {
			this.log(`Invalid forum slug: ${thread.forumSlug}`, 'error');
			return false;
		}

		// Validate prefix
		if (thread.prefix && !forum.rules.availablePrefixes?.includes(thread.prefix)) {
			this.log(`Invalid prefix "${thread.prefix}" for forum ${thread.forumSlug}`, 'error');
			return false;
		}

		// Validate access level
		if (forum.rules.minXpRequired && thread.authorXp < forum.rules.minXpRequired) {
			this.log(`Author XP too low for forum ${thread.forumSlug}`, 'warn');
		}

		return true;
	}

	/**
	 * Validate user against economy rules
	 */
	validateUser(user: any): boolean {
		// Check XP bounds
		if (user.xp > economyConfig.MAX_XP_PER_DAY * 365) {
			this.log(`User ${user.username} has unrealistic XP`, 'warn');
		}

		// Check DGT balance
		if (user.dgtBalance < 0) {
			this.log(`User ${user.username} has negative DGT balance`, 'error');
			return false;
		}

		return true;
	}
}