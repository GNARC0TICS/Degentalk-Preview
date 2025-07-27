#!/usr/bin/env tsx

import { db } from '@db';
import { users } from '../../db/schema/user/users';
import bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Simple console logger for scripts
const logger = {
	info: (...args: any[]) => console.log('[INFO]', ...args),
	error: (...args: any[]) => console.error('[ERROR]', ...args),
	warn: (...args: any[]) => console.warn('[WARN]', ...args)
};

// Simple token generator
function generateToken(userId: UserId): string {
	const secret = process.env.JWT_SECRET || 'test-secret';
	const payload = { userId };
	return jwt.sign(payload, secret, { expiresIn: '30d' });
}
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';
import type { UserId } from '@shared/types/ids';

// Load environment
import dotenv from 'dotenv';
dotenv.config();

interface TestUser {
	username: string;
	password: string;
	email: string;
	role: 'admin' | 'moderator' | 'user';
	xp: number;
	level: number;
}

interface TokenCacheEntry {
	username: string;
	userId: string;
	token: string;
	role: string;
	expiresAt: string;
}

const TEST_PASSWORD = 'testpass';
const CACHE_FILE = '.cache/dev-tokens.json';

// Test users configuration
const TEST_USERS: TestUser[] = [
	{
		username: 'testadmin',
		password: TEST_PASSWORD,
		email: 'testadmin@degentalk.dev',
		role: 'admin',
		xp: 99999,
		level: 99
	},
	{
		username: 'testmod',
		password: TEST_PASSWORD,
		email: 'testmod@degentalk.dev',
		role: 'moderator',
		xp: 5000,
		level: 25
	},
	// Generate regular test users
	...Array.from({ length: 5 }, (_, i) => ({
		username: `testuser${String(i + 1).padStart(2, '0')}`,
		password: TEST_PASSWORD,
		email: `testuser${String(i + 1).padStart(2, '0')}@degentalk.dev`,
		role: 'user' as const,
		xp: 100 + (i * 50),
		level: 1 + i
	}))
];

async function seedUsersWithTokens() {
	console.log(chalk.bold.blue('\n🌱 Seeding test users with JWT tokens...\n'));

	// Only run in development
	if (process.env.NODE_ENV === 'production') {
		console.error(chalk.red('❌ Cannot run user seeder in production!'));
		process.exit(1);
	}

	const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
	const tokenCache: TokenCacheEntry[] = [];
	const results: Array<{ user: TestUser; token: string; userId: string }> = [];

	for (const testUser of TEST_USERS) {
		try {
			// Insert or update user
			const [insertedUser] = await db.insert(users)
				.values({
					username: testUser.username,
					email: testUser.email,
					password: passwordHash,
					role: testUser.role,
					xp: testUser.xp,
					level: testUser.level,
					isActive: true,
					isBanned: false,
					isVerified: true,
					bio: `Test ${testUser.role} account for development`,
					signature: `${testUser.role.toUpperCase()} | Dev Account`,
					avatarUrl: `/images/avatars/${testUser.role}.png`,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.onConflictDoUpdate({
					target: users.username,
					set: {
						email: sql`excluded.email`,
						password: sql`excluded.password_hash`,
						role: sql`excluded.role`,
						xp: sql`excluded.xp`,
						level: sql`excluded.level`,
						isActive: sql`excluded.is_active`,
						updatedAt: sql`CURRENT_TIMESTAMP`
					}
				})
				.returning();

			// Generate JWT token
			const token = generateToken(insertedUser.id as UserId);
			
			// Decode to get expiration
			const tokenParts = token.split('.');
			let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
			try {
				const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
				if (payload.exp) {
					expiresAt = new Date(payload.exp * 1000).toISOString();
				}
			} catch {}

			// Add to results
			results.push({
				user: testUser,
				token,
				userId: insertedUser.id
			});

			// Add to cache
			tokenCache.push({
				username: testUser.username,
				userId: insertedUser.id,
				token,
				role: testUser.role,
				expiresAt
			});

		} catch (error) {
			console.error(chalk.red(`❌ Failed to seed ${testUser.username}:`), error);
		}
	}

	// Save token cache
	const cacheDir = dirname(CACHE_FILE);
	mkdirSync(cacheDir, { recursive: true });
	writeFileSync(CACHE_FILE, JSON.stringify(tokenCache, null, 2));

	// Display results
	console.log(chalk.green('\n✅ Test users created successfully!\n'));
	console.log(chalk.cyan('━'.repeat(80)));
	
	for (const { user, token, userId } of results) {
		console.log(chalk.bold(`\n👤 ${user.username}`));
		console.log(chalk.gray('─'.repeat(40)));
		console.log(`📧 Email: ${chalk.yellow(user.email)}`);
		console.log(`🔑 Password: ${chalk.yellow(TEST_PASSWORD)}`);
		console.log(`🎭 Role: ${chalk.magenta(user.role)}`);
		console.log(`🆔 User ID: ${chalk.gray(userId)}`);
		console.log(`🎯 Token: ${chalk.green(token.substring(0, 50))}...`);
		console.log(`\n📋 Quick test commands:`);
		console.log(chalk.gray(`# Login via CLI`));
		console.log(`${chalk.cyan('pnpm')} run dev:login ${user.username} ${TEST_PASSWORD}`);
		console.log(chalk.gray(`\n# Test API with token`));
		console.log(`${chalk.cyan('curl')} -H "Authorization: Bearer ${token.substring(0, 30)}..." \\`);
		console.log(`     http://localhost:5001/api/xp/user/${userId}`);
		console.log(chalk.cyan('─'.repeat(60)));
	}

	console.log(chalk.bold.green(`\n✨ ${results.length} users seeded with tokens!`));
	console.log(chalk.gray(`\nTokens cached at: ${CACHE_FILE}`));
	console.log(chalk.yellow('\n⚠️  Remember: These tokens expire in 7 days\n'));
}

// Run the seeder
seedUsersWithTokens()
	.then(() => {
		console.log(chalk.green('✅ Seeding complete!'));
		process.exit(0);
	})
	.catch((error) => {
		console.error(chalk.red('❌ Seeding failed:'), error);
		process.exit(1);
	});