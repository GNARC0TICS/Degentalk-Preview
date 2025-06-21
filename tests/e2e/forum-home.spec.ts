import { test, expect } from '@playwright/test';

test.describe('Forum Home Smoke', () => {
	test('homepage loads and shows primary zones grid', async ({ page }) => {
		await page.goto('/');

		// Wait for zone grid container
		await expect(page.locator('[data-testid="zone-grid"]')).toBeVisible();

		// Check at least one primary zone card exists
		const cards = page.locator('[data-testid="zone-card"]');
		await expect(cards.first()).toBeVisible();

		// Optionally assert a known zone title appears
		await expect(page.locator('text=The Pit')).toBeVisible();
	});
});
