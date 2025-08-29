import { StoreApi, UseBoundStore } from 'zustand';

/**
 * A utility function to log state changes in Zustand stores during development.
 * This helps with debugging and monitoring state changes.
 *
 * @param store The Zustand store to monitor
 * @param name A name to identify the store in logs
 */
export function monitorStore<T>(store: UseBoundStore<StoreApi<T>>, name: string) {
  if (process.env.NODE_ENV !== 'development') return;

  // Subscribe to all state changes
  const unsubscribe = store.subscribe(state => {
    console.group(`[${name}] State updated`);
    console.groupEnd();
  });

  // Return unsubscribe function for cleanup
  return unsubscribe;
}

/**
 * A utility function to clear persisted Zustand store data from localStorage.
 * Useful for testing or handling corrupted state.
 *
 * @param storageKey The localStorage key used by the persist middleware
 */
export function clearPersistedStore(storageKey: string) {
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error(`Failed to clear persisted store: ${storageKey}`, error);
    return false;
  }
}
