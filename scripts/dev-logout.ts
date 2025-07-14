#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import chalk from 'chalk';
import axios from 'axios';

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

async function devLogout(username?: string, clearAll: boolean = false) {
	console.log(chalk.bold.blue('\n🔐 Dev Logout\n'));

	// Only run in development
	if (process.env.NODE_ENV === 'production') {
		console.error(chalk.red('❌ Cannot use dev-logout in production!'));
		process.exit(1);
	}

	// Check if cache exists
	if (!existsSync(CACHE_FILE)) {
		console.log(chalk.yellow('⚠️  No token cache found'));
		return;
	}

	try {
		if (clearAll) {
			// Clear entire cache
			unlinkSync(CACHE_FILE);
			console.log(chalk.green('✅ All cached tokens cleared'));
			console.log(chalk.gray('   Cache file removed: ' + CACHE_FILE));
		} else if (username) {
			// Clear specific user
			const content = readFileSync(CACHE_FILE, 'utf-8');
			let cache: TokenCacheEntry[] = JSON.parse(content);
			
			const initialLength = cache.length;
			cache = cache.filter(entry => entry.username !== username);
			
			if (cache.length === initialLength) {
				console.log(chalk.yellow(`⚠️  User "${username}" not found in cache`));
				return;
			}

			// If session-based, attempt to logout via API
			const loggedOutEntry = cache.find(e => e.username === username);
			if (loggedOutEntry?.loginMethod === 'session' && loggedOutEntry.sessionCookie) {
				try {
					await axios.post(`${API_BASE}/api/auth/logout`, {}, {
						headers: {
							Cookie: loggedOutEntry.sessionCookie
						}
					});
					console.log(chalk.gray('   Session invalidated on server'));
				} catch {
					// Silent fail - session might already be expired
				}
			}

			// Save updated cache
			if (cache.length > 0) {
				writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
			} else {
				unlinkSync(CACHE_FILE);
			}

			console.log(chalk.green(`✅ Logged out: ${username}`));
			console.log(chalk.gray(`   ${cache.length} users remaining in cache`));
		} else {
			// Show current cache and prompt
			const content = readFileSync(CACHE_FILE, 'utf-8');
			const cache: TokenCacheEntry[] = JSON.parse(content);
			
			console.log(chalk.cyan('Current cached logins:'));
			console.log(chalk.gray('─'.repeat(50)));
			
			cache.forEach(entry => {
				const expiry = new Date(entry.expiresAt);
				const isExpired = expiry < new Date();
				const status = isExpired ? chalk.red('[EXPIRED]') : chalk.green('[ACTIVE]');
				
				console.log(`${status} ${chalk.yellow(entry.username)} (${entry.role}) - ${entry.loginMethod}`);
			});
			
			console.log(chalk.gray('─'.repeat(50)));
			console.log(chalk.yellow('\nUsage:'));
			console.log('  pnpm run dev:logout <username>    # Logout specific user');
			console.log('  pnpm run dev:logout --all         # Clear all tokens');
		}

		// Note about token blacklisting
		if (username || clearAll) {
			console.log(chalk.gray('\n📝 Note: JWT tokens remain valid until expiration.'));
			console.log(chalk.gray('   Future enhancement: Implement token blacklist/revocation.'));
		}

	} catch (error: any) {
		console.error(chalk.red(`\n❌ Logout failed: ${error.message}`));
		process.exit(1);
	}
}

// CLI usage
if (require.main === module) {
	const args = process.argv.slice(2);
	
	const clearAll = args.includes('--all');
	const username = args.find(arg => !arg.startsWith('--'));

	devLogout(username, clearAll)
		.then(() => process.exit(0))
		.catch(() => process.exit(1));
}

export { devLogout };