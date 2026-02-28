/**
 * Settings Embed
 * Configure OpenAI API key and other settings
 */

import { BaseEmbed } from '../lib/base-embed';
import type { EmbedManifest } from '../lib/embed-manifest';

export class SettingsEmbed extends BaseEmbed {
  /**
   * Embed manifest metadata
   */
  static manifest: EmbedManifest = {
    tag: 'settings-embed',
    name: 'Settings',
    category: 'utility',
    description: 'Configuration panel for API keys and settings',
    version: '1.0.0',
    defaultProps: {
      brand_colors_primary: '#0066cc',
      brand_colors_surface: '#ffffff'
    }
  };

  protected render(): void {
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const hasApiKey = savedApiKey.length > 0;

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--sl-font-family, system-ui, -apple-system, sans-serif);
        }

        .settings-container {
          padding: 24px;
          background: #ffffff;
          border-radius: var(--sl-radius, 8px);
          box-shadow: var(--sl-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
          margin-bottom: 24px;
        }

        .settings-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: var(--sl-color-primary, #0066cc);
        }

        .form-group {
          margin-bottom: 16px;
        }

        label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          color: #333;
        }

        input[type="text"],
        input[type="password"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: var(--sl-radius, 4px);
          font-family: inherit;
          font-size: 14px;
        }

        .input-group {
          display: flex;
          gap: 8px;
        }

        .input-group input {
          flex: 1;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: var(--sl-radius, 4px);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .btn:hover {
          opacity: 0.9;
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

        .status {
          padding: 12px;
          border-radius: var(--sl-radius, 4px);
          margin-top: 12px;
          font-size: 14px;
        }

        .status.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .status.info {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .help-text {
          font-size: 13px;
          color: #6c757d;
          margin-top: 4px;
        }

        .key-masked {
          font-family: monospace;
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          display: inline-block;
        }
      </style>

      <div class="settings-container">
        <h3 class="settings-title">⚙️ OpenAI Settings</h3>

        <div class="form-group">
          <label for="apiKey">OpenAI API Key</label>
          <div class="input-group">
            <input 
              type="password" 
              id="apiKey" 
              placeholder="sk-..." 
              value="${this.maskApiKey(savedApiKey)}"
            />
            <button class="btn btn-primary" id="saveBtn">Save</button>
            ${hasApiKey ? '<button class="btn btn-danger" id="clearBtn">Clear</button>' : ''}
          </div>
          <div class="help-text">
            Your API key is stored securely in browser localStorage. 
            Get your key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>.
          </div>
        </div>

        <div id="statusMessage"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  private maskApiKey(key: string): string {
    if (!key || key.length < 8) return '';
    return key.substring(0, 7) + '•'.repeat(Math.min(20, key.length - 7));
  }

  private attachEventListeners(): void {
    const saveBtn = this.shadow.getElementById('saveBtn');
    const clearBtn = this.shadow.getElementById('clearBtn');
    const apiKeyInput = this.shadow.getElementById('apiKey') as HTMLInputElement;

    saveBtn?.addEventListener('click', () => this.saveApiKey());
    clearBtn?.addEventListener('click', () => this.clearApiKey());
    
    apiKeyInput?.addEventListener('focus', () => {
      const saved = localStorage.getItem('openai_api_key');
      if (saved) {
        apiKeyInput.value = saved;
      }
    });
  }

  private saveApiKey(): void {
    const apiKeyInput = this.shadow.getElementById('apiKey') as HTMLInputElement;
    const apiKey = apiKeyInput?.value.trim();

    if (!apiKey) {
      this.showStatus('Please enter an API key', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      this.showStatus('Invalid API key format. OpenAI keys start with "sk-"', 'error');
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    this.showStatus('API key saved successfully!', 'success');
    
    // Dispatch event to notify app
    this.dispatchEvent(new CustomEvent('apikey:saved', {
      bubbles: true,
      composed: true,
      detail: { apiKey }
    }));

    // Re-render to show masked key
    setTimeout(() => this.render(), 1000);
  }

  private clearApiKey(): void {
    const confirmClear = this.showConfirm('Are you sure you want to remove the saved API key?');
    if (confirmClear) {
      localStorage.removeItem('openai_api_key');
      this.showStatus('API key cleared', 'info');
      
      this.dispatchEvent(new CustomEvent('apikey:cleared', {
        bubbles: true,
        composed: true
      }));

      setTimeout(() => this.render(), 1000);
    }
  }

  private showConfirm(message: string): boolean {
    // Simple inline confirmation - in a production app, use a modal
    return confirm(message);
  }

  private showStatus(message: string, type: 'success' | 'error' | 'info'): void {
    const statusDiv = this.shadow.getElementById('statusMessage');
    if (!statusDiv) return;

    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    setTimeout(() => {
      statusDiv.innerHTML = '';
    }, 5000);
  }
}

customElements.define('settings-embed', SettingsEmbed);
