// API Client Configuration
const API_ENDPOINTS = {
  LOCAL: 'http://localhost:3000/api',
  STAGING: 'https://staging-api.example.com/api',
  PRODUCTION: 'https://api.example.com/api'
}

// Set your environment here
const ENVIRONMENT = 'LOCAL'
const BASE_URL = API_ENDPOINTS[ENVIRONMENT]

export { BASE_URL, API_ENDPOINTS, ENVIRONMENT }

/**
 * Generic API request handler
 * @param {string} endpoint - The API endpoint
 * @param {object} options - Request options (method, body, headers, etc)
 * @returns {Promise} API response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    token = null,
  } = options

  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const finalHeaders = { ...defaultHeaders, ...headers }
  const url = `${BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : null,
    })

    const data = await response.json()

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        data: data,
      }
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
