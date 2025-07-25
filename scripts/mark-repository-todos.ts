#!/usr/bin/env tsx
/**
 * Mark Repository Pattern TODOs
 * 
 * This script adds TODO comments to service files that have @db imports
 * to mark them for repository pattern migration
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const DRY_RUN = process.argv.includes('--dry-run');

async function markRepositoryTodos() {
	console.log('🔍 Finding service files with @db imports...\n');
	
	// Priority services from audit report
	const priorityServices = [
		'server/src/domains/xp/xp.service.ts',
		'server/src/domains/forum/services/thread.service.ts',
		'server/src/domains/wallet/services/wallet.service.ts',
		'server/src/domains/analytics/services/platform.service.ts',
		'server/src/domains/gamification/services/mission.service.ts'
	];

	let todoCount = 0;
	let skippedCount = 0;

	for (const file of priorityServices) {
		try {
			const content = readFileSync(file, 'utf-8');
			
			// Check if file has @db imports
			if (!content.includes("from '@db'") && !content.includes('from "@db"')) {
				console.log(`✅ No @db import in: ${file}`);
				continue;
			}

			// Check if TODO already exists
			if (content.includes('TODO: Repository Pattern')) {
				console.log(`⏭️  TODO already exists in: ${file}`);
				skippedCount++;
				continue;
			}

			// Add TODO comment at the top of the file after imports
			const lines = content.split('\n');
			const lastImportIndex = lines.reduce((lastIndex, line, index) => {
				if (line.startsWith('import ')) return index;
				return lastIndex;
			}, 0);

			// Insert TODO comment after imports
			lines.splice(lastImportIndex + 1, 0, 
				'',
				'// TODO: Repository Pattern - This service violates architecture rules by using @db directly',
				'// Should inject repositories instead of importing @db',
				'// See: server/src/core/repository/repositories/ for examples'
			);

			const newContent = lines.join('\n');
			
			if (!DRY_RUN) {
				writeFileSync(file, newContent);
			}
			
			console.log(`📝 Added TODO to: ${file}`);
			todoCount++;
			
		} catch (e) {
			console.log(`❌ Error processing ${file}: ${e.message}`);
		}
	}

	console.log('\n📊 Summary:');
	console.log(`- TODOs added: ${todoCount}`);
	console.log(`- Files skipped: ${skippedCount}`);
	
	if (DRY_RUN) {
		console.log('\n⚠️  DRY RUN - No files were actually modified');
		console.log('Run without --dry-run to apply changes');
	}
	
	console.log('\n📋 Next Steps:');
	console.log('1. Create repositories for each domain (extend BaseRepository)');
	console.log('2. Register them in repository-factory.ts');
	console.log('3. Inject repositories into services');
	console.log('4. Move all DB queries from services to repositories');
	console.log('5. Remove @db imports from services');
}

markRepositoryTodos().catch(console.error);