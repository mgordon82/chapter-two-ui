import { type Epic } from 'redux-observable';
import { from, of, EMPTY } from 'rxjs';
import { catchError, filter, mergeMap } from 'rxjs/operators';

import {
  authErrorSet,
  authInitRequested,
  authStepSet,
  changePasswordRequested,
  forgotPasswordRequested,
  forgotPasswordSubmitted,
  loginRequested,
  logoutRequested,
  newPasswordSubmitted,
  currentUserSet
} from './authSlice';

import {
  changePassword,
  completeNewPassword,
  isAuthenticated,
  login,
  logout,
  requestPasswordReset,
  submitPasswordReset
} from './index';
import { fetchCurrentUser } from './helpers/fetchCurrentUser';
import { activateCurrentUser } from './helpers/activateCurrentUser';
import { appReset } from '../app/appActions';

import type { AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../app/store';

type AppAction = { type: string; payload?: unknown };

type CognitoishError = {
  __type?: string;
  message?: string;
};

const asCognitoishError = (err: unknown): CognitoishError | null => {
  if (!err || typeof err !== 'object') return null;

  const e = err as Record<string, unknown>;
  return {
    __type: typeof e.__type === 'string' ? e.__type : undefined,
    message: typeof e.message === 'string' ? e.message : undefined
  };
};

const isSessionExpiredError = (err: unknown) => {
  const e = asCognitoishError(err);
  const type = e?.__type ?? '';
  const msg = (e?.message ?? '').toLowerCase();

  return (
    type.includes('NotAuthorizedException') &&
    msg.includes('session is expired')
  );
};

type SetPasswordOutcome =
  | { ok: true }
  | {
      ok: false;
      actions: Array<
        ReturnType<typeof authErrorSet> | ReturnType<typeof authStepSet>
      >;
    };

export const authEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    filter((action) => {
      const a = action as AppAction;
      return (
        a.type === authInitRequested.type ||
        a.type === loginRequested.type ||
        a.type === newPasswordSubmitted.type ||
        a.type === forgotPasswordRequested.type ||
        a.type === forgotPasswordSubmitted.type ||
        a.type === changePasswordRequested.type ||
        a.type === logoutRequested.type
      );
    }),

    mergeMap((action) => {
      const a = action as AppAction;

      // INIT
      if (a.type === authInitRequested.type) {
        return from(isAuthenticated()).pipe(
          mergeMap((authenticated) => {
            if (!authenticated) {
              return of(
                appReset(),
                currentUserSet(null),
                authStepSet('SIGNED_OUT')
              );
            }

            return from(fetchCurrentUser()).pipe(
              mergeMap((user) =>
                of(currentUserSet(user), authStepSet('SIGNED_IN'))
              ),
              catchError(() =>
                of(appReset(), currentUserSet(null), authStepSet('SIGNED_OUT'))
              )
            );
          }),
          catchError(() =>
            of(appReset(), currentUserSet(null), authStepSet('SIGNED_OUT'))
          )
        );
      }

      // LOGIN
      if (a.type === loginRequested.type) {
        const { email, password } = a.payload as {
          email: string;
          password: string;
        };

        return of(authStepSet('SIGNING_IN')).pipe(
          mergeMap(() => from(login(email, password))),
          mergeMap((result) => {
            if (!result.ok && result.next === 'NEW_PASSWORD_REQUIRED') {
              return of(authStepSet('NEW_PASSWORD_REQUIRED'));
            }

            return from(fetchCurrentUser()).pipe(
              mergeMap((user) =>
                of(currentUserSet(user), authStepSet('SIGNED_IN'))
              ),
              catchError((err: unknown) => {
                const msg =
                  err instanceof Error && err.message === 'NO_ACCESS'
                    ? 'Your account does not have access to this application.'
                    : err instanceof Error
                    ? err.message
                    : 'Failed to load your user profile.';

                return from(logout()).pipe(
                  mergeMap(() =>
                    of(
                      appReset(),
                      currentUserSet(null),
                      authErrorSet(msg),
                      authStepSet('SIGNED_OUT')
                    )
                  ),
                  catchError(() =>
                    of(
                      appReset(),
                      currentUserSet(null),
                      authErrorSet(msg),
                      authStepSet('SIGNED_OUT')
                    )
                  )
                );
              })
            );
          }),
          catchError((err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Login failed';
            return of(
              appReset(),
              currentUserSet(null),
              authErrorSet(msg),
              authStepSet('SIGNED_OUT')
            );
          })
        );
      }

      // NEW PASSWORD
      if (a.type === newPasswordSubmitted.type) {
        const { newPassword, email, password } = a.payload as {
          newPassword: string;
          email: string;
          password: string;
        };

        const setPasswordFlow$ = from(completeNewPassword(newPassword)).pipe(
          mergeMap(() => of<SetPasswordOutcome>({ ok: true })),
          catchError((err: unknown) => {
            if (isSessionExpiredError(err)) {
              return from(login(email, password)).pipe(
                mergeMap((result) => {
                  if (result.ok) return of<SetPasswordOutcome>({ ok: true });

                  return from(completeNewPassword(newPassword)).pipe(
                    mergeMap(() => of<SetPasswordOutcome>({ ok: true }))
                  );
                }),
                catchError((err2: unknown) => {
                  const msg =
                    err2 instanceof Error
                      ? err2.message
                      : 'Failed to set new password (session expired).';

                  return of<SetPasswordOutcome>({
                    ok: false,
                    actions: [
                      authErrorSet(msg),
                      authStepSet('NEW_PASSWORD_REQUIRED')
                    ]
                  });
                })
              );
            }

            const msg =
              err instanceof Error ? err.message : 'Failed to set new password';

            return of<SetPasswordOutcome>({
              ok: false,
              actions: [authErrorSet(msg), authStepSet('NEW_PASSWORD_REQUIRED')]
            });
          })
        );

        return of(authStepSet('SIGNING_IN')).pipe(
          mergeMap(() => setPasswordFlow$),

          mergeMap((outcome) => {
            if (!outcome.ok) return of(...outcome.actions);

            return from(activateCurrentUser()).pipe(
              mergeMap(() => of({ ok: true as const })),
              catchError((err: unknown) => {
                const msg =
                  err instanceof Error ? err.message : 'Activation failed';

                return from(logout()).pipe(
                  mergeMap(() =>
                    of(
                      appReset(),
                      currentUserSet(null),
                      authErrorSet(
                        `Password updated, but activation failed. Please sign in again. (${msg})`
                      ),
                      authStepSet('SIGNED_OUT')
                    )
                  ),
                  catchError(() =>
                    of(
                      appReset(),
                      currentUserSet(null),
                      authErrorSet(
                        `Password updated, but activation failed. Please sign in again. (${msg})`
                      ),
                      authStepSet('SIGNED_OUT')
                    )
                  )
                );
              })
            );
          }),

          mergeMap((maybeOk) => {
            if (!maybeOk || typeof maybeOk !== 'object' || !('ok' in maybeOk)) {
              return EMPTY;
            }

            return from(fetchCurrentUser()).pipe(
              mergeMap((user) =>
                of(currentUserSet(user), authStepSet('SIGNED_IN'))
              ),
              catchError((err: unknown) => {
                const msg =
                  err instanceof Error && err.message === 'NO_ACCESS'
                    ? 'Your account does not have access to this application.'
                    : err instanceof Error
                    ? err.message
                    : 'Failed to load your user profile.';

                return from(logout()).pipe(
                  mergeMap(() =>
                    of(
                      appReset(),
                      currentUserSet(null),
                      authErrorSet(msg),
                      authStepSet('SIGNED_OUT')
                    )
                  ),
                  catchError(() =>
                    of(
                      appReset(),
                      currentUserSet(null),
                      authErrorSet(msg),
                      authStepSet('SIGNED_OUT')
                    )
                  )
                );
              })
            );
          })
        );
      }

      // FORGOT PASSWORD - REQUEST CODE
      if (a.type === forgotPasswordRequested.type) {
        const { email } = a.payload as { email: string };

        return of(authStepSet('FORGOT_PASSWORD_REQUESTING')).pipe(
          mergeMap(() => from(requestPasswordReset(email))),
          mergeMap(() => of(authStepSet('FORGOT_PASSWORD_CODE_SENT'))),
          catchError((err: unknown) => {
            const msg =
              err instanceof Error
                ? err.message
                : 'Failed to send password reset code';

            return of(authErrorSet(msg), authStepSet('SIGNED_OUT'));
          })
        );
      }

      // FORGOT PASSWORD - CONFIRM RESET
      if (a.type === forgotPasswordSubmitted.type) {
        const { email, code, newPassword } = a.payload as {
          email: string;
          code: string;
          newPassword: string;
        };

        return of(authStepSet('FORGOT_PASSWORD_CONFIRMING')).pipe(
          mergeMap(() => from(submitPasswordReset(email, code, newPassword))),
          mergeMap(() => of(authStepSet('FORGOT_PASSWORD_SUCCESS'))),
          catchError((err: unknown) => {
            const msg =
              err instanceof Error ? err.message : 'Failed to reset password';

            return of(
              authErrorSet(msg),
              authStepSet('FORGOT_PASSWORD_CODE_SENT')
            );
          })
        );
      }

      // CHANGE PASSWORD
      if (a.type === changePasswordRequested.type) {
        const { currentPassword, newPassword } = a.payload as {
          currentPassword: string;
          newPassword: string;
        };

        return of(authStepSet('CHANGING_PASSWORD')).pipe(
          mergeMap(() => from(changePassword(currentPassword, newPassword))),
          mergeMap(() => of(authStepSet('PASSWORD_CHANGE_SUCCESS'))),
          catchError((err: unknown) => {
            const msg =
              err instanceof Error ? err.message : 'Failed to change password';

            return of(authErrorSet(msg), authStepSet('SIGNED_IN'));
          })
        );
      }

      // LOGOUT
      return of(authStepSet('SIGNING_OUT')).pipe(
        mergeMap(() => from(logout())),
        mergeMap(() =>
          of(appReset(), currentUserSet(null), authStepSet('SIGNED_OUT'))
        ),
        catchError((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Logout failed';
          return of(
            appReset(),
            currentUserSet(null),
            authErrorSet(msg),
            authStepSet('SIGNED_OUT')
          );
        })
      );
    })
  );
