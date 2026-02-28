/**
 * Memory Game Embed
 * 
 * Example game using the render-only pattern with separated concerns:
 * - types.ts: State and action types
 * - engine.ts: Game logic
 * - store.ts: State management
 * - This file: Render-only UI
 */

import { BaseEmbed } from '../lib/base-embed';
import type { EmbedManifest } from '../lib/embed-manifest';
import {
  GameEngine,
  GameStore,
  renderGameSurface,
  gameSurfaceCss,
  gameTokensCss,
  shuffleArray,
  generateId
} from '../lib/game';
import type { GameState, GameCard } from '../lib/game';

/**
 * Memory game specific state
 */
interface MemoryGameState extends GameState {
  cards: GameCard[];
  flippedCards: string[];
  matchedCards: string[];
  attempts: number;
}

/**
 * Memory Game Engine
 * Pure game logic - no rendering
 */
class MemoryGameEngine extends GameEngine<MemoryGameState> {
  private cardValues = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎸'];
  
  constructor() {
    const cards = MemoryGameEngine.createCards(['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎸']);
    
    super({
      status: 'idle',
      score: 0,
      moves: 0,
      cards,
      flippedCards: [],
      matchedCards: [],
      attempts: 0
    });
  }
  
  /**
   * Create shuffled card pairs
   */
  private static createCards(values: string[]): GameCard[] {
    const pairs = values.flatMap(value => [
      { id: generateId(), value, faceUp: false },
      { id: generateId(), value, faceUp: false }
    ]);
    return shuffleArray(pairs);
  }
  
  /**
   * Flip a card
   */
  flipCard(cardId: string): void {
    const state = this.store.getState();
    
    if (state.status !== 'playing') {
      return;
    }
    
    // Can't flip if already flipped or matched
    if (state.flippedCards.includes(cardId) || state.matchedCards.includes(cardId)) {
      return;
    }
    
    // Can't flip more than 2 cards
    if (state.flippedCards.length >= 2) {
      return;
    }
    
    const newFlipped = [...state.flippedCards, cardId];
    
    this.store.dispatch(
      { type: 'FLIP_CARD', payload: cardId },
      { flippedCards: newFlipped }
    );
    
    // Check for match if 2 cards are flipped
    if (newFlipped.length === 2) {
      setTimeout(() => this.checkMatch(newFlipped), 600);
    }
  }
  
  /**
   * Check if flipped cards match
   */
  private checkMatch(flippedCards: string[]): void {
    const state = this.store.getState();
    const [card1Id, card2Id] = flippedCards;
    
    const card1 = state.cards.find(c => c.id === card1Id);
    const card2 = state.cards.find(c => c.id === card2Id);
    
    if (card1 && card2 && card1.value === card2.value) {
      // Match found!
      const newMatched = [...state.matchedCards, card1Id, card2Id];
      const newScore = state.score + 100;
      
      this.store.dispatch(
        { type: 'MATCH_FOUND', payload: flippedCards },
        {
          matchedCards: newMatched,
          flippedCards: [],
          score: newScore,
          attempts: state.attempts + 1
        }
      );
      
      // Check if game is won
      if (newMatched.length === state.cards.length) {
        this.end(true);
      }
    } else {
      // No match
      this.store.dispatch(
        { type: 'NO_MATCH' },
        {
          flippedCards: [],
          attempts: state.attempts + 1
        }
      );
    }
  }
  
  protected onStart(): void {
    // Reset cards when starting
    const cards = MemoryGameEngine.createCards(this.cardValues);
    this.store.setState({
      cards,
      flippedCards: [],
      matchedCards: [],
      score: 0,
      attempts: 0,
      moves: 0
    });
  }
  
  protected onPause(): void {
    // No special pause logic needed
  }
  
  protected onResume(): void {
    // No special resume logic needed
  }
  
  protected onReset(): void {
    const cards = MemoryGameEngine.createCards(this.cardValues);
    this.store.setState({
      status: 'idle',
      cards,
      flippedCards: [],
      matchedCards: [],
      score: 0,
      attempts: 0,
      moves: 0
    });
  }
  
  protected onEnd(won: boolean): void {
    // Game ended
  }
  
  protected onConfigChange(): void {
    // No config changes
  }
  
  protected onDestroy(): void {
    // Cleanup
  }
}

/**
 * Memory Game Embed - Render Only!
 * All game logic is in MemoryGameEngine
 */
export class MemoryGameEmbed extends BaseEmbed {
  /**
   * Embed manifest metadata
   */
  static manifest: EmbedManifest = {
    tag: 'memory-game',
    name: 'Memory Game',
    category: 'interaction',
    description: 'Card matching memory game with render-only architecture',
    version: '1.0.0',
    defaultProps: {
      brand_colors_primary: '#8b5cf6',
      brand_colors_surface: '#0b0b0b'
    }
  };
  
  private engine: MemoryGameEngine;
  private unsubscribe?: () => void;
  
  constructor() {
    super();
    this.engine = new MemoryGameEngine();
  }
  
