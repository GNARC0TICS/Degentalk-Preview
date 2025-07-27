#!/usr/bin/env tsx
/**
 * Fix Database Migration Issues
 * 
 * This script analyzes and fixes the current database migration problems:
 * 1. Duplicate reputation field in users schema
 * 2. Missing .js extension in enum imports
 * 3. Migration workflow verification
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const fixes = {
  duplicateField: false,
  enumImports: false,
  verified: false
};

async function fixDuplicateReputation() {
  console.log('🔧 Fixing duplicate reputation field...');
  
  const usersSchemaPath = path.join(process.cwd(), 'db/schema/user/users.ts');
  
  try {
    let content = await fs.readFile(usersSchemaPath, 'utf8');
    
    // Count occurrences
    const reputationMatches = content.match(/reputation: integer\('reputation'\)/g);
    
    if (reputationMatches && reputationMatches.length > 1) {
      console.log(`  Found ${reputationMatches.length} reputation fields`);
      
      // Remove the second occurrence (line 84)
      const lines = content.split('\n');
      const lineToRemove = lines.findIndex((line, index) => 
        index > 80 && line.includes("reputation: integer('reputation')")
      );
      
      if (lineToRemove > -1) {
        lines.splice(lineToRemove, 1);
        content = lines.join('\n');
        await fs.writeFile(usersSchemaPath, content);
        console.log('  ✅ Removed duplicate reputation field');
        fixes.duplicateField = true;
      }
    } else {
      console.log('  ✅ No duplicate reputation fields found');
      fixes.duplicateField = true;
    }
  } catch (error) {
    console.error('  ❌ Error fixing reputation field:', error);
  }
}

async function fixEnumImports() {
  console.log('\n🔧 Fixing enum imports...');
  
  const schemaIndexPath = path.join(process.cwd(), 'db/schema/index.ts');
  
  try {
    let content = await fs.readFile(schemaIndexPath, 'utf8');
    
    // Fix .js extensions in imports
    const updatedContent = content.replace(/from '\.\/(.+)\.js'/g, "from './$1'");
    
    if (content !== updatedContent) {
      await fs.writeFile(schemaIndexPath, updatedContent);
      console.log('  ✅ Fixed .js extensions in imports');
      fixes.enumImports = true;
    } else {
      console.log('  ✅ Import paths already correct');
      fixes.enumImports = true;
    }
  } catch (error) {
    console.error('  ❌ Error fixing enum imports:', error);
  }
}

async function verifySchemaStructure() {
  console.log('\n🔍 Verifying schema structure...');
  
  try {
    // Check if core/enums.ts exists
    const enumsPath = path.join(process.cwd(), 'db/schema/core/enums.ts');
    await fs.access(enumsPath);
    console.log('  ✅ core/enums.ts exists');
    
    // Check TypeScript compilation
    console.log('  🔍 Checking TypeScript compilation...');
    execSync('cd db && npx tsc --noEmit', { stdio: 'pipe' });
    console.log('  ✅ Schema compiles without errors');
    
    fixes.verified = true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error('  ❌ core/enums.ts is missing');
    } else if (error.stdout) {
      console.error('  ❌ TypeScript errors:', error.stdout.toString());
    } else {
      console.error('  ❌ Verification error:', error.message);
    }
  }
}

async function testMigrationGeneration() {
  console.log('\n🧪 Testing migration generation...');
  
  try {
    // Set DATABASE_URL from .env
    const envContent = await fs.readFile('.env', 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL="(.+)"/);
    
    if (!dbUrlMatch) {
      throw new Error('DATABASE_URL not found in .env');
    }
    
    process.env.DATABASE_URL = dbUrlMatch[1];
    
    // Try to generate migrations
    execSync('cd db && npx drizzle-kit generate --config ./drizzle.config.ts', { 
      stdio: 'inherit',
      env: process.env 
    });
    
    console.log('  ✅ Migration generation successful');
  } catch (error) {
    console.error('  ❌ Migration generation failed');
  }
}

async function createMigrationHelpers() {
  console.log('\n📝 Creating migration helper scripts...');
  
  // Create a simple migration runner
  const migrationRunner = `#!/usr/bin/env tsx
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import path from 'path';

config();

async function runMigrations() {
  console.log('🏃 Running migrations...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'db/migrations/postgres'),
    });
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
`;

  await fs.writeFile('scripts/db/run-migrations.ts', migrationRunner);
  console.log('  ✅ Created migration runner script');
}

async function main() {
  console.log('🚀 DegenTalk Database Migration Fix\n');
  
  // Run fixes
  await fixDuplicateReputation();
  await fixEnumImports();
  await verifySchemaStructure();
  await createMigrationHelpers();
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`  Duplicate field fixed: ${fixes.duplicateField ? '✅' : '❌'}`);
  console.log(`  Enum imports fixed: ${fixes.enumImports ? '✅' : '❌'}`);
  console.log(`  Schema verified: ${fixes.verified ? '✅' : '❌'}`);
  
  if (Object.values(fixes).every(v => v)) {
    console.log('\n✅ All issues fixed! Try running migrations:');
    console.log('  pnpm db:migrate');
    console.log('  pnpm db:migrate:apply');
    
    await testMigrationGeneration();
  } else {
    console.log('\n⚠️  Some issues remain. Please review the errors above.');
  }
}

main().catch(console.error);