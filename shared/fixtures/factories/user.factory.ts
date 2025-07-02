/**
 * User factory with crypto-community personas and realistic test data
 */

import { BaseFactory } from '../core/factory';
import type { User } from '@schema';
import { generateId } from '@shared/utils/id';

export class UserFactory extends BaseFactory<User> {
	private static readonly CRYPTO_USERNAMES = [
		'diamondhands',
		'paperhands',
		'cryptowhale',
		'moonboi',
		'hodler',
		'degen',
		'apefollower',
		'nftfloor',
		'yieldfarmer',
		'defilover',
		'btcmaxi',
		'etherean',
		'altcoinhunter',
		'memecoinlord',
		'rugpuller'
	];

	private static readonly CRYPTO_EMAILS = [
		'gmail.com',
		'protonmail.com',
		'tutanota.com',
		'outlook.com'
	];

	definition(): Partial<User> {
		const username = this.generateCryptoUsername();

		return {
			id: generateId<'user'>(),
			username,
			email: `${username}@${this.faker.helpers.arrayElement(UserFactory.CRYPTO_EMAILS)}`,
			passwordHash: '$2b$10$' + this.faker.string.alphanumeric(53), // Realistic bcrypt hash
			role: 'user',
			xp: this.faker.number.int({ min: 0, max: 10000 }),
			level: this.calculateLevel(),
			dgtWalletBalance: BigInt(this.faker.number.int({ min: 0, max: 100000 })),
			reputation: this.faker.number.int({ min: 0, max: 1000 }),
			totalPosts: this.faker.number.int({ min: 0, max: 500 }),
			totalThreads: this.faker.number.int({ min: 0, max: 50 }),
			totalLikes: this.faker.number.int({ min: 0, max: 200 }),
			totalTips: this.faker.number.int({ min: 0, max: 100 }),
			bio: this.generateCryptoBio(),
			avatarUrl: this.faker.image.avatar(),
			isActive: true,
			isEmailVerified: this.faker.datatype.boolean(0.8),
			createdAt: this.faker.date.past({ years: 2 }),
			updatedAt: new Date()
		};
	}

	private generateCryptoUsername(): string {
		const base = this.faker.helpers.arrayElement(UserFactory.CRYPTO_USERNAMES);
		const suffix = this.faker.helpers.maybe(
			() => this.faker.number.int({ min: 1, max: 9999 }).toString(),
			{ probability: 0.6 }
		);
		return suffix ? `${base}${suffix}` : base;
	}

	private calculateLevel(): number {
		const xp = this.faker.number.int({ min: 0, max: 10000 });
		// Simple XP to level calculation
		return Math.floor(Math.sqrt(xp / 100)) + 1;
	}

	private generateCryptoBio(): string {
		const templates = [
			'Diamond hands since {year}. {coin} to the moon! 🚀',
			'DeFi degen, yield farmer, rug survivor. HODL or die.',
			'NFT collector, meme coin enthusiast. Not financial advice.',
			'Building in the bear market. {framework} developer.',
			'Crypto trader, shit poster, moon dreamer. WAGMI.'
		];

		const template = this.faker.helpers.arrayElement(templates);
		return template
			.replace('{year}', this.faker.date.past({ years: 5 }).getFullYear().toString())
			.replace('{coin}', this.faker.helpers.arrayElement(['BTC', 'ETH', 'SOL', 'LINK', 'DOGE']))
			.replace(
				'{framework}',
				this.faker.helpers.arrayElement(['Solidity', 'Rust', 'Move', 'React'])
			);
	}

	// State definitions for different user types
	protected getState(state: string): Partial<User> {
		const states: Record<string, Partial<User>> = {
			admin: {
				role: 'admin',
				xp: this.faker.number.int({ min: 50000, max: 100000 }),
				level: this.faker.number.int({ min: 50, max: 100 }),
				reputation: this.faker.number.int({ min: 5000, max: 10000 }),
				dgtWalletBalance: BigInt(this.faker.number.int({ min: 500000, max: 1000000 })),
				isEmailVerified: true
			},
			moderator: {
				role: 'moderator',
				xp: this.faker.number.int({ min: 25000, max: 75000 }),
				level: this.faker.number.int({ min: 25, max: 75 }),
				reputation: this.faker.number.int({ min: 2500, max: 7500 }),
				dgtWalletBalance: BigInt(this.faker.number.int({ min: 100000, max: 500000 })),
				isEmailVerified: true
			},
			newbie: {
				xp: this.faker.number.int({ min: 0, max: 100 }),
				level: 1,
				reputation: 0,
				totalPosts: this.faker.number.int({ min: 0, max: 5 }),
				totalThreads: 0,
				dgtWalletBalance: BigInt(1000), // Starting balance
				isEmailVerified: false
			},
			whale: {
				dgtWalletBalance: BigInt(this.faker.number.int({ min: 1000000, max: 10000000 })),
				reputation: this.faker.number.int({ min: 5000, max: 10000 }),
				totalTips: this.faker.number.int({ min: 500, max: 2000 }),
				bio: 'Crypto whale 🐋 Large bag holder. Tips generously.'
			},
			banned: {
				isActive: false,
				bio: 'Account suspended for violations.'
			},
			inactive: {
				updatedAt: this.faker.date.past({ years: 1 }),
				totalPosts: 0,
				totalThreads: 0
			}
		};

		return states[state] || {};
	}
}

// Specialized user factories for common scenarios
export class AdminUserFactory extends UserFactory {
	definition(): Partial<User> {
		return {
			...super.definition(),
			...this.getState('admin'),
			username: `admin_${this.faker.string.alphanumeric(8)}`
		};
	}
}

export class CryptoWhaleFactory extends UserFactory {
	definition(): Partial<User> {
		return {
			...super.definition(),
			...this.getState('whale'),
			username: `whale_${this.faker.string.alphanumeric(8)}`
		};
	}
}

export class NewbieUserFactory extends UserFactory {
	definition(): Partial<User> {
		return {
			...super.definition(),
			...this.getState('newbie'),
			createdAt: this.faker.date.recent({ days: 7 })
		};
	}
}
