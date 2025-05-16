/**
 * Utility functions for API calls
 */
import { getAuthToken } from "./authUtils";
import { withRetry } from "./errorHandling";

/**
 * Base URL for API calls
 */
const API_BASE_URL = "";

/**
 * Interface for API response
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Options for API calls
 */
interface ApiOptions {
  headers?: Record<string, string>;
  withAuth?: boolean;
  retries?: number;
}

/**
 * Get default headers for API calls
 * @param withAuth Whether to include authentication header
 * @returns Headers object
 */
const getDefaultHeaders = (
  withAuth: boolean = true,
): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (withAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Make a GET request
 * @param endpoint API endpoint
 * @param options API options
 * @returns API response
 */
export const apiGet = async <T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> => {
  const { headers = {}, withAuth = true, retries = 3 } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const requestHeaders = { ...getDefaultHeaders(withAuth), ...headers };

  try {
    const response = await withRetry(async () => {
      const res = await fetch(url, {
        method: "GET",
        headers: requestHeaders,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      return res;
    }, retries);

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error(`GET request failed for ${url}:`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
};

/**
 * Make a POST request
 * @param endpoint API endpoint
 * @param body Request body
 * @param options API options
 * @returns API response
 */
export const apiPost = async <T>(
  endpoint: string,
  body: any,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> => {
  const { headers = {}, withAuth = true, retries = 3 } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const requestHeaders = { ...getDefaultHeaders(withAuth), ...headers };

  try {
    const response = await withRetry(async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      return res;
    }, retries);

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error(`POST request failed for ${url}:`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
};

/**
 * Make a PUT request
 * @param endpoint API endpoint
 * @param body Request body
 * @param options API options
 * @returns API response
 */
export const apiPut = async <T>(
  endpoint: string,
  body: any,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> => {
  const { headers = {}, withAuth = true, retries = 3 } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const requestHeaders = { ...getDefaultHeaders(withAuth), ...headers };

  try {
    const response = await withRetry(async () => {
      const res = await fetch(url, {
        method: "PUT",
        headers: requestHeaders,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      return res;
    }, retries);

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error(`PUT request failed for ${url}:`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
};

/**
 * Make a DELETE request
 * @param endpoint API endpoint
 * @param options API options
 * @returns API response
 */
export const apiDelete = async <T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> => {
  const { headers = {}, withAuth = true, retries = 3 } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const requestHeaders = { ...getDefaultHeaders(withAuth), ...headers };

  try {
    const response = await withRetry(async () => {
      const res = await fetch(url, {
        method: "DELETE",
        headers: requestHeaders,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      return res;
    }, retries);

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error(`DELETE request failed for ${url}:`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
};
