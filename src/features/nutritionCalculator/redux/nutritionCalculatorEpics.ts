import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';

import {
  persistUserProfileRequested,
  persistUserPreferencesRequested,
  persistUserProfileSucceeded,
  persistUserProfileFailed,
  type UserProfileUpsertPayload,
  type PersistUserPreferencesPayload,
  loadUserProfileRequested,
  loadUserProfileSucceeded,
  loadUserProfileFailed,
  selectLoadedUserProfile
} from './nutritionCalculatorSlice';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';
import { fetchUserProfile } from '../helpers/fetchUserProfile';
import type { RootState } from '../../../app/store';

const buildUpsertPayloadFromProfile = (
  loaded: ReturnType<typeof selectLoadedUserProfile>,
  prefs: PersistUserPreferencesPayload
): UserProfileUpsertPayload => {
  if (!loaded) {
    return {
      profile: {
        firstName: null,
        lastName: null,
        gender: null,
        age: null,
        heightCm: null,
        weightKg: null,
        goalWeightKg: null,
        activityLevel: null,
        goal: null,
        rateLevel: null,
        preferences: prefs
      },
      calculated: { bmr: null, tdee: null, weightGoal: null },
      nutrition: {
        targets: { calories: null, protein: null, carbs: null, fats: null }
      }
    };
  }

  return {
    profile: {
      firstName: loaded.profile.firstName ?? null,
      lastName: loaded.profile.lastName ?? null,
      gender: loaded.profile.gender ?? null,
      age: loaded.profile.age ?? null,
      heightCm: loaded.profile.heightCm ?? null,
      weightKg: loaded.profile.weightKg ?? null,
      goalWeightKg: loaded.profile.goalWeightKg ?? null,
      activityLevel: loaded.profile.activityLevel ?? null,
      goal: loaded.profile.goal ?? null,
      rateLevel: loaded.profile.rateLevel ?? null,
      preferences: {
        measurementUnitPref: prefs.measurementUnitPref,
        weightUnitPref: prefs.weightUnitPref
      }
    },
    calculated: {
      bmr: loaded.calculated?.bmr ?? null,
      tdee: loaded.calculated?.tdee ?? null,
      weightGoal: loaded.calculated?.weightGoal ?? null
    },
    nutrition: {
      targets: {
        calories: loaded.nutrition?.targets?.calories ?? null,
        protein: loaded.nutrition?.targets?.protein ?? null,
        carbs: loaded.nutrition?.targets?.carbs ?? null,
        fats: loaded.nutrition?.targets?.fats ?? null
      }
    }
  };
};

const putUserProfile = async (payload: UserProfileUpsertPayload) => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_SIGNED_IN');

  const API_URL = import.meta.env.VITE_API_URL;

  const res = await fetch(`${API_URL}/api/users/current-user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (res.status === 403) throw new Error('NO_ACCESS');

  if (!res.ok) {
    const msg = (await res.text().catch(() => '')) || 'Failed to save profile.';
    throw new Error(msg);
  }
};

const toFriendlyMsg = (err: unknown, fallback: string) => {
  return err instanceof Error && err.message === 'NOT_SIGNED_IN'
    ? 'You must be signed in.'
    : err instanceof Error && err.message === 'NO_ACCESS'
    ? 'Your account does not have access.'
    : err instanceof Error
    ? err.message
    : fallback;
};

export const persistUserProfileEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(persistUserProfileRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<UserProfileUpsertPayload>)
        .payload;

      return from(putUserProfile(payload)).pipe(
        mergeMap(() =>
          of(persistUserProfileSucceeded(), loadUserProfileRequested())
        ),
        catchError((err: unknown) =>
          of(
            persistUserProfileFailed(
              toFriendlyMsg(err, 'Failed to save profile.')
            )
          )
        )
      );
    })
  );

export const persistUserPreferencesEpic: Epic<
  AnyAction,
  AnyAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    ofType(persistUserPreferencesRequested.type),
    mergeMap((action) => {
      const prefs = (action as PayloadAction<PersistUserPreferencesPayload>)
        .payload;

      const loaded = selectLoadedUserProfile(state$.value);
      const payload = buildUpsertPayloadFromProfile(loaded, prefs);

      return from(putUserProfile(payload)).pipe(
        mergeMap(() =>
          of(persistUserProfileSucceeded(), loadUserProfileRequested())
        ),
        catchError((err: unknown) =>
          of(
            persistUserProfileFailed(
              toFriendlyMsg(err, 'Failed to save preferences.')
            )
          )
        )
      );
    })
  );

export const loadUserProfileEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(loadUserProfileRequested.type),
    mergeMap(() =>
      from(fetchUserProfile()).pipe(
        mergeMap((data) => of(loadUserProfileSucceeded(data))),
        catchError((err: unknown) =>
          of(
            loadUserProfileFailed(toFriendlyMsg(err, 'Failed to load profile.'))
          )
        )
      )
    )
  );

export const nutritionCalculatorEpics: Epic<AnyAction, AnyAction, RootState>[] =
  [persistUserProfileEpic, persistUserPreferencesEpic, loadUserProfileEpic];
