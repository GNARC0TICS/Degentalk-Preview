import * as fs from 'fs';
import * as path from 'path';

const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const Reset = "\x1b[0m";

// 🔥 UPDATE THESE
const directoriesToScan = ['./server', './client', './scripts'];
const oldImportPath = '../../../core/db';     // <== what you're removing
const newImportPath = '@db';        // <== what you want to replace it with

let filesChanged = 0;
let filesScanned = 0;

function processFile(filePath: string): void {
  filesScanned++;
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // import { X } from '@schema'
    const importRegex = new RegExp(`(import\\s+.*?\\s+from\\s+['\"])${oldImportPath}(['\"])`, 'g');

    // import * as schema from '@schema'
    const importAllRegex = new RegExp(`(import\\s+\\*\\s+as\\s+\\w+\\s+from\\s+['\"])${oldImportPath}(['\"])`, 'g');

    if (importRegex.test(content) || importAllRegex.test(content)) {
      content = content.replace(importRegex, `$1${newImportPath}$2`);
      content = content.replace(importAllRegex, `$1${newImportPath}$2`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`${FgGreen}[FIXED]${Reset} ${filePath}`);
      filesChanged++;
    }
  } catch (error: any) {
    console.error(`${FgRed}[ERROR]${Reset} ${filePath}: ${error.message}`);
  }
}

function scanDirectory(dir: string): void {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      processFile(fullPath);
    }
  }
}

console.log(`${FgYellow}Starting import cleanup...${Reset}`);
console.log(`Replacing "${oldImportPath}" → "${newImportPath}"`);

directoriesToScan.forEach(scanDirectory);

console.log(`\n${FgGreen}✔ Rewrite complete.${Reset}`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files changed: ${filesChanged}`); 