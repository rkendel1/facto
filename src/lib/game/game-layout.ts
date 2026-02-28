/**
 * Game Layout Helper
 * 
 * Provides a standardized game surface layout with 4:3 aspect ratio.
 * All games should use this helper to ensure consistent behavior across devices.
 */

export const renderGameSurface = (header: string, content: string): string => `
  <div class="embed-card-container">
    <div class="game-frame">
      <div class="game-header">
        ${header}
      </div>

      <div class="game-viewport">
        ${content}
      </div>
    </div>
  </div>
`;

/**
 * Game Surface CSS
 * 
 * Standardized 4:3 aspect ratio game surface with responsive sizing
 */
export const gameSurfaceCss = `
:host {
  --game-max-width-tablet: 720px;
  --game-max-width-desktop: 960px;
}

/* width controller */
.embed-card-container {
  width: 100%;
  margin: 0 auto;
}

/* fixed-ratio surface */
.game-frame {
  width: 100%;
  aspect-ratio: 4 / 3;
  max-height: 90vh;

  border-radius: 12px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  background: var(--game-surface-bg, #0b0b0b);
}

/* fixed header */
.game-header {
  flex-shrink: 0;
}

/* scrolling play area */
.game-viewport {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

@media (min-width: 640px) {
  .embed-card-container {
    max-width: var(--game-max-width-tablet);
  }
}

@media (min-width: 1024px) {
  .embed-card-container {
    max-width: var(--game-max-width-desktop);
  }
}
`;

/**
 * Game Tokens CSS
 * 
 * Responsive sizing tokens for game cards and elements
 */
export const gameTokensCss = `
:host {
  --card-w: 60px;
  --card-h: 84px;
}

@media (max-width: 480px) {
  :host {
    --card-w: 50px;
    --card-h: 70px;
  }
}

.card,
.card-back,
.card-back-small {
  width: var(--card-w);
  height: var(--card-h);
}
`;
