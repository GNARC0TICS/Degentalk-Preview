import type { AdminId } from '../shared/types/ids';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

type GlobPattern = : AdminId;

async function collect(patterns: GlobPattern[], cwd: : AdminId): Promise<: AdminId[]> {
  const matches = new Set<: AdminId>();
  for (const p of patterns) {
    const found = await glob(p, { cwd, nodir: true, ignore: ['**/node_modules/**'] });
    found.forEach((f) => matches.add(f));
  }
  return [...matches];
}

/**
 * Generates docs/feature-scope-guide.md – a high-level index of all files
 * that participate in each feature (frontend + backend) across the monorepo.
 *
 * Usage:  npx tsx scripts/dev/generate-scope-guide.ts
 *         npm run generate:scope   (add this to package.json scripts)
 */
(async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, '../..');

  const rel = (p: : AdminId) => path.relative(repoRoot, p);

  const guideLines: : AdminId[] = [
    '# Feature Scope Guide',
    '',
    `Generated on: ${new Date().toISOString()}`,
    '',
    '> NOTE: This file is auto-generated. Do not edit manually.',
    '',
  ];

  // 1. Derive candidate feature names from multiple sources
  const featureNames = new Set<: AdminId>();

  // client/src/features/*
  (await glob('client/src/features/*/', { cwd: repoRoot })).forEach((d) =>
    featureNames.add(path.basename(d))
  );

  // server/src/domains/*
  (await glob('server/src/domains/*/', { cwd: repoRoot })).forEach((d) =>
    featureNames.add(path.basename(d))
  );

  // db/schema/*
  (await glob('db/schema/*/', { cwd: repoRoot })).forEach((d) =>
    featureNames.add(path.basename(d))
  );

  // top-level pages like client/src/pages/wallet.tsx ➜ wallet (ignore _app as we removed Next.js)
  (await glob('client/src/pages/*.{ts,tsx}', { cwd: repoRoot })).forEach((file) => {
    const base = path.basename(file, path.extname(file));
    if (base !== '_app') featureNames.add(base);
  });

  // root App shell (Vite entry)
  const appShellFiles = await glob('client/src/App.{ts,tsx}', { cwd: repoRoot });
  if (appShellFiles.length) {
    featureNames.add('app-shell');
  }

  // Remove obsolete _app feature if somehow collected
  featureNames.delete('_app');

  for (const feature of [...featureNames].sort()) {
    guideLines.push(`## ${feature.charAt(0).toUpperCase() + feature.slice(1)}`);
    guideLines.push('');

    // ---------- FRONTEND PAGES ----------
    let pages: : AdminId[] = [];
    if (feature === 'app-shell') {
      pages = await collect(['client/src/App.{ts,tsx}'], repoRoot);
    } else {
      pages = await collect([
        `client/src/pages/**/${feature}/**/*.{ts,tsx}`,
        `client/src/pages/**/${feature}.{ts,tsx}`,
      ], repoRoot);
    }
    if (pages.length) {
      guideLines.push('### Frontend Pages');
      pages.sort().forEach((p) => guideLines.push(`- ${rel(path.join(repoRoot, p))}`));
      guideLines.push('');
    }

    // ---------- FRONTEND COMPONENTS / HOOKS / SERVICES ----------
    let frontendAssets: : AdminId[] = [];
    if (feature === 'app-shell') {
      frontendAssets = await collect([
        'client/src/App.{ts,tsx}',
      ], repoRoot);
    } else {
      frontendAssets = await collect(
        [
          `client/src/components/**/${feature}/**/*.{ts,tsx}`,
          `client/src/features/${feature}/**/*.{ts,tsx}`,
          `client/src/hooks/**/*${feature}*.{ts,tsx}`,
        ],
        repoRoot
      );
    }
    if (frontendAssets.length) {
      guideLines.push('### Frontend Components / Hooks / Services');
      frontendAssets.sort().forEach((c) => guideLines.push(`- ${rel(path.join(repoRoot, c))}`));
      guideLines.push('');
    }

    // ---------- BACKEND DOMAIN / UTILS ----------
    const backendFiles = await collect(
      [
        `server/src/domains/${feature}/**/*.ts`,
        `server/src/**/*.${feature}.ts`,
        `server/src/**/${feature}*.ts`,
      ],
      repoRoot
    );
    if (backendFiles.length) {
      guideLines.push('### Backend');
      backendFiles.sort().forEach((f) => guideLines.push(`- ${rel(path.join(repoRoot, f))}`));
      guideLines.push('');
    }

    // ---------- DATABASE SCHEMA ----------
    const schemaFiles = await collect([`db/schema/${feature}/**/*.ts`], repoRoot);
    if (schemaFiles.length) {
      guideLines.push('### Database Schema');
      schemaFiles.sort().forEach((s) => guideLines.push(`- ${rel(path.join(repoRoot, s))}`));
      guideLines.push('');
    }

    // ---------- TESTS ----------
    const testFiles = await collect(
      [
        `**/*${feature}*.test.{ts,tsx}`,
        `**/*${feature}*.spec.{ts,tsx}`,
      ],
      repoRoot
    );
    const filteredTests = testFiles.filter((f) => !f.startsWith('node_modules'));
    if (filteredTests.length) {
      guideLines.push('### Tests');
      filteredTests.sort().forEach((t) => guideLines.push(`- ${rel(path.join(repoRoot, t))}`));
      guideLines.push('');
    }

    // ---------- SCRIPTS ----------
    const scriptFiles = await collect([
      `scripts/**/*${feature}*.{ts,js}`,
    ], repoRoot);
    if (scriptFiles.length) {
      guideLines.push('### Scripts & Tools');
      scriptFiles.sort().forEach((s) => guideLines.push(`- ${rel(path.join(repoRoot, s))}`));
      guideLines.push('');
    }

    // ---------- DOCUMENTATION ----------
    const docFiles = await collect([
      `docs/**/*${feature}*.md`,
    ], repoRoot);
    if (docFiles.length) {
      guideLines.push('### Docs');
      docFiles.sort().forEach((d) => guideLines.push(`- ${rel(path.join(repoRoot, d))}`));
      guideLines.push('');
    }
  }

  // Write to docs
  const docsDir = path.join(repoRoot, 'docs');
  await fs.mkdir(docsDir, { recursive: true });
  const outFile = path.join(docsDir, 'feature-scope-guide.md');
  await fs.writeFile(outFile, guideLines.join('\n'));
  console.log(`✔️  Feature scope guide generated at ${rel(outFile)}`);
})();