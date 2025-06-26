#!/usr/bin/env npx tsx

/**
 * Fresh Wallet Test Setup
 * 
 * Creates a clean test user without existing wallet data
 * for testing the complete signup → wallet creation flow
 */

import { db } from '@db';
import { users, ccpaymentUsers, transactions } from '@schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function setupFreshWalletTest() {
	console.log('🧪 Setting up fresh wallet test environment...');

	const testUsername = 'wallettest';
	const testEmail = 'wallettest@degentalk.dev';
	const testPassword = 'test123';

	try {
		// 1. Clean up any existing test user
		console.log('🧹 Cleaning up existing test user...');
		
		const existingUser = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, testUsername))
			.limit(1);

		if (existingUser.length > 0) {
			const userId = existingUser[0].id;
			
			// Delete related records first
			await db.delete(transactions).where(eq(transactions.userId, userId));
			await db.delete(ccpaymentUsers).where(eq(ccpaymentUsers.userId, userId));
			await db.delete(users).where(eq(users.id, userId));
			
			console.log('✅ Cleaned up existing test user');
		}

		// 2. Create fresh test user WITHOUT wallet
		console.log('👤 Creating fresh test user...');
		
		const passwordHash = await bcrypt.hash(testPassword, 10);
		
		const [newUser] = await db.insert(users).values({
			username: testUsername,
			email: testEmail,
			password: passwordHash,
			role: 'user',
			isActive: true,
			isBanned: false,
			isVerified: true,
			xp: 0,
			clout: 0,
			level: 1,
			reputation: 0,
			bio: 'Fresh test user for wallet creation testing',
			createdAt: new Date(),
			updatedAt: new Date()
		}).returning();

		console.log('✅ Fresh test user created:', {
			id: newUser.id,
			username: newUser.username,
			email: newUser.email
		});

		// 3. Verify NO wallet exists
		const ccpaymentMapping = await db
			.select()
			.from(ccpaymentUsers)
			.where(eq(ccpaymentUsers.userId, newUser.id));

		const userTransactions = await db
			.select()
			.from(transactions)
			.where(eq(transactions.userId, newUser.id));

		console.log('🔍 Wallet status verification:');
		console.log('  CCPayment mapping:', ccpaymentMapping.length === 0 ? '❌ None (Good!)' : '⚠️  Exists');
		console.log('  DGT transactions:', userTransactions.length === 0 ? '❌ None (Good!)' : '⚠️  Exists');

		console.log('\n🎯 Ready for testing! Login with:');
		console.log(`  Username: ${testUsername}`);
		console.log(`  Password: ${testPassword}`);
		console.log(`  User ID: ${newUser.id}`);

		console.log('\n📋 Test Steps:');
		console.log('1. Start servers: npm run dev');
		console.log('2. Login as wallettest user');
		console.log('3. Check wallet initialization in browser');
		console.log('4. Test endpoints:');
		console.log('   - GET /api/wallet/test/debug/' + newUser.id);
		console.log('   - POST /api/wallet/test/create-wallet');
		console.log('   - POST /api/wallet/test/simulate-webhook');

		return {
			success: true,
			user: {
				id: newUser.id,
				username: testUsername,
				email: testEmail,
				password: testPassword
			}
		};

	} catch (error) {
		console.error('❌ Setup failed:', error);
		throw error;
	}
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	setupFreshWalletTest()
		.then(result => {
			console.log('\n🎉 Fresh wallet test setup complete!');
			process.exit(0);
		})
		.catch(error => {
			console.error('\n💥 Setup failed:', error);
			process.exit(1);
		});
}

export { setupFreshWalletTest };