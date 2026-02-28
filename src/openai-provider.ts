/**
 * OpenAI Code Generation Provider
 * Production-ready integration with OpenAI API
 */

import type { CodegenProvider, GeneratedFile } from './lib/llm-provider.interface';

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class OpenAICodegenProvider implements CodegenProvider {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  async generate(prompt: string): Promise<GeneratedFile[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a code generation assistant. Return ONLY code files in the format specified. Use this exact format for each file:\n\n```filepath: path/to/file.ts\n// code here\n```'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const generatedCode = data.choices[0].message.content;

      return this.parseGeneratedCode(generatedCode);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Code generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  private parseGeneratedCode(code: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    
    // Pattern 1: ```filepath: path/to/file.ts ... ```
    const filepathPattern = /```filepath:\s*(.+?)\n([\s\S]+?)```/g;
    let match;

    while ((match = filepathPattern.exec(code)) !== null) {
      const [, path, content] = match;
      files.push({
        path: path.trim(),
        content: content.trim()
      });
    }

    // Pattern 2: // File: path/to/file.ts followed by code block
    if (files.length === 0) {
      const fileCommentPattern = /\/\/\s*File:\s*(.+?)\n```(?:\w+)?\n([\s\S]+?)```/g;
      
      while ((match = fileCommentPattern.exec(code)) !== null) {
        const [, path, content] = match;
        files.push({
          path: path.trim(),
          content: content.trim()
        });
      }
    }

    // Pattern 3: Standard code blocks with language identifier
    if (files.length === 0) {
      const codeBlockPattern = /```(?:typescript|ts)?\s*(?:\/\/\s*)?(.+?\.ts)\n([\s\S]+?)```/g;
      
      while ((match = codeBlockPattern.exec(code)) !== null) {
        const [, path, content] = match;
        if (path && !path.includes('\n')) {
          files.push({
            path: path.trim(),
            content: content.trim()
          });
        }
      }
    }

    // If still no files found, create a single file with all code
    if (files.length === 0) {
      const allCodePattern = /```(?:typescript|ts)?\n([\s\S]+?)```/g;
      let allContent = '';
      
      while ((match = allCodePattern.exec(code)) !== null) {
        allContent += match[1] + '\n\n';
      }

      if (allContent) {
        files.push({
          path: 'src/generated/output.ts',
          content: allContent.trim()
        });
      }
    }

    return files;
  }
}

/**
 * Helper function to get OpenAI provider from environment or config
 */
export function createOpenAIProvider(): OpenAICodegenProvider {
  // Try to get API key from localStorage or window
  const apiKey = 
    (typeof window !== 'undefined' && (window as any).OPENAI_API_KEY) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('openai_api_key')) ||
    '';

  if (!apiKey) {
    throw new Error(
      'OpenAI API key not found. Please set it in the Settings panel or store it in localStorage with key "openai_api_key"'
    );
  }

  return new OpenAICodegenProvider({
    apiKey,
    model: 'gpt-4', // or 'gpt-4-turbo', 'gpt-3.5-turbo'
    maxTokens: 4096,
    temperature: 0.7
  });
}
