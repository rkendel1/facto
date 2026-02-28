/**
 * LLM Integration Contract
 * Provides a vendor-agnostic interface for code generation
 */

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface CodegenProvider {
  generate(prompt: string): Promise<GeneratedFile[]>;
}
