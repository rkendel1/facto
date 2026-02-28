/**
 * Simple build script to bundle all modules into a single file
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = './dist';
const outputFile = join(distDir, 'app.bundle.js');

// Read all compiled JS files
const files = [
  'lib/base-embed.js',
  'lib/llm-provider.interface.js',
  'lib/prompt-compiler.js',
  'embeds/generator-form.js',
  'embeds/prompt-preview.js',
  'embeds/generate-action.js',
  'embeds/file-output.js',
  'embeds/live-preview.js',
  'app.manifest.js'
];

let bundle = '// StackLive Code Generator Bundle\n\n';

files.forEach(file => {
  const filePath = join(distDir, file);
  try {
    let content = readFileSync(filePath, 'utf-8');
    // Remove export/import statements for bundling
    content = content.replace(/^export\s+/gm, '');
    content = content.replace(/^import\s+.+from\s+.+;?\s*$/gm, '');
    bundle += `// ${file}\n${content}\n\n`;
  } catch (error) {
    console.warn(`Warning: Could not read ${file}:`, error.message);
  }
});

writeFileSync(outputFile, bundle);
console.log(`✓ Bundle created: ${outputFile}`);
