/**
 * Generate Action Embed
 * CTA button to trigger code generation
 */

import { BaseEmbed } from '../lib/base-embed';

export class GenerateActionEmbed extends BaseEmbed {
  private isGenerating: boolean = false;
  private enabled: boolean = false;

  protected render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--sl-font-family, system-ui, -apple-system, sans-serif);
        }

        .action-container {
          padding: 24px;
          text-align: center;
        }

        .generate-button {
          padding: 16px 48px;
          font-size: 18px;
          font-weight: 600;
          background: var(--sl-color-primary, #0066cc);
          color: white;
          border: none;
          border-radius: var(--sl-radius, 8px);
          cursor: pointer;
          box-shadow: var(--sl-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
          transition: all 0.2s ease;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
        }

        .generate-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .generate-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .generate-button.generating {
          background: #28a745;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>

      <div class="action-container">
        <button class="generate-button" id="generateButton" disabled>
          Generate Code
        </button>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const button = this.shadow.getElementById('generateButton');
    button?.addEventListener('click', () => this.handleGenerate());
  }

  private handleGenerate(): void {
    if (this.isGenerating) return;

    this.isGenerating = true;
    this.updateButtonState();

    this.dispatchEvent(new CustomEvent('generate:start', {
      bubbles: true,
      composed: true
    }));
  }

  private updateButtonState(): void {
    const button = this.shadow.getElementById('generateButton');
    if (!button) return;

    if (this.isGenerating) {
      button.classList.add('generating');
      button.innerHTML = '<span class="spinner"></span>Generating...';
    } else {
      button.classList.remove('generating');
      button.innerHTML = 'Generate Code';
      (button as HTMLButtonElement).disabled = !this.enabled;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    const button = this.shadow.getElementById('generateButton') as HTMLButtonElement;
    if (button && !this.isGenerating) {
      button.disabled = !enabled;
    }
  }

  public setGenerating(generating: boolean): void {
    this.isGenerating = generating;
    this.updateButtonState();
  }
}

customElements.define('generate-action', GenerateActionEmbed);
