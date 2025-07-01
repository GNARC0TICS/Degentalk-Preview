/**
 * Directory Tree Generator Script
 * 
 * This script generates a Markdown file containing the project directory structure,
 * excluding node_modules, .git, and other large/irrelevant directories.
 */

import { promises as fs } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';

// Directories to exclude from the tree
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  '.turbo',
  '.cursor/traces',
  '.vscode',
  'coverage'
];

// File extensions to exclude
const EXCLUDE_EXTENSIONS = [
  '.map',
  '.d.ts'
];

// Maximum depth to traverse (0 means no limit)
const MAX_DEPTH = 4;

/**
 * Generate a directory tree as a string representation
 * @param {string} dir - The directory to start from
 * @param {string} basePath - The base path for relative paths
 * @param {number} depth - Current depth level
 * @param {string} prefix - String prefix for current line
 * @returns {Promise<string>} - The directory tree as a string
 */
async function generateTree(dir, basePath = '', depth = 0, prefix = '') {
  if (MAX_DEPTH > 0 && depth > MAX_DEPTH) {
    return `${prefix}... (max depth reached)\n`;
  }

  let output = '';
  let items;

  try {
    items = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    return `${prefix}Error reading directory: ${error.message}\n`;
  }

  // Sort items: directories first, then files alphabetically
  items.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isLast = i === items.length - 1;
    const itemPath = join(dir, item.name);
    const relativePath = relative(basePath || dir, itemPath);

    // Skip excluded directories and files
    if (
      (item.isDirectory() && EXCLUDE_DIRS.includes(item.name)) ||
      (EXCLUDE_EXTENSIONS.some(ext => item.name.endsWith(ext)))
    ) {
      continue;
    }

    // Current item representation
    const newPrefix = prefix + (isLast ? '└─ ' : '├─ ');
    output += `${newPrefix}${item.name}${item.isDirectory() ? '/' : ''}\n`;

    // If directory, recursively process its contents
    if (item.isDirectory()) {
      const childPrefix = prefix + (isLast ? '   ' : '│  ');
      output += await generateTree(itemPath, basePath || dir, depth + 1, childPrefix);
    }
  }

  return output;
}

/**
 * Main function to generate the directory tree
 */
async function main() {
  const argv = minimist(process.argv.slice(2));

  // Determine project root reliably even when called from sub-directories
  const __filename = fileURLToPath(import.meta.url);
  const scriptDir = dirname(__filename);
  const rootDir = resolve(scriptDir, '../../');

  // Determine output path
  const outputPath = argv.output
    ? resolve(process.cwd(), argv.output)
    : join(rootDir, 'directory-tree.md');

  // Header for the markdown file
  let projectName = 'Project';
  try {
    const pkgRaw = await fs.readFile(join(rootDir, 'package.json'), 'utf8');
    projectName = JSON.parse(pkgRaw).name || projectName;
  } catch {
    // ignore
  }

  const date = new Date().toISOString().split('T')[0];
  const header = `# ${projectName} Directory Structure\n\nGenerated on: ${date}\n\n\`\`\`\n`;

  const footer = `\`\`\`\n\n## Structure Notes\n\n- \`server/src/domains/\` - Domain-driven backend modules\n- \`client/src/components/\` - Reusable React components\n- \`client/src/pages/\` - Page components corresponding to routes\n- \`shared/\` - Shared code between client and server\n`;

  // Generate the tree
  const tree = await generateTree(rootDir, rootDir);
  const markdown = header + tree + footer;

  // Write to file
  await fs.writeFile(outputPath, markdown, 'utf8');

  // Also pipe to stdout so users can still redirect if desired
  process.stdout.write(markdown);

  console.log(`\nDirectory tree written to: ${relative(rootDir, outputPath)}`);
}

main().catch(error => {
  console.error('Error generating directory tree:', error);
  process.exit(1);
}); 