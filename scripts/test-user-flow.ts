#!/usr/bin/env tsx
import axios from 'axios';
import { chromium } from 'playwright';

const API_URL = 'http://localhost:5001/api';
const WEB_URL = 'http://localhost:5173';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // First, we need to login as admin
    console.log('📝 Creating admin user via direct seed...');
    const seedResponse = await axios.post(`${API_URL}/admin/dev/seed/users`).catch(() => null);
    
    if (!seedResponse) {
      console.log('⚠️  Admin endpoint not accessible, trying alternative approach...');
      console.log('🔧 Please run: pnpm seed:users');
      return false;
    }
    
    console.log('✅ Users seeded');
    
    // Seed forum structure
    console.log('🏛️  Seeding forum structure...');
    await axios.post(`${API_URL}/admin/dev/seed/forum`);
    console.log('✅ Forums seeded');
    
    // Seed enhanced data
    console.log('🚀 Seeding enhanced data (XP, wallets, etc)...');
    await axios.post(`${API_URL}/admin/dev/seed/enhanced`);
    console.log('✅ Enhanced data seeded');
    
    return true;
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUserFlow() {
  console.log('\n🧪 Starting user flow test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const issues: string[] = [];
  
  try {
    // 1. Navigate to homepage
    console.log('1️⃣ Navigating to homepage...');
    await page.goto(WEB_URL);
    await delay(2000);
    
    // Check if page loaded
    const title = await page.title();
    console.log(`   Page title: ${title}`);
    
    // 2. Test login flow
    console.log('\n2️⃣ Testing login flow...');
    
    // Look for login button/link
    const loginButton = await page.locator('button:has-text("Login"), a:has-text("Login"), button:has-text("Sign In"), a:has-text("Sign In")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await delay(1000);
      
      // Fill login form
      await page.fill('input[name="username"], input[type="text"]', 'cryptoadmin');
      await page.fill('input[name="password"], input[type="password"]', 'password123');
      
      // Submit login
      await page.click('button[type="submit"]');
      await delay(2000);
      
      // Check if logged in
      const userMenu = await page.locator('[data-testid="user-menu"], .user-menu, button:has-text("cryptoadmin")');
      if (await userMenu.isVisible()) {
        console.log('   ✅ Login successful');
      } else {
        issues.push('Login flow completed but user menu not visible');
        console.log('   ⚠️  Login might have issues - user menu not found');
      }
    } else {
      issues.push('Login button not found on homepage');
      console.log('   ❌ Login button not found');
    }
    
    // 3. Navigate to forums
    console.log('\n3️⃣ Testing forum navigation...');
    const forumLink = await page.locator('a:has-text("Forum"), a:has-text("Forums"), nav a[href*="forum"]').first();
    if (await forumLink.isVisible()) {
      await forumLink.click();
      await delay(2000);
      console.log('   ✅ Navigated to forums');
      
      // Check for forum categories
      const categories = await page.locator('.forum-category, [data-testid="forum-category"]').count();
      console.log(`   Found ${categories} forum categories`);
      if (categories === 0) {
        issues.push('No forum categories visible');
      }
    } else {
      issues.push('Forum navigation link not found');
      console.log('   ❌ Forum link not found');
    }
    
    // 4. Test post interactions
    console.log('\n4️⃣ Testing post interactions...');
    const firstPost = await page.locator('.post, article, [data-testid="post"]').first();
    if (await firstPost.isVisible()) {
      // Try to like a post
      const likeButton = await firstPost.locator('button:has-text("Like"), button[aria-label*="like"]').first();
      if (await likeButton.isVisible()) {
        await likeButton.click();
        await delay(1000);
        console.log('   ✅ Liked a post');
      } else {
        issues.push('Like button not found on posts');
        console.log('   ⚠️  Like button not found');
      }
      
      // Try to comment
      const commentButton = await firstPost.locator('button:has-text("Comment"), button:has-text("Reply")').first();
      if (await commentButton.isVisible()) {
        await commentButton.click();
        await delay(1000);
        
        const commentInput = await page.locator('textarea, input[placeholder*="comment"], input[placeholder*="reply"]').first();
        if (await commentInput.isVisible()) {
          await commentInput.fill('Test comment from automated flow');
          await page.keyboard.press('Enter');
          await delay(1000);
          console.log('   ✅ Added a comment');
        } else {
          issues.push('Comment input field not found');
          console.log('   ⚠️  Comment input not found');
        }
      } else {
        issues.push('Comment button not found on posts');
        console.log('   ⚠️  Comment button not found');
      }
    } else {
      issues.push('No posts visible in forum');
      console.log('   ❌ No posts found');
    }
    
    // 5. Test wallet functionality
    console.log('\n5️⃣ Testing wallet functionality...');
    const walletLink = await page.locator('a:has-text("Wallet"), button:has-text("Wallet")').first();
    if (await walletLink.isVisible()) {
      await walletLink.click();
      await delay(2000);
      
      // Check wallet balance
      const balance = await page.locator('.balance, [data-testid="wallet-balance"]').first();
      if (await balance.isVisible()) {
        const balanceText = await balance.textContent();
        console.log(`   ✅ Wallet balance: ${balanceText}`);
      } else {
        issues.push('Wallet balance not displayed');
        console.log('   ⚠️  Wallet balance not visible');
      }
    } else {
      issues.push('Wallet navigation not found');
      console.log('   ❌ Wallet link not found');
    }
    
    // 6. Test XP system
    console.log('\n6️⃣ Testing XP system...');
    const profileLink = await page.locator('a:has-text("Profile"), a[href*="profile"]').first();
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await delay(2000);
      
      // Check XP display
      const xpDisplay = await page.locator('.xp, [data-testid="user-xp"], :has-text("XP")').first();
      if (await xpDisplay.isVisible()) {
        const xpText = await xpDisplay.textContent();
        console.log(`   ✅ XP display: ${xpText}`);
      } else {
        issues.push('XP display not found in profile');
        console.log('   ⚠️  XP not displayed');
      }
    } else {
      issues.push('Profile navigation not found');
      console.log('   ❌ Profile link not found');
    }
    
    // Take a final screenshot
    await page.screenshot({ path: 'test-flow-final.png', fullPage: true });
    console.log('\n📸 Screenshot saved as test-flow-final.png');
    
  } catch (error: any) {
    console.error('\n❌ Test flow error:', error.message);
    issues.push(`Test flow crashed: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  if (issues.length === 0) {
    console.log('✅ All tests passed!');
  } else {
    console.log(`⚠️  Found ${issues.length} issues:`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  return issues;
}

async function main() {
  console.log('🚀 DegenTalk Full Flow Test\n');
  
  // Wait for servers to be ready
  console.log('⏳ Waiting for servers to start...');
  await delay(5000);
  
  // Check if server is ready
  try {
    await axios.get(`${API_URL}/health`);
    console.log('✅ Server is ready\n');
  } catch (error) {
    console.log('⚠️  Server might not be ready, continuing anyway...\n');
  }
  
  // Seed database
  const seeded = await seedDatabase();
  if (!seeded) {
    console.log('\n⚠️  Database seeding failed, but continuing with test...');
  }
  
  // Run user flow test
  await testUserFlow();
}

main().catch(console.error);