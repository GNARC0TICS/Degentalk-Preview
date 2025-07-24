import { useState, useEffect } from 'react';
import { logger } from '@app/lib/logger";

/**
 * A hook that manages state with localStorage persistence
 *
 * @param key The localStorage key to use
 * @param initialValue The initial value if localStorage is empty
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
	// State to store our value
	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return initialValue;
		}

		try {
			// Get from local storage by key
			const item = window.localStorage.getItem(key);
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			// If error (e.g. permission issues or corruption) also return initialValue
			logger.error('useLocalStorage', 'Error reading from localStorage:', error);
			return initialValue;
		}
	});

	// Return a wrapped version of useState's setter function that
	// persists the new value to localStorage.
	const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore = value instanceof Function ? value(storedValue) : value;

			// Save state
			setStoredValue(valueToStore);

			// Save to local storage
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			// Handle errors
			logger.error('useLocalStorage', 'Error writing to localStorage:', error);
		}
	};

	// Sync state with other tabs/windows
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue) {
				try {
					setStoredValue(JSON.parse(e.newValue));
				} catch (error) {
					logger.error('useLocalStorage', 'Error parsing localStorage change:', error);
				}
			}
		};

		// Listen for changes
		window.addEventListener('storage', handleStorageChange);

		// Cleanup
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, [key]);

	return [storedValue, setValue];
}

export default useLocalStorage;
