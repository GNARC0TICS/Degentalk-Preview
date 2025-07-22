#!/usr/bin/env ts-node

/**
 * Codemod to fix React Router Link component prop issues
 * Replaces href prop with to prop
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '../../');
const CLIENT_SRC = path.join(ROOT_DIR, 'client/src');

async function fixReactRouterLinks() {
  console.log('🔧 Fixing React Router Link components...\n');

  // Find all TypeScript/React files
  const files = await glob('**/*.{ts,tsx}', {
    cwd: CLIENT_SRC,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts']
  });

  let totalFixed = 0;
  let filesModified = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    
    // Skip if no Link import from react-router-dom
    if (!content.includes("from 'react-router-dom'") || !content.includes('Link')) {
      continue;
    }

    let modified = content;
    let fixes = 0;

    // Fix Link components with href prop
    // Match <Link href="..." with various attributes
    const linkPattern = /<Link\s+([^>]*\s)?href\s*=\s*["']([^"']+)["']([^>]*)>/g;
    
    modified = modified.replace(linkPattern, (match, before = '', href, after = '') => {
      fixes++;
      // Check if 'to' prop already exists
      if (before.includes(' to=') || after.includes(' to=')) {
        console.log(`⚠️  Skipping ${file} - already has 'to' prop`);
        return match;
      }
      return `<Link ${before}to="${href}"${after}>`;
    });

    // Also fix cases where href is in JSX spread or computed
    const hrefPropPattern = /(<Link\s+[^>]*?)href(\s*[:=])/g;
    modified = modified.replace(hrefPropPattern, (match, before, assignment) => {
      // Don't replace if it's part of a larger word
      if (match.includes('Href') || match.includes('shref')) {
        return match;
      }
      fixes++;
      return `${before}to${assignment}`;
    });

    if (fixes > 0) {
      writeFileSync(file, modified);
      totalFixed += fixes;
      filesModified++;
      console.log(`✅ Fixed ${fixes} Link components in ${path.relative(ROOT_DIR, file)}`);
    }
  }

  console.log(`\n🎉 Fixed ${totalFixed} Link components across ${filesModified} files`);
}

// Run the codemod
fixReactRouterLinks().catch(console.error);