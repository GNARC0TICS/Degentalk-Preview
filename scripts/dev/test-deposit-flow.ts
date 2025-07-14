/**
 * E2E Test Script for Deposit-to-DGT Flow
 *
 * This script simulates a real user deposit on the ETH Sepolia testnet
 * and verifies that the entire webhook and DGT conversion process works correctly.
 *
 * Instructions:
 * 1. Ensure your .env.development.local has the correct CCPayment testnet credentials.
 * 2. Ensure the application is running in development mode (`pnpm run dev`).
 * 3. Run this script from the root directory: `pnpm tsx scripts/dev/test-deposit-flow.ts`
 * 4. Follow the prompts.
 */

import { db } from '@/db';
import { users } from '@/db/schema';
import { ccpaymentService } from '@/server/domains/wallet/providers/ccpayment/ccpayment.service';
import { walletService } from '@/server/domains/wallet/services/wallet.service';
import { logger } from '@/core/logger';
import inquirer from 'inquirer';

async function main() {
	logger.info('Starting Deposit-to-DGT E2E Test');

	// 1. Select a Test User
	const testUsers = await db.select().from(users).limit(10);
	const { selectedUserId } = await inquirer.prompt([
		{
			type: 'list',
			name: 'selectedUserId',
			message: 'Select a user to perform the test deposit for:',
			choices: testUsers.map(u => ({ name: `${u.username} (ID: ${u.id})`, value: u.id }))
		}
	]);

	logger.info(`Test user selected: ${selectedUserId}`);

	// 2. Get the user's initial DGT balance
	const initialDgtBalance = await walletService.getUserDgtBalance(selectedUserId);
	logger.info(`Initial DGT Balance: ${initialDgtBalance}`);

	// 3. Generate a deposit address on the ETH Sepolia testnet
	const chain = 'ETH_SEPOLIA'; // Using the testnet chain
	logger.info(`Generating deposit address for ${chain}...`);

	const depositAddressInfo = await ccpaymentService.createDepositAddress(selectedUserId, chain);

	logger.info('--- DEPOSIT INSTRUCTIONS ---');
	logger.info(`Address: ${depositAddressInfo.address}`);
	if (depositAddressInfo.memo) {
		logger.info(`Memo: ${depositAddressInfo.memo}`);
	}
	logger.info('Please send a small amount of Sepolia ETH to the address above.');
	logger.info('You can get test ETH from a faucet like https://sepolia-faucet.pk910.de/');
	logger.info('----------------------------');

	// 4. Wait for the user to confirm they've sent the funds
	await inquirer.prompt([{
		type: 'confirm',
		name: 'sent',
		message: 'Press Enter after you have sent the test ETH and the transaction is confirmed on the blockchain.'
	}]);

	// 5. Wait for webhook and check for balance change
	logger.info('Waiting for CCPayment webhook to be processed...');
	logger.info('This can take a few minutes. The script will check the balance every 10 seconds.');

	let newDgtBalance = initialDgtBalance;
	for (let i = 0; i < 30; i++) { // Check for 5 minutes (30 * 10s)
		await new Promise(resolve => setTimeout(resolve, 10000));
		newDgtBalance = await walletService.getUserDgtBalance(selectedUserId);
		
		process.stdout.write(`\rCurrent DGT Balance: ${newDgtBalance}`);

		if (newDgtBalance > initialDgtBalance) {
			logger.info('\nSuccess! DGT balance has increased.');
			break;
		}
	}

	console.log('\n'); // Newline after the progress indicator

	if (newDgtBalance <= initialDgtBalance) {
		logger.error('Test Failed: DGT balance did not increase after 5 minutes.');
		logger.error('Please check the following:');
		logger.error('1. Is the application running in dev mode?');
		logger.error('2. Is your ngrok/webhook tunnel configured correctly and pointing to the running app?');
		logger.error('3. Check the server logs for any errors during webhook processing.');
	} else {
		logger.info('--- TEST COMPLETE ---');
		logger.info(`Initial DGT: ${initialDgtBalance}`);
		logger.info(`Final DGT:   ${newDgtBalance}`);
		logger.info('The deposit-to-DGT flow is working correctly!');
	}
}

main().catch(error => {
	logger.error('An unexpected error occurred during the test:', error);
});
