import { useEffect, useState } from 'react';
export default function useStored(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(fallback))
        return Array.isArray(data) ? data.filter((item) => typeof item === 'string') : fallback;
      if (typeof fallback === 'boolean') return typeof data === 'boolean' ? data : fallback;
      return data && typeof data === 'object' && !Array.isArray(data) ? data : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* O armazenamento é opcional. */
    }
  }, [key, value]);
  return [value, setValue];
}
