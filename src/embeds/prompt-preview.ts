/**
 * Prompt Preview Embed
 * Shows the final compiled prompt that will be sent to the LLM
 */

import { BaseEmbed } from '../lib/base-embed';

export class PromptPreviewEmbed extends BaseEmbed {
  private prompt: string = '';

  protected render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--sl-font-family, system-ui, -apple-system, sans-serif);
        }

        .preview-container {
          padding: 24px;
          background: #ffffff;
          border-radius: var(--sl-radius, 8px);
          box-shadow: var(--sl-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
        }

        .preview-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: var(--sl-color-primary, #0066cc);
        }

        .prompt-display {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: var(--sl-radius, 4px);
          padding: 16px;
          font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
          max-height: 400px;
          overflow-y: auto;
          color: #212529;
        }

        .empty-state {
          color: #6c757d;
          font-style: italic;
          text-align: center;
          padding: 40px;
        }

        .copy-button {
          margin-top: 12px;
          padding: 8px 16px;
          background: var(--sl-color-primary, #0066cc);
          color: white;
          border: none;
          border-radius: var(--sl-radius, 4px);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .copy-button:hover {
          opacity: 0.9;
        }

        .copy-button.copied {
          background: #28a745;
        }
      </style>

      <div class="preview-container">
        <h3 class="preview-title">Prompt Preview</h3>
        <div class="prompt-display" id="promptDisplay">
          <div class="empty-state">Fill out the form to see the generated prompt</div>
        </div>
        <button class="copy-button" id="copyButton" style="display: none;">Copy Prompt</button>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const copyButton = this.shadow.getElementById('copyButton');
    copyButton?.addEventListener('click', () => this.copyPrompt());
  }

  private copyPrompt(): void {
    if (!this.prompt) return;

    navigator.clipboard.writeText(this.prompt).then(() => {
      const copyButton = this.shadow.getElementById('copyButton');
      if (copyButton) {
        copyButton.textContent = '✓ Copied!';
        copyButton.classList.add('copied');
        setTimeout(() => {
          copyButton.textContent = 'Copy Prompt';
          copyButton.classList.remove('copied');
        }, 2000);
      }
    });
  }

  public updatePrompt(prompt: string): void {
    this.prompt = prompt;
    const display = this.shadow.getElementById('promptDisplay');
    const copyButton = this.shadow.getElementById('copyButton');

    if (display) {
      if (prompt) {
        display.textContent = prompt;
        if (copyButton) copyButton.style.display = 'block';
      } else {
        display.innerHTML = '<div class="empty-state">Fill out the form to see the generated prompt</div>';
        if (copyButton) copyButton.style.display = 'none';
      }
    }
  }
}

customElements.define('prompt-preview', PromptPreviewEmbed);
