#!/usr/bin/env ts-node

/**
 * tools/collect-tsconfigs.ts
 *
 * Aggregates all workspace package.json files and their nearest tsconfig.json
 * into a single Markdown document for easy LLM ingestion / diffing.
 *
 * Usage:
 *   pnpm ts-node tools/collect-tsconfigs.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import fg from 'fast-glob';
import * as prettier from 'prettier';

interface PackageInfo {
  name: string;
  dir: string;
  tsconfigPath?: string;
  tsconfig?: Record<string, unknown>;
}

const REPO_ROOT = process.cwd(); // assume script runs from root
const OUTPUT_FILE = 'tsconfig-matrix.md';
const IGNORES = ['**/node_modules/**', '**/dist/**', '**/.next/**'];

async function main() {
  const packageJsonPaths = await fg(['**/package.json'], { ignore: IGNORES });

  const packages: PackageInfo[] = await Promise.all(
    packageJsonPaths.map(async (pkgPath) => {
      const dir = path.dirname(pkgPath);
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
      const tsconfigPath = await findNearestTsconfig(dir);
      const tsconfig =
        tsconfigPath && JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));

      return { name: pkg.name ?? path.basename(dir), dir, tsconfigPath, tsconfig };
    })
  );

  const markdown = await buildMarkdown(packages);
  await fs.writeFile(OUTPUT_FILE, markdown);
  console.log(`✅  Wrote ${OUTPUT_FILE}`);
}

async function findNearestTsconfig(startDir: string): Promise<string | undefined> {
  let dir: string | undefined = startDir;
  while (dir && dir !== path.dirname(dir)) {
    const candidate = path.join(dir, 'tsconfig.json');
    try {
      await fs.access(candidate);
      return path.relative(REPO_ROOT, candidate);
    } catch {
      /* not here, go up */
    }
    dir = path.dirname(dir);
  }
  return undefined;
}

async function buildMarkdown(pkgs: PackageInfo[]): Promise<string> {
  const warnings: string[] = [];
  const header = `# Monorepo TypeScript Config Matrix\n\n_Generated: ${new Date().toISOString()}_\n`;
  const sections = await Promise.all(
    pkgs.map(async (p) => {
      if (!p.tsconfigPath) {
        warnings.push(`- **${p.name}** → _no tsconfig.json found_`);
        return `## ${p.name}\n\n_No tsconfig.json located_\n`;
      }

      const pretty = await prettier.format(JSON.stringify(p.tsconfig, null, 2), {
        parser: 'json',
      });

      return `## ${p.name}\n\n\`\`\`json\n${pretty}\n\`\`\`\n` +
        `Path: \`${p.tsconfigPath}\`\n`;
    })
  );

  // Simple duplicate path-alias detection
  const pathAliasMap = new Map<string, string>();
  for (const p of pkgs) {
    const paths = p.tsconfig?.compilerOptions?.paths as Record<string, string[]> | undefined;
    if (!paths) continue;
    for (const alias of Object.keys(paths)) {
      if (pathAliasMap.has(alias) && pathAliasMap.get(alias) !== p.name) {
        warnings.push(
          `- Path alias **${alias}** used by both **${pathAliasMap.get(alias)}** and **${p.name}**`
        );
      } else {
        pathAliasMap.set(alias, p.name);
      }
    }
  }

  const warnSection =
    warnings.length > 0
      ? `\n---\n## 🚨 Warnings\n\n${warnings.join('\n')}\n`
      : '';

  return header + sections.join('\n') + warnSection;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 