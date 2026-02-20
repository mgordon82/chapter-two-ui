import { Paper, Stack, Typography, Divider } from '@mui/material';
import { Section } from '../../../components/sections/section';
import type { MacroResult } from '../calculations/dailyMacros';

type ResultRowProps = {
  label: string;
  value?: string | number | null;
  unit?: string;
  hint?: string;
  color?: string;
};

type CoachCalculatedValuesPanelProps = {
  weightGoalLabel: string | null;
  bmr: number | null;
  tdee: number | null;
  macros: MacroResult | null;
};

const ResultRow = ({ label, value, unit, hint, color }: ResultRowProps) => (
  <Stack spacing={0.5}>
    <Stack direction='row' justifyContent='space-between' alignItems='baseline'>
      <Typography variant='body2' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='subtitle1' fontWeight={600} color={color}>
        {value ?? '—'}
        {unit ? ` ${unit}` : ''}
      </Typography>
    </Stack>
    {hint ? (
      <Typography variant='caption' color='text.secondary'>
        {hint}
      </Typography>
    ) : null}
  </Stack>
);

export const CoachCalculatedValuesPanel = ({
  weightGoalLabel,
  bmr,
  tdee,
  macros
}: CoachCalculatedValuesPanelProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2 },
        borderRadius: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        width: 380
      }}
    >
      <Typography variant='h6' mb={2}>
        Calculated Values
      </Typography>

      <Stack spacing={2.5}>
        <Section title='Goal Summary'>
          <ResultRow label='Weight Goal' value={weightGoalLabel} />
        </Section>

        <Divider />

        <Section title='Metabolism'>
          <ResultRow
            label='BMR'
            value={bmr}
            unit='kcal/day'
            hint='Basal metabolic rate'
          />
          <ResultRow
            label='TDEE'
            value={tdee}
            unit='kcal/day'
            hint='Estimated daily energy expenditure'
          />
        </Section>

        <Divider />

        <Section title='Daily Targets'>
          <ResultRow
            label='Daily Calories'
            value={macros?.calories}
            unit='kcal'
            color='#2563EB'
          />
          <ResultRow
            label='Daily Protein'
            value={macros?.protein}
            unit='g'
            color='#16A34A'
          />
          <ResultRow
            label='Daily Carbs'
            value={macros?.carbs}
            unit='g'
            color='#F59E0B'
          />
          <ResultRow
            label='Daily Fat'
            value={macros?.fat}
            unit='g'
            color='#DC2626'
          />
        </Section>
      </Stack>
    </Paper>
  );
};
