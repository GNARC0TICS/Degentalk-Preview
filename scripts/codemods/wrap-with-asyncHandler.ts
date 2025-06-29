// jscodeshift codemod: wrap-with-asyncHandler.ts
// ------------------------------------------------
// Wraps any inline Express route handler functions that are **not** already
// wrapped in asyncHandler(). This speeds up migration to the new unified error
// handling utilities.
//
// Usage (from repo root):
//   npx jscodeshift -t scripts/codemods/wrap-with-asyncHandler.ts server/src
//
// What it does:
//   router.get('/path', (req, res) => { ... })
//     -> router.get('/path', asyncHandler((req, res) => { ... }))
//
//   router.post('/x', validateBody, (req, res) => { ... })
//     -> router.post('/x', validateBody, asyncHandler((req, res) => { ... }))
//
// It purposely **does not** add an import statement for asyncHandler because
// path resolution differs across domains (some files import from '../../core/errors',
// others from '../../admin.middleware', etc.). You can run a follow-up codemod
// or manual sweep to consolidate imports after this transform.
// -----------------------------------------------------------------------------

import { API, FileInfo, Options, JSCodeshift, ArrowFunctionExpression, FunctionExpression, CallExpression } from 'jscodeshift';

const ROUTER_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'all']);

export default function transformer(file: FileInfo, api: API, _options: Options) {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(file.source);

  let modified = false;

  // Helper: check if node is router.<verb>(...)
  const isRouterCall = (node: CallExpression): boolean => {
    if (node.callee.type !== 'MemberExpression') return false;
    const prop = node.callee.property;
    if (prop.type !== 'Identifier') return false;
    return ROUTER_METHODS.has(prop.name);
  };

  root.find(j.CallExpression).forEach((path) => {
    const node = path.node;
    if (!isRouterCall(node)) return;

    // Iterate over arguments AFTER the route path (arg[0] is usually string/regex)
    node.arguments.forEach((arg, idx) => {
      // Skip first argument (path) – but only if it is a Literal/TemplateLiteral/RegExp
      if (idx === 0) return;

      // Already wrapped?
      if (arg.type === 'CallExpression' && arg.callee.type === 'Identifier' && arg.callee.name === 'asyncHandler') {
        return;
      }

      // Only wrap inline arrow or function expressions
      if (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression') {
        const wrapped = j.callExpression(j.identifier('asyncHandler'), [arg as ArrowFunctionExpression | FunctionExpression]);
        node.arguments[idx] = wrapped;
        modified = true;
      }
    });
  });

  return modified ? root.toSource({ quote: 'single', trailingComma: true }) : null;
} 