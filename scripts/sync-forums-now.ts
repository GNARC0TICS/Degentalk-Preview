import { forumStructureService } from '../server/src/domains/forum/services/structure.service.js';

async function syncForums() {
  console.log('Starting forum sync from config...');
  
  // First do a dry run
  console.log('\n=== DRY RUN ===');
  const dryRunResults = await forumStructureService.syncFromConfig(true);
  console.log('Dry run results:', dryRunResults);
  
  // If dry run looks good, do the actual sync
  if (dryRunResults.created > 0 || dryRunResults.updated > 0) {
    console.log('\n=== ACTUAL SYNC ===');
    const results = await forumStructureService.syncFromConfig(false);
    console.log('Sync complete:', results);
  } else {
    console.log('No changes needed');
  }
  
  process.exit(0);
}

syncForums().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});