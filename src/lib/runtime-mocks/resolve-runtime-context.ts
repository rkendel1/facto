/**
 * Mock runtime context resolver
 */

import type { RuntimeContext } from '../types';

export function resolveRuntimeContext(
  scopeId: string,
  componentKeys?: string[]
): RuntimeContext {
  // Mock implementation
  return {};
}
