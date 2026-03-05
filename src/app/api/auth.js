// Authentication API calls
import { apiRequest } from './client'

/**
 * Login API call
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login response with user data and token
 */
export const loginAPI = async (email, password) => {
  return apiRequest('/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  })
}

/**
 * Register API call
 * @param {object} userData - User registration data
 * @returns {Promise} Registration response
 */
export const registerAPI = async (userData) => {
  const { fullName, email, password } = userData
  return apiRequest('/register', {
    method: 'POST',
    body: {
      fullName,
      email,
      password,
    },
  })
}

/**
 * Get current user profile
 * @param {string} token - Authentication token
 * @returns {Promise} User profile data
 */
export const getCurrentUser = async (token) => {
  return apiRequest('/me', {
    method: 'GET',
    token,
  })
}

/**
 * Logout API call
 * @param {string} token - Authentication token
 * @returns {Promise} Logout response
 */
export const logoutAPI = async (token) => {
  return apiRequest('/logout', {
    method: 'POST',
    token,
  })
}

/**
 * Refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} New access token
 */
export const refreshTokenAPI = async (refreshToken) => {
  return apiRequest('/refresh-token', {
    method: 'POST',
    body: {
      refreshToken,
    },
  })
}
