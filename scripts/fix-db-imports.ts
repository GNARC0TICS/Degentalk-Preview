#!/usr/bin/env tsx
/**
 * Fix @db Import Violations
 * 
 * This script fixes the import path crisis by:
 * 1. Identifying all files with @db imports
 * 2. Determining if they're in server domain services (which should use repositories)
 * 3. Adding a TODO comment for services that need repository pattern
 * 4. Keeping @db imports in repository files (which are allowed to have them)
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { dirname, basename } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

async function fixDbImports() {
	console.log('🔍 Finding files with @db imports...');
	
	// Find all TypeScript files with @db imports
	const files = await glob('**/*.{ts,tsx}', {
		ignore: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'.next/**',
			'scripts/fix-db-imports.ts'
		]
	});

	let fixedCount = 0;
	let todoCount = 0;
	let skippedCount = 0;

	for (const file of files) {
		const content = readFileSync(file, 'utf-8');
		
		// Check if file has @db imports
		if (!content.includes("from '@db'") && !content.includes('from "@db"')) {
			continue;
		}

		const dir = dirname(file);
		const filename = basename(file);

		// Skip if it's a repository file (they're allowed to use @db)
		if (filename.includes('repository') || dir.includes('/repository/')) {
			console.log(`✅ Skipping repository file: ${file}`);
			skippedCount++;
			continue;
		}

		// Skip if it's in db directory itself
		if (dir.startsWith('db/')) {
			skippedCount++;
			continue;
		}

		// Check if it's a service file in domains
		const isServiceFile = file.includes('/domains/') && 
			(filename.includes('.service.') || filename.includes('.routes.') || filename.includes('.controller.'));

		if (isServiceFile) {
			// Add TODO comment for services that need repository pattern
			const lines = content.split('\n');
			const importLineIndex = lines.findIndex(line => 
				line.includes("from '@db'") || line.includes('from "@db"')
			);

			if (importLineIndex !== -1) {
				// Check if TODO already exists
				const hasTodo = lines[importLineIndex - 1]?.includes('TODO: Repository Pattern');
				
				if (!hasTodo) {
					lines.splice(importLineIndex, 0, '// TODO: Repository Pattern - This service should use repository instead of direct @db import');
					
					const newContent = lines.join('\n');
					
					if (!DRY_RUN) {
						writeFileSync(file, newContent);
					}
					
					console.log(`📝 Added TODO to service: ${file}`);
					todoCount++;
				}
			}
		}

		// For now, we're not changing the imports themselves
		// Just marking them for manual refactoring
		fixedCount++;
	}

	console.log('\n📊 Summary:');
	console.log(`- Files with @db imports: ${fixedCount}`);
	console.log(`- TODOs added: ${todoCount}`);
	console.log(`- Repository files skipped: ${skippedCount}`);
	
	if (DRY_RUN) {
		console.log('\n⚠️  DRY RUN - No files were actually modified');
		console.log('Run without --dry-run to apply changes');
	}
}

// Alternative approach: Create a report of all violations
async function generateReport() {
	console.log('\n📋 Generating detailed report...\n');
	
	const violations = {
		services: [] as string[],
		controllers: [] as string[],
		routes: [] as string[],
		utils: [] as string[],
		tests: [] as string[],
		scripts: [] as string[],
		other: [] as string[]
	};

	const files = await glob('**/*.{ts,tsx}', {
		ignore: ['node_modules/**', 'dist/**', 'build/**']
	});

	for (const file of files) {
		const content = readFileSync(file, 'utf-8');
		
		if (!content.includes("from '@db'") && !content.includes('from "@db"')) {
			continue;
		}

		// Skip allowed files
		if (file.includes('repository') || file.startsWith('db/')) {
			continue;
		}

		// Categorize violations
		if (file.includes('.service.')) violations.services.push(file);
		else if (file.includes('.controller.')) violations.controllers.push(file);
		else if (file.includes('.routes.')) violations.routes.push(file);
		else if (file.includes('/utils/')) violations.utils.push(file);
		else if (file.includes('.test.') || file.includes('.spec.')) violations.tests.push(file);
		else if (file.startsWith('scripts/')) violations.scripts.push(file);
		else violations.other.push(file);
	}

	// Print report
	console.log('=== @db Import Violations Report ===\n');
	
	console.log(`📁 Services (${violations.services.length}):`);
	violations.services.forEach(f => console.log(`  - ${f}`));
	
	console.log(`\n📁 Controllers (${violations.controllers.length}):`);
	violations.controllers.forEach(f => console.log(`  - ${f}`));
	
	console.log(`\n📁 Routes (${violations.routes.length}):`);
	violations.routes.forEach(f => console.log(`  - ${f}`));
	
	console.log(`\n📁 Utils (${violations.utils.length}):`);
	violations.utils.forEach(f => console.log(`  - ${f}`));
	
	console.log(`\n📁 Tests (${violations.tests.length}):`);
	violations.tests.forEach(f => console.log(`  - ${f}`));
	
	console.log(`\n📁 Scripts (${violations.scripts.length}):`);
	violations.scripts.forEach(f => console.log(`  - ${f}`));
	
	console.log(`\n📁 Other (${violations.other.length}):`);
	violations.other.forEach(f => console.log(`  - ${f}`));
	
	const total = Object.values(violations).reduce((sum, arr) => sum + arr.length, 0);
	console.log(`\n📊 Total violations: ${total}`);
	
	// Priority domains for repository pattern
	const priorityDomains = new Set<string>();
	violations.services.forEach(file => {
		const match = file.match(/domains\/([^/]+)\//);
		if (match) priorityDomains.add(match[1]);
	});
	
	console.log(`\n🎯 Priority domains for repository pattern:`);
	Array.from(priorityDomains).forEach(domain => console.log(`  - ${domain}`));
}

// Run the script
async function main() {
	if (process.argv.includes('--report')) {
		await generateReport();
	} else {
		await fixDbImports();
	}
}

main().catch(console.error);