  connectedCallback(): void {
    super.connectedCallback();
    
    // Subscribe to state changes and re-render
    this.unsubscribe = this.engine.subscribe((state) => {
      this.render();
    });
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    
    // Cleanup
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.engine.destroy();
  }
  
  /**
   * Render the game UI based on current state
   */
  protected render(): void {
    const state = this.engine.getStore().getState();
    
    // Render header
    const header = this.renderHeader(state);
    
    // Render game content
    const content = this.renderContent(state);
    
    // Use game layout helper
    const gameHtml = renderGameSurface(header, content);
    
    this.root.innerHTML = `
      <style>
        ${gameSurfaceCss}
        ${gameTokensCss}
        ${this.getGameStyles()}
      </style>
      ${gameHtml}
    `;
    
    // Attach event listeners
    this.attachEventListeners();
  }
  
  /**
   * Render game header
   */
  private renderHeader(state: MemoryGameState): string {
    return `
      <div class="header-content">
        <div class="game-title">🧠 Memory Match</div>
        <div class="game-stats">
          <span class="stat">Score: ${state.score}</span>
          <span class="stat">Attempts: ${state.attempts}</span>
        </div>
        <div class="game-controls">
          ${this.renderControls(state)}
        </div>
      </div>
    `;
  }
  
  /**
   * Render game controls
   */
  private renderControls(state: MemoryGameState): string {
    if (state.status === 'idle') {
      return '<button class="btn-start">Start Game</button>';
    }
    
    if (state.status === 'playing') {
      return '<button class="btn-reset">Reset</button>';
    }
    
    if (state.status === 'won') {
      return `
        <div class="win-message">🎉 You Won!</div>
        <button class="btn-start">Play Again</button>
      `;
    }
    
    return '';
  }
  
  /**
   * Render game content
   */
  private renderContent(state: MemoryGameState): string {
    if (state.status === 'idle') {
      return `
        <div class="welcome-screen">
          <h2>Memory Match Game</h2>
          <p>Find all matching pairs of cards!</p>
          <p class="instructions">Click cards to flip them and find matches.</p>
        </div>
      `;
    }
    
    return `
      <div class="cards-grid">
        ${state.cards.map(card => this.renderCard(card, state)).join('')}
      </div>
    `;
  }
  
  /**
   * Render a single card
   */
  private renderCard(card: GameCard, state: MemoryGameState): string {
    const isFlipped = state.flippedCards.includes(card.id);
    const isMatched = state.matchedCards.includes(card.id);
    const shouldShow = isFlipped || isMatched;
    const classes = `card ${shouldShow ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`;
    
    return `
      <div class="${classes}" data-card-id="${card.id}">
        <div class="card-front">${shouldShow ? card.value : ''}</div>
        <div class="card-back">?</div>
      </div>
    `;
  }
  
  /**
   * Get game-specific styles
   */
  private getGameStyles(): string {
    return `
      .header-content {
        padding: 1rem;
        background: linear-gradient(135deg, var(--sl-color-primary, #8b5cf6) 0%, #6d28d9 100%);
        color: white;
      }
      
      .game-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      
      .game-stats {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }
      
      .stat {
        font-size: 0.9rem;
        opacity: 0.9;
      }
      
      .game-controls {
        margin-top: 0.5rem;
      }
      
      button {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 6px;
        background: white;
        color: var(--sl-color-primary, #8b5cf6);
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      button:hover {
        transform: scale(1.05);
      }
      
      .win-message {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      
      .welcome-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: white;
        text-align: center;
        padding: 2rem;
      }
      
      .welcome-screen h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
      
      .instructions {
        opacity: 0.8;
        margin-top: 1rem;
      }
      
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        padding: 2rem;
        justify-items: center;
      }
      
      .card {
        position: relative;
        cursor: pointer;
        transition: transform 0.3s;
      }
      
      .card:hover:not(.matched) {
        transform: scale(1.05);
      }
      
      .card-front,
      .card-back {
        width: var(--card-w);
        height: var(--card-h);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-size: 2rem;
        position: absolute;
        top: 0;
        left: 0;
        backface-visibility: hidden;
        transition: opacity 0.3s;
      }
      
      .card-front {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        opacity: 0;
      }
      
      .card-back {
        background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%);
        color: white;
        opacity: 1;
      }
      
      .card.flipped .card-front {
        opacity: 1;
      }
      
      .card.flipped .card-back {
        opacity: 0;
      }
      
      .card.matched {
        cursor: default;
        opacity: 0.6;
      }
      
      .card.matched .card-front {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }
    `;
  }
  
  /**
   * Attach event listeners (called after render)
   */
  private attachEventListeners(): void {
    // Start button
    const startBtn = this.root.querySelector('.btn-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.engine.start();
      });
    }
    
    // Reset button
    const resetBtn = this.root.querySelector('.btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.engine.reset();
      });
    }
    
    // Card clicks
    const cards = this.root.querySelectorAll('.card');
    cards.forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        const cardId = (cardEl as HTMLElement).dataset.cardId;
        if (cardId) {
          this.engine.flipCard(cardId);
        }
      });
    });
  }
}

// Register the custom element
customElements.define('memory-game', MemoryGameEmbed);
