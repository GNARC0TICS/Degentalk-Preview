// jscodeshift codemod: migrate-user-fetch.ts
// ------------------------------------------------
// Replaces legacy `req.user` accesses and helper calls with the
// centralized `userService.getUserFromRequest(req)`.
// Adds `import { userService } from '@server/src/core/services/user.service'`
// if not already present.
//
// Usage:
//   npx jscodeshift -t scripts/codemods/migrate-user-fetch.ts server/src/domains/forum --parser=ts
// ------------------------------------------------

import { API, FileInfo, Options, JSCodeshift, ImportDeclaration, Identifier } from 'jscodeshift';

const IMPORT_SPEC = {
  source: '@server/src/core/services/user.service',
  specName: 'userService',
};

function ensureImport(j: JSCodeshift, root: ReturnType<JSCodeshift>, filePath: string) {
  const hasImport = root.find(j.ImportDeclaration).some((path) => {
    const decl = path.node as ImportDeclaration;
    return (
      decl.source.value === IMPORT_SPEC.source &&
      decl.specifiers?.some(
        (s) => s.type === 'ImportSpecifier' && (s.imported as Identifier).name === IMPORT_SPEC.specName,
      )
    );
  });

  if (!hasImport) {
    const importDecl = j.importDeclaration(
      [j.importSpecifier(j.identifier(IMPORT_SPEC.specName))],
      j.literal(IMPORT_SPEC.source),
    );
    const firstImport = root.find(j.ImportDeclaration).at(0);
    if (firstImport.size()) {
      firstImport.insertBefore(importDecl);
    } else {
      root.get().node.program.body.unshift(importDecl as any);
    }
  }
}

export default function transformer(file: FileInfo, api: API, _options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let modified = false;

  // Replace req.user occurrences
  root.find(j.MemberExpression, {
    object: { type: 'Identifier', name: 'req' },
    property: { type: 'Identifier', name: 'user' },
  }).replaceWith(() => {
    modified = true;
    return j.callExpression(
      j.memberExpression(j.identifier('userService'), j.identifier('getUserFromRequest')),
      [j.identifier('req')],
    );
  });

  // Replace getUserFromRequest(req) helper calls
  root.find(j.CallExpression, {
    callee: { type: 'Identifier', name: 'getUserFromRequest' },
  }).forEach((path) => {
    modified = true;
    path.node.callee = j.memberExpression(j.identifier('userService'), j.identifier('getUserFromRequest'));
  });

  // Replace getAuthenticatedUser(req) or getUserId(req) similarly (broad pattern)
  root.find(j.CallExpression, {
    callee: { type: 'Identifier' },
  }).forEach((path) => {
    const id = (path.node.callee as Identifier).name;
    if (['getAuthenticatedUser', 'getUserId'].includes(id)) {
      modified = true;
      path.node.callee = j.memberExpression(j.identifier('userService'), j.identifier('getUserFromRequest'));
    }
  });

  if (modified) ensureImport(j, root, file.path);

  return modified ? root.toSource({ quote: 'single', trailingComma: true }) : null;
} 