import { test, expect } from '@playwright/test';

test.describe('Forum Home Smoke', () => {
	test('homepage loads and shows primary zones grid', async ({ page }) => {
		await page.goto('/forum');

		// Wait for the page to load
		await page.waitForLoadState('networkidle');

		// Check the main forum page title appears
		await expect(page.locator('h1:has-text("Community Forums")')).toBeVisible();

		// Check Primary Zones section exists
		await expect(page.locator('text=Primary Zones')).toBeVisible();

		// Check at least one zone appears (use first() to handle multiple matches)
		await expect(page.locator('text=The Pit').first()).toBeVisible();
		await expect(page.locator('text=Mission Control').first()).toBeVisible();

		// Verify zone descriptions are visible
		await expect(page.locator('text=The daily war-zone for raw market chatter')).toBeVisible();
	});
});
