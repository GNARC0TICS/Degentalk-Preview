import { Project } from 'ts-morph';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Codemod: move-db-id-imports
 * --------------------------------------
 * Rewrites legacy branded-ID imports that reference `@shared/types` or
 * `@shared/types/id.types` to the new canonical module `@shared/types`.
 *
 *  – Skips node_modules, archive, deprecated, and declaration files
 *  – Idempotent: running twice makes no changes
 *  – Logs a summary of updated files / import statements
 *
 * Usage:  pnpm ts-node scripts/codemods/move-db-id-imports.ts
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../');

const filePaths = globSync('**/*.{ts,tsx}', {
  cwd: projectRoot,
  ignore: [
    'node_modules/**',
    'archive/**',
    'deprecated/**',
    '**/*.d.ts',
  ],
});

const project = new Project({
  tsConfigFilePath: path.join(projectRoot, 'tsconfig.json'),
});

filePaths.forEach((rel) => project.addSourceFileAtPath(path.join(projectRoot, rel)));

let importCount = 0;

for (const sf of project.getSourceFiles()) {
  sf.getImportDeclarations().forEach((imp) => {
    const spec = imp.getModuleSpecifierValue();
    if (
      spec === '@shared/types' ||
      spec === '@shared/types/id.types' ||
      spec.startsWith('@db_types')
    ) {
      imp.setModuleSpecifier('@shared/types');
      importCount += 1;
    }
  });

  if (sf.isSaved() === false && sf.getFullText().trim().length) {
    // ensure we only save if modifications happened
    // (ts-morph marks sf unsaved if we changed any import)
    sf.saveSync();
  }
}

console.log(importCount
  ? `✨  Updated ${importCount} import statements.\n   Rerun to confirm zero legacy paths remain.`
  : '✅  No legacy @shared/types imports found.'); 