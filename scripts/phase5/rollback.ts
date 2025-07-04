import { execSync } from 'child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Phase 5 Rollback System
 * -----------------------
 * Safe rollback mechanism for Phase 5 codemods with validation and recovery options.
 * 
 * Features:
 * - Automatic checkpoint detection
 * - Confirmation prompts
 * - Partial rollback options
 * - Recovery validation
 * - Cleanup of temporary files
 * 
 * Usage:
 * - pnpm phase5:rollback
 * - pnpm phase5:rollback --force (skip confirmation)
 * - pnpm phase5:rollback --partial (select specific changes)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

interface RollbackOptions {
  force?: boolean;
  partial?: boolean;
  dryRun?: boolean;
}

interface CheckpointInfo {
  tag: string;
  timestamp: Date;
  commitHash: string;
  filesChanged: number;
}

export async function rollbackPhase5(options: RollbackOptions = {}): Promise<void> {
  const { force = false, partial = false, dryRun = false } = options;
  
  console.log('🔄 Phase 5 Rollback System');
  console.log('=' .repeat(40));
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }
  
  try {
    // Step 1: Detect available checkpoints
    const checkpoints = await detectCheckpoints();
    
    if (checkpoints.length === 0) {
      console.log('❌ No Phase 5 checkpoints found');
      console.log('💡 Available recovery options:');
      console.log('  1. Manual git reset to a known good commit');
      console.log('  2. Re-run codemods with --dry-run to see current state');
      console.log('  3. Use git reflog to find previous states');
      return;
    }
    
    // Step 2: Select checkpoint
    const selectedCheckpoint = await selectCheckpoint(checkpoints, force);
    
    if (!selectedCheckpoint) {
      console.log('❌ No checkpoint selected - rollback cancelled');
      return;
    }
    
    // Step 3: Analyze what will be rolled back
    const changes = await analyzeRollbackChanges(selectedCheckpoint);
    
    console.log('\n📋 Rollback Impact Analysis:');
    console.log(`   Target: ${selectedCheckpoint.tag}`);
    console.log(`   Timestamp: ${selectedCheckpoint.timestamp.toLocaleString()}`);
    console.log(`   Files affected: ${changes.filesChanged}`);
    console.log(`   Commits to discard: ${changes.commitsToDiscard}`);
    
    if (changes.filesChanged > 50) {
      console.log('⚠️  Large rollback detected - consider partial rollback');
    }
    
    // Step 4: Partial rollback option
    if (partial && !dryRun) {
      await performPartialRollback(selectedCheckpoint, changes);
      return;
    }
    
    // Step 5: Confirmation
    if (!force && !dryRun) {
      const confirmed = await confirmRollback(selectedCheckpoint, changes);
      if (!confirmed) {
        console.log('❌ Rollback cancelled by user');
        return;
      }
    }
    
    // Step 6: Perform rollback
    if (!dryRun) {
      await performFullRollback(selectedCheckpoint);
    } else {
      console.log('✅ Dry run complete - rollback would succeed');
    }
    
    // Step 7: Post-rollback validation
    if (!dryRun) {
      await validateRollback();
    }
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    console.log('\n🆘 Emergency recovery options:');
    console.log('  1. git reflog --all');
    console.log('  2. git fsck --lost-found');
    console.log('  3. Contact team lead for assistance');
    throw error;
  }
}

async function detectCheckpoints(): Promise<CheckpointInfo[]> {
  console.log('🔍 Detecting Phase 5 checkpoints...');
  
  try {
    // Look for Phase 5 git tags
    const tagResult = execSync('git tag --list | grep phase5', { encoding: 'utf8' });
    const tags = tagResult.trim().split('\n').filter(tag => tag.length > 0);
    
    const checkpoints: CheckpointInfo[] = [];
    
    for (const tag of tags) {
      try {
        // Get commit info for this tag
        const commitInfo = execSync(`git show --format="%H %ci" ${tag} --no-patch`, { encoding: 'utf8' });
        const [commitHash, dateStr] = commitInfo.trim().split(' ', 2);
        
        // Count files changed since this tag
        const diffResult = execSync(`git diff --name-only ${tag}..HEAD | wc -l`, { encoding: 'utf8' });
        const filesChanged = parseInt(diffResult.trim()) || 0;
        
        checkpoints.push({
          tag,
          timestamp: new Date(dateStr),
          commitHash,
          filesChanged
        });
      } catch (error) {
        console.warn(`⚠️  Could not analyze tag ${tag}:`, error);
      }
    }
    
    // Also check for checkpoint file
    try {
      const fs = require('fs');
      const checkpointFile = path.join(projectRoot, '.phase5-checkpoint');
      if (fs.existsSync(checkpointFile)) {
        const checkpointTag = fs.readFileSync(checkpointFile, 'utf8').trim();
        
        // Add to list if not already present
        if (!checkpoints.some(cp => cp.tag === checkpointTag)) {
          const commitInfo = execSync(`git show --format="%H %ci" ${checkpointTag} --no-patch`, { encoding: 'utf8' });
          const [commitHash, dateStr] = commitInfo.trim().split(' ', 2);
          const diffResult = execSync(`git diff --name-only ${checkpointTag}..HEAD | wc -l`, { encoding: 'utf8' });
          
          checkpoints.push({
            tag: checkpointTag,
            timestamp: new Date(dateStr),
            commitHash,
            filesChanged: parseInt(diffResult.trim()) || 0
          });
        }
      }
    } catch (error) {
      // Checkpoint file doesn't exist or is corrupted
    }
    
    // Sort by timestamp (newest first)
    checkpoints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    console.log(`✅ Found ${checkpoints.length} checkpoints`);
    return checkpoints;
    
  } catch (error) {
    console.log('⚠️  No git tags found, checking for manual checkpoints...');
    return [];
  }
}

