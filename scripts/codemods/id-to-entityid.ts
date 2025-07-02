import { readFileSync, writeFileSync } from 'fs';
import { exit } from 'process';
import { glob } from 'glob';
import * as recast from 'recast';
// @ts-ignore – recast typings don't expose this parser path
import tsParser from 'recast/parsers/typescript';

/**
 * Safely replace `id: number` or `id?: number` annotations with the branded `EntityId`.
 * Only touches files inside client UI paths so backend & shared code stay intact.
 *
 * Usage:
 *  pnpm exec tsx scripts/codemods/id-to-entityid.ts           # live
 *  pnpm exec tsx scripts/codemods/id-to-entityid.ts --dry     # preview only
 */
(async () => {
  const isDryRun = process.argv.includes('--dry');
  const patterns = [
    'client/src/components/**/*.tsx',
    'client/src/pages/**/*.tsx'
  ];

  const files = await glob(patterns, { nodir: true });
  const patched: string[] = [];

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    if (!/\bid\s*\??\s*:\s*number\b/.test(source)) continue;

    const ast = recast.parse(source, { parser: tsParser });
    let mutated = false;

    recast.types.visit(ast, {
      visitTSTypeAnnotation(path) {
        const { node } = path;
        if (node.typeAnnotation.type === 'TSNumberKeyword') {
          // Replace with EntityId reference
          node.typeAnnotation = {
            type: 'TSTypeReference',
            typeName: { type: 'Identifier', name: 'EntityId' }
          } as any;
          mutated = true;
        }
        this.traverse(path);
      }
    });

    if (!mutated) continue;

    let output = recast.print(ast, { quote: 'single' }).code;

    // Inject import if not present
    if (!output.includes('EntityId') || !/import[^;]*EntityId[^;]*from/.test(output)) {
      const firstImportMatch = output.match(/import[^;]+;/);
      const importLine = "import type { EntityId } from '@/types/ids';";
      if (firstImportMatch) {
        output = output.replace(firstImportMatch[0], `${firstImportMatch[0]}\n${importLine}`);
      } else {
        output = `${importLine}\n${output}`;
      }
    }

    if (isDryRun) {
      patched.push(file);
    } else {
      writeFileSync(file, output);
      patched.push(file);
    }
  }

  if (patched.length === 0) {
    console.log('No matches found – nothing to do.');
    return;
  }

  console.log('\nCodemod summary:');
  patched.forEach((f) => console.log(`  • ${isDryRun ? 'would patch' : 'patched'} ${f}`));
  console.log(`\n${isDryRun ? 'Dry run complete – rerun without --dry to apply.' : 'Done.'}`);

  if (isDryRun) exit(0);
})(); 