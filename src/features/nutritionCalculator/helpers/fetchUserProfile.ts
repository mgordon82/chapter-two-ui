import { getAccessToken } from '../../../auth/helpers/getAccessToken';

import type { MeasurementUnit } from '../../../components/units/MeasurementUnit';
import type { WeightUnit } from '../../../components/units/WeightUnit';

import type { ActivityLevel } from '../types/activityLevel';
import type { Gender } from '../types/gender';
import type { Goal } from '../types/goal';
import type { RateLevel } from '../types/rateLevel';

export type UserProfileResponse = {
  profile: {
    firstName: string | null;
    lastName: string | null;
    gender: Gender | null;
    age: number | null;

    heightCm: number | null;
    weightKg: number | null;
    goalWeightKg: number | null;

    activityLevel: ActivityLevel | null;
    goal: Goal | null;
    rateLevel: RateLevel | null;

    preferences?: {
      measurementUnitPref?: MeasurementUnit | null;
      weightUnitPref?: WeightUnit | null;
    } | null;
  };
  calculated: {
    bmr: number | null;
    tdee: number | null;
    weightGoal: unknown;
  };
  nutrition: {
    targets: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  };
};

export async function fetchUserProfile(): Promise<UserProfileResponse> {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_SIGNED_IN');

  const API_URL = import.meta.env.VITE_API_URL;

  const res = await fetch(`${API_URL}/api/users/current-user/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 403) throw new Error('NO_ACCESS');

  if (!res.ok) {
    const msg = (await res.text().catch(() => '')) || 'Failed to load profile.';
    throw new Error(msg);
  }

  return (await res.json()) as UserProfileResponse;
}
