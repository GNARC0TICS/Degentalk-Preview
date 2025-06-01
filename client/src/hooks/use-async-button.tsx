import { useState, useCallback } from 'react';

export type AsyncCallback<T = void> = () => Promise<T>;

interface UseAsyncButtonResult<T> {
  handleClick: () => void;
  isLoading: boolean;
  result: T | null;
  error: Error | null;
}

/**
 * A hook for handling async operations in button clicks with loading state
 * @param callback An async function to execute when the button is clicked
 * @returns An object with handleClick function, isLoading state, result, and error
 */
export function useAsyncButton<T = void>(
  callback: AsyncCallback<T>
): UseAsyncButtonResult<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleClick = useCallback(() => {
    // Don't execute if already loading
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    callback()
      .then((result) => {
        setResult(result);
        return result;
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [callback, isLoading]);

  return { handleClick, isLoading, result, error };
}