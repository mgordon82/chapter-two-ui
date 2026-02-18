import type { MeasurementUnit } from '../../../components/units/MeasurementUnit';
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

  heightCm: string;
  weightKg: string;
  goalWeightKg: string;

  age: string;
  activityLevel: ActivityLevel | '';
  goal: Goal | '';
  idealTimelineWeeks: string;
  rateLevel: RateLevel | '';

  measurementUnitPref: MeasurementUnit;
  weightUnitPref: WeightUnit;
};

export const initialFormState: FormState = {
  firstName: '',
  lastName: '',
  gender: '' as Gender,

  heightFeet: '',
  heightInches: '',
  weight: '',
  goalWeight: '',

  heightCm: '',
  weightKg: '',
  goalWeightKg: '',

  age: '',
  activityLevel: '' as ActivityLevel,
  goal: '' as Goal,
  idealTimelineWeeks: '',
  rateLevel: '' as RateLevel,

  measurementUnitPref: 'cm' as MeasurementUnit,
  weightUnitPref: 'kg' as WeightUnit
};
