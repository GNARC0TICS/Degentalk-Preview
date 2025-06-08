import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// ESM-compatible __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to move config files from /config to /client/src/config and update all imports across the codebase.
 * Usage: ts-node scripts/refactor/move-configs-and-update-imports.ts
 */

const ROOT = path.resolve(__dirname, '../../');
const OLD_CONFIG_DIR = path.join(ROOT, 'config');
const NEW_CONFIG_DIR = path.join(ROOT, 'client', 'src', 'config');
const CONFIG_FILES = [
    'economy.config.ts',
    'forumRules.config.ts',
    'roles.config.ts',
    'cosmetics.config.ts',
    'CONFIG_MIGRATION_LOG.md',
];

const IMPORTABLE_CONFIGS = CONFIG_FILES.filter(f => f.endsWith('.ts'));

async function ensureDirExists(dir: string) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (e) {
        // Directory may already exist
    }
}

async function moveConfigFiles() {
    await ensureDirExists(NEW_CONFIG_DIR);
    const moves: string[] = [];
    for (const file of CONFIG_FILES) {
        const oldPath = path.join(OLD_CONFIG_DIR, file);
        const newPath = path.join(NEW_CONFIG_DIR, file);
        try {
            await fs.rename(oldPath, newPath);
            moves.push(`${file}: ${oldPath} → ${newPath}`);
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                // Already moved or missing
                continue;
            } else {
                throw e;
            }
        }
    }
    return moves;
}

async function scanAndUpdateImports() {
    const changed: Array<{ file: string; line: number; old: string; updated: string }> = [];
    // Recursively scan all .ts and .tsx files in the repo
    async function scanDir(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                // Skip node_modules, .git, dist, build, etc.
                if (/node_modules|\.git|dist|build|\.next|logs|archive|Wallet-Workspace/.test(entry.name)) continue;
                await scanDir(fullPath);
            } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
                await processFile(fullPath);
            }
        }
    }

    async function processFile(filePath: string) {
        let content = await fs.readFile(filePath, 'utf8');
        let updated = false;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            for (const configFile of IMPORTABLE_CONFIGS) {
                const importPath = `@/config/${configFile.replace(/\.ts$/, '')}`;
                // Regex to match import statements
                const importRegex = new RegExp(`(['\"])((\.\.?/)*config/${configFile.replace(/\.ts$/, '')})(['\"])`);
                // If the file is in client/src, use @/config/...
                if (filePath.includes(path.join('client', 'src'))) {
                    // Replace any relative or old absolute import with @/config/...
                    if (lines[i].includes(configFile.replace('.ts', ''))) {
                        const oldLine = lines[i];
                        lines[i] = lines[i].replace(/(['\"])((\.\.?\/)*config\/[\w-]+)(['\"])/g, `'@/config/${configFile.replace('.ts', '')}'`);
                        // Also handle imports from 'config/...' (root)
                        lines[i] = lines[i].replace(/(['\"])config\/(\w+)(['\"])/g, `'@/config/$2'`);
                        if (lines[i] !== oldLine) {
                            changed.push({ file: filePath, line: i + 1, old: oldLine, updated: lines[i] });
                            updated = true;
                        }
                    }
                } else {
                    // For backend/server files, use relative path from file to client/src/config
                    const relPath = path.relative(path.dirname(filePath), NEW_CONFIG_DIR);
                    const relImport = `./${path.join(relPath, configFile).replace(/\\/g, '/')}`;
                    if (lines[i].includes(configFile.replace('.ts', ''))) {
                        const oldLine = lines[i];
                        lines[i] = lines[i].replace(/(['\"])((@\/)?config\/[\w-]+)(['\"])/g, `'${relImport.replace(/\.ts$/, '')}'`);
                        if (lines[i] !== oldLine) {
                            changed.push({ file: filePath, line: i + 1, old: oldLine, updated: lines[i] });
                            updated = true;
                        }
                    }
                }
            }
        }
        if (updated) {
            await fs.writeFile(filePath, lines.join('\n'), 'utf8');
        }
    }

    await scanDir(ROOT);
    return changed;
}

async function main() {
    console.log('--- Moving config files to client/src/config ---');
    const moves = await moveConfigFiles();
    moves.forEach(m => console.log('Moved:', m));

    console.log('\n--- Updating imports across codebase ---');
    const changes = await scanAndUpdateImports();
    changes.forEach(c => {
        console.log(`Updated import in ${c.file}:${c.line}`);
        console.log(`  - ${c.old}`);
        console.log(`  + ${c.updated}`);
    });

    console.log(`\nSummary:`);
    console.log(`  Files moved: ${moves.length}`);
    console.log(`  Imports updated: ${changes.length}`);
    console.log('Done.');
}

main().catch(e => {
    console.error('Error during config move/update:', e);
    process.exit(1);
}); 