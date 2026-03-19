/**
 * Type-safe event listener hook with explicit cleanup
 * Demonstrates avoiding hidden side effects through clear API design
 */

import { useEffect, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface EventListenerOptions {
  /** Whether to use capture phase */
  capture?: boolean;
  /** Whether the listener should be passive */
  passive?: boolean;
  /** Whether the listener should be called only once */
  once?: boolean;
  /** Custom condition to enable/disable the listener */
  enabled?: boolean;
}

// Type-safe event map for different targets
export interface WindowEventMap extends GlobalEventHandlersEventMap {
  resize: UIEvent;
  scroll: Event;
  beforeunload: BeforeUnloadEvent;
  online: Event;
  offline: Event;
}

export interface DocumentEventMap extends GlobalEventHandlersEventMap {
  visibilitychange: Event;
  DOMContentLoaded: Event;
}

// Generic event listener type
export type EventListener<T extends Event = Event> = (event: T) => void;

// ============================================================================
// HOOK IMPLEMENTATIONS
// ============================================================================

/**
 * Add event listener to window with automatic cleanup
 *
 * @param eventName - Name of the event to listen for
 * @param handler - Event handler function
 * @param options - Event listener options
 *
 * @example
 * ```tsx
 * useWindowEventListener('resize', (event) => {
 *   console.log('Window resized:', event);
 * }, { passive: true });
 * ```
 */
export function useWindowEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: EventListener<WindowEventMap[K]>,
  options: EventListenerOptions = {}
): void {
  const { capture = false, passive = false, once = false, enabled = true } = options;

  // Use ref to store the handler to avoid re-running effect when handler changes
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    // Don't add listener if disabled
    if (!enabled) return;

    // Create stable handler that calls the current handler
    const eventListener = (event: WindowEventMap[K]) => {
      handlerRef.current(event);
    };

    // Add event listener with specified options
    window.addEventListener(eventName, eventListener as EventListener, {
      capture,
      passive,
      once,
    });

    // Explicit cleanup function
    return () => {
      window.removeEventListener(eventName, eventListener as EventListener, {
        capture,
      });
    };
  }, [eventName, capture, passive, once, enabled]);
}

/**
 * Add event listener to document with automatic cleanup
 *
 * @param eventName - Name of the event to listen for
 * @param handler - Event handler function
 * @param options - Event listener options
 *
 * @example
 * ```tsx
 * useDocumentEventListener('visibilitychange', () => {
 *   console.log('Visibility changed:', document.visibilityState);
 * });
 * ```
 */
export function useDocumentEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: EventListener<DocumentEventMap[K]>,
  options: EventListenerOptions = {}
): void {
  const { capture = false, passive = false, once = false, enabled = true } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const eventListener = (event: DocumentEventMap[K]) => {
      handlerRef.current(event);
    };

    document.addEventListener(eventName, eventListener as EventListener, {
      capture,
      passive,
      once,
    });

    return () => {
      document.removeEventListener(eventName, eventListener as EventListener, {
        capture,
      });
    };
  }, [eventName, capture, passive, once, enabled]);
}

/**
 * Add event listener to any element with automatic cleanup
 *
 * @param element - Target element (or ref to element)
 * @param eventName - Name of the event to listen for
 * @param handler - Event handler function
 * @param options - Event listener options
 *
 * @example
 * ```tsx
 * const buttonRef = useRef<HTMLButtonElement>(null);
 *
 * useElementEventListener(
 *   buttonRef,
 *   'click',
 *   (event) => console.log('Button clicked:', event),
 *   { once: true }
 * );
 * ```
 */
export function useElementEventListener<
  T extends HTMLElement = HTMLElement,
  K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
>(
  element: T | React.RefObject<T> | null,
  eventName: K,
  handler: EventListener<HTMLElementEventMap[K]>,
  options: EventListenerOptions = {}
): void {
  const { capture = false, passive = false, once = false, enabled = true } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    // Get the actual element
    const targetElement = element && 'current' in element ? element.current : element;

    if (!targetElement) return;

    const eventListener = (event: HTMLElementEventMap[K]) => {
      handlerRef.current(event);
    };

    targetElement.addEventListener(eventName, eventListener as EventListener, {
      capture,
      passive,
      once,
    });

    return () => {
      targetElement.removeEventListener(eventName, eventListener as EventListener, {
        capture,
      });
    };
  }, [element, eventName, capture, passive, once, enabled]);
}

/**
 * Generic event listener hook for any event target
 *
 * @param target - Event target (window, document, element, or ref)
 * @param eventName - Name of the event to listen for
 * @param handler - Event handler function
 * @param options - Event listener options
 *
 * @example
 * ```tsx
 * // Listen to window events
 * useEventListener(window, 'resize', handleResize);
 *
 * // Listen to document events
 * useEventListener(document, 'click', handleDocumentClick);
 *
 * // Listen to element events
 * const ref = useRef<HTMLDivElement>(null);
 * useEventListener(ref, 'scroll', handleScroll);
 * ```
 */
export function useEventListener<T extends EventTarget, K extends string>(
  target: T | React.RefObject<T> | null,
  eventName: K,
  handler: EventListener,
  options: EventListenerOptions = {}
): void {
  const { capture = false, passive = false, once = false, enabled = true } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    // Get the actual target
    let targetElement: EventTarget | null = null;

    if (target && 'current' in target) {
      targetElement = target.current;
    } else {
      targetElement = target;
    }

    if (!targetElement) return;

    const eventListener = (event: Event) => {
      handlerRef.current(event);
    };

    targetElement.addEventListener(eventName, eventListener, {
      capture,
      passive,
      once,
    });

    return () => {
      targetElement?.removeEventListener(eventName, eventListener, {
        capture,
      });
    };
  }, [target, eventName, capture, passive, once, enabled]);
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for handling keyboard events with type safety
 *
 * @example
 * ```tsx
 * useKeyboardEvent('Escape', () => {
 *   closeModal();
 * }, { target: document });
 * ```
 */
export function useKeyboardEvent(
  key: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: EventListenerOptions & { target?: EventTarget | React.RefObject<EventTarget> } = {}
): void {
  const { target = document, ...eventOptions } = options;
  const keys = Array.isArray(key) ? key : [key];

  const keyHandler = (event: KeyboardEvent) => {
    if (keys.includes(event.key)) {
      handler(event);
    }
  };

  useEventListener(target, 'keydown', keyHandler, eventOptions);
}

/**
 * Hook for handling click outside events
 *
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 *
 * useClickOutside(modalRef, () => {
 *   closeModal();
 * });
 * ```
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent) => void,
  options: EventListenerOptions = {}
): void {
  const clickHandler = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      handler(event);
    }
  };

  useDocumentEventListener('mousedown', clickHandler, options);
}
