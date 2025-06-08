import { execSync } from 'child_process';

const aliases = ['@db', '@server', '@schema'];
for (const alias of aliases) {
  try {
    const output = execSync(`rg "from .*${alias}" server/src/domains | grep -v "from '.*${alias}'"`);
    if (output.toString()) {
      console.error(`❌ Broken ${alias} imports found:\n${output}`);
    }
  } catch {
    console.log(`✅ All ${alias} imports are clean.`);
  }
} 