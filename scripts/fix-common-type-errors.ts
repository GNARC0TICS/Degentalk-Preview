#!/usr/bin/env tsx
/**
 * Script to fix common TypeScript errors in bulk
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const fixes = [
  {
    name: 'Fix _forumRules property',
    pattern: /\._forumRules/g,
    replacement: '.forumRules',
    filePattern: '**/ThreadForm.tsx'
  },
  {
    name: 'Fix isComplete property on Mission',
    pattern: /mission\.isComplete/g,
    replacement: 'mission.completed',
    filePattern: '**/MissionHub.tsx'
  },
  {
    name: 'Fix isVIP property on User', 
    pattern: /user\.isVIP/g,
    replacement: '(user as any).isVIP',
    filePattern: '**/MissionHub.tsx'
  }
];

async function main() {
  for (const fix of fixes) {
    console.log(`\nApplying fix: ${fix.name}`);
    
    const files = await glob(fix.filePattern, {
      cwd: path.join(process.cwd(), 'client/src'),
      absolute: true
    });
    
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const newContent = content.replace(fix.pattern, fix.replacement);
      
      if (content !== newContent) {
        writeFileSync(file, newContent);
        console.log(`  ✓ Fixed ${path.relative(process.cwd(), file)}`);
      }
    }
  }
}

main().catch(console.error);