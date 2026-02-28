/**
 * Prompt Compiler
 * Transforms structured user input into a final LLM prompt
 */

export interface GeneratorConfig {
  mode: 'single-embed' | 'multi-embed-app' | 'embed-library';
  name: string;
  description: string;
  embeds: string[];
  design_system: boolean;
  context_aware: boolean;
  output_types: {
    embed: boolean;
    app: boolean;
    manifest: boolean;
    variants: boolean;
  };
}

const SYSTEM_PROMPT = `You are generating production-ready StackLive render-only code.

RULES:
- Must extend BaseEmbed
- Render-only
- Config-driven
- Shadow DOM only
- Emit embed:render
- Self-contained CSS
- Manifest required
- No frameworks
- TypeScript only

OUTPUT:
Return only code files.`;

export function buildPrompt(config: GeneratorConfig): string {
  let prompt = SYSTEM_PROMPT + '\n\n';
  
  prompt += '━━━━━━━━━━━━━━━━━━━\n';
  prompt += 'USER REQUEST\n';
  prompt += '━━━━━━━━━━━━━━━━━━━\n\n';
  
  prompt += `Mode: ${config.mode}\n`;
  prompt += `Name: ${config.name}\n`;
  prompt += `Description: ${config.description}\n\n`;
  
  if (config.embeds.length > 0) {
    prompt += 'EMBEDS TO GENERATE:\n';
    config.embeds.forEach((embed, idx) => {
      prompt += `${idx + 1}. ${embed}\n`;
    });
    prompt += '\n';
  }
  
  prompt += 'OPTIONS:\n';
  prompt += `- Design System: ${config.design_system ? 'Yes' : 'No'}\n`;
  prompt += `- Context Aware: ${config.context_aware ? 'Yes' : 'No'}\n\n`;
  
  prompt += 'OUTPUT TYPES:\n';
  if (config.output_types.embed) prompt += '- Embed files\n';
  if (config.output_types.app) prompt += '- App structure\n';
  if (config.output_types.manifest) prompt += '- Manifest file\n';
  if (config.output_types.variants) prompt += '- Variant files\n';
  
  prompt += '\n━━━━━━━━━━━━━━━━━━━\n';
  prompt += 'DESIGN TOKENS\n';
  prompt += '━━━━━━━━━━━━━━━━━━━\n\n';
  
  if (config.design_system) {
    prompt += `Use these design tokens:
- --sl-color-primary
- --sl-radius
- --sl-font-family
- --sl-shadow\n\n`;
  }
  
  prompt += 'Generate the requested files now.';
  
  return prompt;
}
