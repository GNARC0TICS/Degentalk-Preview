import { Project, SyntaxKind, StringLiteral, CallExpression } from 'ts-morph';
import fg from 'fast-glob';
import path from 'node:path';

/**
 * Codemod: brand-ids
 * --------------------------------------------------
 * Searches for raw string IDs (or crypto.randomUUID()) assigned to variables or
 * object-literal properties ending in `Id` and wraps them with the correct
 * branded-ID helper (toUserId, toForumId, …).  The helper is auto-imported from
 * '@shared/utils/id' if not already present.
 *
 * Scope (v1):
 *   • Variable declarations  → const userId = "abc"        → const userId = toUserId("abc")
 *   • Object literal props   → { userId: "abc" }            → { userId: toUserId("abc") }
 *   • crypto.randomUUID()    → const id = toUserId(crypto.randomUUID())
 *
 * Out-of-scope (v1): complex expressions, function args, mutations. These can
 * be handled in v2 after first error reduction pass.
 *
 * Usage:
 *   pnpm ts-node scripts/codemods/brand-ids.ts
 */

// ------------------------ helper mapping -----------------------------
const helperMap: Record<string, string> = {
  user: 'toUserId',
  author: 'toUserId',
  recipient: 'toUserId',
  zone: 'toZoneId',
  parentZone: 'toParentZoneId',
  forum: 'toForumId',
  thread: 'toThreadId',
  post: 'toPostId',
  group: 'toGroupId',
  message: 'toMessageId',
  title: 'toTitleId',
  badge: 'toBadgeId',
  product: 'toProductId',
  frame: 'toFrameId',
};

function guessHelper(idName: string): string | null {
  // Strip trailing "Id" and any camel-case prefixes (e.g., parentZoneId)
  const base = idName.replace(/Id$/, '');
  const entries = Object.keys(helperMap);
  const match = entries.find((k) => base.toLowerCase().endsWith(k.toLowerCase()));
  return match ? helperMap[match] : null;
}

function isRawId(expr: StringLiteral | CallExpression): boolean {
  if (expr.getKind() === SyntaxKind.StringLiteral) return true;
  if (expr.getKind() === SyntaxKind.CallExpression) {
    const callExpr = expr as CallExpression;
    return callExpr.getExpression().getText() === 'crypto.randomUUID';
  }
  return false;
}

async function run() {
  const project = new Project({ tsConfigFilePath: path.resolve('tsconfig.json') });

  const files = await fg(['client/src/**/*.{ts,tsx}', 'shared/**/*.{ts,tsx}'], {
    ignore: ['**/*.d.ts', '**/node_modules/**'],
  });

  files.forEach((filePath) => project.addSourceFileAtPathIfExists(filePath));

  const sourceFiles = project.getSourceFiles();
  const stats = { touched: 0, rewrites: 0 };

  sourceFiles.forEach((sf) => {
    const usedHelpers = new Set<string>();

    // VARIABLE DECLARATIONS -------------------------------------------------
    sf.getVariableDeclarations().forEach((decl) => {
      const name = decl.getName();
      if (!name.endsWith('Id')) return;
      const helper = guessHelper(name);
      if (!helper) return;
      const init = decl.getInitializer();
      if (!init) return;
      if (!isRawId(init as any)) return;

      decl.setInitializer(`${helper}(${init.getText()})`);
      usedHelpers.add(helper);
      stats.rewrites++;
    });

    // OBJECT LITERAL PROPERTY ASSIGNMENTS ----------------------------------
    sf.getDescendantsOfKind(SyntaxKind.PropertyAssignment).forEach((prop) => {
      const nameNode = prop.getNameNode();
      if (nameNode.getKind() !== SyntaxKind.Identifier) return;
      const name = nameNode.getText();
      if (!name.endsWith('Id')) return;
      const helper = guessHelper(name);
      if (!helper) return;
      const initializer = prop.getInitializer();
      if (!initializer) return;
      if (!isRawId(initializer as any)) return;

      prop.setInitializer(`${helper}(${initializer.getText()})`);
      usedHelpers.add(helper);
      stats.rewrites++;
    });

    // IMPORT MANAGEMENT -----------------------------------------------------
    if (usedHelpers.size > 0) {
      stats.touched++;
      let importDecl = sf.getImportDeclaration((d) => d.getModuleSpecifierValue() === '@shared/utils/id');
      if (!importDecl) {
        importDecl = sf.addImportDeclaration({ moduleSpecifier: '@shared/utils/id', namedImports: [] });
      }
      const existing = new Set(importDecl.getNamedImports().map((ni) => ni.getName()));
      usedHelpers.forEach((helper) => {
        if (!existing.has(helper)) importDecl!.addNamedImport(helper);
      });
    }
  });

  await project.save();
  console.log(`brand-ids codemod complete → ${stats.touched} files updated, ${stats.rewrites} rewrites.`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
}); 