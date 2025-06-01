import * as fs from 'fs';
import * as path from 'path';

const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const Reset = "\x1b[0m";

const directoriesToScan = ['./server', './client'];
const oldImportPath = '@shared/schema';
const newImportPath = '@db/schema';

let filesChanged = 0;
let filesScanned = 0;

function processFile(filePath: string): void {
  filesScanned++;
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const importRegex = new RegExp(`(import\\s+.*\\s+from\\s+['"\\s]*)${oldImportPath.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(['"\\s]*;?)`, 'g');

    if (importRegex.test(content)) {
      console.log(`${FgYellow}[REWRITING]${Reset} Found old import in: ${filePath}`);
      content = content.replace(importRegex, `$1${newImportPath}$2`);
      fs.writeFileSync(filePath, content, 'utf8');
      filesChanged++;
      console.log(`${FgGreen}[SUCCESS]${Reset}   Rewrote import in: ${filePath}`);
    } else {
      // Check for import * as schema from '@shared/schema' type imports
      const importAsRegex = new RegExp(`(import\\s+\\*\\s+as\\s+\w+\\s+from\\s+['"\\s]*)${oldImportPath.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(['"\\s]*;?)`, 'g');
      if (importAsRegex.test(content)) {
        console.log(`${FgYellow}[REWRITING]${Reset} Found old import (import * as) in: ${filePath}`);
        content = content.replace(importAsRegex, `$1${newImportPath}$2`);
        fs.writeFileSync(filePath, content, 'utf8');
        filesChanged++;
        console.log(`${FgGreen}[SUCCESS]${Reset}   Rewrote import (import * as) in: ${filePath}`);
      }
    }

  } catch (error: any) {
    console.error(`${FgRed}[ERROR]${Reset} Failed to process file ${filePath}: ${error.message}`);
  }
}

function scanDirectory(dirPath: string): void {
  try {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          // Exclude node_modules, .git, and other common non-source directories
          if (item !== 'node_modules' && item !== '.git' && item !== 'dist' && item !== 'build') {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
          processFile(fullPath);
        }
      } catch (statError: any) {
        console.error(`${FgRed}[ERROR]${Reset} Failed to stat item ${fullPath}: ${statError.message}`);
      }
    }
  } catch (readDirError: any) {
    console.error(`${FgRed}[ERROR]${Reset} Failed to read directory ${dirPath}: ${readDirError.message}`);
  }
}

console.log(`Starting schema import rewrite process...`);
console.log(`Scanning for imports of "${oldImportPath}" to replace with "${newImportPath}".`);

directoriesToScan.forEach(dir => {
  console.log(`Scanning directory: ${dir}`);
  scanDirectory(path.resolve(process.cwd(), dir));
});

console.log(`
${FgGreen}Rewrite process complete.${Reset}`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files changed: ${filesChanged}`);

if (filesChanged > 0) {
  console.log(`${FgYellow}Please review the changes and test your application thoroughly.${Reset}`);
} else {
  console.log(`No instances of "${oldImportPath}" were found.`);
} 