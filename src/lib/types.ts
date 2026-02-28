/**
 * Type definitions for StackLive embeds
 */

/**
 * Embed context - runtime dimensions and state
 */
export interface EmbedContext {
  [key: string]: any;
}

/**
 * Embed configuration - embed-specific settings
 */
export interface EmbedConfig {
  [key: string]: any;
}

/**
 * Embed runtime - for signal emission and subscription
 */
export interface EmbedRuntime {
  emit(signal: string, payload?: any): void;
  subscribe(signal: string, handler: (payload: any) => void): () => void;
}

/**
 * Combined embed props
 */
export interface EmbedProps {
  context?: EmbedContext;
  variant?: string;
  config?: EmbedConfig;
  runtime?: EmbedRuntime;
}

/**
 * Context change set for WASM runtime
 */
export interface ContextChangeSet {
  [key: string]: any;
}

/**
 * Context subscriber callback
 */
export interface ContextSubscriber {
  (changes: ContextChangeSet): void;
}

/**
 * Runtime context resolution
 */
export interface RuntimeContext {
  [key: string]: any;
}
