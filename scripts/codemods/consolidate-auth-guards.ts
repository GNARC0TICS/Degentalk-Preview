import { API, FileInfo, Options, JSCodeshift } from 'jscodeshift';

/**
 * Codemod: consolidate-auth-guards
 * --------------------------------
 * Replaces imports of various obsolete auth-guard components with the single
 * canonical `GlobalRouteGuard` implementation.
 *
 * Handles named and default imports for the following legacy modules:
 *   • ProtectedRoute / protected-route
 *   • withRouteProtection / withAuth / withAdmin / withModerator / withSuperAdmin
 *   • RouteGuards
 *
 * Strategy:
 * 1. For every import declaration whose source matches one of the obsolete
 *    modules, rewrite to:
 *      import { GlobalRouteGuard } from '@/components/auth/GlobalRouteGuard';
 *
 *    – If the old import used a default import, it is replaced by a **named**
 *      import of GlobalRouteGuard (since GRG has named export).
 *    – If multiple specifiers existed, they are pruned to just GlobalRouteGuard.
 * 2. The script does **not** attempt to refactor JSX usage – relying instead on
 *    the fact that all legacy components accepted `children` and guard props,
 *    which GRG also supports.  Edge-case prop mismatches can be cleaned up by
 *    ESLint / TS afterward.
 *
 * Usage:
 *   jscodeshift -t scripts/codemods/consolidate-auth-guards.ts <file/glob>
 */

const LEGACY_SOURCES = [
  '@/components/auth/ProtectedRoute',
  '@/components/auth/protected-route',
  '@/components/auth/withRouteProtection',
  '@/components/auth/RouteGuards',
];

export default function transformer(file: FileInfo, api: API, options: Options) {
  const j: JSCodeshift = api.jscodeshift;
  
  // Configure parser for TypeScript
  const parser = options.parser || 'tsx';
  
  const root = j(file.source);

  let modified = false;

  root.find(j.ImportDeclaration).forEach(path => {
    const importDecl = path.node;
    const sourceValue = importDecl.source.value.toString();

    if (LEGACY_SOURCES.includes(sourceValue)) {
      // Replace with canonical import
      importDecl.source = j.literal('@/components/auth/GlobalRouteGuard');

      // If GlobalRouteGuard not already imported elsewhere, set up named spec
      if (importDecl.specifiers && importDecl.specifiers.length > 0) {
        // Replace ALL specifiers with { GlobalRouteGuard }
        importDecl.specifiers = [j.importSpecifier(j.identifier('GlobalRouteGuard'))];
      } else {
        importDecl.specifiers = [j.importSpecifier(j.identifier('GlobalRouteGuard'))];
      }

      modified = true;
    }
  });

  if (!modified) return null;
  return root.toSource({ quote: 'single', trailingComma: true });
} 