/**
 * API Helper functions to ensure consistent data handling
 */

/**
 * Ensures returned API data is always an array, even if API returns null or undefined
 * 
 * @param data The data returned from an API call
 * @param defaultValue Optional default value if data is null/undefined (defaults to empty array)
 * @returns The data as is if it's an array, otherwise the default value
 */
export function ensureArray<T>(data: T[] | null | undefined, defaultValue: T[] = []): T[] {
  return Array.isArray(data) ? data : defaultValue;
}

/**
 * Ensures returned API data has a default value if null/undefined
 * 
 * @param data The data returned from an API call
 * @param defaultValue Default value if data is null/undefined
 * @returns The data as is if not null/undefined, otherwise the default value
 */
export function ensureValue<T>(data: T | null | undefined, defaultValue: T): T {
  return data !== null && data !== undefined ? data : defaultValue;
} 