import type { InvitationFormValues } from '../types';

export const initialInvitationFormValues: InvitationFormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  pronouns: '',

  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  country: '',

  weightUnit: 'lbs',
  weightValue: '',

  heightUnit: 'ft_in',
  heightCmValue: '',
  heightFeet: '',
  heightInches: '',

  job: '',

  trainingLocation: '',
  homeEquipment: [],
  gymEquipment: [],

  hasInjuries: '',
  injuryDetails: '',

  followedNutritionApproach: '',
  nutritionApproachDetails: '',
  perfectNutrition: '',
  favoriteFoods: '',
  leastFavoriteFoods: '',

  trainingTimePerSession: '',
  trainingDaysPerWeek: '',
  trainingDays: [],

  motivationReason: '',
  motivationStyle: '',
  interestedInExtraIncome: ''
};
