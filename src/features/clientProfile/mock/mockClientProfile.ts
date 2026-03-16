import type { ClientProfile } from '../types';

export const mockClientProfile: ClientProfile = {
  overview: {
    clientId: 'client_123',
    userId: 'user_123',
    firstName: 'Jamie',
    lastName: 'Carter',
    fullName: 'Jamie Carter',
    email: 'jamie@example.com',
    profilePhotoUrl: null,
    role: 'client',
    status: 'active',
    assignedCoach: {
      coachId: 'coach_88',
      fullName: 'Matt Gordon'
    },
    joinedAt: '2025-12-10T00:00:00.000Z',
    age: 34,
    heightCm: 170,
    heightDisplay: `5'7"`,
    currentWeightKg: 74.4,
    currentWeightDisplay: '164 lb',
    goalWeightKg: 65.8,
    goalWeightDisplay: '145 lb',
    bodyFatPercent: 29,
    goalType: 'fat_loss',
    membershipService: 'Value Plus'
  },
  nutrition: {
    calorieTarget: 1850,
    macros: {
      proteinGrams: 150,
      carbsGrams: 160,
      fatGrams: 55
    },
    waterTargetOz: 90,
    fiberTargetGrams: 28,
    mealPlanStyle: 'high-protein',
    phase: 'fat loss',
    calculatedFrom: {
      goalType: 'fat_loss',
      activityLevel: 'moderate',
      weeklyGoalRate: 0.75
    },
    lastUpdatedAt: '2026-03-10T15:00:00.000Z'
  },
  notes: {
    currentNote:
      'Doing well overall. Focus on weekend consistency and protein target.',
    updatedAt: '2026-03-13T18:12:00.000Z',
    updatedBy: {
      userId: 'coach_88',
      fullName: 'Matt Gordon'
    }
  },
  weightTrend: {
    unit: 'lb',
    points: [
      { date: '2026-02-15', weight: 168.2 },
      { date: '2026-02-22', weight: 167.1 },
      { date: '2026-03-01', weight: 166.4 },
      { date: '2026-03-08', weight: 165.2 },
      { date: '2026-03-15', weight: 164.0 }
    ],
    summary: {
      startWeight: 168.2,
      currentWeight: 164.0,
      change: -4.2,
      changeDirection: 'down',
      periodLabel: 'Last 30 days'
    }
  },
  latestCheckIn: {
    checkInId: 'checkin_456',
    recordedAt: '2026-03-14T08:30:00.000Z',
    weightKg: 74.4,
    weightDisplay: '164 lb',
    bodyFatPercent: 28.7,
    waistCm: 84,
    waistDisplay: '33.1 in',
    energy: 7,
    sleepHours: 7.2,
    steps: 9450,
    workoutCount: 4,
    adherence: {
      nutrition: 85,
      training: 90,
      recovery: 72
    },
    notes: 'Felt strong this week. Hunger was a bit higher.',
    mood: 'good',
    hasPhotos: true
  },
  activity: {
    period: '7d',
    averageSteps: 8730,
    averageSleepHours: 6.9,
    workoutsCompleted: 4,
    workoutsScheduled: 4,
    cardioMinutes: 110,
    strengthSessions: 3,
    adherenceScore: 83,
    streaks: {
      checkInStreakDays: 21,
      workoutStreakDays: 6
    }
  },
  insights: {
    status: 'improving',
    highlights: [
      'Weight is trending down at a steady pace.',
      'Workout consistency was strong this week.',
      'Nutrition adherence remains above target.'
    ],
    flags: ['Sleep average is slightly below goal.'],
    metrics: {
      weightChangeLast30Days: -4.2,
      avgWeeklyWeightChange: -1.05,
      adherenceScore: 83
    },
    generatedAt: '2026-03-15T12:00:00.000Z'
  },
  photos: {
    latestSet: {
      photoSetId: 'photoset_99',
      capturedAt: '2026-03-14T08:30:00.000Z',
      photos: {
        front: {
          url: 'https://via.placeholder.com/600x800?text=Front',
          thumbnailUrl: 'https://via.placeholder.com/200x260?text=Front'
        },
        side: {
          url: 'https://via.placeholder.com/600x800?text=Side',
          thumbnailUrl: 'https://via.placeholder.com/200x260?text=Side'
        },
        back: {
          url: 'https://via.placeholder.com/600x800?text=Back',
          thumbnailUrl: 'https://via.placeholder.com/200x260?text=Back'
        }
      }
    },
    totalSets: 6
  }
};
