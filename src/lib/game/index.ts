/**
 * Game Module - Main Entry Point
 * 
 * Exports all game-related utilities, types, and classes
 */

// Types
export type {
  GameState,
  GameAction,
  GameConfig,
  Player,
  GameCard,
  GameEvent
} from './types';

// Store
export { GameStore } from './store';
export type { StateChangeListener } from './store';

// Engine
export {
  GameEngine,
  shuffleArray,
  generateId,
  calculateScore
} from './engine';

// Layout
export {
  renderGameSurface,
  gameSurfaceCss,
  gameTokensCss
} from './game-layout';
