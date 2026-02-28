/**
 * Simple build script to bundle all modules into a single file
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = './dist';
const outputFile = join(distDir, 'app.bundle.js');

// Read all compiled JS files
const files = [
  'lib/types.js',
  'lib/config-metadata.js',
  'lib/embed-manifest.js',
  'lib/embed-shared/embedContractProps.js',
  'lib/runtime-mocks/context-sync.js',
  'lib/runtime-mocks/runtime.js',
  'lib/runtime-mocks/dom-application.js',
  'lib/runtime-mocks/resolve-runtime-context.js',
  'lib/base-embed.js',
  'lib/llm-provider.interface.js',
  'lib/prompt-compiler.js',
  'lib/game/types.js',
  'lib/game/store.js',
  'lib/game/engine.js',
  'lib/game/game-layout.js',
  'lib/game/index.js',
  'embeds/generator-form.js',
  'embeds/prompt-preview.js',
  'embeds/generate-action.js',
  'embeds/file-output.js',
  'embeds/live-preview.js',
  'embeds/settings.js',
  'embeds/memory-game.js',
  'openai-provider.js',
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
    // Remove export { ... } from '...' statements
    content = content.replace(/^export\s*\{[^}]+\}\s*from\s+.+;?\s*$/gm, '');
    // Remove remaining { ... } from '...' statements (leftover from above)
    content = content.replace(/^\{[^}]+\}\s*from\s+.+;?\s*$/gm, '');
    bundle += `// ${file}\n${content}\n\n`;
  } catch (error) {
    console.warn(`Warning: Could not read ${file}:`, error.message);
  }
});

writeFileSync(outputFile, bundle);
console.log(`✓ Bundle created: ${outputFile}`);
