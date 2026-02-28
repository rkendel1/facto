/**
 * Game Types
 * 
 * Core type definitions for game state and actions
 */

/**
 * Base game state interface
 * All games should extend this with their specific state
 */
export interface GameState {
  /**
   * Current game status
   */
  status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
  
  /**
   * Player score
   */
  score: number;
  
  /**
   * Game level or difficulty
   */
  level?: number;
  
  /**
   * Time elapsed in milliseconds
   */
  timeElapsed?: number;
  
  /**
   * Number of moves made
   */
  moves?: number;
  
  /**
   * Custom game-specific state
   */
  [key: string]: any;
}

/**
 * Base game action interface
 */
export interface GameAction {
  /**
   * Action type
   */
  type: string;
  
  /**
   * Action payload
   */
  payload?: any;
}

/**
 * Game configuration interface
 */
export interface GameConfig {
  /**
   * Game difficulty
   */
  difficulty?: 'easy' | 'medium' | 'hard';
  
  /**
   * Enable sound effects
   */
  soundEnabled?: boolean;
  
  /**
   * Enable animations
   */
  animationsEnabled?: boolean;
  
  /**
   * Custom game-specific configuration
   */
  [key: string]: any;
}

/**
 * Player information
 */
export interface Player {
  /**
   * Player ID
   */
  id: string;
  
  /**
   * Player name
   */
  name: string;
  
  /**
   * Player score
   */
  score: number;
  
  /**
   * Additional player data
   */
  [key: string]: any;
}

/**
 * Card/Game piece interface
 * Useful for card games, tile games, etc.
 */
export interface GameCard {
  /**
   * Unique card ID
   */
  id: string;
  
  /**
   * Card value/rank
   */
  value: string | number;
  
  /**
   * Card suit (for card games)
   */
  suit?: string;
  
  /**
   * Card visibility
   */
  faceUp: boolean;
  
  /**
   * Card position
   */
  position?: {
    x: number;
    y: number;
  };
  
  /**
   * Additional card properties
   */
  [key: string]: any;
}

/**
 * Game event for tracking and analytics
 */
export interface GameEvent {
  /**
   * Event type
   */
  type: string;
  
  /**
   * Timestamp
   */
  timestamp: number;
  
  /**
   * Event data
   */
  data?: any;
}
