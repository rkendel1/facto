# Game Mode Architecture

A render-only game development framework with proper separation of concerns.

## Architecture Overview

```
src/lib/game/
├── types.ts          # Type definitions (GameState, GameAction, GameCard, etc.)
├── store.ts          # State management with pub-sub pattern
├── engine.ts         # Base game logic class + utilities
├── game-layout.ts    # Reusable layout helpers (4:3 aspect ratio)
└── index.ts          # Main entry point
```

## Core Principles

1. **Separation of Concerns**: Game logic completely separated from rendering
2. **Reactive Updates**: UI automatically updates when state changes
3. **Reusable Components**: Layout helpers and base classes for all games
4. **Type Safety**: Full TypeScript support with generics
5. **Testable**: Engine logic can be tested independently

## Creating a New Game

### 1. Define Your Game State

```typescript
import type { GameState } from '../lib/game';

interface MyGameState extends GameState {
  // Add your custom state properties
  level: number;
  lives: number;
  // ... etc
}
```

### 2. Create Game Engine (Logic Only)

```typescript
import { GameEngine } from '../lib/game';

class MyGameEngine extends GameEngine<MyGameState> {
  constructor() {
    super({
      status: 'idle',
      score: 0,
      level: 1,
      lives: 3
    });
  }

  // Implement game logic methods
  protected onStart(): void {
    // Initialize game
  }

  protected onPause(): void {
    // Handle pause
  }

  protected onResume(): void {
    // Handle resume
  }

  protected onReset(): void {
    // Reset game
  }

  protected onEnd(won: boolean): void {
    // Handle game end
  }

  protected onConfigChange(config: GameConfig): void {
    // Handle config changes
  }

  protected onDestroy(): void {
    // Cleanup
  }

  // Add your custom game methods
  public makeMove(data: any): void {
    const state = this.store.getState();
    // Update state based on move
    this.store.dispatch(
      { type: 'MAKE_MOVE', payload: data },
      { /* updated state */ }
    );
  }
}
```

### 3. Create Render-Only Component

```typescript
import { BaseEmbed } from '../lib/base-embed';
import { renderGameSurface, gameSurfaceCss, gameTokensCss } from '../lib/game';
import type { EmbedManifest } from '../lib/embed-manifest';

export class MyGameEmbed extends BaseEmbed {
  static manifest: EmbedManifest = {
    tag: 'my-game',
    name: 'My Game',
    category: 'interaction',
    description: 'Description of my game',
    version: '1.0.0'
  };

  private engine: MyGameEngine;
  private unsubscribe?: () => void;

  constructor() {
    super();
    this.engine = new MyGameEngine();
  }

  connectedCallback(): void {
    super.connectedCallback();
    
    // Subscribe to state changes
    this.unsubscribe = this.engine.subscribe(state => {
      this.render();
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.engine.destroy();
  }

  protected render(): void {
    const state = this.engine.getStore().getState();
    
    // Render header
    const header = this.renderHeader(state);
    
    // Render content
    const content = this.renderContent(state);
    
    // Use game layout helper
    const gameHtml = renderGameSurface(header, content);
    
    this.root.innerHTML = `
      <style>
        ${gameSurfaceCss}
        ${gameTokensCss}
        ${this.getCustomStyles()}
      </style>
      ${gameHtml}
    `;
    
    // Attach event listeners
    this.attachEventListeners();
  }

  private renderHeader(state: MyGameState): string {
    return `
      <div class="header">
        <div>Score: ${state.score}</div>
        <div>Level: ${state.level}</div>
        <button class="btn-start">Start</button>
      </div>
    `;
  }

  private renderContent(state: MyGameState): string {
    // Render game content based on state
    return `<div class="game-content">...</div>`;
  }

  private getCustomStyles(): string {
    return `
      /* Your custom styles */
    `;
  }

  private attachEventListeners(): void {
    // Attach event listeners and call engine methods
    const startBtn = this.root.querySelector('.btn-start');
    startBtn?.addEventListener('click', () => {
      this.engine.start();
    });
  }
}

customElements.define('my-game', MyGameEmbed);
```

## Game Layout Helpers

### renderGameSurface(header, content)

Creates a 4:3 aspect ratio game container:

```typescript
const html = renderGameSurface(
  `<div>Header content</div>`,
  `<div>Game content</div>`
);
```

### gameSurfaceCss

Provides responsive game surface styling:
- 4:3 aspect ratio
- Max height: 90vh
- Responsive max-widths: 720px (tablet), 960px (desktop)
- Dark background: `var(--game-surface-bg, #0b0b0b)`

### gameTokensCss

Provides responsive card/element sizing:
- Desktop: `--card-w: 60px`, `--card-h: 84px`
- Mobile (≤480px): `--card-w: 50px`, `--card-h: 70px`

## GameStore API

```typescript
// Get current state (read-only)
const state = store.getState();

// Update state
store.setState({ score: 100 });

// Dispatch action with state update
store.dispatch(
  { type: 'SCORE_UPDATE', payload: 100 },
  { score: 100 }
);

// Subscribe to changes
const unsubscribe = store.subscribe(state => {
  console.log('State changed:', state);
});

// Unsubscribe
unsubscribe();

// Reset to initial state
store.reset(initialState);

// Get action history (for debugging)
const history = store.getHistory();
```

## GameEngine API

```typescript
// Start the game
engine.start();

// Pause the game
engine.pause();

// Resume the game
engine.resume();

// Reset the game
engine.reset();

// End the game
engine.end(won: boolean);

// Get the store
const store = engine.getStore();

// Subscribe to state changes
const unsubscribe = engine.subscribe(state => {
  // Handle state change
});

// Update configuration
engine.updateConfig({ difficulty: 'hard' });

// Cleanup
engine.destroy();
```

## Utility Functions

```typescript
import { shuffleArray, generateId, calculateScore } from '../lib/game';

// Shuffle an array
const shuffled = shuffleArray([1, 2, 3, 4, 5]);

// Generate unique ID
const id = generateId(); // "1234567890-abc123def"

// Calculate score
const score = calculateScore(baseScore, timeElapsed, moves);
```

## Example: Memory Game

See `src/embeds/memory-game.ts` for a complete example demonstrating:
- Custom game state extending GameState
- GameEngine implementation with game rules
- Render-only component with reactive updates
- Card flip animations
- Win detection
- Score tracking

## Testing

Games can be tested independently:

```typescript
// Test game engine without DOM
describe('MyGameEngine', () => {
  it('should update score when move is made', () => {
    const engine = new MyGameEngine();
    engine.start();
    
    engine.makeMove({ /* data */ });
    
    const state = engine.getStore().getState();
    expect(state.score).toBe(expectedScore);
  });
});
```

## Best Practices

1. **Never mix logic and rendering**: Engine should have zero DOM manipulation
2. **Use the store for all state**: Don't maintain state outside GameStore
3. **Subscribe to changes in connectedCallback**: Always unsubscribe in disconnectedCallback
4. **Use layout helpers**: Ensure consistent sizing across games
5. **Extend base interfaces**: Use GameState, GameAction as foundations
6. **Record actions**: Use dispatch() to maintain action history for debugging

## Demo

Run the demo:

```bash
npm run build
python3 -m http.server 8000
# Visit http://localhost:8000/game-demo.html
```
