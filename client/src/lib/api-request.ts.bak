/**
 * Utility for making API requests with proper error handling
 */

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

/**
 * Make a GET request to the API
 * @param url The URL to fetch
 * @param options Optional fetch options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'API request failed') as ApiError;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    
    const newError = new Error(
      (error as Error).message || 'Network error'
    ) as ApiError;
    throw newError;
  }
}

/**
 * Make a POST request to the API
 * @param url The URL to fetch
 * @param body The request body
 * @param options Optional fetch options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiPost<T = any, U = any>(
  url: string,
  body: U,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Make a PUT request to the API
 * @param url The URL to fetch
 * @param body The request body
 * @param options Optional fetch options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiPut<T = any, U = any>(
  url: string,
  body: U,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Make a PATCH request to the API
 * @param url The URL to fetch
 * @param body The request body
 * @param options Optional fetch options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiPatch<T = any, U = any>(
  url: string,
  body: U,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * Make a DELETE request to the API
 * @param url The URL to fetch
 * @param options Optional fetch options
 * @returns The JSON response
 * @throws ApiError if the request fails
 */
export async function apiDelete<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'DELETE',
  });
}