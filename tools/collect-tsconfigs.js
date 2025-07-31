#!/usr/bin/env node

/**
 * tools/collect-tsconfigs.js
 *
 * Aggregates all workspace package.json files and their nearest tsconfig.json
 * into a single Markdown document for easy LLM ingestion / diffing.
 *
 * Usage:
 *   node tools/collect-tsconfigs.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import fg from 'fast-glob';
import * as prettier from 'prettier';
import { fileURLToPath } from 'url';
import { parse } from 'jsonc-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = process.cwd(); // assume script runs from root
const OUTPUT_FILE = 'tsconfig-matrix.md';
const IGNORES = ['**/node_modules/**', '**/dist/**', '**/.next/**'];

async function main() {
  const packageJsonPaths = await fg(['**/package.json'], { ignore: IGNORES });

  const packages = await Promise.all(
    packageJsonPaths.map(async (pkgPath) => {
      try {
        const dir = path.dirname(pkgPath);
        const pkgContent = await fs.readFile(pkgPath, 'utf8');
        const pkg = JSON.parse(pkgContent);
        const tsconfigPath = await findNearestTsconfig(dir);
        let tsconfig = null;
        
        if (tsconfigPath) {
          try {
            const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
            tsconfig = parse(tsconfigContent);
          } catch (tsError) {
            console.warn(`⚠️  Failed to parse tsconfig at ${tsconfigPath}: ${tsError.message}`);
          }
        }

        return { name: pkg.name ?? path.basename(dir), dir, tsconfigPath, tsconfig };
      } catch (error) {
        console.warn(`⚠️  Failed to process ${pkgPath}: ${error.message}`);
        return { name: path.basename(path.dirname(pkgPath)), dir: path.dirname(pkgPath), tsconfigPath: null, tsconfig: null };
      }
    })
  );

  const markdown = await buildDetailedMarkdown(packages);
  await fs.writeFile(OUTPUT_FILE, markdown);
  console.log(`✅  Wrote ${OUTPUT_FILE}`);
}

