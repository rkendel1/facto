/**
 * @file base-embed.ts
 * @description Base Production Embed Class
 * 
 * Standardizes lifecycle, runtime wiring, and marketplace packaging
 * for all production embeds.
 */

import type { EmbedProps, EmbedContext, EmbedConfig, EmbedRuntime, ContextChangeSet, ContextSubscriber, RuntimeContext } from './types';
import { BRAND_COLORS_DEFAULTS, EMBED_CONTRACT_V1_DEFAULTS } from './embed-shared/embedContractProps';
import { enableContextSync } from './runtime-mocks/context-sync';
import { WasmContextRuntime } from './runtime-mocks/runtime';
import { applyCssVariables, applyVoice, applyAccessibility } from './runtime-mocks/dom-application';

/**
 * Base class for all production embeds
 * 
 * Each embed:
 * - is a custom element (extends HTMLElement)
 * - accepts: context, variant, config, runtime
 * - emits experience signals
 * - contains NO capability logic
 * - includes embed contract properties by default
 */
export abstract class BaseEmbed extends HTMLElement {
  /**
   * Runtime context dimensions
   */
  protected context?: EmbedContext;
  
  /**
   * Current variant identifier
   */
  protected variant?: string;
  
  /**
   * Embed-specific configuration
   */
  protected config?: EmbedConfig;
  
  /**
   * Runtime instance for signal emission
   */
  protected runtime?: EmbedRuntime;
  
  /**
   * Shadow root for encapsulation
   */
  protected root: ShadowRoot;
  
  /**
   * WASM Context Bridge unsubscribe function
   * Protected so subclasses can override subscription logic if needed
   */
  protected wasmUnsubscribe?: () => void;
  
  /**
   * New WASM Context Runtime unsubscribe function
   * Manages scoped context subscriptions
   */
  protected wasmRuntimeUnsubscribe?: () => void;
  
  /**
   * Context Sync session ID for Live Context Switcher
   */
  private contextSyncSessionId?: string;
  
  /**
   * Context Sync cleanup function
   */
  private contextSyncCleanup?: () => void;
  
  /**
   * Context scope ID for isolated runtime instances
   * Defaults to "global" for backward compatibility
   */
  protected scopeId: string = 'global';
  
  /**
   * Component keys - defines which context keys this embed cares about
   * Only rerender if these keys change
   */
  protected componentKeys?: string[] = undefined;
  
  /**
   * Supported contract versions
   * Can be overridden by subclasses to declare compatibility
   */
  static supportedContracts: string[] = ["1.x"];
  
  /**
   * Get configuration metadata for this embed type
   * 
   * Override this in subclasses to define configuration fields.
   * Used to auto-generate:
   * - UI form configurations (embed-config-registry.js)
   * - Convex validators (component_props.ts)
   * 
   * @returns Configuration metadata or null if not defined
   */
  static getConfigMetadata(): import('./config-metadata').EmbedConfigMetadata | null {
    return null;
  }
  
  // ============================================================================
  // EMBED CONTRACT V1 PROPERTIES
  // All embeds automatically inherit these properties
  // ============================================================================
  
  /**
   * API host URL for backend communication
   */
  api_host = EMBED_CONTRACT_V1_DEFAULTS.api_host;
  
  /**
   * Brand color - primary
   */
  brand_colors_primary = BRAND_COLORS_DEFAULTS.primary;
  
  /**
   * Brand color - text primary
   */
  brand_colors_text_primary = BRAND_COLORS_DEFAULTS.text_primary;
  
  /**
   * Brand color - text secondary
   */
  brand_colors_text_secondary = BRAND_COLORS_DEFAULTS.text_secondary;
  
  /**
   * Brand color - secondary
   */
  brand_colors_secondary = BRAND_COLORS_DEFAULTS.secondary;
  
  /**
   * Brand color - text on primary background
   */
  brand_colors_text_on_primary = BRAND_COLORS_DEFAULTS.text_on_primary;
  
  /**
   * Brand color - surface
   */
  brand_colors_surface = BRAND_COLORS_DEFAULTS.surface;
  
  /**
   * Brand color - alternate surface
   */
  brand_colors_surface_alt = BRAND_COLORS_DEFAULTS.surface_alt;
  
