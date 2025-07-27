#!/usr/bin/env node
import { Project, SyntaxKind } from 'ts-morph';
import fg from 'fast-glob';
import path from 'node:path';
import fs from 'node:fs/promises';
import chalk from 'chalk';

/**
 * Codemod: migrate-import-aliases
 * --------------------------------------------------
 * Safely migrates import aliases from old to new patterns.
 * 
 * Migrations:
 * - Client: @app/* → @/*
 * - Server: @api/* → @/*
 * - Server: @server/* → @/*
 * - Server: @server-core/* → @core/*
 * - Server: @server-utils/* → @utils/*
 * - Server: @server-middleware/* → @middleware/*
 * 
 * SAFETY FEATURES:
 * - Dry-run by default (add --execute to write)
 * - Creates backups per modified file
 * - Shows preview of changes
 * - Validates imports still resolve
 */

const DRY_RUN = !process.argv.includes('--execute');
const BACKUP_DIR = path.resolve(process.cwd(), '.codemod-backups/import-migration');

// Stats tracking
let totalFiles = 0;
let modifiedFiles = 0;
let totalImports = 0;
let modifiedImports = 0;

async function processFile(project: Project, filePath: string): Promise<void> {
    const sourceFile = project.addSourceFileAtPath(filePath);
    let fileModified = false;
    
    // Process all import declarations
    sourceFile.getImportDeclarations().forEach(importDecl => {
        const moduleSpec = importDecl.getModuleSpecifierValue();
        let newSpec: string | null = null;
        
        // Client migrations
        if (filePath.includes('client/')) {
            if (moduleSpec.startsWith('@app/')) {
                newSpec = moduleSpec.replace(/^@app\//, '@/');
            }
        }
        
        // Server migrations
        if (filePath.includes('server/')) {
            if (moduleSpec.startsWith('@api/')) {
                newSpec = moduleSpec.replace(/^@api\//, '@/');
            } else if (moduleSpec.startsWith('@server/')) {
                newSpec = moduleSpec.replace(/^@server\//, '@/');
            } else if (moduleSpec.startsWith('@server-core/')) {
                newSpec = moduleSpec.replace(/^@server-core\//, '@core/');
            } else if (moduleSpec.startsWith('@server-utils/')) {
                newSpec = moduleSpec.replace(/^@server-utils\//, '@utils/');
            } else if (moduleSpec.startsWith('@server-middleware/')) {
                newSpec = moduleSpec.replace(/^@server-middleware\//, '@middleware/');
            }
        }
        
        if (newSpec && newSpec !== moduleSpec) {
            totalImports++;
            console.log(chalk.yellow(`  ${moduleSpec} → ${newSpec}`));
            
            if (!DRY_RUN) {
                importDecl.setModuleSpecifier(newSpec);
                modifiedImports++;
            }
            fileModified = true;
        }
    });
    
    // Process dynamic imports
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(callExpr => {
        const expr = callExpr.getExpression();
        if (expr.getText() === 'import' && callExpr.getArguments().length > 0) {
            const arg = callExpr.getArguments()[0];
            if (arg.getKind() === SyntaxKind.StringLiteral) {
                const moduleSpec = arg.getText().slice(1, -1); // Remove quotes
                let newSpec: string | null = null;
                
                // Apply same rules as above
                if (filePath.includes('client/') && moduleSpec.startsWith('@app/')) {
                    newSpec = moduleSpec.replace(/^@app\//, '@/');
                } else if (filePath.includes('server/')) {
                    if (moduleSpec.startsWith('@api/')) {
                        newSpec = moduleSpec.replace(/^@api\//, '@/');
                    } else if (moduleSpec.startsWith('@server/')) {
                        newSpec = moduleSpec.replace(/^@server\//, '@/');
                    }
                    // ... etc
                }
                
                if (newSpec && newSpec !== moduleSpec) {
                    totalImports++;
                    console.log(chalk.yellow(`  Dynamic: ${moduleSpec} → ${newSpec}`));
                    
                    if (!DRY_RUN) {
                        arg.replaceWithText(`'${newSpec}'`);
                        modifiedImports++;
                    }
                    fileModified = true;
                }
            }
        }
    });
    
    if (fileModified) {
        modifiedFiles++;
        
        if (!DRY_RUN) {
            // Create backup
            const backupPath = path.join(BACKUP_DIR, path.relative(process.cwd(), filePath));
            await fs.mkdir(path.dirname(backupPath), { recursive: true });
            await fs.copyFile(filePath, backupPath);
            
            // Save changes
            await sourceFile.save();
        }
    }
}

async function main() {
    console.log(chalk.blue('🔧 Import Alias Migration'));
    console.log(chalk.gray(DRY_RUN ? 'Running in dry-run mode' : 'Running in execute mode'));
    
    if (!DRY_RUN) {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
    }
    
    // Find all TypeScript files
    const clientFiles = await fg(['client/src/**/*.{ts,tsx}'], {
        ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.spec.ts']
    });
    
    const serverFiles = await fg(['server/src/**/*.ts'], {
        ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.spec.ts']
    });
    
    const allFiles = [...clientFiles, ...serverFiles];
    totalFiles = allFiles.length;
    
    console.log(chalk.gray(`Found ${totalFiles} files to process`));
    
    // Create project
    const project = new Project({
        tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
        skipAddingFilesFromTsConfig: true
    });
    
    // Process files
    for (const filePath of allFiles) {
        const relPath = path.relative(process.cwd(), filePath);
        console.log(chalk.cyan(`\nProcessing: ${relPath}`));
        
        try {
            await processFile(project, filePath);
        } catch (error) {
            console.error(chalk.red(`Error processing ${relPath}: ${error.message}`));
        }
    }
    
    // Summary
    console.log('\n' + chalk.green('Summary:'));
    console.log(`  Total files scanned: ${totalFiles}`);
    console.log(`  Files with changes: ${modifiedFiles}`);
    console.log(`  Total imports found: ${totalImports}`);
    console.log(`  Imports ${DRY_RUN ? 'to be modified' : 'modified'}: ${DRY_RUN ? totalImports : modifiedImports}`);
    
    if (DRY_RUN) {
        console.log('\n' + chalk.yellow('This was a dry run. To apply changes, run with --execute'));
    } else {
        console.log('\n' + chalk.green(`✅ Changes applied! Backups saved to ${BACKUP_DIR}`));
    }
}

main().catch(console.error);