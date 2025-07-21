import { Project, SyntaxKind } from 'ts-morph';
import fg from 'fast-glob';
import path from 'node:path';
import fs from 'node:fs/promises';
import chalk from 'chalk';

/**
 * Codemod: fix-import-aliases (Improved Version)
 * --------------------------------------------------
 * Normalises common import-path mistakes to enforce path alias consistency.
 *
 * Key Rules:
 * 1. '@/shared/…'      → '@shared/…'
 * 2. '../shared/…'     → '@shared/…'
 * 3. '../../../config/…' → '@config/…'
 * 4. Relative paths within client/src to aliased dirs (e.g. '../hooks') → '@hooks/...'
 *
 * SAFETY FEATURES
 * – Dry-run by default (add --execute to write).
 * – Creates backups per modified file in .codemod-backups/import-aliases.
 * - Processes files individually to conserve memory.
 * - Uses the correct tsconfig for each part of the project.
 */

const DRY_RUN = !process.argv.includes('--execute');
const BACKUP_DIR = path.resolve(process.cwd(), '.codemod-backups/import-aliases');

// --- Rule Engine ---
function getSpecifierReplacement(spec: string, filePath: string): string | null {
    // Rule 1: Incorrect @/shared alias
    if (spec.startsWith('@/shared/')) {
        return spec.replace(/^@\/shared\//, '@shared/');
    }

    // Rule 2: Relative paths to shared from client
    if (filePath.includes('client/src') && spec.startsWith('../shared/')) {
        return spec.replace(/^\.\.\/shared\//, '@shared/');
    }
    
    // Rule 3: Relative paths to shared from server
    if (filePath.includes('server/src') && spec.startsWith('../shared/')) {
        return spec.replace(/^\.\.\/shared\//, '@shared/');
    }
    
    // Rule 4: Config imports
    if (filePath.includes('client/src') && spec.startsWith('../../../config/')) {
         return spec.replace(/^\.\.\/\.\.\/\.\.\/config\//, '@config/');
    }
    if (filePath.includes('server/src') && spec.startsWith('../../config/')) {
         return spec.replace(/^\.\.\/\.\.\/config\//, '@config/');
    }
    
    // Rule 5: Server-specific core imports
    if (filePath.includes('server/src') && spec.startsWith('@core/')) {
        // @core is correct, no change needed
        return null;
    }
    if (filePath.includes('server/src') && spec.startsWith('./core/')) {
        return spec.replace(/^\.\/core\//, '@core/');
    }
    if (filePath.includes('server/src') && spec.startsWith('../core/')) {
        return spec.replace(/^\.\.\/core\//, '@core/');
    }
    
    // Rule 6: Fix @/domains to @server/domains in server files
    if (filePath.includes('server/src') && spec.startsWith('@/domains/')) {
        return spec.replace(/^@\/domains\//, '@server/domains/');
    }
    
    // Rule 7: Fix relative db imports to use aliases
    if (spec.startsWith('../db/') || spec.startsWith('../../db/')) {
        return spec.replace(/^(\.\.\/)+db\//, '@db/');
    }

    return null; // No change
}

async function backup(filePath: string): Promise<void> {
    if (DRY_RUN) return;
    try {
        const relativePath = path.relative(process.cwd(), filePath);
        const dest = path.join(BACKUP_DIR, relativePath);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(filePath, dest);
    } catch (error) {
        console.error(chalk.red(`Failed to back up ${filePath}:`), error);
        throw error; // Stop execution if backup fails
    }
}

async function processFiles(filePaths: string[], tsConfigFilePath: string) {
    const project = new Project({ tsConfigFilePath });
    const stats = { touched: 0, rewrites: 0 };

    for (const filePath of filePaths) {
        const sourceFile = project.addSourceFileAtPath(filePath);
        let changed = false;

        sourceFile.getImportDeclarations().forEach((imp) => {
            const specifier = imp.getModuleSpecifierValue();
            const replacement = getSpecifierReplacement(specifier, filePath);

            if (replacement && replacement !== specifier) {
                console.log(
                    `  ${chalk.yellow(sourceFile.getBaseName())}: ` +
                    `${chalk.red(`'${specifier}'`)} → ${chalk.green(`'${replacement}'`)}`
                );
                if (!DRY_RUN) {
                    imp.setModuleSpecifier(replacement);
                }
                changed = true;
                stats.rewrites++;
            }
        });

        if (changed) {
            stats.touched++;
            await backup(sourceFile.getFilePath());
            if (!DRY_RUN) {
                await sourceFile.save();
            }
        }
        // Remove the file from the project to free up memory
        project.removeSourceFile(sourceFile);
    }
    return stats;
}


async function run() {
    console.log(chalk.bold.cyan(`🔧 fix-import-aliases codemod – ${DRY_RUN ? 'dry-run' : 'execute mode'}`));
    
    const clientFiles = await fg('client/src/**/*.{ts,tsx}', {
        ignore: ['**/*.d.ts', '**/node_modules/**', '**/.codemod-backups/**'],
        absolute: true,
    });

    const sharedFiles = await fg('shared/**/*.{ts,tsx}', {
        ignore: ['**/*.d.ts', '**/node_modules/**', '**/.codemod-backups/**'],
        absolute: true,
    });

    const clientStats = await processFiles(clientFiles, 'client/tsconfig.json');
    const sharedStats = await processFiles(sharedFiles, 'shared/tsconfig.json'); // Assuming shared has its own tsconfig

    const totalStats = {
        touched: clientStats.touched + sharedStats.touched,
        rewrites: clientStats.rewrites + sharedStats.rewrites,
    };

    console.log(chalk.bold.cyan(`\n📊 Codemod complete.`));
    console.log(`  ${totalStats.rewrites} specifiers rewritten in ${totalStats.touched} files.`);
    
    if (DRY_RUN) {
        console.log(chalk.yellow('\nDry-run finished. No files were changed.'));
        console.log(chalk.yellow('Rerun with the --execute flag to apply these changes.'));
    } else {
        console.log(chalk.green('\nChanges have been saved successfully.'));
    }
}

run().catch((e) => {
    console.error(chalk.red.bold('\nAn unexpected error occurred:'), e);
    process.exit(1);
});