  /**
   * Brand color - border
   */
  brand_colors_border = BRAND_COLORS_DEFAULTS.border;
  
  /**
   * Domain for the embed
   */
  domain = EMBED_CONTRACT_V1_DEFAULTS.domain;
  
  /**
   * Environment (production, staging, development)
   */
  environment = EMBED_CONTRACT_V1_DEFAULTS.environment;
  
  /**
   * Preview mode flag
   */
  preview_mode = EMBED_CONTRACT_V1_DEFAULTS.preview_mode;
  
  /**
   * Component ID (for context switching)
   */
  component_id = EMBED_CONTRACT_V1_DEFAULTS.component_id;
  
  /**
   * Embed ID (alternative to component_id, for backward compatibility)
   */
  embed_id = '';
  
  /**
   * Instance ID
   */
  instance_id = EMBED_CONTRACT_V1_DEFAULTS.instance_id;
  
  /**
   * Auto-load flag
   */
  auto_load = EMBED_CONTRACT_V1_DEFAULTS.auto_load;
  
  /**
   * Disabled flag
   */
  disabled = EMBED_CONTRACT_V1_DEFAULTS.disabled;
  
  // ============================================================================
  // TYPOGRAPHY & STYLING PROPERTIES
  // Multi-level styling support for embeds and apps
  // ============================================================================
  
  /**
   * Body font family
   */
  font_family_body = '';
  
  /**
   * Heading font family
   */
  font_family_heading = '';
  
  /**
   * Body font file URL (optional, for web font loading)
   */
  font_file_body = '';
  
  /**
   * Heading font file URL (optional, for web font loading)
   */
  font_file_heading = '';
  
  /**
   * Base font size in pixels
   */
  font_size_base = 16;
  
  /**
   * Border radius tokens
   */
  brand_radius: any = undefined;
  
  /**
   * Shadow tokens
   */
  brand_shadow: any = undefined;
  
  /**
   * Spacing tokens
   */
  brand_spacing: any = undefined;
  
  /**
   * Voice configuration for text transformation
   */
  brand_voice: any = undefined;
  
