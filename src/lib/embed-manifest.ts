/**
 * Embed manifest metadata
 * Defines how embeds appear in the marketplace and IDE
 */

export interface EmbedManifest {
  /**
   * Web Component tag name (e.g., 'sl-feature-card-embed')
   */
  tag: string;
  
  /**
   * Display name for the embed
   */
  name: string;
  
  /**
   * Category classification
   */
  category: 'layout' | 'interaction' | 'media' | 'content' | 'utility' | 'generator';
  
  /**
   * Default properties for the embed
   */
  defaultProps?: Record<string, any>;
  
  /**
   * Description of what the embed does
   */
  description?: string;
  
  /**
   * Version of the embed
   */
  version?: string;
}
