// src/eventBus.js
// Pub/sub event bus. See CABBIE_SPEC.md §5 for event naming conventions
// and the canonical event map.

const listeners = new Map();

export const EventBus = {
  on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => {
      const set = listeners.get(event);
      if (set) set.delete(handler);
    };
  },

  emit(event, payload) {
    const handlers = listeners.get(event);
    if (!handlers) return;
    for (const h of handlers) {
      try {
        h(payload);
      } catch (e) {
        console.error(`EventBus handler error for ${event}:`, e);
      }
    }
  },

  off(event, handler) {
    const set = listeners.get(event);
    if (set) set.delete(handler);
  },

  // For testing only. Do not call from game code.
  _reset() {
    listeners.clear();
  },
};
