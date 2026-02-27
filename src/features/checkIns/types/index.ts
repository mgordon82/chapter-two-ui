export type RangeKey = '1W' | '1M' | '3M' | '6M' | '12M';

export type ViewMode = 'chart' | 'list';

export type UnitPrefType = 'lbs' | 'kg';

export type CheckInTooltipProps = {
  active?: boolean;
  label?: unknown;
  payload?: Array<{ value?: unknown }>;
  unit: 'kg' | 'lbs';
};
