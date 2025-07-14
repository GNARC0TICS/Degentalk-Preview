#!/usr/bin/env tsx

import { db } from '../db';
import { users } from '../db/schema/user/users';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { generateToken } from '../server/src/domains/auth/utils/jwt.utils';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import chalk from 'chalk';
import axios from 'axios';
import type { UserId } from '../shared/types/ids';

// Load environment
import dotenv from 'dotenv';
dotenv.config();

const CACHE_FILE = '.cache/dev-tokens.json';
const API_BASE = process.env.API_BASE || 'http://localhost:5001';

interface TokenCacheEntry {
	username: string;
	userId: string;
	token: string;
	role: string;
	expiresAt: string;
	loginMethod: 'jwt' | 'session';
	sessionCookie?: string;
}

async function devLogin(username: string, password: string, useSession: boolean = false) {
	console.log(chalk.bold.blue(`\n🔐 Dev Login: ${username}\n`));

	// Only run in development
	if (process.env.NODE_ENV === 'production') {
		console.error(chalk.red('❌ Cannot use dev-login in production!'));
		process.exit(1);
	}

	try {
		if (useSession) {
			// Use real login endpoint for session auth
			console.log(chalk.yellow('📡 Using session-based login...'));
			
			const response = await axios.post(`${API_BASE}/api/auth/login`, {
				username,
				password
			}, {
				withCredentials: true,
				validateStatus: () => true // Don't throw on non-2xx
			});

			if (response.status !== 200) {
				throw new Error(response.data?.error || 'Login failed');
			}

			const { user, token } = response.data.data;
			const sessionCookie = response.headers['set-cookie']?.[0];

			console.log(chalk.green('✅ Session login successful!'));
			console.log(`👤 User: ${chalk.yellow(user.username)} (${user.role})`);
			console.log(`🍪 Session: ${chalk.gray(sessionCookie ? 'Active' : 'Not set')}`);
			
			if (token) {
				console.log(`🎯 Token: ${chalk.green(token.substring(0, 50))}...`);
			}

			// Cache the session info
			updateTokenCache({
				username: user.username,
				userId: user.id,
				token: token || '',
				role: user.role,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				loginMethod: 'session',
				sessionCookie
			});

			return { user, token, sessionCookie };

		} else {
			// Direct database login with JWT generation
			console.log(chalk.yellow('🔍 Authenticating via database...'));

			// Find user
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.username, username))
				.limit(1);

			if (!user) {
				throw new Error('User not found');
			}

			// Verify password
			const isValid = await bcrypt.compare(password, user.password);
			if (!isValid) {
				throw new Error('Invalid password');
			}

			if (!user.isActive) {
				throw new Error('Account is not active');
			}

			// Generate JWT token
			const token = generateToken(user.id as UserId);
			
			// Decode to get expiration
			const tokenParts = token.split('.');
			let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
			try {
				const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
				if (payload.exp) {
					expiresAt = new Date(payload.exp * 1000).toISOString();
				}
			} catch {}

			console.log(chalk.green('✅ Login successful!'));
			console.log(chalk.cyan('━'.repeat(60)));
			console.log(`👤 User: ${chalk.yellow(user.username)}`);
			console.log(`📧 Email: ${chalk.yellow(user.email)}`);
			console.log(`🎭 Role: ${chalk.magenta(user.role)}`);
			console.log(`💎 Level: ${chalk.cyan(user.level)} (${user.xp} XP)`);
			console.log(`🆔 User ID: ${chalk.gray(user.id)}`);
			console.log(`🎯 Token: ${chalk.green(token.substring(0, 50))}...`);
			console.log(`⏰ Expires: ${chalk.yellow(expiresAt)}`);
			console.log(chalk.cyan('━'.repeat(60)));

			// Update token cache
			updateTokenCache({
				username: user.username,
				userId: user.id,
				token,
				role: user.role,
				expiresAt,
				loginMethod: 'jwt'
			});

			// Show example usage
			console.log(chalk.bold('\n📋 Example API usage:'));
			console.log(chalk.gray('\n# Get user XP info'));
			console.log(`curl -H "Authorization: Bearer ${token.substring(0, 30)}..." \\`);
			console.log(`     ${API_BASE}/api/xp/user/${user.id}`);
			
			console.log(chalk.gray('\n# Get wallet balance'));
			console.log(`curl -H "Authorization: Bearer ${token.substring(0, 30)}..." \\`);
			console.log(`     ${API_BASE}/api/wallet/balance`);

			if (user.role === 'admin') {
				console.log(chalk.gray('\n# Admin endpoint'));
				console.log(`curl -H "Authorization: Bearer ${token.substring(0, 30)}..." \\`);
				console.log(`     ${API_BASE}/api/admin/users`);
			}

			// Return for programmatic use
			return {
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.role,
					xp: user.xp,
					level: user.level
				},
				token,
				expiresAt
			};
		}

	} catch (error: any) {
		console.error(chalk.red(`\n❌ Login failed: ${error.message}`));
		process.exit(1);
	}
}

function updateTokenCache(entry: TokenCacheEntry) {
	try {
		// Read existing cache
		let cache: TokenCacheEntry[] = [];
		if (existsSync(CACHE_FILE)) {
			const content = readFileSync(CACHE_FILE, 'utf-8');
			cache = JSON.parse(content);
		}

		// Update or add entry
		const index = cache.findIndex(e => e.username === entry.username);
		if (index >= 0) {
			cache[index] = entry;
		} else {
			cache.push(entry);
		}

		// Save cache
		const cacheDir = dirname(CACHE_FILE);
		mkdirSync(cacheDir, { recursive: true });
		writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

		console.log(chalk.gray(`\n💾 Token cached at: ${CACHE_FILE}`));
	} catch (error) {
		console.warn(chalk.yellow('\n⚠️  Failed to update token cache'));
	}
}

// CLI usage
if (require.main === module) {
	const args = process.argv.slice(2);
	
	if (args.length < 2) {
		console.log(chalk.yellow('\nUsage:'));
		console.log('  pnpm run dev:login <username> <password> [--session]');
		console.log('\nExamples:');
		console.log('  pnpm run dev:login testuser01 testpass');
		console.log('  pnpm run dev:login testadmin testpass --session');
		process.exit(1);
	}

	const [username, password] = args;
	const useSession = args.includes('--session');

	devLogin(username, password, useSession)
		.then(() => process.exit(0))
		.catch(() => process.exit(1));
}

export { devLogin };