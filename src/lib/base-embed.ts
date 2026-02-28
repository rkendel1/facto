/**
 * Base Embed Class
 * Foundation for all StackLive render-only embeds
 */

export abstract class BaseEmbed extends HTMLElement {
  protected shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.dispatchEvent(new CustomEvent('embed:render', {
      bubbles: true,
      composed: true
    }));
  }

  protected abstract render(): void;
}
