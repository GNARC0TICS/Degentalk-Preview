import { useState, useEffect } from 'react';

/**
 * Hook to detect when the component has been hydrated on the client.
 * Useful for preventing hydration mismatches with random content.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}