async function findNearestTsconfig(startDir) {
  let dir = startDir;
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

async function buildDetailedMarkdown(pkgs) {
  const warnings = [];
  const analysis = {
    extendsChains: new Map(),
    moduleResolutions: new Map(),
    strictSettings: new Map(),
    pathAliases: new Map(),
    compositeProjects: new Set(),
    references: new Map()
  };

  const header = `# Monorepo TypeScript Config Matrix

_Generated: ${new Date().toISOString()}_

## 📊 Summary

- **Total Workspaces:** ${pkgs.length}
- **Workspaces with tsconfig.json:** ${pkgs.filter(p => p.tsconfigPath).length}
- **Workspaces without tsconfig.json:** ${pkgs.filter(p => !p.tsconfigPath).length}

`;

  // Analyze each package
  for (const pkg of pkgs) {
    if (!pkg.tsconfig) continue;
    
    const config = pkg.tsconfig;
    
    // Track extends chains
    if (config.extends) {
      analysis.extendsChains.set(pkg.name, config.extends);
    }
    
    // Track module resolution
    if (config.compilerOptions?.moduleResolution) {
      analysis.moduleResolutions.set(pkg.name, config.compilerOptions.moduleResolution);
    }
    
    // Track strict settings
    if (config.compilerOptions?.strict !== undefined) {
      analysis.strictSettings.set(pkg.name, config.compilerOptions.strict);
    }
    
    // Track composite projects
    if (config.compilerOptions?.composite) {
      analysis.compositeProjects.add(pkg.name);
    }
    
    // Track project references
    if (config.references) {
      analysis.references.set(pkg.name, config.references);
    }
    
    // Track path aliases
    if (config.compilerOptions?.paths) {
      for (const [alias, targets] of Object.entries(config.compilerOptions.paths)) {
        if (!analysis.pathAliases.has(alias)) {
          analysis.pathAliases.set(alias, []);
        }
        analysis.pathAliases.get(alias).push({
          package: pkg.name,
          targets: targets,
          configPath: pkg.tsconfigPath
        });
      }
    }
  }

  // Build detailed sections
  const sections = await Promise.all(
    pkgs.map(async (p) => {
      if (!p.tsconfigPath) {
        warnings.push(`- **${p.name}** → _no tsconfig.json found_`);
        return `## ${p.name}\n\n_No tsconfig.json located_\n`;
      }

      if (!p.tsconfig) {
        warnings.push(`- **${p.name}** → _invalid tsconfig.json at ${p.tsconfigPath}_`);
        return `## ${p.name}\n\n_Invalid tsconfig.json at \`${p.tsconfigPath}\`_\n`;
      }

      const pretty = await prettier.format(JSON.stringify(p.tsconfig, null, 2), {
        parser: 'json',
      });

      const config = p.tsconfig;
      const compilerOpts = config.compilerOptions || {};
      
      // Build detailed analysis for this package
      const details = [];
      
      if (config.extends) {
        details.push(`- **Extends:** \`${Array.isArray(config.extends) ? config.extends.join(', ') : config.extends}\``);
      }
      
      if (compilerOpts.moduleResolution) {
        details.push(`- **Module Resolution:** \`${compilerOpts.moduleResolution}\``);
      }
      
      if (compilerOpts.target) {
        details.push(`- **Target:** \`${compilerOpts.target}\``);
      }
      
      if (compilerOpts.module) {
        details.push(`- **Module:** \`${compilerOpts.module}\``);
      }
      
      if (compilerOpts.strict !== undefined) {
        details.push(`- **Strict:** \`${compilerOpts.strict}\``);
      }
      
      if (compilerOpts.composite) {
        details.push(`- **Composite:** \`${compilerOpts.composite}\``);
      }
      
      if (compilerOpts.baseUrl) {
        details.push(`- **Base URL:** \`${compilerOpts.baseUrl}\``);
      }
      
      if (config.include) {
        details.push(`- **Include:** \`${config.include.join(', ')}\``);
      }
      
      if (config.exclude) {
        details.push(`- **Exclude:** \`${config.exclude.join(', ')}\``);
      }
      
      if (config.references) {
        details.push(`- **References:** ${config.references.map(r => r.path).join(', ')}`);
      }

      return `## ${p.name}

**Path:** \`${p.tsconfigPath}\`

### Configuration Details
${details.join('\n')}

### Full Configuration
\`\`\`json
${pretty}
\`\`\`

`;
    })
  );

  // Build analysis sections
  const analysisSections = [];

  // Extends Analysis
  if (analysis.extendsChains.size > 0) {
    analysisSections.push(`## 🔗 Extends Chain Analysis

${Array.from(analysis.extendsChains.entries()).map(([pkg, extendsPath]) => 
  `- **${pkg}** → \`${Array.isArray(extendsPath) ? extendsPath.join(', ') : extendsPath}\``
).join('\n')}

`);
  }

  // Module Resolution Analysis
  if (analysis.moduleResolutions.size > 0) {
    analysisSections.push(`## 📦 Module Resolution Analysis

${Array.from(analysis.moduleResolutions.entries()).map(([pkg, resolution]) => 
  `- **${pkg}** → \`${resolution}\``
).join('\n')}

`);
  }

  // Strict Settings Analysis
  if (analysis.strictSettings.size > 0) {
    analysisSections.push(`## 🔒 Strict Settings Analysis

${Array.from(analysis.strictSettings.entries()).map(([pkg, strict]) => 
  `- **${pkg}** → \`${strict}\``
).join('\n')}

`);
  }

  // Composite Projects Analysis
  if (analysis.compositeProjects.size > 0) {
    analysisSections.push(`## 🧩 Composite Projects

${Array.from(analysis.compositeProjects).map(pkg => 
  `- **${pkg}**`
).join('\n')}

`);
  }

  // Path Alias Analysis
  if (analysis.pathAliases.size > 0) {
    const pathAliasSection = [`## 🛣️ Path Alias Analysis

`];
    
    for (const [alias, usages] of analysis.pathAliases) {
      if (usages.length > 1) {
        warnings.push(`- Path alias **${alias}** used by ${usages.length} packages: ${usages.map(u => u.package).join(', ')}`);
      }
      
      pathAliasSection.push(`### \`${alias}\``);
      for (const usage of usages) {
        pathAliasSection.push(`- **${usage.package}** → \`${usage.targets.join(', ')}\``);
      }
      pathAliasSection.push('');
    }
    
    analysisSections.push(pathAliasSection.join('\n'));
  }

  // Project References Analysis
  if (analysis.references.size > 0) {
    analysisSections.push(`## 🔗 Project References

${Array.from(analysis.references.entries()).map(([pkg, refs]) => 
  `- **${pkg}** → ${refs.map(r => r.path).join(', ')}`
).join('\n')}

`);
  }

  const warnSection =
    warnings.length > 0
      ? `\n---\n## 🚨 Warnings & Issues\n\n${warnings.join('\n')}\n`
      : '';

  return header + analysisSections.join('\n') + '\n---\n' + sections.join('\n') + warnSection;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 