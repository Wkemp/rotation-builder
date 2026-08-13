import { useState, useEffect, useRef } from 'react';

/**
 * Same shape as useState, but persisted to localStorage under `key`.
 * Safe for PWA/offline use since localStorage is purely on-device.
 *
 * `initialValue` may be a plain value or a function (like useState's lazy
 * initializer) - useful when computing the default is non-trivial (e.g.
 * migrating old data) and should only run once, on first mount.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
    } catch {
      // fall through to initialValue
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable (e.g. private browsing) - fail silently,
      // the app still works for the current session
    }
  }, [key, value]);

  return [value, setValue];
}
