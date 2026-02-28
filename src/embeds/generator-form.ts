/**
 * Generator Form Embed
 * Structured form for describing what to generate
 */

import { BaseEmbed } from '../lib/base-embed';
import type { GeneratorConfig } from '../lib/prompt-compiler';
import type { EmbedManifest } from '../lib/embed-manifest';

export class GeneratorFormEmbed extends BaseEmbed {
  /**
   * Embed manifest metadata
   */
  static manifest: EmbedManifest = {
    tag: 'generator-form',
    name: 'Generator Form',
    category: 'generator',
    description: 'Structured form for describing code generation requirements',
    version: '1.0.0',
    defaultProps: {
      brand_colors_primary: '#0066cc',
      brand_colors_surface: '#ffffff'
    }
  };

  private generatorConfig: GeneratorConfig = {
    mode: 'single-embed',
    name: '',
    description: '',
    embeds: [],
    design_system: true,
    context_aware: false,
    output_types: {
      embed: true,
      app: false,
      manifest: false,
      variants: false
    }
  };

  protected render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--sl-font-family, system-ui, -apple-system, sans-serif);
        }

        .form-container {
          padding: 24px;
          background: #ffffff;
          border-radius: var(--sl-radius, 8px);
          box-shadow: var(--sl-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
        }

        .form-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 24px 0;
          color: var(--sl-color-primary, #0066cc);
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          color: #333;
        }

        input[type="text"],
        textarea,
        select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: var(--sl-radius, 4px);
          font-family: inherit;
          font-size: 14px;
        }

        textarea {
          min-height: 80px;
          resize: vertical;
        }

        .checkbox-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .embeds-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .embed-item {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .embed-item input {
          flex: 1;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: var(--sl-radius, 4px);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-primary {
          background: var(--sl-color-primary, #0066cc);
          color: white;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn:hover {
          opacity: 0.9;
        }
      </style>

      <div class="form-container">
        <h2 class="form-title">StackLive Code Generator</h2>

        <div class="form-group">
          <label for="mode">Generation Mode</label>
          <select id="mode">
            <option value="single-embed">Single Embed</option>
            <option value="multi-embed-app">Multi-Embed App</option>
            <option value="embed-library">Embed Library</option>
          </select>
        </div>

        <div class="form-group">
          <label for="name">Project Name</label>
          <input type="text" id="name" placeholder="my-awesome-embed" />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" placeholder="Describe what you want to generate..."></textarea>
        </div>

        <div class="form-group">
          <label>Embeds to Generate</label>
          <div class="embeds-list" id="embedsList"></div>
          <button class="btn btn-secondary" id="addEmbed">+ Add Embed</button>
        </div>

        <div class="form-group">
          <label>Options</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input type="checkbox" id="design_system" checked />
              <label for="design_system">Use Design System</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="context_aware" />
              <label for="context_aware">Context Aware</label>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Output Types</label>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input type="checkbox" id="output_embed" checked />
              <label for="output_embed">Embed Files</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="output_app" />
              <label for="output_app">App Structure</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="output_manifest" />
              <label for="output_manifest">Manifest</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="output_variants" />
              <label for="output_variants">Variants</label>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const addEmbedBtn = this.shadow.getElementById('addEmbed');
    addEmbedBtn?.addEventListener('click', () => this.addEmbedField());

    // Listen to changes and emit config updates
    const inputs = this.shadow.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', () => this.updateConfig());
      input.addEventListener('input', () => this.updateConfig());
    });
  }

  private addEmbedField(value: string = ''): void {
    const embedsList = this.shadow.getElementById('embedsList');
    if (!embedsList) return;

    const embedItem = document.createElement('div');
    embedItem.className = 'embed-item';
    embedItem.innerHTML = `
      <input type="text" class="embed-name" placeholder="embed-name" value="${value}" />
      <button class="btn btn-danger remove-embed">Remove</button>
    `;

    const removeBtn = embedItem.querySelector('.remove-embed');
    removeBtn?.addEventListener('click', () => {
      embedItem.remove();
      this.updateConfig();
    });

    const input = embedItem.querySelector('.embed-name');
    input?.addEventListener('input', () => this.updateConfig());

    embedsList.appendChild(embedItem);
  }

  private updateConfig(): void {
    const mode = (this.shadow.getElementById('mode') as HTMLSelectElement)?.value as GeneratorConfig['mode'];
    const name = (this.shadow.getElementById('name') as HTMLInputElement)?.value || '';
    const description = (this.shadow.getElementById('description') as HTMLTextAreaElement)?.value || '';
    
    const embedInputs = this.shadow.querySelectorAll('.embed-name') as NodeListOf<HTMLInputElement>;
    const embeds = Array.from(embedInputs).map(input => input.value).filter(v => v);

    const design_system = (this.shadow.getElementById('design_system') as HTMLInputElement)?.checked || false;
    const context_aware = (this.shadow.getElementById('context_aware') as HTMLInputElement)?.checked || false;

    const output_embed = (this.shadow.getElementById('output_embed') as HTMLInputElement)?.checked || false;
    const output_app = (this.shadow.getElementById('output_app') as HTMLInputElement)?.checked || false;
    const output_manifest = (this.shadow.getElementById('output_manifest') as HTMLInputElement)?.checked || false;
    const output_variants = (this.shadow.getElementById('output_variants') as HTMLInputElement)?.checked || false;

    this.generatorConfig = {
      mode,
      name,
      description,
      embeds,
      design_system,
      context_aware,
      output_types: {
        embed: output_embed,
        app: output_app,
        manifest: output_manifest,
        variants: output_variants
      }
    };

    this.dispatchEvent(new CustomEvent('config:change', {
      detail: this.generatorConfig,
      bubbles: true,
      composed: true
    }));
  }

  public getConfig(): GeneratorConfig {
    return this.generatorConfig;
  }
}

customElements.define('generator-form', GeneratorFormEmbed);
