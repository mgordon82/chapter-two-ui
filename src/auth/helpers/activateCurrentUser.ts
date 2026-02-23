import { getAccessToken } from './getAccessToken';

export async function activateCurrentUser(): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not signed in');

  const API_URL = import.meta.env.VITE_API_URL;

  const res = await fetch(`${API_URL}/api/users/activate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const msg = (await res.text().catch(() => '')) || 'Activation failed';
    throw new Error(msg);
  }
}
