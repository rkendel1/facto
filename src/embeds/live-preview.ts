/**
 * Live Preview Embed (Optional Variant)
 * Renders generated embeds using the runtime
 */

import { BaseEmbed } from '../lib/base-embed';

export class LivePreviewEmbed extends BaseEmbed {
  private previewContent: string = '';

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

        .preview-frame {
          border: 2px solid #dee2e6;
          border-radius: var(--sl-radius, 4px);
          padding: 20px;
          background: #f8f9fa;
          min-height: 200px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-message {
          font-size: 16px;
        }

        .preview-content {
          background: white;
          border-radius: var(--sl-radius, 4px);
          padding: 16px;
        }

        .error-message {
          color: #dc3545;
          background: #f8d7da;
          border: 1px solid #f5c2c7;
          border-radius: var(--sl-radius, 4px);
          padding: 12px;
          margin-top: 12px;
        }
      </style>

      <div class="preview-container">
        <h3 class="preview-title">Live Preview</h3>
        <div class="preview-frame" id="previewFrame">
          <div class="empty-state">
            <div class="empty-icon">👁️</div>
            <div class="empty-message">Generate code to see a live preview</div>
          </div>
        </div>
      </div>
    `;
  }

  public updatePreview(content: string): void {
    this.previewContent = content;
    const previewFrame = this.shadow.getElementById('previewFrame');
    
    if (!previewFrame) return;

    if (!content) {
      previewFrame.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">👁️</div>
          <div class="empty-message">Generate code to see a live preview</div>
        </div>
      `;
      return;
    }

    try {
      // In a real implementation, this would compile and execute the TypeScript
      // For now, we'll show a placeholder
      previewFrame.innerHTML = `
        <div class="preview-content">
          <div class="empty-icon" style="text-align: center; font-size: 32px;">🚀</div>
          <p style="text-align: center; color: #28a745; margin-top: 8px;">
            Preview functionality would render the generated embed here
          </p>
          <div class="error-message">
            Note: Full runtime preview requires TypeScript compilation and embed registration.
            This is a placeholder showing where the live preview would appear.
          </div>
        </div>
      `;
    } catch (error) {
      previewFrame.innerHTML = `
        <div class="error-message">
          Failed to render preview: ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
      `;
    }
  }

  public clearPreview(): void {
    this.updatePreview('');
  }
}

customElements.define('live-preview', LivePreviewEmbed);
