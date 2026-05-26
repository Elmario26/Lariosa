import { API_BASE_URL, buildApiUrl } from '../config/api';
import { extractApiErrorMessage } from './normalize';

export { API_BASE_URL };

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
  /** Retry once on transient network failure (emulator DNS / dropped connection). */
  retryOnNetworkError?: boolean;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  data?: unknown;
}

const REQUEST_TIMEOUT_MS = 45000;

function normalizeToken(token: string | null | undefined): string | null {
  if (token == null) return null;
  const trimmed = String(token).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = (error as { name?: string }).name;
  return name === 'AbortError' || name === 'CanceledError';
}

function isNetworkFailure(error: unknown): boolean {
  if (isAbortError(error)) return false;
  const message =
    error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error);
  return /network request failed|failed to fetch|network error/i.test(message);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function executeRequest<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const { method = 'GET', body = null, headers = {}, token = null } = options;
  const authToken = normalizeToken(token);

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (authToken) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  const finalHeaders = { ...defaultHeaders, ...headers };
  const url = buildApiUrl(endpoint);

  if (__DEV__) {
    console.log(`[API] ${method} ${url}`);
    if (body) console.log('[API] body:', body);
  }

  const response = await fetchWithTimeout(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : null,
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      throw {
        status: response.status,
        message: 'Invalid JSON response from server',
        data: text,
      } as ApiErrorResponse;
    }
  }

  if (__DEV__) {
    const preview = Array.isArray(data)
      ? `[array:${data.length}]`
      : data ?? '(empty)';
    console.log(`[API] ${response.status}`, preview);
  }

  if (!response.ok) {
    const payload =
      data && typeof data === 'object' && !Array.isArray(data)
        ? { ...(data as Record<string, unknown>), status: response.status }
        : { status: response.status, message: text };
    const message = extractApiErrorMessage(
      payload as Record<string, unknown>,
      `Request failed (${response.status})`
    );
    throw { status: response.status, message, data: payload } as ApiErrorResponse;
  }

  return (data ?? {}) as T;
}

/**
 * Generic API request handler (Symfony JSON API)
 */
export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { retryOnNetworkError = true, method = 'GET' } = options;
  const shouldRetry =
    retryOnNetworkError && method === 'GET' && !endpoint.includes('/login');

  try {
    return await executeRequest<T>(endpoint, options);
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    if (apiError?.status) throw error;

    if (isAbortError(error)) {
      throw {
        status: 0,
        message: 'Request was cancelled.',
        data: error,
      } as ApiErrorResponse;
    }

    if (shouldRetry && isNetworkFailure(error)) {
      if (__DEV__) console.log('[API] retrying after network failure…');
      try {
        return await executeRequest<T>(endpoint, options);
      } catch (retryError) {
        error = retryError;
      }
    }

    const apiErrorRetry = error as ApiErrorResponse;
    if (apiErrorRetry?.status) throw error;

    console.error('[API] network error:', error);
    throw {
      status: 0,
      message:
        'Cannot reach the Symfony server. Check that it is running, ENVIRONMENT in src/app/config/api.ts matches your device, and Postman uses the same host/port.',
      data: error,
    } as ApiErrorResponse;
  }
};
