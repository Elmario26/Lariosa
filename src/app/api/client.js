const API_ENDPOINTS = {
  LOCAL: 'http://10.0.2.2:8000/api', 
}

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

  // Log API request details
  console.log(`[API REQUEST] Method: ${method}`)
  console.log(`[API REQUEST] URL: ${url}`)
  console.log(`[API REQUEST] Headers:`, finalHeaders)
  if (body) {
    console.log(`📡 [API REQUEST] Body:`, JSON.stringify(body, null, 2))
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : null,
    })

    const data = await response.json()

    console.log(`[API RESPONSE] Status: ${response.status}`)
    console.log(`[API RESPONSE] Data:`, JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error(`[API ERROR] Status ${response.status}: ${data.message || 'Unknown error'}`)
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        data: data,
      }
    }

    return data
  } catch (error) {
    console.error('[API ERROR]:', error.message || error)
    throw error
  }
}
