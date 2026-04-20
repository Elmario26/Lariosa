const API_ENDPOINTS = {
  // Android emulator to host machine (most common)
  ANDROID_EMULATOR: 'http://10.0.2.2:8000/api',
  // iOS simulator or web
  LOCALHOST: 'http://localhost:8000/api',
  // Your actual local network IP (find with ipconfig/ifconfig)
  // Example: 'http://192.168.1.100:8000/api',
  NETWORK: 'http://192.168.1.100:8000/api',
  // Production
  PRODUCTION: 'https://your-production-api.com/api',
} as const;

// Change this to switch environments
const ENVIRONMENT = 'ANDROID_EMULATOR';
const BASE_URL = API_ENDPOINTS[ENVIRONMENT as keyof typeof API_ENDPOINTS];

export { BASE_URL, API_ENDPOINTS, ENVIRONMENT };

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  token?: string | null;
}

interface ApiErrorResponse {
  status: number;
  message: string;
  data?: any;
}

/**
 * Generic API request handler
 * @param {string} endpoint - The API endpoint
 * @param {RequestOptions} options - Request options (method, body, headers, etc)
 * @returns {Promise} API response
 */
export const apiRequest = async (endpoint: string, options: RequestOptions = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    token = null,
  } = options;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const finalHeaders = { ...defaultHeaders, ...headers };
  const url = `${BASE_URL}${endpoint}`;

  console.log(`[API REQUEST] Method: ${method}`);
  console.log(`[API REQUEST] URL: ${url}`);
  console.log(`[API REQUEST] Headers:`, finalHeaders);
  if (body) {
    console.log(`[API REQUEST] Body:`, JSON.stringify(body, null, 2));
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();

    console.log(`[API RESPONSE] Status: ${response.status}`);
    console.log(`[API RESPONSE] Data:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error(`[API ERROR] Status ${response.status}: ${data.message || 'Unknown error'}`);
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        data: data,
      } as ApiErrorResponse;
    }

    return data;
  } catch (error) {
    console.error('[API ERROR]:', (error as any)?.message || error);
    throw error;
  }
};