  /**
   * Surface type ('embed' or 'app')
   */
  surface = 'embed';
  
  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.initializeContractProps();
  }
  
  /**
   * Initialize embed contract properties
   * Can be overridden by subclasses to customize initialization
   */
  protected initializeContractProps(): void {
    // Default implementation - properties are already set via class field initializers
    // Subclasses can override to add custom initialization logic
  }
  
  /**
   * Get CSS custom properties string for brand colors, typography, and styling
   * Returns inline style string with --sl-* CSS variables
   * 
   * Supported CSS variables:
   * - --sl-color-primary
   * - --sl-color-secondary
   * - --sl-color-background (surface)
   * - --sl-color-surface-alt
   * - --sl-color-text-primary
   * - --sl-color-text-secondary
   * - --sl-color-text-on-primary
   * - --sl-color-border
   * - --sl-font-body
   * - --sl-font-heading
   * - --sl-font-size-base
   * - --sl-radius-default
   * - --sl-shadow-default
   * - --sl-spacing-4
   * 
   * @returns CSS inline style string
   */
  protected getContractStyles(): string {
    const vars: string[] = [
      `--sl-color-primary: ${this.brand_colors_primary}`,
      `--sl-color-secondary: ${this.brand_colors_secondary}`,
      `--sl-color-background: ${this.brand_colors_surface}`,
      `--sl-color-surface-alt: ${this.brand_colors_surface_alt}`,
      `--sl-color-text-primary: ${this.brand_colors_text_primary}`,
      `--sl-color-text-secondary: ${this.brand_colors_text_secondary}`,
      `--sl-color-text-on-primary: ${this.brand_colors_text_on_primary}`,
      `--sl-color-border: ${this.brand_colors_border}`,
    ];
    
    // Add typography variables if set
    if (this.font_family_body) {
      vars.push(`--sl-font-body: ${this.font_family_body}`);
    }
    if (this.font_family_heading) {
      vars.push(`--sl-font-heading: ${this.font_family_heading}`);
    }
    if (this.font_size_base) {
      vars.push(`--sl-font-size-base: ${this.font_size_base}px`);
    }
    
    // Add radius variables if set
    if (this.brand_radius) {
      if (this.brand_radius.default) {
        vars.push(`--sl-radius-default: ${this.brand_radius.default}`);
      }
      if (this.brand_radius.small) {
        vars.push(`--sl-radius-small: ${this.brand_radius.small}`);
      }
      if (this.brand_radius.large) {
        vars.push(`--sl-radius-large: ${this.brand_radius.large}`);
      }
    }
    
    // Add shadow variables if set
    if (this.brand_shadow) {
      if (this.brand_shadow.default) {
        vars.push(`--sl-shadow-default: ${this.brand_shadow.default}`);
      }
      if (this.brand_shadow.small) {
        vars.push(`--sl-shadow-small: ${this.brand_shadow.small}`);
      }
      if (this.brand_shadow.large) {
        vars.push(`--sl-shadow-large: ${this.brand_shadow.large}`);
      }
    }
    
    // Add spacing variables if set
    if (this.brand_spacing) {
      if (this.brand_spacing.xs) {
        vars.push(`--sl-spacing-1: ${this.brand_spacing.xs}`);
      }
      if (this.brand_spacing.sm) {
        vars.push(`--sl-spacing-2: ${this.brand_spacing.sm}`);
      }
      if (this.brand_spacing.md) {
        vars.push(`--sl-spacing-4: ${this.brand_spacing.md}`);
      }
      if (this.brand_spacing.lg) {
        vars.push(`--sl-spacing-6: ${this.brand_spacing.lg}`);
      }
      if (this.brand_spacing.xl) {
        vars.push(`--sl-spacing-8: ${this.brand_spacing.xl}`);
      }
    }
    
    return vars.join('; ');
  }
  
  /**
   * Set all props at once and trigger render
   */
  setProps(props: EmbedProps): void {
    if (props.context !== undefined) this.context = props.context;
    if (props.variant !== undefined) this.variant = props.variant;
    if (props.config !== undefined) this.config = props.config;
    if (props.runtime !== undefined) this.runtime = props.runtime;
    
    this.render();
  }
  
  /**
   * Emit an experience signal
   */
  protected emit(signal: string, payload?: any): void {
    if (this.runtime) {
      this.runtime.emit(signal, payload);
    }
    
    // Also dispatch as custom event for direct listeners
    this.dispatchEvent(new CustomEvent(signal, {
      detail: payload,
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Subscribe to runtime signals
   */
  protected subscribe(signal: string, handler: (payload: any) => void): () => void {
    if (this.runtime) {
      return this.runtime.subscribe(signal, handler);
    }
    return () => {};
  }
  
  /**
   * Create or join a multiplayer session
   * 
   * @param sessionId - Optional session ID to join. If not provided, creates new session.
   * @param options - Session options (userId, role, metadata)
   * @returns Session handle with methods to interact with the session
   */
  protected createMultiplayerSession(sessionId?: string, options?: {
    userId?: string;
    role?: 'host' | 'creator' | 'player' | 'viewer';
    metadata?: Record<string, any>;
  }): { sessionId: string; leave: () => void } {
    // Mock implementation
    // In production, would create/join actual multiplayer session
    const mockSessionId = sessionId || `session-${Date.now()}`;
    
    return {
      sessionId: mockSessionId,
      leave: () => {
        // Cleanup session
      }
    };
  }
  
  /**
   * Web Component lifecycle - element added to DOM
   */
  connectedCallback() {
    this.render();
    this.dispatchEvent(new CustomEvent('embed:render', {
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Web Component lifecycle - element removed from DOM
   */
  disconnectedCallback() {
    // Cleanup context subscriptions
    if (this.wasmUnsubscribe) {
      this.wasmUnsubscribe();
      this.wasmUnsubscribe = undefined;
    }
    
    if (this.wasmRuntimeUnsubscribe) {
      this.wasmRuntimeUnsubscribe();
      this.wasmRuntimeUnsubscribe = undefined;
    }
    
    if (this.contextSyncCleanup) {
      this.contextSyncCleanup();
      this.contextSyncCleanup = undefined;
    }
  }
  
  /**
   * Render method - must be implemented by subclasses
   */
  protected abstract render(): void;
  
  /**
   * Deprecated: Use root instead
   * Kept for backward compatibility
   */
  protected get shadow(): ShadowRoot {
    return this.root;
  }
}
