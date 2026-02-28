/**
 * Mock WASM Context Runtime
 * In production, this would be the actual WebAssembly-based context runtime
 */

import type { ContextChangeSet, ContextSubscriber } from '../types';

export class WasmContextRuntime {
  private subscribers: Map<string, Set<ContextSubscriber>> = new Map();
  private context: Record<string, any> = {};

  subscribe(
    scopeId: string,
    keys: string[] | undefined,
    subscriber: ContextSubscriber
  ): () => void {
    const key = `${scopeId}:${keys?.join(',') || '*'}`;
    
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(subscriber);

    return () => {
      this.subscribers.get(key)?.delete(subscriber);
    };
  }

  updateContext(scopeId: string, changes: ContextChangeSet): void {
    this.context = { ...this.context, ...changes };
    
    // Notify subscribers
    this.subscribers.forEach((subs, key) => {
      if (key.startsWith(scopeId)) {
        subs.forEach(sub => sub(changes));
      }
    });
  }

  getContext(scopeId: string, keys?: string[]): Record<string, any> {
    if (!keys) return this.context;
    
    const filtered: Record<string, any> = {};
    keys.forEach(key => {
      if (key in this.context) {
        filtered[key] = this.context[key];
      }
    });
    return filtered;
  }
}
