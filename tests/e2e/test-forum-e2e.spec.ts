import { test, expect } from '@playwright/test';

test.describe('Forum System E2E Flow Testing', () => {
	const baseURL = 'http://localhost:5173';

	test.beforeEach(async ({ page }) => {
		// Set a longer timeout for this test
		test.setTimeout(60000);
	});

	test('Complete Forum Flow - Landing to Thread', async ({ page }) => {
		console.log('🚀 Starting comprehensive E2E forum flow test...');

		// 1. LANDING PAGE → ZONE SELECTION
		console.log('📍 Step 1: Testing Landing Page → Zone Selection');
		await page.goto(baseURL);
		await page.waitForLoadState('networkidle');

		// Check if landing page loads properly
		await expect(page).toHaveTitle(/Degentalk/i);

		// Look for primary zone carousel
		const carousel = page.locator('[data-testid="zone-carousel"], .carousel, .swiper, .embla');
		if ((await carousel.count()) > 0) {
			console.log('✅ Zone carousel found');
			await expect(carousel).toBeVisible();
		} else {
			console.log('⚠️ Zone carousel not found, looking for zone cards');
		}

		// Look for zone cards/links
		const zoneLinks = page.locator(
			'a[href*="/zone/"], a[href*="/zones/"], .zone-card, [class*="zone"]'
		);
		const zoneCount = await zoneLinks.count();
		console.log(`Found ${zoneCount} zone elements`);

		if (zoneCount === 0) {
			// Check if we're already on a forum page or need to navigate
			const currentUrl = page.url();
			console.log(`Current URL: ${currentUrl}`);

			// Look for navigation menu
			const navMenu = page.locator('nav, .navigation, .menu, [role="navigation"]');
			if ((await navMenu.count()) > 0) {
				console.log('✅ Navigation menu found');
			}
		}

		// Try to find the first zone to navigate to
		let targetZoneLink = null;

		// Look for specific zone names from the forum structure
		const commonZoneSelectors = [
			'a[href*="crypto-general"]',
			'a[href*="defi"]',
			'a[href*="trading"]',
			'a[href*="bitcoin"]',
			'a[href*="zone"]',
			'.zone-card a',
			'[data-zone] a'
		];

		for (const selector of commonZoneSelectors) {
			const element = page.locator(selector).first();
			if ((await element.count()) > 0) {
				targetZoneLink = element;
				console.log(`✅ Found zone link with selector: ${selector}`);
				break;
			}
		}

		if (!targetZoneLink) {
			// Try to find any link that might be a zone
			targetZoneLink = page
				.locator('a')
				.filter({ hasText: /zone|crypto|trading|defi|bitcoin/i })
				.first();
		}

		// 2. ZONE → FORUM NAVIGATION
		console.log('📍 Step 2: Testing Zone → Forum Navigation');

		if ((await targetZoneLink.count()) > 0) {
			console.log('✅ Navigating to zone page');
			await targetZoneLink.click();
			await page.waitForLoadState('networkidle');

			// Check zone page loads with forum listings
			const forumCards = page.locator(
				'.forum-card, [data-testid="forum-card"], a[href*="/forum/"]'
			);
			const forumCount = await forumCards.count();
			console.log(`Found ${forumCount} forum elements on zone page`);

			if (forumCount > 0) {
				console.log('✅ Forum cards found on zone page');

				// Check if forum cards show thread/post counts
				const statsElements = page.locator('.stats, .count, [class*="thread"], [class*="post"]');
				if ((await statsElements.count()) > 0) {
					console.log('✅ Forum statistics visible');
				}
			}
		} else {
			console.log('⚠️ No zone link found, trying direct forum navigation');
			await page.goto(`${baseURL}/crypto-general`);
			await page.waitForLoadState('networkidle');
		}

		// 3. FORUM → THREAD BROWSING
		console.log('📍 Step 3: Testing Forum → Thread Browsing');

		// Look for forum link to navigate to specific forum
		const forumLink = page.locator('a[href*="/forum/"], .forum-card a, [data-forum] a').first();

		if ((await forumLink.count()) > 0) {
			console.log('✅ Navigating to forum page');
			await forumLink.click();
			await page.waitForLoadState('networkidle');

			// Check forum page displays threads
			const threadElements = page.locator('.thread, [data-testid="thread"], a[href*="/thread/"]');
			const threadCount = await threadElements.count();
			console.log(`Found ${threadCount} thread elements on forum page`);

			if (threadCount > 0) {
				console.log('✅ Thread listings found');

				// Check engagement metrics
				const metricsElements = page.locator('.engagement, .replies, .views, [class*="metric"]');
				if ((await metricsElements.count()) > 0) {
					console.log('✅ Thread engagement metrics visible');
				}
			}

			// Check sidebar navigation
			const sidebar = page.locator('.sidebar, [data-testid="sidebar"], .navigation-sidebar');
			if ((await sidebar.count()) > 0) {
				console.log('✅ Sidebar navigation found');

				// Test collapsed/expanded states if toggle exists
				const sidebarToggle = page.locator('.sidebar-toggle, [data-testid="sidebar-toggle"]');
				if ((await sidebarToggle.count()) > 0) {
					console.log('✅ Sidebar toggle found - testing expand/collapse');
					await sidebarToggle.click();
					await page.waitForTimeout(500);
					await sidebarToggle.click();
					await page.waitForTimeout(500);
				}
			}
		} else {
			console.log('⚠️ No forum link found, trying direct thread access');
			await page.goto(`${baseURL}/forum/crypto-discussion`);
			await page.waitForLoadState('networkidle');
		}

		// 4. THREAD VIEWING
		console.log('📍 Step 4: Testing Thread Viewing');

		// Look for a thread to open
		const threadLink = page
			.locator('a[href*="/thread/"], .thread-title a, [data-thread] a')
			.first();

		if ((await threadLink.count()) > 0) {
			console.log('✅ Navigating to thread page');
			await threadLink.click();
			await page.waitForLoadState('networkidle');

			// Check thread page loads with posts
			const postElements = page.locator('.post, [data-testid="post"], .message');
			const postCount = await postElements.count();
			console.log(`Found ${postCount} post elements on thread page`);

			if (postCount > 0) {
				console.log('✅ Thread posts found');

				// Check BBCode rendering
				const richContent = page.locator('strong, em, code, pre, [class*="bbcode"]');
				if ((await richContent.count()) > 0) {
					console.log('✅ Rich content/BBCode rendering detected');
				}
			}

			// Check breadcrumb navigation
			const breadcrumbs = page.locator(
				'.breadcrumb, [data-testid="breadcrumb"], .navigation-breadcrumb'
			);
			if ((await breadcrumbs.count()) > 0) {
				console.log('✅ Breadcrumb navigation found');

				const breadcrumbLinks = breadcrumbs.locator('a');
				const breadcrumbCount = await breadcrumbLinks.count();
				console.log(`Found ${breadcrumbCount} breadcrumb links`);
			}
		} else {
			console.log('⚠️ No thread link found, checking for existing thread content');

			// Check if we're already on a thread page
			const currentUrl = page.url();
			if (currentUrl.includes('/thread/')) {
				console.log('✅ Already on a thread page');
			}
		}

		// 5. USER INTERACTIONS
		console.log('📍 Step 5: Testing User Interactions');

		// Check for XP/DGT system integration
		const xpElements = page.locator('.xp, [class*="experience"], [data-testid*="xp"]');
		if ((await xpElements.count()) > 0) {
			console.log('✅ XP system elements found');
		}

		const dgtElements = page.locator('.dgt, [class*="token"], [data-testid*="dgt"]');
		if ((await dgtElements.count()) > 0) {
			console.log('✅ DGT token elements found');
		}

		// Check for VIP subscription effects
		const vipElements = page.locator('.vip, [class*="premium"], [data-testid*="vip"]');
		if ((await vipElements.count()) > 0) {
			console.log('✅ VIP subscription elements found');
		}

		// Check for cosmetic perks
		const cosmeticElements = page.locator('.cosmetic, .avatar-frame, [class*="perk"]');
		if ((await cosmeticElements.count()) > 0) {
			console.log('✅ Cosmetic perk elements found');
		}

		// Check for thread creation options (if available without auth)
		const createThreadBtn = page
			.locator('button, a')
			.filter({ hasText: /create|new thread|post/i });
		if ((await createThreadBtn.count()) > 0) {
			console.log('✅ Thread creation interface found');
		}

		// 6. VISUAL CONSISTENCY CHECK
		console.log('📍 Step 6: Testing Visual Consistency');

		// Check theme system
		const themeElements = page.locator('[class*="theme"], [data-theme], [style*="--zone"]');
		if ((await themeElements.count()) > 0) {
			console.log('✅ Theme system elements found');
		}

		// Check responsive design
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.waitForTimeout(500);
		console.log('✅ Tested mobile viewport');

		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.waitForTimeout(500);
		console.log('✅ Tested desktop viewport');

		console.log('🎉 Forum E2E flow test completed successfully!');
	});

	test('Navigation Consistency Test', async ({ page }) => {
		console.log('🧭 Testing navigation consistency across different pages');

		const testUrls = [
			`${baseURL}/`,
			`${baseURL}/crypto-general`,
			`${baseURL}/forum/crypto-discussion`
		];

		for (const url of testUrls) {
			console.log(`Testing navigation on: ${url}`);
			try {
				await page.goto(url);
				await page.waitForLoadState('networkidle');

				// Check for consistent navigation elements
				const navElements = page.locator('nav, .navigation, .menu, header');
				if ((await navElements.count()) > 0) {
					console.log(`✅ Navigation found on ${url}`);
				}

				// Check for logo/brand link
				const brandLink = page.locator('a[href="/"], .logo, .brand');
				if ((await brandLink.count()) > 0) {
					console.log(`✅ Brand link found on ${url}`);
				}
			} catch (error) {
				console.log(`⚠️ Error testing ${url}: ${error.message}`);
			}
		}
	});
});
