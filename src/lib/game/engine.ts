/**
 * Game Engine
 * 
 * Base game engine with common game logic patterns
 * Games should extend this class or use these utilities
 */

import type { GameState, GameAction, GameConfig } from './types';
import { GameStore } from './store';

/**
 * Base Game Engine class
 * Provides common game logic patterns
 */
export abstract class GameEngine<T extends GameState> {
  protected store: GameStore<T>;
  protected config: GameConfig;
  protected timerId?: number;
  
  constructor(initialState: T, config: GameConfig = {}) {
    this.store = new GameStore(initialState);
    this.config = config;
  }
  
  /**
   * Start the game
   */
  start(): void {
    const currentState = this.store.getState();
    
    if (currentState.status === 'playing') {
      return; // Already playing
    }
    
    this.store.dispatch(
      { type: 'GAME_START' },
      { status: 'playing' } as Partial<T>
    );
    
    this.onStart();
  }
  
  /**
   * Pause the game
   */
  pause(): void {
    const currentState = this.store.getState();
    
    if (currentState.status !== 'playing') {
      return;
    }
    
    this.store.dispatch(
      { type: 'GAME_PAUSE' },
      { status: 'paused' } as Partial<T>
    );
    
    this.onPause();
  }
  
  /**
   * Resume the game
   */
  resume(): void {
    const currentState = this.store.getState();
    
    if (currentState.status !== 'paused') {
      return;
    }
    
    this.store.dispatch(
      { type: 'GAME_RESUME' },
      { status: 'playing' } as Partial<T>
    );
    
    this.onResume();
  }
  
  /**
   * Reset the game
   */
  reset(newInitialState?: T): void {
    if (newInitialState) {
      this.store.reset(newInitialState);
    }
    
    this.store.dispatch({ type: 'GAME_RESET' });
    this.onReset();
  }
  
  /**
   * End the game with win/loss
   */
  end(won: boolean): void {
    this.store.dispatch(
      { type: won ? 'GAME_WIN' : 'GAME_LOSE' },
      { status: won ? 'won' : 'lost' } as Partial<T>
    );
    
    this.onEnd(won);
  }
  
  /**
   * Get the game store
   */
  getStore(): GameStore<T> {
    return this.store;
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: T) => void): () => void {
    return this.store.subscribe(listener);
  }
  
  /**
   * Update game configuration
   */
  updateConfig(config: Partial<GameConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
    this.onConfigChange(this.config);
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.onDestroy();
  }
  
  // Abstract methods for subclasses to implement
  
  /**
   * Called when game starts
   */
  protected abstract onStart(): void;
  
  /**
   * Called when game pauses
   */
  protected abstract onPause(): void;
  
  /**
   * Called when game resumes
   */
  protected abstract onResume(): void;
  
  /**
   * Called when game resets
   */
  protected abstract onReset(): void;
  
  /**
   * Called when game ends
   */
  protected abstract onEnd(won: boolean): void;
  
  /**
   * Called when configuration changes
   */
  protected abstract onConfigChange(config: GameConfig): void;
  
  /**
   * Called when engine is destroyed
   */
  protected abstract onDestroy(): void;
}

/**
 * Utility: Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Utility: Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Utility: Calculate score based on time and moves
 */
export function calculateScore(baseScore: number, timeElapsed: number, moves: number): number {
  const timeBonus = Math.max(0, 1000 - timeElapsed / 1000);
  const movePenalty = moves * 10;
  return Math.max(0, baseScore + timeBonus - movePenalty);
}
