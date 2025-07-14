#!/usr/bin/env tsx

/**
 * Test script for JWT authentication
 * Tests login, token usage, and protected endpoints
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

interface LoginResponse {
	success: boolean;
	data: {
		user: any;
		token: string;
	};
}

async function testJWTAuth() {
	console.log('🔐 Testing JWT Authentication System\n');

	try {
		// Test 1: Login and get JWT token
		console.log('1️⃣ Testing login endpoint...');
		const loginResponse = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, {
			username: 'cryptoadmin',
			password: 'password123'
		});

		const { token, user } = loginResponse.data.data;
		console.log('✅ Login successful!');
		console.log(`   User: ${user.username} (${user.role})`);
		console.log(`   Token: ${token.substring(0, 20)}...`);
		console.log('');

		// Test 2: Access protected endpoint without token
		console.log('2️⃣ Testing protected endpoint without token...');
		try {
			await axios.get(`${API_BASE}/xp/actions`);
			console.log('❌ Expected 401 but request succeeded');
		} catch (error: any) {
			if (error.response?.status === 401) {
				console.log('✅ Correctly rejected with 401');
			} else {
				console.log('❌ Unexpected error:', error.message);
			}
		}
		console.log('');

		// Test 3: Access protected endpoint with token
		console.log('3️⃣ Testing protected endpoint with JWT token...');
		try {
			const xpResponse = await axios.get(`${API_BASE}/xp/actions`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			console.log('✅ Successfully accessed protected endpoint');
			console.log(`   Available XP actions: ${xpResponse.data.data.length}`);
		} catch (error: any) {
			console.log('❌ Failed to access protected endpoint:', error.response?.data || error.message);
		}
		console.log('');

		// Test 4: Test mission endpoints
		console.log('4️⃣ Testing mission endpoints with JWT...');
		try {
			const missionsResponse = await axios.get(`${API_BASE}/gamification/missions`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			console.log('✅ Successfully accessed missions endpoint');
			console.log(`   Active missions: ${missionsResponse.data.missions?.length || 0}`);
		} catch (error: any) {
			console.log('❌ Failed to access missions:', error.response?.data || error.message);
		}
		console.log('');

		// Test 5: Test wallet endpoints
		console.log('5️⃣ Testing wallet endpoints with JWT...');
		try {
			const balanceResponse = await axios.get(`${API_BASE}/wallet/balance`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			console.log('✅ Successfully accessed wallet balance');
			console.log(`   DGT Balance: ${balanceResponse.data.data?.dgtBalance || 0}`);
		} catch (error: any) {
			console.log('❌ Failed to access wallet:', error.response?.data || error.message);
		}
		console.log('');

		// Test 6: Test invalid token
		console.log('6️⃣ Testing with invalid token...');
		try {
			await axios.get(`${API_BASE}/xp/actions`, {
				headers: {
					Authorization: 'Bearer invalid-token-here'
				}
			});
			console.log('❌ Expected 401 but request succeeded');
		} catch (error: any) {
			if (error.response?.status === 401) {
				console.log('✅ Correctly rejected invalid token');
			} else {
				console.log('❌ Unexpected error:', error.message);
			}
		}

		console.log('\n✨ JWT authentication tests completed!');

	} catch (error: any) {
		console.error('❌ Test failed:', error.response?.data || error.message);
		process.exit(1);
	}
}

// Run tests
testJWTAuth().catch(console.error);