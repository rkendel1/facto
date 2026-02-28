/**
 * Configuration metadata for embeds
 * Used to auto-generate UI forms and validators
 */

export interface EmbedConfigField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  label?: string;
  description?: string;
  default?: any;
  required?: boolean;
  options?: any[];
}

export interface EmbedConfigMetadata {
  fields: EmbedConfigField[];
  version?: string;
}
