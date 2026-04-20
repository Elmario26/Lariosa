export const RESET_USER_LOGIN = 'RESET_USER_LOGIN';
export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const USER_LOGIN_LOGIN = 'USER_LOGIN_LOGIN';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_ERROR = 'REGISTER_ERROR';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_ERROR = 'LOGOUT_ERROR';
export const GET_USER_REQUEST = 'GET_USER_REQUEST';
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
export const GET_USER_ERROR = 'GET_USER_ERROR';
export const SET_AUTH_STATE = 'SET_AUTH_STATE';
export const CLEAR_ERROR = 'CLEAR_ERROR';

// Auth types
export interface User {
  id?: string;
  email: string;
  fullName?: string;
  [key: string]: any;
}

export interface AuthPayload {
  email: string;
  password: string;
  googleToken?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

// Action creators
export const logoutRequest = () => ({
  type: LOGOUT_REQUEST,
});

export const userLoginRequest = (payload: AuthPayload) => ({
  type: USER_LOGIN_REQUEST,
  payload,
});

export const registerRequest = (payload: RegisterPayload) => ({
  type: REGISTER_REQUEST,
  payload,
});

// Re-export vehicle action types and creators
export * from './actions/vehicles';
