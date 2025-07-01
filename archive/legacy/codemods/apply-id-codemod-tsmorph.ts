#!/usr/bin/env ts-node
import { Project, SyntaxKind, Node, StructureKind } from 'ts-morph';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import minimist from 'minimist';
import type { ImportDeclarationStructure } from 'ts-morph';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const argv = minimist(process.argv.slice(2), {
  boolean: ['dry', 'all'],
  string: ['paths'],
  default: { dry: false, all: false }
});
const isDryRun = argv.dry as boolean;
const pathsArg = argv.paths as string | undefined;
const runAll = argv.all as boolean;

if (!runAll && !pathsArg) {
  console.error('Specify --paths="glob1,glob2" or --all');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load alias names from id.types.ts so we only import known ones.
// ---------------------------------------------------------------------------
const idTypesPath = path.resolve(__dirname, '../../db/types/id.types.ts');
const idTypesSrc = fs.readFileSync(idTypesPath, 'utf8');
const aliasRegex = /export\s+type\s+(\w+Id)\s*=\s*Id<[^>]+>/g;
const aliasNames: string[] = [];
let m: RegExpExecArray | null;
while ((m = aliasRegex.exec(idTypesSrc))) {
  aliasNames.push(m[1]);
}

// Helper to guess ID alias from variable/field name.
function guessAliasFromName(name: string): string | null {
  const lowered = name.toLowerCase();
  for (const alias of aliasNames) {
    if (lowered.includes(alias.toLowerCase().replace(/id$/, 'id'))) {
      return alias;
    }
  }
  // Fallback: generic Id<'foo'> would require template literal; skip.
  return null;
}

// ---------------------------------------------------------------------------
// Prepare ts-morph project
// ---------------------------------------------------------------------------
const project = new Project({
  tsConfigFilePath: path.resolve('tsconfig.json'),
  skipAddingFilesFromTsConfig: false
});

// Collect target files
let fileGlobs: string[] = [];
if (runAll) {
  fileGlobs = ['client/src/**/*.ts', 'client/src/**/*.tsx', 'server/src/**/*.ts', 'shared/**/*.ts'];
} else if (pathsArg) {
  fileGlobs = pathsArg.split(',').map((g) => (g.endsWith('**') ? `${g}/*.{ts,tsx}` : g));
}

const sourceFiles = project.addSourceFilesAtPaths(fileGlobs);

let edits = 0;

for (const sf of sourceFiles) {
  let fileTouched = false;

  // Walk variable declarations, parameters, property signatures
  sf.forEachDescendant((node) => {
    if (
      Node.isParameterDeclaration(node) ||
      Node.isVariableDeclaration(node) ||
      Node.isPropertySignature(node) ||
      Node.isPropertyDeclaration(node) ||
      Node.isTypeAliasDeclaration(node) ||
      Node.isInterfaceDeclaration(node)
    ) {
      const name = (node as any).getName?.() as string | undefined;
      if (!name) return;

      const typeNode = (node as any).getTypeNode?.();
      if (!typeNode) return;

      // Only operate on explicit 'number' types or unions containing number|null
      if (typeNode.getKind() === SyntaxKind.NumberKeyword) {
        const alias = guessAliasFromName(name);
        if (alias) {
          typeNode.replaceWithText(alias);
          fileTouched = true;
          edits++;
        }
      } else if (Node.isUnionTypeNode(typeNode)) {
        const parts = typeNode.getTypeNodes();
        if (parts.some((p) => p.getKind() === SyntaxKind.NumberKeyword)) {
          const alias = guessAliasFromName(name);
          if (alias) {
            // rebuild union replacing number with alias
            const newText = parts
              .map((p) => (p.getKind() === SyntaxKind.NumberKeyword ? alias : p.getText()))
              .join(' | ');
            typeNode.replaceWithText(newText);
            fileTouched = true;
            edits++;
          }
        }
      }
    }
  });

  if (fileTouched) {
    // Ensure import exists
    const existing = sf.getImportDeclarations().find((d) => d.getModuleSpecifier().getLiteralText() === '@/db/types');
    const aliasesUsed = new Set<string>();
    aliasNames.forEach((a) => {
      if (sf.getText().includes(`${a}`)) aliasesUsed.add(a);
    });
    if (aliasesUsed.size) {
      const namedImports = Array.from(aliasesUsed);
      if (existing) {
        const named = existing.getNamedImports().map((ni) => ni.getName());
        const toAdd = namedImports.filter((n) => !named.includes(n));
        if (toAdd.length) existing.addNamedImports(toAdd);
      } else {
        sf.addImportDeclaration({
          kind: StructureKind.ImportDeclaration,
          isTypeOnly: true,
          moduleSpecifier: '@/db/types',
          namedImports: Array.from(namedImports)
        } as ImportDeclarationStructure);
      }
    }
  }
}

if (!isDryRun) {
  project.saveSync();
}

console.log(`${isDryRun ? 'Dry run completed' : 'Codemod applied'} – ${edits} type annotation edits.`); 