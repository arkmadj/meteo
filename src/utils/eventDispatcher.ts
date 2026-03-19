/**
 * React-friendly event dispatch utilities.
 *
 * Many of our async utilities (cancellation tokens, pipelines, etc.) need to
 * notify listeners in a way that:
 *
 *   - Preserves "same cycle" semantics (callbacks still run in the same
 *     macrotask / event loop turn), and
 *   - Avoids re-entrancy issues with React's render lifecycle.
 *
 * We achieve this by scheduling listener execution into a microtask. From the
 * caller's perspective, all callbacks run "immediately" before the next
 * macrotask, but React gets a clean stack frame.
 */

const queueMicrotaskFn: ((cb: () => void) => void) | undefined =
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as { queueMicrotask?: (cb: () => void) => void }).queueMicrotask === 'function'
    ? (globalThis as { queueMicrotask: (cb: () => void) => void }).queueMicrotask.bind(globalThis)
    : undefined;

/**
 * Schedule an event dispatch in a microtask while staying in the same
 * event loop tick when possible.
 */
export function scheduleEventDispatch(callback: () => void): void {
  if (queueMicrotaskFn) {
    queueMicrotaskFn(callback);
    return;
  }

  if (typeof Promise !== 'undefined') {
    Promise.resolve().then(callback);
    return;
  }

  // Last-resort fallback; still preserves ordering but may cross macrotask
  // boundary in very old environments.
  setTimeout(callback, 0);
}
