import { Project, QuoteKind, SourceFile } from 'ts-morph';
import path from 'path';
import fs from 'fs/promises';

// Define the mapping of old paths to new paths
// This should be comprehensive for all moved files.
const pathMapping: Record<string, string> = {
  'server/services/ccpayment-client.ts': 'server/src/domains/ccpayment/services/ccpayment-client.ts',
  'server/services/path-service.ts': 'server/src/domains/path/services/path-service.ts',
  'server/services/tip-service-ccpayment.ts': 'server/src/domains/tipping/services/tip-service-ccpayment.ts',
  'server/services/xp-clout-service.ts': 'server/src/domains/xp/services/xp-clout-service.ts',
  'server/services/xp-level-service.ts': 'server/src/domains/xp/services/xp-level-service.ts',
  // For directories, we might need a more robust way if files within them are imported directly
  // For now, let's assume imports are to the directory's index file or specific files we list
  'server/routes/api/ccpayment/deposit.ts': 'server/src/domains/ccpayment/routes/ccpayment/deposit.ts',
  'server/routes/api/ccpayment/index.ts': 'server/src/domains/ccpayment/routes/ccpayment/index.ts', // Assuming an index file
  'server/routes/api/ccpayment/webhook.ts': 'server/src/domains/ccpayment/routes/ccpayment/webhook.ts',
  'server/routes/api/ccpayment/withdraw.ts': 'server/src/domains/ccpayment/routes/ccpayment/withdraw.ts',
};

// Convert to absolute paths for reliable comparison
const absolutePathMapping: Record<string, string> = {};
const projectRoot = process.cwd();
for (const oldPath in pathMapping) {
  absolutePathMapping[path.resolve(projectRoot, oldPath)] = path.resolve(projectRoot, pathMapping[oldPath]);
}

async function updateImports(dryRun: boolean): Promise<void> {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
    manipulationSettings: {
      quoteKind: QuoteKind.Single, // Or your project's preference
    },
  });

  const sourceFiles = project.getSourceFiles('server/src/**/*.ts'); // Adjust glob pattern as needed

  console.log(`Found ${sourceFiles.length} source files to process in server/src/.`);
  let changedFilesCount = 0;

  for (const sourceFile of sourceFiles) {
    let madeChangesInFile = false;
    const filePath = sourceFile.getFilePath();
    // console.log(`Processing file: ${filePath}`);

    sourceFile.getImportDeclarations().forEach((importDeclaration) => {
      const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
      const moduleSpecifierSourceFile = importDeclaration.getModuleSpecifierSourceFile();

      if (moduleSpecifierSourceFile) {
        const oldImportPathAbsolute = moduleSpecifierSourceFile.getFilePath();
        
        if (absolutePathMapping[oldImportPathAbsolute]) {
          const newImportPathAbsolute = absolutePathMapping[oldImportPathAbsolute];
          let newRelativePath = path.relative(path.dirname(filePath), newImportPathAbsolute);

          // Remove .ts extension and ensure it's a relative path
          if (newRelativePath.endsWith('.ts')) {
            newRelativePath = newRelativePath.slice(0, -3);
          }
          if (!newRelativePath.startsWith('.')) {
            newRelativePath = './' + newRelativePath;
          }
          
          // Normalize path separators for consistency
          newRelativePath = newRelativePath.replace(/\\/g, '/');

          console.log(`  In ${path.relative(projectRoot, filePath)}:`);
          console.log(`    Replacing import from '${moduleSpecifier}'`);
          console.log(`    Old absolute: '${path.relative(projectRoot, oldImportPathAbsolute)}'`);
          console.log(`    New relative: '${newRelativePath}' (New absolute: '${path.relative(projectRoot, newImportPathAbsolute)}')`);
          
          if (!dryRun) {
            importDeclaration.setModuleSpecifier(newRelativePath);
          }
          madeChangesInFile = true;
        }
      } else {
        // Handle external module specifiers or ones that couldn't be resolved
        // This part might need refinement if we have path aliases like @/server/...
        // For now, we'll try a simpler relative path adjustment for known old paths
        for (const oldPathKey in pathMapping) {
            // Attempt to match if moduleSpecifier is relative and points to an old path
            const resolvedOldPathAttempt = path.resolve(path.dirname(filePath), moduleSpecifier);
            const oldAbsolutePathKey = path.resolve(projectRoot, oldPathKey);

            if (resolvedOldPathAttempt === oldAbsolutePathKey || resolvedOldPathAttempt + '.ts' === oldAbsolutePathKey) {
                const newAbsolutePathTarget = path.resolve(projectRoot, pathMapping[oldPathKey]);
                let newRelativePath = path.relative(path.dirname(filePath), newAbsolutePathTarget);

                if (newRelativePath.endsWith('.ts')) {
                    newRelativePath = newRelativePath.slice(0, -3);
                }
                if (!newRelativePath.startsWith('.')) {
                    newRelativePath = './' + newRelativePath;
                }
                newRelativePath = newRelativePath.replace(/\\/g, '/');

                console.log(`  In ${path.relative(projectRoot, filePath)} (unresolved module):`);
                console.log(`    Replacing import from '${moduleSpecifier}'`);
                console.log(`    Guessed old absolute: '${path.relative(projectRoot, oldAbsolutePathKey)}'`);
                console.log(`    New relative: '${newRelativePath}' (New absolute: '${path.relative(projectRoot, newAbsolutePathTarget)}')`);

                if (!dryRun) {
                    importDeclaration.setModuleSpecifier(newRelativePath);
                }
                madeChangesInFile = true;
                break; 
            }
        }
      }
    });

    if (madeChangesInFile) {
      changedFilesCount++;
      if (!dryRun) {
        await sourceFile.save();
        console.log(`  Saved changes in ${path.relative(projectRoot, filePath)}`);
      } else {
        console.log(`  DRY RUN: Would save changes in ${path.relative(projectRoot, filePath)}`);
      }
    }
  }

  if (dryRun) {
    console.log(`\nDRY RUN COMPLETE: Would attempt to save ${changedFilesCount} files.`);
  } else {
    console.log(`\nImport update complete. ${changedFilesCount} files potentially saved.`);
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('Running in DRY RUN mode. No files will be changed.');
  }
  await updateImports(dryRun);
}

main().catch((error) => {
  console.error('Error updating import paths:', error);
  process.exit(1);
});
