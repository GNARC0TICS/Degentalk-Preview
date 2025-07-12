/**
 * E2E Smoke Test: Wallet Deposit Flow
 * 
 * Tests the critical money loop:
 * 1. User signup
 * 2. Deposit webhook processing  
 * 3. Auto-convert toggle off
 * 4. Second deposit (no conversion)
 * 
 * Expected balances:
 * - 10 DGT welcome bonus
 * - 200 DGT from first deposit  
 * - 0 DGT from second deposit (auto-convert disabled)
 */

import { test, expect, type Page } from '@playwright/test';

const TEST_USER = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

const MOCK_WEBHOOK_DEPOSIT_1 = {
  eventType: 'deposit_completed',
  orderId: `test_order_${Date.now()}_1`,
  status: 'completed',
  amount: '20.00',
  actualAmount: '20.00',
  currency: 'USDT',
  coinSymbol: 'USDT',
  txHash: '0xtest123abc',
  uid: '', // Will be set after user creation
};

const MOCK_WEBHOOK_DEPOSIT_2 = {
  ...MOCK_WEBHOOK_DEPOSIT_1,
  orderId: `test_order_${Date.now()}_2`,
  txHash: '0xtest456def'
};

test.describe('Wallet Deposit Flow E2E', () => {
  let userId: string;
  let ccpaymentUserId: string;

  test('Complete wallet deposit flow with auto-convert toggle', async ({ page, request }) => {
    // Step 1: User Signup
    await test.step('User signs up and gets welcome bonus', async () => {
      await page.goto('/auth/register');
      
      // Fill registration form
      await page.fill('[name="username"]', TEST_USER.username);
      await page.fill('[name="email"]', TEST_USER.email);
      await page.fill('[name="password"]', TEST_USER.password);
      await page.fill('[name="confirmPassword"]', TEST_USER.password);
      
      // Submit registration
      await page.click('button[type="submit"]');
      
      // Should redirect to login or dashboard
      await expect(page).toHaveURL(/\/(dashboard|login)/);
      
      // If redirected to login, log in
      if (page.url().includes('/login')) {
        await page.fill('[name="username"]', TEST_USER.username);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
      }
      
      // Should now be on dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Verify welcome bonus (10 DGT)
      await page.goto('/wallet');
      await expect(page.locator('[data-testid="dgt-balance"]')).toContainText('10');
    });

    // Step 2: Get user ID for webhook setup
    await test.step('Get user ID from API', async () => {
      const response = await request.get('/api/auth/me', {
        headers: {
          'Cookie': await page.context().cookies()
            .then(cookies => cookies.map(c => `${c.name}=${c.value}`).join('; '))
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const userData = await response.json();
      userId = userData.user.id;
      ccpaymentUserId = userData.user.ccpaymentUserId || `ccpay_${userId}`;
      
      // Update webhook payload with user ID
      MOCK_WEBHOOK_DEPOSIT_1.uid = ccpaymentUserId;
      MOCK_WEBHOOK_DEPOSIT_2.uid = ccpaymentUserId;
    });

    // Step 3: First deposit webhook (auto-convert enabled by default)
    await test.step('Process first deposit webhook (200 DGT expected)', async () => {
      // Simulate CCPayment webhook for deposit
      const webhookResponse = await request.post('/api/wallet/webhooks/ccpayment', {
        data: MOCK_WEBHOOK_DEPOSIT_1,
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Webhook-Signature': 'test_signature'
        }
      });
      
      expect(webhookResponse.ok()).toBeTruthy();
      
      // Refresh wallet page and check balance
      await page.reload();
      await page.waitForTimeout(1000); // Allow webhook processing
      
      // Should have 10 DGT (welcome) + 200 DGT (20 USDT * 10 DGT/USD) = 210 DGT
      await expect(page.locator('[data-testid="dgt-balance"]')).toContainText('210');
    });

    // Step 4: Toggle auto-convert off
    await test.step('Disable auto-convert in admin settings', async () => {
      // Navigate to admin settings (assuming user has admin access or we create admin)
      await page.goto('/admin/wallet');
      
      // Find and toggle auto-convert setting
      const autoConvertToggle = page.locator('[data-testid="auto-convert-toggle"]');
      if (await autoConvertToggle.isChecked()) {
        await autoConvertToggle.click();
      }
      
      // Save settings
      await page.click('button:has-text("Save")');
      await expect(page.locator('text=Settings saved')).toBeVisible();
    });

    // Step 5: Second deposit webhook (auto-convert disabled)  
    await test.step('Process second deposit webhook (0 DGT expected)', async () => {
      // Simulate second CCPayment webhook
      const webhookResponse = await request.post('/api/wallet/webhooks/ccpayment', {
        data: MOCK_WEBHOOK_DEPOSIT_2,
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Webhook-Signature': 'test_signature'
        }
      });
      
      expect(webhookResponse.ok()).toBeTruthy();
      
      // Go back to wallet and verify balance unchanged
      await page.goto('/wallet');
      await page.waitForTimeout(1000); // Allow webhook processing
      
      // Should still have 210 DGT (no conversion from second deposit)
      await expect(page.locator('[data-testid="dgt-balance"]')).toContainText('210');
      
      // Should have crypto balance for the unconverted deposit
      await expect(page.locator('[data-testid="usdt-balance"]')).toContainText('20');
    });

    // Step 6: Verify transaction history
    await test.step('Verify transaction history shows both deposits', async () => {
      await page.click('[data-testid="transaction-history-tab"]');
      
      // Should see welcome bonus transaction
      await expect(page.locator('text=Welcome bonus')).toBeVisible();
      
      // Should see first deposit conversion
      await expect(page.locator('text=Cryptocurrency deposit auto-conversion')).toBeVisible();
      
      // Second deposit should show in crypto transactions, not DGT
      await page.click('[data-testid="crypto-transactions-tab"]');
      await expect(page.locator('text=USDT Deposit').nth(1)).toBeVisible();
    });
  });

  test.afterEach(async ({ request }) => {
    // Cleanup: Delete test user if needed
    if (userId) {
      try {
        await request.delete(`/api/admin/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.warn('Failed to cleanup test user:', error);
      }
    }
  });
});