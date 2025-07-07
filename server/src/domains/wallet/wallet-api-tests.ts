/**
 * Wallet API Test Utility
 *
 * This file provides test functions to validate the wallet API endpoints.
 * It's intended for development use only.
 */

import axios from 'axios';
import { logger } from '../../core/logger';
import { wallet } from '../..';
import { z } from 'zod';
import { AxiosInstance } from 'axios';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN; // JWT token for authentication

// Create axios instance with auth header
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		...(TEST_USER_TOKEN ? { Authorization: `Bearer ${TEST_USER_TOKEN}` } : {})
	}
});

/**
 * Colors for console output
 */
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	underscore: '\x1b[4m',
	blink: '\x1b[5m',
	reverse: '\x1b[7m',
	hidden: '\x1b[8m',

	fg: {
		black: '\x1b[30m',
		red: '\x1b[31m',
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		blue: '\x1b[34m',
		magenta: '\x1b[35m',
		cyan: '\x1b[36m',
		white: '\x1b[37m',
		crimson: '\x1b[38m'
	},

	bg: {
		black: '\x1b[40m',
		red: '\x1b[41m',
		green: '\x1b[42m',
		yellow: '\x1b[43m',
		blue: '\x1b[44m',
		magenta: '\x1b[45m',
		cyan: '\x1b[46m',
		white: '\x1b[47m',
		crimson: '\x1b[48m'
	}
};

/**
 * Log a test step with color coding
 */
