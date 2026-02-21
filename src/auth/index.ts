import {
  signIn,
  confirmSignIn,
  fetchAuthSession,
  signOut
} from 'aws-amplify/auth';
import { getCurrentUser } from 'aws-amplify/auth';

export type LoginResult =
  | { ok: true; accessToken: string }
  | { ok: false; next: 'NEW_PASSWORD_REQUIRED' };

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const result = await signIn({ username: email, password });

  if (
    result?.nextStep?.signInStep ===
    'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
  ) {
    return { ok: false, next: 'NEW_PASSWORD_REQUIRED' };
  }

  const session = await fetchAuthSession();
  const accessToken = session.tokens?.accessToken?.toString();
  if (!accessToken) throw new Error('No access token returned.');
  return { ok: true, accessToken };
}

export async function completeNewPassword(newPassword: string) {
  await confirmSignIn({ challengeResponse: newPassword });

  const session = await fetchAuthSession();
  const accessToken = session.tokens?.accessToken?.toString();
  if (!accessToken) throw new Error('No access token returned.');
  return accessToken;
}

export async function logout() {
  await signOut();
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
