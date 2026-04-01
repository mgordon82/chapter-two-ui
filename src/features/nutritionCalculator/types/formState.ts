import type { MeasurementUnit } from '../../../components/units/MeasurementUnit';
import type { VolumeUnit } from '../../../components/units/VolumeUnit';
import type { WeightUnit } from '../../../components/units/WeightUnit';
import type { ActivityLevel } from './activityLevel';
import type { Gender } from './gender';
import type { Goal } from './goal';
import type { RateLevel } from './rateLevel';

export type FormState = {
  firstName: string;
  lastName: string;
  gender: Gender | '';

  heightFeet: string;
  heightInches: string;
  weight: string;
  goalWeight: string;
  stepGoalDaily: string;
  waterGoalDailyDisplay: string;

  heightCm: string;
  weightKg: string;
  startingWeight: string;
  startingWeightKg: string;
  goalWeightKg: string;

  age: string;
  activityLevel: ActivityLevel | '';
  goal: Goal | '';
  rateLevel: RateLevel | '';

  measurementUnitPref: MeasurementUnit;
  weightUnitPref: WeightUnit;
  volumeUnitPref: VolumeUnit;
};

export const initialFormState: FormState = {
  firstName: '',
  lastName: '',
  gender: '' as Gender,

  heightFeet: '',
  heightInches: '',
  weight: '',
  goalWeight: '',
  stepGoalDaily: '',
  waterGoalDailyDisplay: '',

  heightCm: '',
  weightKg: '',
  startingWeight: '',
  startingWeightKg: '',
  goalWeightKg: '',

  age: '',
  activityLevel: '' as ActivityLevel,
  goal: '' as Goal,
  rateLevel: '' as RateLevel,

  measurementUnitPref: 'cm' as MeasurementUnit,
  weightUnitPref: 'kg' as WeightUnit,
  volumeUnitPref: 'ml' as VolumeUnit
};
