import { getAccessToken } from './getAccessToken';

export type AppRole = 'client' | 'coach' | 'admin' | 'staff';

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  role: AppRole | null;
  roles: AppRole[];
  status: string | null;
};

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not signed in');

  const API_URL = import.meta.env.VITE_API_URL;

  const res = await fetch(`${API_URL}/api/current-user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 403) {
    throw new Error('NO_ACCESS');
  }

  if (!res.ok) {
    const msg = (await res.text().catch(() => '')) || 'Failed to load user.';
    throw new Error(msg);
  }

  const data = (await res.json()) as {
    id: string;
    email: string | null;
    displayName: string | null;
    role?: string | null;
    roles?: string[] | null;
    status: string | null;
  };

  const validRoles: AppRole[] = ['client', 'coach', 'admin', 'staff'];

  const normalizedRoles = Array.isArray(data.roles)
    ? data.roles.filter((role): role is AppRole =>
        validRoles.includes(role as AppRole)
      )
    : [];

  const normalizedLegacyRole =
    typeof data.role === 'string' && validRoles.includes(data.role as AppRole)
      ? (data.role as AppRole)
      : null;

  const roles =
    normalizedRoles.length > 0
      ? normalizedRoles
      : normalizedLegacyRole
      ? [normalizedLegacyRole]
      : [];

  const role = roles[0] ?? normalizedLegacyRole ?? null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.displayName,
    role,
    roles,
    status: data.status
  };
}
