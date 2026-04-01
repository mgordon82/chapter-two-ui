import { kgToLbsRounded } from '../../../utils/conversions/weight';
import type { RangeKey } from '../types';

export const startDateForRange = (range: RangeKey, end: Date) => {
  const d = new Date(end);
  switch (range) {
    case '1W':
      d.setDate(d.getDate() - 7);
      return d;
    case '1M':
      d.setMonth(d.getMonth() - 1);
      return d;
    case '3M':
      d.setMonth(d.getMonth() - 3);
      return d;
    case '6M':
      d.setMonth(d.getMonth() - 6);
      return d;
    case '12M':
      d.setFullYear(d.getFullYear() - 1);
      return d;
    default:
      return d;
  }
};

export const toDisplayWeight = (weightKg: number, unit: 'kg' | 'lbs') => {
  if (unit === 'lbs') return kgToLbsRounded(weightKg, 1);
  return Number(weightKg.toFixed(1));
};

export const formatDateLabel = (iso: string) => {
  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTimeLabel = (iso: string) => {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export const formatWeight = (weightKg: number, unit: 'kg' | 'lbs') => {
  if (!Number.isFinite(weightKg)) return '';
  if (unit === 'lbs') return String(kgToLbsRounded(weightKg, 1));
  return String(Number(weightKg.toFixed(1)));
};

export const toIsoDateInputValue = (d: Date) => {
  return d.toISOString().slice(0, 10);
};

export const toLocalDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const confidenceLabel = (c?: string | null) => {
  if (c === 'high') return 'high confidence';
  if (c === 'medium') return 'medium confidence';
  if (c === 'low') return 'low confidence';
  return null;
};
