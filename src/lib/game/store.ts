/**
 * Game Store
 * 
 * Centralized state management for games
 * Follows a simple pub-sub pattern for state updates
 */

import type { GameState, GameAction } from './types';

/**
 * State change listener callback
 */
export type StateChangeListener<T extends GameState> = (state: T) => void;

/**
 * Game Store class
 * Manages game state and notifies listeners of changes
 */
export class GameStore<T extends GameState> {
  private state: T;
  private listeners: Set<StateChangeListener<T>> = new Set();
  private actionHistory: GameAction[] = [];
  
  constructor(initialState: T) {
    this.state = initialState;
  }
  
  /**
   * Get current state (read-only)
   */
  getState(): Readonly<T> {
    return { ...this.state };
  }
  
  /**
   * Update state with partial changes
   */
  setState(partialState: Partial<T>): void {
    this.state = {
      ...this.state,
      ...partialState
    };
    this.notifyListeners();
  }
  
  /**
   * Dispatch an action to update state
   * Actions are recorded in history for debugging
   */
  dispatch(action: GameAction, newState?: Partial<T>): void {
    this.actionHistory.push(action);
    
    if (newState) {
      this.setState(newState);
    }
  }
  
  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  subscribe(listener: StateChangeListener<T>): () => void {
    this.listeners.add(listener);
    
    // Call listener immediately with current state
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Reset state to initial value
   */
  reset(initialState: T): void {
    this.state = initialState;
    this.actionHistory = [];
    this.notifyListeners();
  }
  
  /**
   * Get action history (for debugging/replay)
   */
  getHistory(): readonly GameAction[] {
    return [...this.actionHistory];
  }
  
  /**
   * Clear action history
   */
  clearHistory(): void {
    this.actionHistory = [];
  }
  
  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      listener(currentState);
    });
  }
}
