export type ClientProfile = {
  overview: ClientOverview;
  nutrition: ClientNutrition;
  notes: CoachNotes;
  weightTrend: WeightTrend;
  latestCheckIn: LatestCheckIn | null;
  checkInHistory: ClientProfileCheckInHistoryItem[];
  activity: ActivitySnapshot;
  insights: ProgressInsights;
  photos: ProgressPhotos;
};

export type ClientOverview = {
  clientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  profilePhotoUrl?: string | null;
  role: 'client';
  status: 'active' | 'inactive' | 'pending';
  assignedCoach: {
    coachId: string;
    fullName: string;
  } | null;
  joinedAt: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
  heightCm?: number | null;
  heightDisplay?: string | null;
  currentWeightKg?: number | null;
  currentWeightDisplay?: string | null;
  goalWeightKg?: number | null;
  goalWeightDisplay?: string | null;
  bodyFatPercent?: number | null;
  goalType?: 'fat_loss' | 'maintenance' | 'muscle_gain' | 'recomp' | null;
  membershipService?: string | null;
};

export type ClientNutrition = {
  calorieTarget: number | null;
  macros: {
    proteinGrams: number | null;
    carbsGrams: number | null;
    fatGrams: number | null;
  };
  waterTargetMl?: number | null;
  fiberTargetGrams?: number | null;
  mealPlanStyle?: string | null;
  phase?: string | null;
  calculatedFrom?: {
    goalType?: string | null;
    activityLevel?: string | null;
    weeklyGoalRate?: number | null;
  } | null;
  lastUpdatedAt?: string | null;
};

export type CoachNotes = {
  currentNote: string;
  updatedAt: string | null;
  updatedBy: {
    userId: string;
    fullName: string;
  } | null;
};

export type WeightTrend = {
  unit: 'kg' | 'lb';
  points: WeightTrendPoint[];
  summary: {
    startWeight?: number | null;
    currentWeight?: number | null;
    change?: number | null;
    changeDirection?: 'down' | 'up' | 'flat' | null;
    periodLabel?: string | null;
  };
};

export type WeightTrendPoint = {
  date: string;
  weight: number;
};

export type LatestCheckIn = {
  checkInId: string;
  recordedAt: string;
  weightKg?: number | null;
  weightDisplay?: string | null;
  bodyFatPercent?: number | null;
  waistCm?: number | null;
  waistDisplay?: string | null;
  waterMl?: number | null;
  energy?: number | null;
  onTrackLevel?: number | null;
  sleepHours?: number | null;
  steps?: number | null;
  workoutCount?: number | null;
  adherence?: {
    nutrition?: number | null;
    training?: number | null;
    recovery?: number | null;
  } | null;
  notes?: string | null;
  hasPhotos: boolean;
};

export type ClientProfileCheckInHistoryItem = {
  _id: string;
  userId: string;
  recordedAt: string | null;
  metrics: {
    weightKg: number | null;
    notes: string | null;
  };
  hasPhotos: boolean;
  photos: unknown;
  createdAt: string | null;
  createdByUserId: string;
  isDeleted: boolean;
  source: unknown;
};

export type ActivitySnapshot = {
  period: '7d' | '14d' | '30d';
  averageSteps?: number | null;
  averageSleepHours?: number | null;
  workoutsCompleted?: number | null;
  workoutsScheduled?: number | null;
  cardioMinutes?: number | null;
  strengthSessions?: number | null;
  adherenceScore?: number | null;
  streaks?: {
    checkInStreakDays?: number | null;
    workoutStreakDays?: number | null;
  } | null;
};

export type ProgressInsights = {
  status:
    | 'on_track'
    | 'needs_attention'
    | 'plateau'
    | 'improving'
    | 'insufficient_data';
  highlights: string[];
  flags: string[];
  metrics?: {
    weightChangeLast30Days?: number | null;
    avgWeeklyWeightChange?: number | null;
    adherenceScore?: number | null;
  } | null;
  generatedAt?: string | null;
};

export type ProgressPhotos = {
  latestSet: ProgressPhotoSet | null;
  totalSets: number;
};

export type ProgressPhotoSet = {
  photoSetId: string;
  capturedAt: string;
  photos: {
    front?: ProgressPhoto | null;
    side?: ProgressPhoto | null;
    back?: ProgressPhoto | null;
  };
};

export type ProgressPhoto = {
  url: string;
  thumbnailUrl?: string | null;
};
