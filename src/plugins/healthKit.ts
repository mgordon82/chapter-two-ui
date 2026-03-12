import { registerPlugin } from '@capacitor/core';

export type HealthPermissionResult = {
  granted: boolean;
};

export type HealthSampleSource = {
  integration: 'apple_health';
  appSourceName: string | null;
  deviceSourceName: string | null;
};

export type LatestWeightResult = {
  valueKg: number | null;
  valueLb: number | null;
  recordedAt: string | null;
  sampleId: string | null;
  source: HealthSampleSource;
};

export type WeightSample = {
  sampleId: string;
  valueKg: number;
  valueLb: number;
  recordedAt: string;
  source: HealthSampleSource;
};

export type WeightSamplesResult = {
  items: WeightSample[];
};

type HealthKitPlugin = {
  requestHealthPermissions: () => Promise<HealthPermissionResult>;
  getLatestWeight: () => Promise<LatestWeightResult>;
  getWeightSamples: (options?: {
    startDate?: string;
    limit?: number;
  }) => Promise<WeightSamplesResult>;
};

export const HealthKit = registerPlugin<HealthKitPlugin>('HealthKit');