async function selectCheckpoint(checkpoints: CheckpointInfo[], force: boolean): Promise<CheckpointInfo | null> {
  if (checkpoints.length === 1) {
    console.log(`📍 Using checkpoint: ${checkpoints[0].tag}`);
    return checkpoints[0];
  }
  
  if (force) {
    console.log(`📍 Auto-selecting latest checkpoint: ${checkpoints[0].tag}`);
    return checkpoints[0];
  }
  
  console.log('\n📋 Available checkpoints:');
  checkpoints.forEach((checkpoint, index) => {
    console.log(`   ${index + 1}. ${checkpoint.tag}`);
    console.log(`      Created: ${checkpoint.timestamp.toLocaleString()}`);
    console.log(`      Files changed since: ${checkpoint.filesChanged}`);
    console.log('');
  });
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise<string>(resolve => {
    readline.question(`Select checkpoint (1-${checkpoints.length}, or 0 to cancel): `, resolve);
  });
  
  readline.close();
  
  const selection = parseInt(answer.trim());
  
  if (selection === 0) {
    return null;
  }
  
  if (selection < 1 || selection > checkpoints.length) {
    throw new Error('Invalid checkpoint selection');
  }
  
  return checkpoints[selection - 1];
}

async function analyzeRollbackChanges(checkpoint: CheckpointInfo) {
  console.log('🔬 Analyzing rollback impact...');
  
  try {
    // Count commits to discard
    const commitCountResult = execSync(`git rev-list --count ${checkpoint.tag}..HEAD`, { encoding: 'utf8' });
    const commitsToDiscard = parseInt(commitCountResult.trim()) || 0;
    
    // Get list of changed files
    const changedFilesResult = execSync(`git diff --name-only ${checkpoint.tag}..HEAD`, { encoding: 'utf8' });
    const changedFiles = changedFilesResult.trim().split('\n').filter(file => file.length > 0);
    
    // Categorize changes
    const categories = {
      server: changedFiles.filter(f => f.startsWith('server/')).length,
      client: changedFiles.filter(f => f.startsWith('client/')).length,
      shared: changedFiles.filter(f => f.startsWith('shared/')).length,
      scripts: changedFiles.filter(f => f.startsWith('scripts/')).length,
      config: changedFiles.filter(f => f.includes('config') || f.includes('package.json') || f.includes('tsconfig')).length
    };
    
    return {
      filesChanged: changedFiles.length,
      commitsToDiscard,
      changedFiles,
      categories
    };
  } catch (error) {
    throw new Error('Failed to analyze rollback changes: ' + error);
  }
}

async function confirmRollback(checkpoint: CheckpointInfo, changes: any): Promise<boolean> {
  console.log('\n⚠️  ROLLBACK CONFIRMATION');
  console.log('=' .repeat(30));
  console.log(`Target checkpoint: ${checkpoint.tag}`);
  console.log(`This will discard ${changes.commitsToDiscard} commits`);
  console.log(`Affecting ${changes.filesChanged} files:`);
  console.log(`  - Server files: ${changes.categories.server}`);
  console.log(`  - Client files: ${changes.categories.client}`);
  console.log(`  - Shared files: ${changes.categories.shared}`);
  console.log(`  - Script files: ${changes.categories.scripts}`);
  console.log(`  - Config files: ${changes.categories.config}`);
  console.log('');
  console.log('💥 THIS ACTION CANNOT BE UNDONE');
  console.log('');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise<string>(resolve => {
    readline.question('Are you absolutely sure you want to proceed? Type "rollback" to confirm: ', resolve);
  });
  
  readline.close();
  
  return answer.trim().toLowerCase() === 'rollback';
}

