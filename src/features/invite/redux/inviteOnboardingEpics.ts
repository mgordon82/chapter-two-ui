import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import {
  loadInvitationRequested,
  loadInvitationSucceeded,
  loadInvitationFailed,
  submitInviteOnboardingRequested,
  submitInviteOnboardingSucceeded,
  submitInviteOnboardingFailed,
  type InviteOnboardingSubmitPayload
} from './inviteOnboardingSlice';

const fetchInvitation = async (userId: string, token: string) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const res = await fetch(`${API_URL}/api/invitations/${userId}/${token}`);

  if (!res.ok) {
    const data = await res.json().catch(() => null);

    const msg =
      (data &&
        typeof data === 'object' &&
        'message' in data &&
        typeof data.message === 'string' &&
        data.message) ||
      'Failed to load invitation.';

    throw new Error(msg);
  }

  const data = await res.json();
  return data.invitation;
};

const postInviteOnboarding = async (payload: InviteOnboardingSubmitPayload) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const res = await fetch(
    `${API_URL}/api/invitations/${payload.userId}/${payload.token}/submit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => null);

    const msg =
      (data &&
        typeof data === 'object' &&
        'message' in data &&
        typeof data.message === 'string' &&
        data.message) ||
      'Failed to submit onboarding.';

    throw new Error(msg);
  }

  return res.json().catch(() => null);
};

const toFriendlyMsg = (err: unknown, fallback: string) => {
  return err instanceof Error ? err.message : fallback;
};

export const loadInvitationEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(loadInvitationRequested.type),
    mergeMap((action) => {
      const { userId, token } = (
        action as PayloadAction<{ userId: string; token: string }>
      ).payload;

      return from(fetchInvitation(userId, token)).pipe(
        mergeMap((invitation) => of(loadInvitationSucceeded(invitation))),
        catchError((err: unknown) =>
          of(
            loadInvitationFailed(
              toFriendlyMsg(err, 'Failed to load invitation.')
            )
          )
        )
      );
    })
  );

export const submitInviteOnboardingEpic: Epic<
  AnyAction,
  AnyAction,
  RootState
> = (action$) =>
  action$.pipe(
    ofType(submitInviteOnboardingRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<InviteOnboardingSubmitPayload>)
        .payload;

      return from(postInviteOnboarding(payload)).pipe(
        mergeMap(() => of(submitInviteOnboardingSucceeded())),
        catchError((err: unknown) =>
          of(
            submitInviteOnboardingFailed(
              toFriendlyMsg(err, 'Failed to submit onboarding.')
            )
          )
        )
      );
    })
  );

export const inviteOnboardingEpics: Epic<AnyAction, AnyAction, RootState>[] = [
  loadInvitationEpic,
  submitInviteOnboardingEpic
];
