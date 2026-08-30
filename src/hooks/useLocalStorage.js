import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {
      // fall through to initializer
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable - fail silently, nothing else to do here
    }
  }, [key, value]);

  return [value, setValue];
}
