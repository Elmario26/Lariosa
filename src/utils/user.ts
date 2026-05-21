import type { User } from '../app/actions';

export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return 'Guest';
  return user.fullName?.trim() || user.username || user.email || 'Guest';
}

export function getUserInitials(user: User | null | undefined): string {
  const name = getUserDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function formatUserRole(role?: string): string {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
}
