/**
 * File Output Embed
 * Displays generated files with copy and download functionality
 */

import { BaseEmbed } from '../lib/base-embed';
import type { GeneratedFile } from '../lib/llm-provider.interface';
import type { EmbedManifest } from '../lib/embed-manifest';

export class FileOutputEmbed extends BaseEmbed {
  /**
   * Embed manifest metadata
   */
  static manifest: EmbedManifest = {
    tag: 'file-output',
    name: 'File Output',
    category: 'content',
    description: 'Display generated code files with copy and download',
    version: '1.0.0',
    defaultProps: {
      brand_colors_primary: '#0066cc',
      brand_colors_surface: '#ffffff'
    }
  };

  private files: GeneratedFile[] = [];

  protected render(): void {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--sl-font-family, system-ui, -apple-system, sans-serif);
        }

        .output-container {
          padding: 24px;
          background: #ffffff;
          border-radius: var(--sl-radius, 8px);
          box-shadow: var(--sl-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
        }

        .output-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: var(--sl-color-primary, #0066cc);
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .file-card {
          border: 1px solid #dee2e6;
          border-radius: var(--sl-radius, 4px);
          overflow: hidden;
        }

        .file-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }

        .file-name {
          font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #212529;
        }

        .file-actions {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          border-radius: var(--sl-radius, 4px);
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn:hover {
          opacity: 0.8;
        }

        .btn-copy {
          background: var(--sl-color-primary, #0066cc);
          color: white;
        }

        .btn-copy.copied {
          background: #28a745;
        }

        .btn-download {
          background: #6c757d;
          color: white;
        }

        .file-content {
          padding: 16px;
          background: #f8f9fa;
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

        .download-all {
          margin-bottom: 16px;
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: var(--sl-radius, 4px);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .download-all:hover {
          opacity: 0.9;
        }
      </style>

      <div class="output-container">
        <h3 class="output-title">Generated Files</h3>
        <div id="filesList"></div>
      </div>
    `;
  }

  private renderFiles(): void {
    const filesList = this.shadow.getElementById('filesList');
    if (!filesList) return;

    if (this.files.length === 0) {
      filesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📄</div>
          <div class="empty-message">No files generated yet</div>
        </div>
      `;
      return;
    }

    filesList.innerHTML = `
      <button class="download-all" id="downloadAll">Download All Files</button>
      <div class="files-list" id="filesContainer"></div>
    `;

    const filesContainer = filesList.querySelector('#filesContainer');
    const downloadAllBtn = filesList.querySelector('#downloadAll');

    downloadAllBtn?.addEventListener('click', () => this.downloadAllFiles());

    this.files.forEach((file, index) => {
      const fileCard = document.createElement('div');
      fileCard.className = 'file-card';
      fileCard.innerHTML = `
        <div class="file-header">
          <span class="file-name">${this.escapeHtml(file.path)}</span>
          <div class="file-actions">
            <button class="btn btn-copy" data-index="${index}">Copy</button>
            <button class="btn btn-download" data-index="${index}">Download</button>
          </div>
        </div>
        <pre class="file-content">${this.escapeHtml(file.content)}</pre>
      `;

      const copyBtn = fileCard.querySelector('.btn-copy');
      const downloadBtn = fileCard.querySelector('.btn-download');

      copyBtn?.addEventListener('click', (e) => {
        const idx = parseInt((e.target as HTMLElement).dataset.index || '0');
        this.copyFile(idx, copyBtn as HTMLElement);
      });

      downloadBtn?.addEventListener('click', (e) => {
        const idx = parseInt((e.target as HTMLElement).dataset.index || '0');
        this.downloadFile(idx);
      });

      filesContainer?.appendChild(fileCard);
    });
  }

  private copyFile(index: number, button: HTMLElement): void {
    const file = this.files[index];
    if (!file) return;

    navigator.clipboard.writeText(file.content).then(() => {
      button.textContent = '✓ Copied!';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = 'Copy';
        button.classList.remove('copied');
      }, 2000);
    });
  }

  private downloadFile(index: number): void {
    const file = this.files[index];
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  private downloadAllFiles(): void {
    this.files.forEach((_, index) => {
      setTimeout(() => this.downloadFile(index), index * 100);
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  public setFiles(files: GeneratedFile[]): void {
    this.files = files;
    this.renderFiles();
  }

  public clearFiles(): void {
    this.files = [];
    this.renderFiles();
  }
}

customElements.define('file-output', FileOutputEmbed);
