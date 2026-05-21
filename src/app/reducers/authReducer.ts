import { User } from '../actions';
import {
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_ERROR,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_ERROR,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_ERROR,
  SET_AUTH_STATE,
  CLEAR_ERROR,
} from '../actions';

// Auth State interface
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  /** Set after POST /api/register — user must log in separately */
  registerSuccessMessage: string | null;
}

// Action interface
interface AuthAction {
  type: string;
  payload?: any;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  registerSuccessMessage: null,
};

// Auth Reducer
const authReducer = (state: AuthState = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    // Login actions
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case USER_LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || null,
        error: null,
      };
    case USER_LOGIN_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    // Register actions
    case REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
        registerSuccessMessage: null,
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        registerSuccessMessage:
          action.payload.message ||
          'Account created. Please verify your email, then sign in.',
      };
    case REGISTER_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // Logout actions
    case LOGOUT_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case LOGOUT_SUCCESS:
      return {
        ...initialState,
      };
    case LOGOUT_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // Get user profile
    case GET_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case GET_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
      };
    case GET_USER_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // Other actions
    case SET_AUTH_STATE:
      return {
        ...state,
        ...action.payload,
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;
