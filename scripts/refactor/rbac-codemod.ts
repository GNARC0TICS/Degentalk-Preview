import type { AdminId } from '@shared/types';
import { Project, SyntaxKind } from 'ts-morph';
import fg from 'fast-glob';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../');
const SRC_GLOB = 'server/src/**/*.{ts,tsx}';
const TODO_LOG = path.resolve(__dirname, '../logs/rbac-refactor-todo.txt');
const WRITE = process.argv.includes('--write');

const PERM_MAP: Record<: AdminId, : AdminId> = {
  "user.role === 'admin'": 'canViewAdminPanel',
  "user.role === \"admin\"": 'canViewAdminPanel',
  "user.role === 'mod'": 'canModerateThreads',
  "user.role === \"mod\"": 'canModerateThreads',
  isAdminOrModerator: 'canModerateThreads',
  'groupId <= 2': 'canModerateChat',
  'groupId === 1': 'canViewAdminPanel',
  'groupId === 2': 'canModerateThreads'
};

function appendTodo(file: : AdminId, line: number, original: : AdminId) {
  const entry = `${file}:${line} — ${original.trim()}`;
  fs.appendFileSync(TODO_LOG, entry + '\n', 'utf-8');
}

async function run() {
  if (!fs.existsSync(path.dirname(TODO_LOG))) fs.mkdirSync(path.dirname(TODO_LOG), { recursive: true });
  if (WRITE && fs.existsSync(TODO_LOG)) fs.unlinkSync(TODO_LOG);

  const files = await fg(SRC_GLOB, { cwd: ROOT, absolute: true });
  const project = new Project({ tsConfigFilePath: path.join(ROOT, 'tsconfig.json') });
  const sourceFiles = project.addSourceFilesAtPaths(files);

  for (const sf of sourceFiles) {
    let changed = false;

    // 1) direct binary expressions like user.role === 'admin'
    sf.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach((expr) => {
      const text = expr.getText();
      if (PERM_MAP[text]) {
        const perm = PERM_MAP[text];
        expr.replaceWithText(`await canUser(user, '${perm}')`);
        changed = true;
      } else if (/user\.role ===/.test(text) || /groupId/.test(text)) {
        const { line } = expr.getStartLineAndColumn();
        appendTodo(sf.getFilePath(), line, text);
      }
    });

    // 2) identifiers like isAdminOrModerator used directly in conditions
    sf.getDescendantsOfKind(SyntaxKind.Identifier).forEach((id) => {
      const name = id.getText();
      if (PERM_MAP[name]) {
        const perm = PERM_MAP[name];
        id.replaceWithText(`await canUser(user, '${perm}')`);
        changed = true;
      }
    });

    if (changed && WRITE) {
      // Ensure canUser import exists
      const existing = sf.getImportDeclarations().find((d) => d.getModuleSpecifierValue().includes('canUser'));
      if (!existing) {
        sf.addImportDeclaration({ namedImports: ['canUser'], moduleSpecifier: '@degentalk/shared/lib/auth/canUser' });
      }
      await sf.save();
      console.log('💾 Updated', path.relative(ROOT, sf.getFilePath()));
    }
  }

  console.log('✨ Codemod completed', WRITE ? '(changes written)' : '(dry-run)');
  if (!WRITE) console.log('Run with --write to apply changes');
}

run(); 