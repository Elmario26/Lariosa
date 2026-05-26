import type { AuthResponse } from './auth';

/** Profile from GET /api/me (ramlewheels MeController) */
export interface UserProfile {
  id: number | string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  phone?: string;
  role?: string;
  roles?: string[];
  status?: string;
}

export function normalizeUserProfile(data: Record<string, unknown>): UserProfile {
  const firstName = (data.firstName as string) ?? '';
  const lastName = (data.lastName as string) ?? '';
  const fullName =
    (data.fullName as string) ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    (data.username as string) ||
    (data.email as string) ||
    'User';

  return {
    id: (data.id as number | string) ?? '',
    email: (data.email as string) ?? '',
    username: data.username as string | undefined,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    fullName,
    phone: data.phone as string | undefined,
    role: data.role as string | undefined,
    roles: data.roles as string[] | undefined,
    status: data.status as string | undefined,
  };
}

/** Map Symfony / Lexik JWT / custom JSON shapes to what Redux expects */
export function normalizeAuthResponse(data: Record<string, unknown>): AuthResponse {
  const nested = (data.data ?? data.user) as Record<string, unknown> | undefined;
  const user =
    (data.user as AuthResponse['user']) ??
    (nested && typeof nested === 'object' && !Array.isArray(nested) ? nested : undefined);

  const token =
    (data.token as string) ??
    (data.access_token as string) ??
    (data.accessToken as string);

  const refreshToken =
    (data.refreshToken as string) ?? (data.refresh_token as string);

  if (!token) {
    throw {
      status: 422,
      message: 'Login response missing token. Check Postman response keys (token vs access_token).',
      data,
    };
  }

  return { user, token, refreshToken };
}

export function extractApiErrorMessage(
  data: Record<string, unknown> | null | undefined,
  fallback: string
): string {
  if (!data) return fallback;

  if (typeof data.error === 'string') return data.error;
  if (typeof data.message === 'string' && !data.success) return data.message;
  if (typeof data.detail === 'string') {
    if (data.status === 404) {
      return 'API not found. Check api.ts host (no trailing slash) and that the server exposes this route.';
    }
    if (data.status === 500) {
      return (
        'Server error (500). Postman may be using localhost while the app uses Railway. ' +
        'Redeploy the backend with JWT env vars, or set ENVIRONMENT in api.ts to ANDROID_EMULATOR for local Symfony.'
      );
    }
    return data.detail;
  }
  if (typeof data['hydra:description'] === 'string') return data['hydra:description'];

  const violations = data.violations as Array<{ message?: string }> | undefined;
  if (Array.isArray(violations) && violations[0]?.message) {
    return violations[0].message;
  }

  return fallback;
}
