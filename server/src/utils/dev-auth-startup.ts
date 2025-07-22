import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { logger } from '@core/logger';
import { db } from '@core/db';
import { users } from '@schema';
import { eq, inArray } from 'drizzle-orm';
import { generateToken } from '../domains/auth/utils/jwt.utils';
import type { UserId } from '@shared/types/ids';
import chalk from 'chalk';

const CACHE_FILE = '.cache/dev-tokens.json';
const DEFAULT_USERS = ['testadmin', 'testuser01'];

interface TokenCacheEntry {
	username: string;
	userId: string;
	token: string;
	role: string;
	expiresAt: string;
	loginMethod: 'jwt' | 'session';
}

/**
 * Auto-login development users on server start
 * Only runs when DEV_FORCE_AUTH=true and NODE_ENV !== 'production'
 */
export async function initializeDevAuth() {
	// Check environment
	if (process.env.NODE_ENV === 'production') {
		return;
	}

	if (process.env.DEV_FORCE_AUTH !== 'true') {
		return;
	}

	logger.info('[DevAuth] Initializing development authentication...');

	try {
		// Check if we have valid cached tokens
		const validCache = await checkTokenCache();
		if (validCache) {
			logger.info('[DevAuth] Using cached tokens from .cache/dev-tokens.json');
			logTokenSummary();
			return;
		}

		// Auto-login default users
		logger.info('[DevAuth] Generating new tokens for test users...');
		const tokens = await loginDefaultUsers();

		if (tokens.length > 0) {
			// Save to cache
			saveTokenCache(tokens);
			logger.info(`[DevAuth] ✅ ${tokens.length} test users auto-logged in`);
			logger.info('[DevAuth] Tokens saved to .cache/dev-tokens.json');
			logTokenSummary();
		} else {
			logger.warn('[DevAuth] No test users found. Run "pnpm seed:users:tokens" first.');
		}

	} catch (error) {
		logger.error('[DevAuth] Failed to initialize dev auth', { error });
	}
}

async function checkTokenCache(): Promise<boolean> {
	if (!existsSync(CACHE_FILE)) {
		return false;
	}

	try {
		const content = readFileSync(CACHE_FILE, 'utf-8');
		const cache: TokenCacheEntry[] = JSON.parse(content);

		// Check if any tokens are still valid
		const now = new Date();
		const validTokens = cache.filter(entry => {
			const expiry = new Date(entry.expiresAt);
			return expiry > now;
		});

		return validTokens.length > 0;
	} catch {
		return false;
	}
}

async function loginDefaultUsers(): Promise<TokenCacheEntry[]> {
	// Fetch default test users from database
	console.log('[DevAuth] 🔍 About to query database for users:', DEFAULT_USERS);
	const testUsers = await db
		.select()
		.from(users)
		.where(inArray(users.username, DEFAULT_USERS));
	console.log('[DevAuth] ✅ Database query completed, found', testUsers.length, 'users');

	const tokens: TokenCacheEntry[] = [];

	for (const user of testUsers) {
		if (!user.isActive) continue;

		// Generate JWT token
		const token = generateToken(user.id as UserId);
		
		// Decode to get expiration
		let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
		try {
			const tokenParts = token.split('.');
			const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
			if (payload.exp) {
				expiresAt = new Date(payload.exp * 1000).toISOString();
			}
		} catch {
			// Ignore JWT parsing errors
		}

		tokens.push({
			username: user.username,
			userId: user.id,
			token,
			role: user.role,
			expiresAt,
			loginMethod: 'jwt'
		});
	}

	return tokens;
}

function saveTokenCache(tokens: TokenCacheEntry[]) {
	const cacheDir = dirname(CACHE_FILE);
	mkdirSync(cacheDir, { recursive: true });
	writeFileSync(CACHE_FILE, JSON.stringify(tokens, null, 2));
}

function logTokenSummary() {
	try {
		const content = readFileSync(CACHE_FILE, 'utf-8');
		const cache: TokenCacheEntry[] = JSON.parse(content);

		logger.info('DEV_AUTH', chalk.cyan('\n┌─────────────────────────────────────────────────────────┐'));
		logger.info('DEV_AUTH', chalk.cyan('│') + chalk.bold.white('  Dev Auth Tokens Available                              ') + chalk.cyan('│'));
		logger.info('DEV_AUTH', chalk.cyan('├─────────────────────────────────────────────────────────┤'));

		for (const entry of cache) {
			const role = entry.role.padEnd(7);
			const username = entry.username.padEnd(12);
			logger.info('DEV_AUTH', chalk.cyan('│ ') + 
				chalk.yellow(`${role}`) + ' ' +
				chalk.white(username) + ' ' +
				chalk.gray(`Token: ${entry.token.substring(0, 20)}...`) + 
				chalk.cyan(' │')
			);
		}

		logger.info('DEV_AUTH', chalk.cyan('├─────────────────────────────────────────────────────────┤'));
		logger.info('DEV_AUTH', chalk.cyan('│ ') + chalk.gray('Use: pnpm dev:login <username> <password>             ') + chalk.cyan('│'));
		logger.info('DEV_AUTH', chalk.cyan('│ ') + chalk.gray('Cache: .cache/dev-tokens.json                          ') + chalk.cyan('│'));
		logger.info('DEV_AUTH', chalk.cyan('└─────────────────────────────────────────────────────────┘\n'));
	} catch {
		// Silent fail if can't read cache
	}
}