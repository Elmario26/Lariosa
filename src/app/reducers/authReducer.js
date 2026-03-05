// Auth Reducer
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // Login actions
    case 'LOGIN_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        error: null,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      }

    // Register actions
    case 'REGISTER_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        error: null,
      }
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    // Logout actions
    case 'LOGOUT_REQUEST':
      return {
        ...state,
        isLoading: true,
      }
    case 'LOGOUT_SUCCESS':
      return {
        ...initialState,
      }
    case 'LOGOUT_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    // Get user profile
    case 'GET_USER_REQUEST':
      return {
        ...state,
        isLoading: true,
      }
    case 'GET_USER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      }
    case 'GET_USER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    // Set authentication state
    case 'SET_AUTH_STATE':
      return {
        ...state,
        ...action.payload,
      }

    // Clear error
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

export default authReducer
