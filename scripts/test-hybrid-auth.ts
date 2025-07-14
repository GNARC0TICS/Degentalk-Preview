#!/usr/bin/env tsx

/**
 * Test script for hybrid JWT/Session authentication
 * Tests both authentication methods and fallback behavior
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';
const axiosInstance = axios.create({ 
	baseURL: API_BASE,
	withCredentials: true // Enable cookies for session auth
});

interface LoginResponse {
	success: boolean;
	data: {
		user: any;
		token: string;
		expiresAt?: string;
	};
}

async function testHybridAuth() {
	console.log('🔐 Testing Hybrid JWT/Session Authentication\n');

	try {
		// Test 1: Login and verify response includes token and expiration
		console.log('1️⃣ Testing login with JWT token generation...');
		const loginResponse = await axiosInstance.post<LoginResponse>('/auth/login', {
			username: 'cryptoadmin',
			password: 'password123'
		});

		const { token, user, expiresAt } = loginResponse.data.data;
		console.log('✅ Login successful!');
		console.log(`   User: ${user.username} (${user.role})`);
		console.log(`   Token: ${token.substring(0, 20)}...`);
		console.log(`   Expires: ${expiresAt || 'Not provided'}`);
		console.log('');

		// Test 2: Access protected endpoint with JWT
		console.log('2️⃣ Testing protected endpoint with JWT...');
		try {
			const jwtResponse = await axiosInstance.get('/xp/actions', {
				headers: { Authorization: `Bearer ${token}` }
			});
			console.log('✅ JWT authentication successful');
			console.log(`   XP actions: ${jwtResponse.data.data?.length || 0}`);
		} catch (error: any) {
			console.log('❌ JWT auth failed:', error.response?.data || error.message);
		}
		console.log('');

		// Test 3: Access protected endpoint with session (no JWT header)
		console.log('3️⃣ Testing protected endpoint with session cookie...');
		try {
			// The login should have set a session cookie
			const sessionResponse = await axiosInstance.get('/xp/actions');
			console.log('✅ Session authentication successful (fallback worked!)');
			console.log(`   XP actions: ${sessionResponse.data.data?.length || 0}`);
		} catch (error: any) {
			console.log('❌ Session auth failed:', error.response?.data || error.message);
		}
		console.log('');

		// Test 4: Test with expired/invalid token (should fall back to session)
		console.log('4️⃣ Testing invalid token with session fallback...');
		try {
			const invalidTokenResponse = await axiosInstance.get('/xp/actions', {
				headers: { Authorization: 'Bearer invalid-token' }
			});
			console.log('❌ Should have rejected invalid token');
		} catch (error: any) {
			if (error.response?.status === 401) {
				console.log('✅ Correctly rejected invalid token');
				console.log(`   Error: ${error.response.data.error}`);
			}
		}
		console.log('');

		// Test 5: Test getUserFromRequest utility
		console.log('5️⃣ Testing auth/user endpoint (uses getUserFromRequest)...');
		try {
			// With JWT
			const userWithJWT = await axiosInstance.get('/auth/user', {
				headers: { Authorization: `Bearer ${token}` }
			});
			console.log('✅ Got user with JWT');

			// With Session
			const userWithSession = await axiosInstance.get('/auth/user');
			console.log('✅ Got user with session');
			
			// Compare
			const jwtUserId = userWithJWT.data.data?.id;
			const sessionUserId = userWithSession.data.data?.id;
			if (jwtUserId === sessionUserId) {
				console.log('✅ Both methods returned same user');
			} else {
				console.log('❌ Different users returned!');
			}
		} catch (error: any) {
			console.log('❌ User fetch failed:', error.response?.data || error.message);
		}
		console.log('');

		// Test 6: Logout and verify both auth methods fail
		console.log('6️⃣ Testing logout clears both JWT and session...');
		await axiosInstance.post('/auth/logout');
		console.log('✅ Logged out');

		// Try JWT (should fail)
		try {
			await axiosInstance.get('/xp/actions', {
				headers: { Authorization: `Bearer ${token}` }
			});
			console.log('❌ JWT still works after logout (bad!)');
		} catch (error: any) {
			if (error.response?.status === 401) {
				console.log('✅ JWT correctly rejected after logout');
			}
		}

		// Try session (should fail)
		try {
			await axiosInstance.get('/xp/actions');
			console.log('❌ Session still works after logout (bad!)');
		} catch (error: any) {
			if (error.response?.status === 401) {
				console.log('✅ Session correctly rejected after logout');
			}
		}

		console.log('\n✨ Hybrid authentication tests completed!');

	} catch (error: any) {
		console.error('❌ Test failed:', error.response?.data || error.message);
		process.exit(1);
	}
}

// Run tests
testHybridAuth().catch(console.error);