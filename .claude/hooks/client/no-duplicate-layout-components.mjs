/**
 * TypeScript Hook: Prevent duplicate SiteHeader/SiteFooter in page components
 * 
 * This hook prevents pages from importing SiteHeader or SiteFooter components
 * as these are already provided by the RootLayout wrapper.
 */

export default {
	name: 'no-duplicate-layout-components',
	description: 'Prevents pages from importing SiteHeader or SiteFooter',
	
	async run({ filePath, content }) {
		// Only check files in the pages directory
		if (!filePath.includes('/pages/') || !filePath.endsWith('.tsx')) {
			return { success: true };
		}
		
		// Skip layout files themselves
		if (filePath.includes('Layout.tsx') || filePath.includes('layout.tsx')) {
			return { success: true };
		}
		
		const errors = [];
		
		// Check for SiteHeader imports
		const siteHeaderImportPattern = /import\s+.*(?:SiteHeader).*from\s+['"].*(?:header|SiteHeader)['"]/;
		if (siteHeaderImportPattern.test(content)) {
			errors.push({
				line: content.split('\n').findIndex(line => siteHeaderImportPattern.test(line)) + 1,
				message: 'Pages should not import SiteHeader - it\'s already provided by RootLayout'
			});
		}
		
		// Check for SiteFooter imports
		const siteFooterImportPattern = /import\s+.*(?:SiteFooter).*from\s+['"].*(?:footer|SiteFooter)['"]/;
		if (siteFooterImportPattern.test(content)) {
			errors.push({
				line: content.split('\n').findIndex(line => siteFooterImportPattern.test(line)) + 1,
				message: 'Pages should not import SiteFooter - it\'s already provided by RootLayout'
			});
		}
		
		// Check for usage of these components
		if (/<SiteHeader/.test(content)) {
			errors.push({
				line: content.split('\n').findIndex(line => /<SiteHeader/.test(line)) + 1,
				message: 'Remove <SiteHeader /> - it\'s already rendered by RootLayout'
			});
		}
		
		if (/<SiteFooter/.test(content)) {
			errors.push({
				line: content.split('\n').findIndex(line => /<SiteFooter/.test(line)) + 1,
				message: 'Remove <SiteFooter /> - it\'s already rendered by RootLayout'
			});
		}
		
		return {
			success: errors.length === 0,
			errors
		};
	}
};