async function performPartialRollback(checkpoint: CheckpointInfo, changes: any): Promise<void> {
  console.log('🎯 Performing partial rollback...');
  
  // Show file categories and let user choose
  const categories = Object.keys(changes.categories).filter(cat => changes.categories[cat] > 0);
  
  console.log('\n📂 File categories with changes:');
  categories.forEach((cat, index) => {
    console.log(`   ${index + 1}. ${cat}: ${changes.categories[cat]} files`);
  });
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise<string>(resolve => {
    readline.question('Select categories to rollback (comma-separated numbers): ', resolve);
  });
  
  readline.close();
  
  const selections = answer.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const selectedCategories = selections.map(n => categories[n - 1]).filter(Boolean);
  
  console.log(`Rolling back categories: ${selectedCategories.join(', ')}`);
  
  // Perform selective rollback
  for (const category of selectedCategories) {
    const pattern = category === 'config' ? '*config* package.json tsconfig*' : `${category}/*`;
    console.log(`   Rolling back ${category} files...`);
    
    try {
      execSync(`git checkout ${checkpoint.tag} -- ${pattern}`, { stdio: 'pipe' });
    } catch (error) {
      console.warn(`⚠️  Some ${category} files could not be rolled back`);
    }
  }
  
  console.log('✅ Partial rollback complete');
  console.log('💡 Review changes with: git status');
}

async function performFullRollback(checkpoint: CheckpointInfo): Promise<void> {
  console.log('🔄 Performing full rollback...');
  
  try {
    // Check if working directory is clean
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim().length > 0) {
      console.log('⚠️  Working directory has uncommitted changes:');
      console.log(status);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const stashAnswer = await new Promise<string>(resolve => {
        readline.question('Stash changes before rollback? (y/N): ', resolve);
      });
      
      readline.close();
      
      if (stashAnswer.toLowerCase() === 'y') {
        console.log('   Stashing uncommitted changes...');
        execSync('git stash push -m "Pre-rollback stash"');
        console.log('   Changes stashed - recover with: git stash pop');
      } else {
        console.log('❌ Rollback aborted - working directory not clean');
        console.log('💡 Commit or stash changes first, then retry rollback');
        return;
      }
    }
    
    // Reset to checkpoint
    console.log(`   Resetting to ${checkpoint.tag}...`);
    execSync(`git reset --hard ${checkpoint.tag}`);
    
    // Clean untracked files
    console.log('   Cleaning untracked files...');
    execSync('git clean -fd');
    
    // Remove checkpoint file if it exists
    try {
      const fs = require('fs');
      const checkpointFile = path.join(projectRoot, '.phase5-checkpoint');
      if (fs.existsSync(checkpointFile)) {
        fs.unlinkSync(checkpointFile);
      }
    } catch {
      // File doesn't exist or can't be removed
    }
    
    console.log('✅ Full rollback complete');
    
  } catch (error) {
    throw new Error('Rollback operation failed: ' + error);
  }
}

async function validateRollback(): Promise<void> {
  console.log('🔍 Validating rollback...');
  
  const validations = [
    {
      name: 'Git working directory clean',
      check: () => {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim().length === 0;
      }
    },
    {
      name: 'TypeScript compilation',
      check: () => {
        try {
          execSync('pnpm typecheck', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Dependencies installed',
      check: () => {
        try {
          execSync('pnpm install --frozen-lockfile', { stdio: 'pipe' });
          return true;
        } catch {
          return false;
        }
      }
    }
  ];
  
  for (const validation of validations) {
    try {
      const passed = validation.check();
      console.log(`   ${passed ? '✅' : '❌'} ${validation.name}`);
      
      if (!passed && validation.name === 'Dependencies installed') {
        console.log('      Running pnpm install...');
        execSync('pnpm install');
      }
    } catch (error) {
      console.log(`   ❌ ${validation.name}: ${error}`);
    }
  }
  
  console.log('\n🎉 Rollback validation complete');
  console.log('\n📋 Post-rollback checklist:');
  console.log('  1. Run tests to ensure functionality');
  console.log('  2. Check that development server starts');
  console.log('  3. Review git log to confirm rollback');
  console.log('  4. Notify team of rollback completion');
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const partial = args.includes('--partial');
  const dryRun = args.includes('--dry-run') || args.includes('--dry');
  
  rollbackPhase5({ force, partial, dryRun })
    .then(() => {
      if (!dryRun) {
        console.log('\n✨ Rollback completed successfully');
      }
    })
    .catch(error => {
      console.error('\n💥 Rollback failed:', error.message);
      process.exit(1);
    });
}