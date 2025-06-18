import { test, expect } from '@playwright/test';

// TODO: ensure ADMIN_TEST_COOKIE is set in global setup for authenticated admin session

test.describe('Admin Settings & Feature Flags', () => {
	test('update a site setting', async ({ page }) => {
		await page.goto('/admin/settings');

		// Replace with proper selectors once UI is wired
		const xpPerPostInput = page.getByTestId('setting-xp_per_post');
		await xpPerPostInput.fill('7');
		await page.getByTestId('save-setting').click();

		await expect(page.getByText('Setting saved')).toBeVisible();
	});

	test('toggle a feature flag', async ({ page }) => {
		await page.goto('/admin/feature-flags');

		// Replace with proper selectors once UI is wired
		const flagToggle = page.getByTestId('flag-dark_mode');
		await flagToggle.click();

		await expect(page.getByText('Flag updated')).toBeVisible();
	});
}); 