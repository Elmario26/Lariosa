import { API_BASE_URL } from '../config/api';
import { extractApiErrorMessage } from './normalize';

export { API_BASE_URL };

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  data?: unknown;
}

/**
 * Generic API request handler (Symfony JSON API)
 */
export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body = null, headers = {}, token = null } = options;

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const finalHeaders = { ...defaultHeaders, ...headers };
  const url = `${API_BASE_URL}${endpoint}`;

  if (__DEV__) {
    console.log(`[API] ${method} ${url}`);
    if (body) console.log('[API] body:', body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : null,
    });

    const text = await response.text();
    let data: Record<string, unknown> | null = null;

    if (text) {
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        throw {
          status: response.status,
          message: 'Invalid JSON response from server',
          data: text,
        } as ApiErrorResponse;
      }
    }

    if (__DEV__) {
      console.log(`[API] ${response.status}`, data ?? '(empty)');
    }

    if (!response.ok) {
      const message = extractApiErrorMessage(data, `Request failed (${response.status})`);
      throw { status: response.status, message, data } as ApiErrorResponse;
    }

    return (data ?? {}) as T;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    if (apiError?.status) throw error;

    console.error('[API] network error:', error);
    throw {
      status: 0,
      message:
        'Cannot reach the Symfony server. Check that it is running, ENVIRONMENT in src/app/config/api.ts matches your device, and Postman uses the same host/port.',
      data: error,
    } as ApiErrorResponse;
  }
};
