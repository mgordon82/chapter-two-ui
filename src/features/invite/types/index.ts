export type TrainingLocation = 'home' | 'gym' | 'both' | '';
export type YesNo = 'yes' | 'no' | '';
export type PronounOption =
  | 'he_him'
  | 'she_her'
  | 'they_them'
  | 'prefer_not_to_say'
  | 'other'
  | '';

export type WeightUnit = 'lbs' | 'kg';
export type HeightUnit = 'cm' | 'ft_in';

export type InvitationFormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  pronouns: PronounOption;

  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  country: string;

  weightUnit: WeightUnit;
  weightValue: string;

  heightUnit: HeightUnit;
  heightCmValue: string;
  heightFeet: string;
  heightInches: string;

  job: string;

  trainingLocation: TrainingLocation;
  homeEquipment: string[];
  gymEquipment: string[];

  hasInjuries: YesNo;
  injuryDetails: string;

  followedNutritionApproach: YesNo;
  nutritionApproachDetails: string;
  perfectNutrition: string;
  favoriteFoods: string;
  leastFavoriteFoods: string;

  trainingTimePerSession: string;
  trainingDaysPerWeek: string;
  trainingDays: string[];

  motivationReason: string;
  motivationStyle: string;
  interestedInExtraIncome: YesNo;
};
