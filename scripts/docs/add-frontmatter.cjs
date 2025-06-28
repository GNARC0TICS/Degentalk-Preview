// add-frontmatter.js converted to plain JS for compatibility

const fs = require('fs/promises');
const path = require('path');
const fg = require('fast-glob');

const DOC_GLOB = [
  'docs/**/*.md',
  '!docs/archive/**',
  '!.claudedocs/**',
  '!.cursor/**'
];

(async () => {
  const files = await fg(DOC_GLOB, { dot: true });
  const today = new Date().toISOString().slice(0, 10);

  for (const file of files) {
    const fullPath = path.resolve(file);
    const raw = await fs.readFile(fullPath, 'utf8');
    if (raw.startsWith('---')) continue;

    const title = path.basename(file).replace(/\.md$/i, '').replace(/-/g, ' ');
    const frontMatter = `---\ntitle: ${title}\nstatus: STABLE\nupdated: ${today}\n---\n\n`;
    await fs.writeFile(fullPath, frontMatter + raw, 'utf8');
    console.log('Added front-matter →', file);
  }
})(); 