function logStep(step: string, data?: any) {
	logger.info(`${colors.fg.cyan}[TEST STEP]${colors.reset} ${step}`);
	if (data) {
		logger.info(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
	}
}

/**
 * Log a test result with color coding
 */
function logResult(passed: boolean, message: string, data?: any) {
	const color = passed ? colors.fg.green : colors.fg.red;
	const status = passed ? 'PASSED' : 'FAILED';
	logger.info(`${color}[${status}]${colors.reset} ${message}`);
	if (data) {
		logger.info(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
	}
}

/**
 * Test wallet balance endpoint
 */
async function testGetWalletBalance() {
	try {
		logStep('Testing GET /wallet/balance');

		const response = await api.get('/wallet/balance');
		const data = response.data;

		const passed =
			response.status === 200 && data.success === true && typeof data.data.dgt === 'number';

		logResult(passed, 'Get wallet balance', data);
		return { passed, data };
	} catch (error) {
		logResult(false, `Error: ${error.message}`, error.response?.data);
		return { passed: false, error };
	}
}

/**
 * Test transaction history endpoint
 */
async function testGetTransactionHistory() {
	try {
		logStep('Testing GET /wallet/transactions');

		const response = await api.get('/wallet/transactions?limit=5');
		const data = response.data;

		const passed =
			response.status === 200 && data.success === true && Array.isArray(data.data.transactions);

		logResult(passed, 'Get transaction history', data);
		return { passed, data };
	} catch (error) {
		logResult(false, `Error: ${error.message}`, error.response?.data);
		return { passed: false, error };
	}
}

/**
 * Test deposit address creation endpoint
 */
async function testCreateDepositAddress() {
	try {
		logStep('Testing POST /wallet/deposit-address for USDT');

		const response = await api.post('/wallet/deposit-address', {
			currency: 'USDT'
		});
		const data = response.data;

		const passed =
			response.status === 200 && data.success === true && data.data.address && data.data.currency;

		logResult(passed, 'Create deposit address', data);
		return { passed, data };
	} catch (error) {
		logResult(false, `Error: ${error.message}`, error.response?.data);
		return { passed: false, error };
	}
}

/**
 * Test DGT purchase endpoint
 */
async function testProcessDgtPurchase() {
	try {
		logStep('Testing POST /wallet/purchase-dgt');

		// This would typically come from a completed CCPayment transaction
		const mockPurchaseData = {
			cryptoAmount: 10,
			cryptoCurrency: 'USDT',
			dgtAmount: 1000, // 10 USDT = 1000 DGT at 1:100 rate
			ccpaymentOrderId: `test-order-${Date.now()}`
		};

		const response = await api.post('/wallet/purchase-dgt', mockPurchaseData);
		const data = response.data;

		const passed =
			response.status === 200 &&
			data.success === true &&
			data.data.transactionId &&
			data.data.newBalance;

		logResult(passed, 'Process DGT purchase', data);
		return { passed, data };
	} catch (error) {
		logResult(false, `Error: ${error.message}`, error.response?.data);
		return { passed: false, error };
	}
}

/**
 * Test DGT transfer endpoint
 */
async function testTransferDGT() {
	try {
		logStep('Testing POST /wallet/transfer (DGT)');

		// To test this, you need another user's ID in the system
		const recipientUserId = 2; // Adjust as needed
		const transferData = {
			toUserId: recipientUserId,
			amount: 10, // Small amount for testing
			reason: 'API test transfer'
		};

		const response = await api.post('/wallet/transfer', transferData);
		const data = response.data;

		const passed = response.status === 200 && data.success === true && data.data.transactionId;

		logResult(passed, 'Transfer DGT', data);
		return { passed, data };
	} catch (error) {
		logResult(false, `Error: ${error.message}`, error.response?.data);
		return { passed: false, error };
	}
}

/**
 * Test Tip endpoint
 */
async function testSendTip() {
	try {
		logStep('Testing POST /engagement/tip');

		// To test this, you need another user's ID in the system
		const recipientUserId = 2; // Adjust as needed
		const tipData = {
			toUserId: recipientUserId,
			amount: 5, // Small amount for testing
			currency: 'DGT',
			source: 'test',
			reason: 'API test tip'
		};

		const response = await api.post('/engagement/tip', tipData);
		const data = response.data;

		const passed = response.status === 200 && data.success === true && data.data.tipId;

		logResult(passed, 'Send tip', data);
		return { passed, data };
	} catch (error) {
		logResult(false, `Error: ${error.message}`, error.response?.data);
		return { passed: false, error };
	}
}

/**
 * Test Rain endpoint
 */
async function testSendRain() {
	try {
		logStep('Testing POST /engagement/rain');

		const rainData = {
			amount: 20, // Small amount for testing
			currency: 'DGT',
			eligibleUserCount: 3,
			channel: 'general',
			message: 'API test rain'
		};

		const response = await api.post('/engagement/rain', rainData);
		const data = response.data;

		const passed =
			response.status === 200 &&
			data.success === true &&
			data.data.transactionId &&
			Array.isArray(data.data.recipients);

		logResult(passed, 'Send rain', data);
		return { passed, data };
	} catch (error) {
		logResult(false, `Error: ${error.message}`, error.response?.data);
		return { passed: false, error };
	}
}

/**
 * Run all wallet tests
 */
async function runAllTests() {
	logger.info(`${colors.fg.yellow}${colors.bright}===== STARTING WALLET API TESTS =====${colors.reset}\n`);

	// Core wallet tests
	const balanceResult = await testGetWalletBalance();
	const transactionsResult = await testGetTransactionHistory();
	const depositAddressResult = await testCreateDepositAddress();
	const purchaseResult = await testProcessDgtPurchase();
	const transferResult = await testTransferDGT();

	// Engagement tests
	const tipResult = await testSendTip();
	const rainResult = await testSendRain();

	// Summarize results
	const allTests = [
		{ name: 'Get Wallet Balance', result: balanceResult },
		{ name: 'Get Transaction History', result: transactionsResult },
		{ name: 'Create Deposit Address', result: depositAddressResult },
		{ name: 'Process DGT Purchase', result: purchaseResult },
		{ name: 'Transfer DGT', result: transferResult },
		{ name: 'Send Tip', result: tipResult },
		{ name: 'Send Rain', result: rainResult }
	];

	logger.info(`\n${colors.fg.yellow}${colors.bright}===== TEST SUMMARY =====${colors.reset}`);
	allTests.forEach((test) => {
		const statusColor = test.result.passed ? colors.fg.green : colors.fg.red;
		const statusText = test.result.passed ? 'PASSED' : 'FAILED';
		logger.info(`${statusColor}[${statusText}]${colors.reset} ${test.name}`);
	});

	const passedCount = allTests.filter((test) => test.result.passed).length;
	logger.info(`\n${colors.fg.yellow}${passedCount}/${allTests.length} tests passed${colors.reset}\n`);

	return {
		totalTests: allTests.length,
		passedTests: passedCount,
		allTests
	};
}

// If file is executed directly, run the tests
if (require.main === module) {
	runAllTests().catch(console.error);
}

// Export functions for external use
export {
	testGetWalletBalance,
	testGetTransactionHistory,
	testCreateDepositAddress,
	testProcessDgtPurchase,
	testTransferDGT,
	testSendTip,
	testSendRain,
	runAllTests
};
