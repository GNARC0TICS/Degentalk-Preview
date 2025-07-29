// tools/runClaude.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const promptPath = process.argv[2];
if (!promptPath) {
  console.error('❌ No prompt file provided. Example: pnpm run run:prompt prompts/debug.prompt.txt');
  process.exit(1);
}

const absPath = path.resolve(promptPath);
if (!fs.existsSync(absPath)) {
  console.error(`❌ Prompt file not found: ${absPath}`);
  process.exit(1);
}

const prompt = fs.readFileSync(absPath, 'utf8');
const output = execSync(`echo "${prompt}" | pnpm claude`, { encoding: 'utf8' });
console.log(`\n🧠 Claude Output:\n${output}`);
