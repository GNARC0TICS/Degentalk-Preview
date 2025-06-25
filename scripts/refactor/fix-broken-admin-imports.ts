import { promises as fs } from 'fs';
import path from 'path';
import glob from 'fast-glob';

/**
 * This maintenance script scans all admin page source files and fixes common malformed
 * import patterns left by early scaffolding (empty imports, missing braces, etc.).
 *
 * Patterns addressed:
 * 1. "import {  } from 'pkg';"  ➜  removed (record the pkg for following fix)
 * 2. "import { useQuery, useMutation ;" (missing `} from 'pkg'`)  ➜  fixed
 *    using the nearest preceding empty-import path OR prompts if not found.
 * 3. "import { React, { useState } from 'react';"  ➜  "import React, { useState } from 'react';"
 * 4. Any line starting with `import` that is missing a `from` section is removed.
 */
async function run() {
  const files = await glob('client/src/pages/admin/**/*.tsx', { absolute: true });
  for (const file of files) {
    let source = await fs.readFile(file, 'utf8');
    const lines = source.split(/\r?\n/);
    const newLines: string[] = [];
    let pendingPath: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // 1. Remove empty import rows and record path
      const emptyImportMatch = line.match(/import\s+\{\s*\}\s+from\s+['"]([^'"]+)['"];?/);
      if (emptyImportMatch) {
        pendingPath = emptyImportMatch[1];
        continue; // skip this line entirely
      }

      // 2. Fix missing brace + path
      const brokenNamedImport = line.match(/import\s+\{([^}]*);?\s*$/);
      if (brokenNamedImport && pendingPath) {
        const names = brokenNamedImport[1].trim().replace(/,$/, '');
        line = `import { ${names} } from '${pendingPath}';`;
        pendingPath = null;
      } else if (brokenNamedImport) {
        // no path known – drop the line and warn
        console.warn(`[fix-broken-admin-imports] Dropped ambiguous import in ${file}: ${line}`);
        continue;
      }

      // 3. Fix React import with double braces
      line = line.replace(/import\s+\{\s*React,\s*\{([^}]+)\}\s+from\s+'react';?/,
                          (_, inner) => `import React, { ${inner.trim()} } from 'react';`);

      // 4. Remove import lines lacking 'from' keyword (very likely broken)
      if (/^import\s+[^'";]+;?$/.test(line) && !line.includes(' from ')) {
        console.warn(`[fix-broken-admin-imports] Removed stray import in ${file}: ${line}`);
        continue;
      }

      newLines.push(line);
    }

    const updated = newLines.join('\n');
    if (updated !== source) {
      await fs.writeFile(file, updated, 'utf8');
      console.log(`[fix-broken-admin-imports] Patched ${path.relative(process.cwd(), file)}`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
}); 