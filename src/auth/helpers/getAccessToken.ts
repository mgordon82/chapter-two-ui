import { fetchAuthSession } from 'aws-amplify/auth';

export async function getAccessToken(): Promise<string | null> {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() ?? null;
}
