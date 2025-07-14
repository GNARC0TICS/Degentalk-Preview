#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:5001/api';
const TEST_USER = {
  username: 'cryptoadmin',
  password: 'password123'
};

let cookie: string;
let userId: string;

async function login() {
  try {
    console.log('🔐 Logging in as', TEST_USER.username);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    const data = await response.json();
    console.log('Login response:', JSON.stringify(data, null, 2));
    if (!response.ok) throw new Error(data.error || 'Login failed');
    
    // Get session cookie from response headers
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      cookie = setCookie.split(';')[0];
    }
    
    userId = data.data?.id || data.data?.user?.id;
    console.log('✅ Login successful! User ID:', userId);
    return true;
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    return false;
  }
}

async function getActiveMissions() {
  try {
    console.log('\n📋 Fetching active missions...');
    const response = await fetch(`${API_BASE_URL}/gamification/missions`, {
      headers: { 
        'Cookie': cookie,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get missions');
    console.log('✅ Active missions:', JSON.stringify(data, null, 2));
    return data.missions || [];
  } catch (error: any) {
    console.error('❌ Failed to get missions:', error.message);
    return [];
  }
}

async function getUserProgress() {
  try {
    console.log('\n📊 Fetching user progress...');
    const response = await fetch(`${API_BASE_URL}/gamification/missions/summary`, {
      headers: { 
        'Cookie': cookie,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get progress');
    console.log('✅ User progress:', JSON.stringify(data, null, 2));
    return data.summary;
  } catch (error: any) {
    console.error('❌ Failed to get progress:', error.message);
    return {};
  }
}

async function trackAction(actionType: string, value: number = 1, metadata?: any) {
  try {
    console.log(`\n🎯 Tracking action: ${actionType} (value: ${value})`);
    // Note: There doesn't seem to be a track endpoint, actions are tracked automatically
    // when the actual actions happen (posts, replies, etc)
    console.log('⚠️  Note: Actions are tracked automatically when they occur');
    return null;
  } catch (error: any) {
    console.error('❌ Failed to track action:', error.message);
    return null;
  }
}

async function claimReward(missionId: string) {
  try {
    console.log(`\n🎁 Claiming reward for mission: ${missionId}`);
    const response = await fetch(`${API_BASE_URL}/gamification/missions/claim/${missionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      credentials: 'include',
      body: JSON.stringify({})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to claim reward');
    console.log('✅ Reward claimed:', JSON.stringify(data, null, 2));
    return data.data;
  } catch (error: any) {
    console.error('❌ Failed to claim reward:', error.message);
    return null;
  }
}

async function testMissionSystem() {
  console.log('🚀 Starting Mission System API Test');
  
  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('Cannot proceed without authentication');
    process.exit(1);
  }

  // 2. Get active missions
  const missions = await getActiveMissions();
  console.log(`Found ${missions?.length || 0} active missions`);

  // 3. Get initial progress
  const initialProgress = await getUserProgress();
  console.log(`User mission summary:`, initialProgress);

  // 4. Track some actions
  console.log('\n🎮 Simulating user actions...');
  
  // Post creation
  await trackAction('POST_CREATED', 1, { forumId: 'test-forum' });
  
  // Multiple replies
  for (let i = 0; i < 3; i++) {
    await trackAction('REPLY_CREATED', 1, { threadId: 'test-thread' });
  }
  
  // Likes received
  for (let i = 0; i < 5; i++) {
    await trackAction('LIKE_RECEIVED', 1);
  }
  
  // Tips
  await trackAction('TIP_SENT', 50, { recipientId: 'test-user' });
  await trackAction('TIP_SENT', 100, { recipientId: 'test-user-2' });

  // 5. Check updated progress
  console.log('\n📈 Checking updated progress...');
  const updatedProgress = await getUserProgress();
  
  // Check if any missions might be completed
  const activeMissionsWithProgress = await getActiveMissions();
  console.log(`\n🎯 Checking ${activeMissionsWithProgress.length} missions for completion...`);

  // 6. Try to claim rewards if any missions are completed
  for (const mission of activeMissionsWithProgress) {
    if (mission.progress?.isCompleted && !mission.progress?.isRewardClaimed) {
      await claimReward(mission.id);
    }
  }

  // 7. Final summary
  console.log('\n📊 Final Summary:');
  const finalProgress = await getUserProgress();
  console.log('Final mission summary:', finalProgress);

  console.log('\n✅ Mission system test complete!');
}

// Run the test
testMissionSystem().catch(console.error);