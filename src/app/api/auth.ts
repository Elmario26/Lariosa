import { apiRequest } from './client';
import { normalizeAuthResponse, normalizeUserProfile, type UserProfile } from './normalize';

export type { UserProfile };

export interface UserData {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user?: UserProfile;
  token: string;
  refreshToken?: string;
}

/** POST /api/register — creates ROLE_CUSTOMER (app only, not staff dashboard) */
export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
  };
}

export const loginAPI = async (email: string, password: string): Promise<AuthResponse> => {
  const data = await apiRequest<Record<string, unknown>>('/login', {
    method: 'POST',
    body: {
      email: email.trim(),
      password,
    },
  });
  return normalizeAuthResponse(data);
};

export const registerAPI = async (userData: UserData): Promise<RegisterResponse> => {
  return apiRequest<RegisterResponse>('/register', {
    method: 'POST',
    body: {
      fullName: userData.fullName.trim(),
      email: userData.email.trim(),
      password: userData.password,
    },
  });
};

export const getCurrentUser = async (token: string): Promise<UserProfile> => {
  const data = await apiRequest<Record<string, unknown>>('/me', {
    method: 'GET',
    token,
  });
  return normalizeUserProfile(data);
};

/** JWT is stateless — logout is handled client-side by clearing the token */
export const logoutAPI = async (_token: string): Promise<{ success: true }> => {
  return { success: true };
};
