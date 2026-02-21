import { getAccessToken } from './getAccessToken';

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string | null;
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
    // important: this is your "must exist in Mongo" rule
    throw new Error('NO_ACCESS');
  }

  if (!res.ok) {
    const msg = (await res.text().catch(() => '')) || 'Failed to load user.';
    throw new Error(msg);
  }

  return (await res.json()) as CurrentUser;
}
