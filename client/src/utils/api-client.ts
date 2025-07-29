/**
 * Typed API Client
 * Provides type-safe API methods that return standardized ApiResponse<T> format
 */

import type { ApiResponse, ApiSuccess, ApiError, PaginationMeta } from '@shared/types/api.types';
import { apiRequest, type ApiRequestConfig } from './api-request';

/**
 * Type-safe API client with standardized response handling
 */
export const apiClient = {
  /**
   * Make a GET request
   * @param url The endpoint URL
   * @param options Optional request configuration
   * @returns The data from the API response
   */
  async get<T>(url: string, options?: Partial<ApiRequestConfig>): Promise<T> {
    return apiRequest<T>({
      url,
      method: 'GET',
      ...options
    });
  },

  /**
   * Make a POST request
   * @param url The endpoint URL
   * @param data The request body
   * @param options Optional request configuration
   * @returns The data from the API response
   */
  async post<T>(url: string, data?: unknown, options?: Partial<ApiRequestConfig>): Promise<T> {
    return apiRequest<T>({
      url,
      method: 'POST',
      data,
      ...options
    });
  },

  /**
   * Make a PUT request
   * @param url The endpoint URL
   * @param data The request body
   * @param options Optional request configuration
   * @returns The data from the API response
   */
  async put<T>(url: string, data?: unknown, options?: Partial<ApiRequestConfig>): Promise<T> {
    return apiRequest<T>({
      url,
      method: 'PUT',
      data,
      ...options
    });
  },

  /**
   * Make a PATCH request
   * @param url The endpoint URL
   * @param data The request body
   * @param options Optional request configuration
   * @returns The data from the API response
   */
  async patch<T>(url: string, data?: unknown, options?: Partial<ApiRequestConfig>): Promise<T> {
    return apiRequest<T>({
      url,
      method: 'PATCH',
      data,
      ...options
    });
  },

  /**
   * Make a DELETE request
   * @param url The endpoint URL
   * @param options Optional request configuration
   * @returns The data from the API response
   */
  async delete<T>(url: string, options?: Partial<ApiRequestConfig>): Promise<T> {
    return apiRequest<T>({
      url,
      method: 'DELETE',
      ...options
    });
  }
};

/**
 * Type helpers for API responses
 */
export type ApiData<T> = T extends ApiSuccess<infer U> ? U : never;

/**
 * Helper to create query keys for React Query
 */
export function createQueryKey(endpoint: string, params?: Record<string, unknown>): string[] {
  const key = [endpoint];
  if (params) {
    key.push(JSON.stringify(params));
  }
  return key;
}

/**
 * Type-safe paginated response helper
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Helper to extract paginated data
 */
export function extractPaginatedData<T>(response: ApiSuccess<T[]>): PaginatedData<T> {
  if (response.meta && 'page' in response.meta) {
    return {
      items: response.data,
      pagination: response.meta as PaginationMeta
    };
  }
  
  // Fallback for non-paginated responses
  return {
    items: response.data,
    pagination: {
      page: 1,
      limit: response.data.length,
      total: response.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  };
}