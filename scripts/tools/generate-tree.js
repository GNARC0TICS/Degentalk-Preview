/**
 * Directory Tree Generator Script
 * 
 * This script generates a Markdown file containing the project directory structure,
 * excluding node_modules, .git, and other large/irrelevant directories.
 * It uses a configuration object to add emojis and labels for better visual representation.
 */

import { promises as fs } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';

// --- Configuration ---

const directoryConfig = {
  // Top-level directories
  'client': { emoji: '⚛️ ', label: 'Frontend Application (React/Vite)', index: true },
  'server': { emoji: '⚙️ ', label: 'Backend Server (Express)', index: true },
  'shared': { emoji: '🤝', label: 'Isomorphic code (client & server)', index: true },
  'db': { emoji: '🗄️', label: 'Database schema, migrations, and seeds', index: true },
  'scripts': { emoji: '🛠️', label: 'Development & utility scripts', index: true },
  'docs': { emoji: '📚', label: 'Project documentation', index: true },
  'config': { emoji: '🔧', label: 'Shared build/tooling configuration', index: true },
  'tests': { emoji: '🧪', label: 'End-to-end tests (Playwright)', index: true },
  '.github': { emoji: ' CI/CD', label: 'GitHub Actions workflows', index: true },
  '.claudedocs': { ignore: true },

  // Key sub-directories
  'src': { emoji: '🏗️', label: 'Core application source code' },
  'components': { emoji: '🧩', label: 'Reusable UI components' },
  'pages': { emoji: '📄', label: 'Page components & routing' },
  'hooks': { emoji: '🎣', label: 'Custom React hooks' },
  'contexts': { emoji: '🔄', label: 'React context providers' },
  'domains': { emoji: '🏗️', label: 'Domain-driven business logic' },
  'routes': { emoji: '🚏', label: 'API route definitions' },
  'schema': { emoji: '📝', label: 'Database table schemas' },
  'migrations': { emoji: '📜', label: 'Database migration files' },

  // Directories to ignore
  'node_modules': { ignore: true },
  '.git': { ignore: true },
  '.next': { ignore: true },
  'dist': { ignore: true },
  '.turbo': { ignore: true },
  '.cursor': { ignore: true },
  '.vscode': { ignore: true },
  'coverage': { ignore: true },
  'tmp': { ignore: true },
  'temp': { ignore: true },
  'UIVERSE': { ignore: true },
  'SuperClaude': { ignore: true },
  'test-results': { ignore: true },
};

// Files to exclude
const EXCLUDE_FILES = [
  '.DS_Store',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
];

// File extensions to exclude
const EXCLUDE_EXTENSIONS = ['.map', '.d.ts', '.log', '.env', '.env.local'];

// Maximum depth to traverse (0 means no limit)
const MAX_DEPTH = 4;

/**
 * Context object to pass through recursion
 */
const generationContext = {
  lineCounter: 1,
  navIndex: {},
};

/**
 * Counts lines of code in a directory, respecting exclusion rules.
 * @param {string} dir - The directory to analyze
 * @returns {Promise<number>} - The total line count
 */
async function countLinesOfCode(dir) {
  let totalLines = 0;
  let items;

  try {
    items = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return 0; // Ignore errors from reading inaccessible directories
  }

  for (const item of items) {
    const itemPath = join(dir, item.name);
    const config = directoryConfig[item.name.replace(/\/$/, '')];

    if (
      (config && config.ignore) ||
      EXCLUDE_FILES.includes(item.name) ||
      EXCLUDE_EXTENSIONS.some(ext => item.name.endsWith(ext))
    ) {
      continue;
    }

    if (item.isDirectory()) {
      totalLines += await countLinesOfCode(itemPath);
    } else if (item.isFile()) {
      try {
        const content = await fs.readFile(itemPath, 'utf8');
        totalLines += content.split('\n').length;
      } catch {
        // ignore binary files or read errors
      }
    }
  }

  return totalLines;
}

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
    const config = directoryConfig[item.name.replace(/\/$/, '')];

    // Skip excluded directories and files
    if (
      (config && config.ignore) ||
      EXCLUDE_FILES.includes(item.name) ||
      (EXCLUDE_EXTENSIONS.some(ext => item.name.endsWith(ext)))
    ) {
      continue;
    }

    // Current item representation
    const newPrefix = prefix + (isLast ? '└─ ' : '├─ ');
    const emoji = config?.emoji || (item.isDirectory() ? '📁' : '📄');
    const label = config?.label ? ` - ${config.label}` : '';
    const line = `${newPrefix}${emoji} ${item.name}${item.isDirectory() ? '/' : ''}${label}\n`;

    if (depth === 0 && config?.index) {
      generationContext.navIndex[item.name] = {
        line: generationContext.lineCounter,
        label: config.label,
        emoji: config.emoji.trim(),
      };
    }
    
    output += line;
    generationContext.lineCounter += (line.match(/\n/g) || []).length;

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
  const header = `# ${projectName} Directory Structure\n\n> Generated on: ${date}\n\nThis document provides a visual map of the DegenTalk monorepo. It's automatically generated by the \`pnpm generate:tree\` script.\n\n`;

  // Generate the tree first to build the nav index
  const tree = await generateTree(rootDir, rootDir);

  // --- Create Navigational Index ---
  let navIndexMarkdown = `## 🗺️ Navigational Index\n\nJump to a specific top-level directory:\n\n| Directory | Purpose | Go to Line |\n| :--- | :--- | :---: |\n`;
  for (const [dir, { emoji, label, line }] of Object.entries(generationContext.navIndex)) {
    navIndexMarkdown += `| **${emoji} \`${dir}/\`** | ${label} | \`L${line}\` |\n`;
  }

  const legend = `\n##  Legend\n\n| Emoji | Meaning                  |\n| :---: | ------------------------ |\n| ⚛️    | Frontend Application     |\n| ⚙️    | Backend Server           |\n| 🤝    | Shared Code              |\n| 🗄️    | Database                 |\n| 🛠️    | Scripts & Tooling        |\n| 📚    | Documentation            |\n| 🧪    | Tests                    |\n| 🧩    | Reusable UI Components   |\n| 🏗️    | Server Business Logic    |\n\n---\n\n`;
  
  const treeMarkdown = `\`\`\`\n${tree}\`\`\`\n`;

  // --- Count Lines of Code ---
  const totalLoc = await countLinesOfCode(rootDir);
  const footer = `\n---\n\n### 📊 Project Stats\n\n- **Total Lines of Code:** ~${totalLoc.toLocaleString()}\n`;

  // Assemble the final markdown
  const markdown = header + navIndexMarkdown + legend + treeMarkdown + footer;

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