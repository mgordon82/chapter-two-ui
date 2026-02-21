import { type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, mergeMap } from 'rxjs/operators';

import {
  authErrorSet,
  authInitRequested,
  authStepSet,
  loginRequested,
  logoutRequested,
  newPasswordSubmitted,
  currentUserSet
} from './authSlice';

import { completeNewPassword, isAuthenticated, login, logout } from './index';
import { fetchCurrentUser } from './helpers/fetchCurrentUser';

type AppAction = { type: string; payload?: unknown };

export const authEpic: Epic = (action$) =>
  action$.pipe(
    filter((action) => {
      const a = action as AppAction;
      return (
        a.type === authInitRequested.type ||
        a.type === loginRequested.type ||
        a.type === newPasswordSubmitted.type ||
        a.type === logoutRequested.type
      );
    }),
    mergeMap((action) => {
      const a = action as AppAction;

      if (a.type === authInitRequested.type) {
        return from(isAuthenticated()).pipe(
          mergeMap((authenticated) => {
            if (!authenticated) {
              return of(currentUserSet(null), authStepSet('SIGNED_OUT'));
            }

            // If already authenticated, bootstrap the Mongo user
            return from(fetchCurrentUser()).pipe(
              mergeMap((user) =>
                of(currentUserSet(user), authStepSet('SIGNED_IN'))
              ),
              catchError(() =>
                of(currentUserSet(null), authStepSet('SIGNED_OUT'))
              )
            );
          }),
          catchError(() => of(currentUserSet(null), authStepSet('SIGNED_OUT')))
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

            // Bootstrap app user from Mongo
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
                      currentUserSet(null),
                      authErrorSet(msg),
                      authStepSet('SIGNED_OUT')
                    )
                  ),
                  catchError(() =>
                    of(
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
              currentUserSet(null),
              authErrorSet(msg),
              authStepSet('SIGNED_OUT')
            );
          })
        );
      }

      // NEW PASSWORD
      if (a.type === newPasswordSubmitted.type) {
        const { newPassword } = a.payload as { newPassword: string };

        return of(authStepSet('SIGNING_IN')).pipe(
          mergeMap(() => from(completeNewPassword(newPassword))),
          mergeMap(() =>
            from(fetchCurrentUser()).pipe(
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
                      currentUserSet(null),
                      authErrorSet(msg),
                      authStepSet('SIGNED_OUT')
                    )
                  ),
                  catchError(() =>
                    of(
                      currentUserSet(null),
                      authErrorSet(msg),
                      authStepSet('SIGNED_OUT')
                    )
                  )
                );
              })
            )
          ),
          catchError((err: unknown) => {
            const msg =
              err instanceof Error ? err.message : 'Failed to set new password';
            return of(authErrorSet(msg), authStepSet('NEW_PASSWORD_REQUIRED'));
          })
        );
      }

      // LOGOUT
      return of(authStepSet('SIGNING_OUT')).pipe(
        mergeMap(() => from(logout())),
        mergeMap(() => of(currentUserSet(null), authStepSet('SIGNED_OUT'))),
        catchError((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Logout failed';
          return of(
            currentUserSet(null),
            authErrorSet(msg),
            authStepSet('SIGNED_OUT')
          );
        })
      );
    })
  );
